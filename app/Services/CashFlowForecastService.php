<?php

namespace App\Services;

use App\Models\CashFlowForecast;
use App\Models\Invoice;
use App\Models\RecurringInvoice;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CashFlowForecastService
{
    protected ?User $user;

    public function __construct(?User $user = null)
    {
        $this->user = $user;
    }

    /**
     * Get base query for a model
     */
    protected function query($model)
    {
        $query = $model::query();
        if ($this->user) {
            $query->where('user_id', $this->user->id);
        }
        return $query;
    }

    /**
     * Generate 12-month cash flow forecast for all scenarios
     */
    public function generateForecast(int $months = 12, ?float $currentBalance = null): array
    {
        // Get current cash balance (or use provided)
        $startingBalance = $currentBalance ?? $this->getCurrentCashBalance();
        
        $forecasts = [];
        
        // Generate for each scenario
        foreach (['optimistic', 'conservative', 'pessimistic'] as $scenario) {
            $forecasts[$scenario] = $this->generateScenarioForecast($scenario, $months, $startingBalance);
        }
        
        // Save to database
        foreach ($forecasts as $scenario => $monthlyForecasts) {
            foreach ($monthlyForecasts as $forecast) {
                CashFlowForecast::create(array_merge($forecast, [
                    'user_id' => $this->user?->id,
                    'scenario' => $scenario,
                    'generated_by' => auth()->id() ?? $this->user?->id,
                    'generated_at' => now(),
                ]));
            }
        }
        
        return $forecasts;
    }

    /**
     * Generate forecast for a specific scenario
     */
    protected function generateScenarioForecast(string $scenario, int $months, float $startingBalance): array
    {
        $forecasts = [];
        $runningBalance = $startingBalance;
        
        for ($i = 1; $i <= $months; $i++) {
            $forecastDate = now()->addMonths($i)->startOfMonth();
            
            // Calculate inflows
            $recurringRevenue = $this->calculateRecurringRevenue($forecastDate, $scenario);
            $oneTimeRevenue = $this->calculateOneTimeRevenue($forecastDate, $scenario);
            $expectedCollections = $this->calculateExpectedCollections($forecastDate, $scenario);
            
            $totalInflow = $recurringRevenue + $oneTimeRevenue + $expectedCollections;
            
            // Calculate outflows
            $recurringExpenses = $this->calculateRecurringExpenses($forecastDate, $scenario);
            $payroll = $this->calculatePayroll($forecastDate, $scenario);
            $taxes = $this->calculateTaxes($forecastDate, $scenario);
            $oneTimeExpenses = $this->calculateOneTimeExpenses($forecastDate, $scenario);
            
            $totalOutflow = $recurringExpenses + $payroll + $taxes + $oneTimeExpenses;
            
            // Net cash flow
            $netCashFlow = $totalInflow - $totalOutflow;
            $projectedBalance = $runningBalance + $netCashFlow;
            
            // Build assumptions
            $assumptions = $this->buildAssumptions($scenario, $forecastDate);
            
            // Components breakdown
            $components = [
                'inflows' => [
                    'recurring_revenue' => $recurringRevenue,
                    'one_time_revenue' => $oneTimeRevenue,
                    'expected_collections' => $expectedCollections,
                ],
                'outflows' => [
                    'recurring_expenses' => $recurringExpenses,
                    'payroll' => $payroll,
                    'taxes' => $taxes,
                    'one_time_expenses' => $oneTimeExpenses,
                ],
            ];
            
            // Calculate confidence score
            $confidenceScore = $this->calculateConfidenceScore($i, $scenario);
            
            $forecasts[] = [
                'forecast_date' => $forecastDate,
                'starting_balance' => $runningBalance,
                'total_inflow' => $totalInflow,
                'total_outflow' => $totalOutflow,
                'net_cash_flow' => $netCashFlow,
                'projected_balance' => $projectedBalance,
                'recurring_revenue' => $recurringRevenue,
                'one_time_revenue' => $oneTimeRevenue,
                'expected_collections' => $expectedCollections,
                'recurring_expenses' => $recurringExpenses,
                'payroll' => $payroll,
                'taxes' => $taxes,
                'one_time_expenses' => $oneTimeExpenses,
                'assumptions' => $assumptions,
                'components' => $components,
                'confidence_score' => $confidenceScore,
            ];
            
            // Update running balance for next month
            $runningBalance = $projectedBalance;
        }
        
        return $forecasts;
    }

    /**
     * Get current cash balance
     */
    protected function getCurrentCashBalance(): float
    {
        // Total revenue received
        $totalRevenue = $this->query(Payment::class)->where('status', 'completed')->sum('amount');
        
        // Total expenses
        $totalExpenses = $this->query(Expense::class)->sum('amount');
        
        // Simple cash balance calculation
        return (float)($totalRevenue - $totalExpenses);
    }

    /**
     * Calculate recurring revenue from recurring invoices
     */
    protected function calculateRecurringRevenue(Carbon $date, string $scenario): float
    {
        // Get active recurring invoices
        $recurringInvoices = $this->query(RecurringInvoice::class)->where('status', 'active')->get();
        
        $total = 0;
        
        foreach ($recurringInvoices as $recurring) {
            // Check if this recurring invoice applies to this month
            if ($this->shouldGenerateInMonth($recurring, $date)) {
                $amount = $recurring->total_amount;
                
                // Apply scenario modifier
                $total += $this->applyScenarioModifier((float)$amount, $scenario, 'revenue');
            }
        }
        
        return $total;
    }

    /**
     * Check if recurring invoice should generate in this month
     */
    protected function shouldGenerateInMonth($recurring, Carbon $date): bool
    {
        $frequency = $recurring->frequency ?? 'monthly';
        $startDate = Carbon::parse($recurring->start_date);
        
        if ($date->lt($startDate)) {
            return false;
        }
        
        if ($recurring->end_date && $date->gt(Carbon::parse($recurring->end_date))) {
            return false;
        }
        
        $monthsDiff = $startDate->diffInMonths($date);
        
        switch ($frequency) {
            case 'weekly':
                return true; // Assume 4 times per month
            case 'monthly':
                return true;
            case 'quarterly':
                return $monthsDiff % 3 === 0;
            case 'yearly':
                return $monthsDiff % 12 === 0;
            default:
                return true;
        }
    }

    /**
     * Calculate one-time revenue
     */
    protected function calculateOneTimeRevenue(Carbon $date, string $scenario): float
    {
        // Use historical average for one-time revenue
        $avgOneTimeRevenue = $this->query(Payment::class)->where('status', 'completed')
            ->whereDoesntHave('invoice', function($q) {
                // Exclude payments from recurring invoices
                $q->whereNotNull('recurring_invoice_id');
            })
            ->whereYear('date', '>=', now()->subYear()->year)
            ->avg('amount');
        
        $monthly = ($avgOneTimeRevenue ?? 0) / 12;
        
        return $this->applyScenarioModifier($monthly, $scenario, 'revenue');
    }

    /**
     * Calculate expected collections from outstanding invoices
     */
    protected function calculateExpectedCollections(Carbon $date, string $scenario): float
    {
        // Get outstanding invoices
        $outstanding = $this->query(Invoice::class)->whereIn('status', ['pending', 'sent', 'overdue'])
            ->where('due_date', '<=', $date)
            ->sum('total_amount');
        
        // Apply collection rate based on scenario
        $collectionRate = match($scenario) {
            'optimistic' => 0.95,    // 95% collection
            'conservative' => 0.75,  // 75% collection
            'pessimistic' => 0.50,   // 50% collection
            default => 0.75,
        };
        
        return $outstanding * $collectionRate / 12; // Spread over next 12 months
    }

    /**
     * Calculate recurring expenses
     */
    protected function calculateRecurringExpenses(Carbon $date, string $scenario): float
    {
        // Use last 3 months average for recurring expenses
        $expenses = $this->query(Expense::class)->where('date', '>=', now()->subMonths(3))
            ->whereIn('category', ['Software', 'Subscriptions', 'Rent', 'Utilities', 'Insurance'])
            ->get();

        $monthlyExpenses = $expenses->groupBy(function($expense) {
            return $expense->date->format('Y-m');
        })->map(function($month) {
            return $month->sum('amount');
        });
        
        $monthly = $monthlyExpenses->avg() ?? 0;
        
        return $this->applyScenarioModifier($monthly, $scenario, 'expense');
    }

    /**
     * Calculate payroll costs
     */
    protected function calculatePayroll(Carbon $date, string $scenario): float
    {
        // Use last month's payroll or historical average
        $avgPayroll = $this->query(Expense::class)->where('category', 'Payroll')
            ->where('date', '>=', now()->subMonths(3))
            ->avg('amount');
        
        $monthly = $avgPayroll ?? 0;
        
        // Payroll is fairly consistent, small variance
        return $this->applyScenarioModifier($monthly, $scenario, 'payroll');
    }

    /**
     * Calculate tax payments
     */
    protected function calculateTaxes(Carbon $date, string $scenario): float
    {
        // Estimate quarterly tax payments
        // Typically paid in months 4, 6, 9, 12
        $taxMonths = [4, 6, 9, 12];
        
        if (!in_array($date->month, $taxMonths)) {
            return 0;
        }
        
        // Estimate as 25% of quarterly profit
        $quarterlyRevenue = $this->query(Payment::class)->where('status', 'completed')
            ->where('date', '>=', now()->subMonths(3))
            ->sum('amount');
        
        $quarterlyExpenses = $this->query(Expense::class)->where('date', '>=', now()->subMonths(3))
            ->sum('amount');
        
        $quarterlyProfit = max(0, $quarterlyRevenue - $quarterlyExpenses);
        $estimatedTax = $quarterlyProfit * 0.25;
        
        return $this->applyScenarioModifier($estimatedTax, $scenario, 'tax');
    }

    /**
     * Calculate one-time expenses
     */
    protected function calculateOneTimeExpenses(Carbon $date, string $scenario): float
    {
        // Use historical average for irregular expenses
        $avgOneTimeExpenses = $this->query(Expense::class)->whereNotIn('category', [
                'Software', 'Subscriptions', 'Rent', 'Utilities', 'Insurance', 'Payroll'
            ])
            ->where('date', '>=', now()->subYear())
            ->avg('amount');
        
        $monthly = ($avgOneTimeExpenses ?? 0) / 12;
        
        return $this->applyScenarioModifier($monthly, $scenario, 'expense');
    }

    /**
     * Apply scenario modifier to amounts
     */
    protected function applyScenarioModifier(float $amount, string $scenario, string $type): float
    {
        $modifiers = [
            'optimistic' => [
                'revenue' => 1.15,   // +15% revenue
                'expense' => 0.90,   // -10% expenses
                'payroll' => 1.0,    // Payroll stays same
                'tax' => 1.0,        // Tax stays same
            ],
            'conservative' => [
                'revenue' => 1.0,    // No change
                'expense' => 1.0,    // No change
                'payroll' => 1.0,    // No change
                'tax' => 1.0,        // No change
            ],
            'pessimistic' => [
                'revenue' => 0.75,   // -25% revenue
                'expense' => 1.20,   // +20% expenses
                'payroll' => 1.05,   // +5% payroll (hiring delays expensive)
                'tax' => 1.0,        // Tax stays same
            ],
        ];
        
        $modifier = $modifiers[$scenario][$type] ?? 1.0;
        
        return $amount * $modifier;
    }

    /**
     * Build scenario assumptions
     */
    protected function buildAssumptions(string $scenario, Carbon $date): array
    {
        $base = [
            'scenario_name' => ucfirst($scenario),
            'forecast_month' => $date->format('Y-m'),
            'generated_at' => now()->toIso8601String(),
        ];
        
        switch ($scenario) {
            case 'optimistic':
                return array_merge($base, [
                    'revenue_assumption' => '+15% above average',
                    'expense_assumption' => '-10% below average',
                    'collection_rate' => '95%',
                    'description' => 'Best-case scenario with strong revenue and controlled costs',
                ]);
            
            case 'conservative':
                return array_merge($base, [
                    'revenue_assumption' => 'Historical average',
                    'expense_assumption' => 'Historical average',
                    'collection_rate' => '75%',
                    'description' => 'Realistic scenario based on historical trends',
                ]);
            
            case 'pessimistic':
                return array_merge($base, [
                    'revenue_assumption' => '-25% below average',
                    'expense_assumption' => '+20% above average',
                    'collection_rate' => '50%',
                    'description' => 'Worst-case scenario to stress-test cash position',
                ]);
            
            default:
                return $base;
        }
    }

    /**
     * Calculate confidence score (0-100)
     */
    protected function calculateConfidenceScore(int $monthsOut, string $scenario): int
    {
        // Confidence decreases over time
        $baseConfidence = match($scenario) {
            'optimistic' => 60,
            'conservative' => 80,
            'pessimistic' => 70,
            default => 70,
        };
        
        // Reduce confidence by 5% per month
        $reduction = ($monthsOut - 1) * 5;
        
        return max(10, $baseConfidence - $reduction);
    }

    /**
     * Find months where cash runs out
     */
    public function findCashCrisis(string $scenario = 'conservative'): ?array
    {
        $forecasts = $this->query(CashFlowForecast::class)
            ->where('scenario', $scenario)
            ->where('generated_at', '>=', now()->subHour()) // Recent forecasts only
            ->orderBy('forecast_date')
            ->get();
        
        foreach ($forecasts as $forecast) {
            if ($forecast->projected_balance < 0) {
                return [
                    'month' => $forecast->forecast_date->format('F Y'),
                    'projected_balance' => $forecast->projected_balance,
                    'months_until_crisis' => $forecast->forecast_date->diffInMonths(now()),
                ];
            }
        }
        
        return null; // No cash crisis detected
    }

    /**
     * Get forecast summary for dashboard
     */
    public function getSummary(): array
    {
        $conservative = $this->query(CashFlowForecast::class)
            ->where('scenario', 'conservative')
            ->where('generated_at', '>=', now()->subHour())
            ->orderBy('forecast_date')
            ->limit(12)
            ->get();
        
        if ($conservative->isEmpty()) {
            return [
                'status' => 'no_forecast',
                'message' => 'No recent forecast available',
            ];
        }
        
        $crisis = $this->findCashCrisis('conservative');
        $lowestBalance = $conservative->min('projected_balance');
        $avgMonthlyBurn = $conservative->avg('net_cash_flow');
        
        return [
            'status' => $crisis ? 'warning' : 'healthy',
            'crisis' => $crisis,
            'lowest_projected_balance' => $lowestBalance,
            'avg_monthly_burn' => $avgMonthlyBurn,
            'months_forecasted' => $conservative->count(),
            'last_forecast_date' => $conservative->first()->forecast_date ?? null,
        ];
    }
}
