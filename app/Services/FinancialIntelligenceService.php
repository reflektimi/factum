<?php

namespace App\Services;

use App\Models\FinancialInsight;
use App\Models\Alert;
use App\Models\Invoice;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FinancialIntelligenceService
{
    protected ?User $user;

    public function __construct(?User $user = null)
    {
        $this->user = $user;
    }

    /**
     * Generate all financial insights
     */
    public function generateInsights(): array
    {
        $insights = [];

        // Detect anomalies
        $insights = array_merge($insights, $this->detectExpenseSpikes());
        $insights = array_merge($insights, $this->detectRevenueDrop());
        $insights = array_merge($insights, $this->detectMissingInvoices());
        $insights = array_merge($insights, $this->detectUnusualTransactions());
        $insights = array_merge($insights, $this->detectDuplicatePayments());

        // Analyze trends
        $insights = array_merge($insights, $this->analyzeBurnRate());
        $insights = array_merge($insights, $this->analyzeMarginErosion());
        $insights = array_merge($insights, $this->analyzePaymentDelays());

        // Generate explanations
        $insights = array_merge($insights, $this->explainRevenueChanges());
        $insights = array_merge($insights, $this->explainExpenseChanges());

        // Save to database (with deduplication)
        foreach ($insights as $insight) {
            if ($this->user) {
                $insight['user_id'] = $this->user->id;
            }

            // Check for existing active insight of same type/category/title today
            $exists = FinancialInsight::where('user_id', $insight['user_id'] ?? null)
                ->where('type', $insight['type'])
                ->where('category', $insight['category'])
                ->where('title', $insight['title'])
                ->where('is_dismissed', false)
                ->where('created_at', '>=', now()->subDay()) // Deduplicate daily
                ->exists();

            if (!$exists) {
                FinancialInsight::create($insight);
            }
        }

        return $insights;
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
     * Detect expense spikes (>20% MoM increase)
     */
    protected function detectExpenseSpikes(): array
    {
        $currentMonth = $this->query(Expense::class)
            ->whereYear('date', now()->year)
            ->whereMonth('date', now()->month)
            ->sum('amount');

        $previousMonth = $this->query(Expense::class)
            ->whereYear('date', now()->subMonth()->year)
            ->whereMonth('date', now()->subMonth()->month)
            ->sum('amount');

        if ($previousMonth == 0) {
            return [];
        }

        $percentChange = (($currentMonth - $previousMonth) / $previousMonth) * 100;

        if ($percentChange > 20) {
            // Find which categories increased most
            $categoryIncreases = $this->query(Expense::class)
                ->selectRaw('category, SUM(amount) as total')
                ->whereYear('date', now()->year)
                ->whereMonth('date', now()->month)
                ->groupBy('category')
                ->get();

            $topCategory = $categoryIncreases->sortByDesc('total')->first();

            return [[
                'type' => 'anomaly',
                'category' => 'expense_spike',
                'severity' => $percentChange > 50 ? 'critical' : 'high',
                'title' => sprintf('Expenses increased %.1f%% this month', $percentChange),
                'description' => sprintf(
                    'Total expenses this month are $%s, up from $%s last month. ' .
                    'The largest category is "%s" with $%s in expenses.',
                    number_format($currentMonth, 2),
                    number_format($previousMonth, 2),
                    $topCategory->category ?? 'Unknown',
                    number_format($topCategory->total ?? 0, 2)
                ),
                'recommendation' => 'Review recent expenses and identify if this is a one-time occurrence or an ongoing trend.',
                'metadata' => [
                    'current_month_total' => $currentMonth,
                    'previous_month_total' => $previousMonth,
                    'percent_change' => $percentChange,
                ],
                'impact_amount' => $currentMonth - $previousMonth,
                'detected_at' => now(),
            ]];
        }

        return [];
    }

    /**
     * Detect revenue drop (>15% MoM decrease)
     */
    protected function detectRevenueDrop(): array
    {
        $currentMonth = $this->query(Payment::class)
            ->where('status', 'completed')
            ->whereYear('date', now()->year)
            ->whereMonth('date', now()->month)
            ->sum('amount');

        $previousMonth = $this->query(Payment::class)
            ->where('status', 'completed')
            ->whereYear('date', now()->subMonth()->year)
            ->whereMonth('date', now()->subMonth()->month)
            ->sum('amount');

        if ($previousMonth == 0) {
            return [];
        }

        $percentChange = (($currentMonth - $previousMonth) / $previousMonth) * 100;

        if ($percentChange < -15) {
            return [[
                'type' => 'warning',
                'category' => 'revenue_drop',
                'severity' => $percentChange < -30 ? 'critical' : 'high',
                'title' => sprintf('Revenue decreased %.1f%% this month', abs($percentChange)),
                'description' => sprintf(
                    'Total revenue this month is $%s, down from $%s last month.',
                    number_format($currentMonth, 2),
                    number_format($previousMonth, 2)
                ),
                'recommendation' => 'Review payment collections and follow up on overdue invoices.',
                'metadata' => [
                    'current_month_total' => $currentMonth,
                    'previous_month_total' => $previousMonth,
                    'percent_change' => $percentChange,
                ],
                'impact_amount' => abs($currentMonth - $previousMonth),
                'detected_at' => now(),
            ]];
        }

        return [];
    }

    /**
     * Detect missing invoice sequences
     */
    protected function detectMissingInvoices(): array
    {
        $recentInvoices = $this->query(Invoice::class)
            ->orderBy('number')
            ->take(100)
            ->pluck('number')
            ->toArray();

        // Extract numeric parts and check for gaps
        $numbers = array_map(function($number) {
            return (int) filter_var($number, FILTER_SANITIZE_NUMBER_INT);
        }, $recentInvoices);

        $numbers = array_filter($numbers);
        
        if (count($numbers) < 2) {
            return [];
        }

        sort($numbers);
        $gaps = [];

        for ($i = 0; $i < count($numbers) - 1; $i++) {
            if ($numbers[$i + 1] - $numbers[$i] > 1) {
                $gaps[] = [$numbers[$i] + 1, $numbers[$i + 1] - 1];
            }
        }

        if (!empty($gaps)) {
            return [[
                'type' => 'warning',
                'category' => 'missing_invoice',
                'severity' => 'medium',
                'title' => sprintf('%d invoice number(s) appear to be missing', count($gaps)),
                'description' => 'There are gaps in your invoice numbering sequence. This could indicate deleted invoices or data entry errors.',
                'recommendation' => 'Review invoice history to ensure no invoices were accidentally deleted.',
                'metadata' => [
                    'gaps' => $gaps,
                ],
                'detected_at' => now(),
            ]];
        }

        return [];
    }

    /**
     * Detect unusual transaction amounts (>3 standard deviations from mean)
     */
    protected function detectUnusualTransactions(): array
    {
        $insights = [];

        // Check expenses
        $expenses = $this->query(Expense::class)
            ->where('date', '>=', now()->subMonths(6))
            ->get();
        
        if ($expenses->count() > 10) {
            $mean = $expenses->avg('amount');
            $stdDev = sqrt($expenses->map(function($e) use ($mean) {
                return pow($e->amount - $mean, 2);
            })->sum() / $expenses->count());

            $unusual = $expenses->filter(function($expense) use ($mean, $stdDev) {
                return abs($expense->amount - $mean) > (3 * $stdDev);
            });

            foreach ($unusual->take(5) as $expense) {
                $insights[] = [
                    'type' => 'anomaly',
                    'category' => 'unusual_amount',
                    'severity' => 'medium',
                    'title' => sprintf('Unusual expense amount: $%s', number_format((float)$expense->amount, 2)),
                    'description' => sprintf(
                        'An expense for $%s in category "%s" is significantly higher than your typical expenses (average: $%s).',
                        number_format((float)$expense->amount, 2),
                        $expense->category,
                        number_format((float)$mean, 2)
                    ),
                    'recommendation' => 'Verify this expense is correct and properly categorized.',
                    'metadata' => [
                        'expense_id' => $expense->id,
                        'mean_amount' => $mean,
                        'std_dev' => $stdDev,
                    ],
                    'affected_entities' => [
                        ['type' => 'expense', 'id' => $expense->id],
                    ],
                    'impact_amount' => $expense->amount - $mean,
                    'detected_at' => now(),
                ];
            }
        }

        return $insights;
    }

    /**
     * Detect duplicate payments
     */
    protected function detectDuplicatePayments(): array
    {
        $duplicates = $this->query(Payment::class)
            ->selectRaw('invoice_id, amount, date, COUNT(*) as count')
            ->where('status', 'completed')
            ->groupBy('invoice_id', 'amount', 'date')
            ->having('count', '>', 1)
            ->get();

        $insights = [];

        foreach ($duplicates as $duplicate) {
            $insights[] = [
                'type' => 'warning',
                'category' => 'duplicate_transaction',
                'severity' => 'high',
                'title' => sprintf('Possible duplicate payment detected: $%s', number_format($duplicate->amount, 2)),
                'description' => sprintf(
                    '%d payments of $%s were recorded for the same invoice on %s.',
                    $duplicate->count,
                    number_format($duplicate->amount, 2),
                    $duplicate->date
                ),
                'recommendation' => 'Review these payments to ensure they are not duplicates.',
                'metadata' => [
                    'invoice_id' => $duplicate->invoice_id,
                    'count' => $duplicate->count,
                ],
                'affected_entities' => [
                    ['type' => 'invoice', 'id' => $duplicate->invoice_id],
                ],
                'impact_amount' => $duplicate->amount * ($duplicate->count - 1),
                'detected_at' => now(),
            ];
        }

        return $insights;
    }

    /**
     * Analyze burn rate (monthly cash outflow trend)
     */
    protected function analyzeBurnRate(): array
    {
        $last3Months = [];
        
        for ($i = 2; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $expense = $this->query(Expense::class)
                ->whereYear('date', $date->year)
                ->whereMonth('date', $date->month)
                ->sum('amount');
            
            $last3Months[] = $expense;
        }

        if (count($last3Months) < 3 || $last3Months[0] == 0) {
            return [];
        }

        // Calculate trend
        $avgIncrease = (($last3Months[2] - $last3Months[0]) / $last3Months[0]) * 100 / 2;

        if ($avgIncrease > 10) {
            return [[
                'type' => 'trend',
                'category' => 'burn_rate',
                'severity' => $avgIncrease > 25 ? 'high' : 'medium',
                'title' => sprintf('Burn rate increasing by ~%.1f%% per month', $avgIncrease),
                'description' => sprintf(
                    'Your average monthly expenses have grown from $%s to $%s over the last 3 months.',
                    number_format($last3Months[0], 2),
                    number_format($last3Months[2], 2)
                ),
                'recommendation' => 'Review expense growth and ensure it aligns with business plans.',
                'metadata' => [
                    'monthly_expenses' => $last3Months,
                    'avg_monthly_increase' => $avgIncrease,
                ],
                'detected_at' => now(),
            ]];
        }

        return [];
    }

    /**
     * Analyze margin erosion (revenue vs expenses)
     */
    protected function analyzeMarginErosion(): array
    {
        $currentRevenue = $this->query(Payment::class)
            ->where('status', 'completed')
            ->whereYear('date', now()->year)
            ->whereMonth('date', now()->month)
            ->sum('amount');

        $currentExpenses = $this->query(Expense::class)
            ->whereYear('date', now()->year)
            ->whereMonth('date', now()->month)
            ->sum('amount');

        $previousRevenue = $this->query(Payment::class)
            ->where('status', 'completed')
            ->whereYear('date', now()->subMonth()->year)
            ->whereMonth('date', now()->subMonth()->month)
            ->sum('amount');

        $previousExpenses = $this->query(Expense::class)
            ->whereYear('date', now()->subMonth()->year)
            ->whereMonth('date', now()->subMonth()->month)
            ->sum('amount');

        if ($currentRevenue == 0 || $previousRevenue == 0) {
            return [];
        }

        $currentMargin = (($currentRevenue - $currentExpenses) / $currentRevenue) * 100;
        $previousMargin = (($previousRevenue - $previousExpenses) / $previousRevenue) * 100;
        $marginChange = $currentMargin - $previousMargin;

        if ($marginChange < -5) {
            return [[
                'type' => 'warning',
                'category' => 'margin_erosion',
                'severity' => $marginChange < -15 ? 'critical' : 'high',
                'title' => sprintf('Profit margin decreased by %.1f percentage points', abs($marginChange)),
                'description' => sprintf(
                    'Your profit margin fell from %.1f%% to %.1f%% this month.',
                    $previousMargin,
                    $currentMargin
                ),
                'recommendation' => 'Review expense growth relative to revenue and consider pricing adjustments.',
                'metadata' => [
                    'current_margin' => $currentMargin,
                    'previous_margin' => $previousMargin,
                    'margin_change' => $marginChange,
                ],
                'detected_at' => now(),
            ]];
        }

        return [];
    }

    /**
     * Analyze payment delays
     */
    protected function analyzePaymentDelays(): array
    {
        $overdueInvoices = $this->query(Invoice::class)
            ->where('status', 'overdue')
            ->where('due_date', '<', now())
            ->get();

        if ($overdueInvoices->count() == 0) {
            return [];
        }

        $totalOverdue = $overdueInvoices->sum('total_amount');
        $avgDaysLate = $overdueInvoices->avg(function($invoice) {
            return now()->diffInDays($invoice->due_date);
        });

        if ($overdueInvoices->count() > 5 || $avgDaysLate > 30) {
            return [[
                'type' => 'warning',
                'category' => 'payment_delay',
                'severity' => $avgDaysLate > 60 ? 'critical' : 'high',
                'title' => sprintf('%d invoices are overdue', $overdueInvoices->count()),
                'description' => sprintf(
                    'You have $%s in overdue invoices, averaging %.0f days past due.',
                    number_format($totalOverdue, 2),
                    $avgDaysLate
                ),
                'recommendation' => 'Send payment reminders to customers with overdue balances.',
                'metadata' => [
                    'overdue_count' => $overdueInvoices->count(),
                    'total_overdue' => $totalOverdue,
                    'avg_days_late' => $avgDaysLate,
                ],
                'impact_amount' => $totalOverdue,
                'detected_at' => now(),
            ]];
        }

        return [];
    }

    /**
     * Explain revenue changes
     */
    protected function explainRevenueChanges(): array
    {
        $currentMonth = $this->query(Payment::class)
            ->where('status', 'completed')
            ->whereYear('date', now()->year)
            ->whereMonth('date', now()->month)
            ->sum('amount');

        $previousMonth = $this->query(Payment::class)
            ->where('status', 'completed')
            ->whereYear('date', now()->subMonth()->year)
            ->whereMonth('date', now()->subMonth()->month)
            ->sum('amount');

        if ($previousMonth == 0) {
            return [];
        }

        $change = $currentMonth - $previousMonth;
        $percentChange = ($change / $previousMonth) * 100;

        if (abs($percentChange) > 10) {
            $direction = $change > 0 ? 'increased' : 'decreased';

            $description = sprintf(
                'Revenue %s by $%s (%.1f%%) this month compared to last month.',
                $direction,
                number_format(abs($change), 2),
                abs($percentChange)
            );

            return [[
                'type' => 'explanation',
                'category' => $change > 0 ? 'seasonal_pattern' : 'revenue_drop',
                'severity' => 'low',
                'title' => sprintf('Revenue %s %.1f%% MoM', $direction, abs($percentChange)),
                'description' => $description,
                'metadata' => [
                    'current_month' => $currentMonth,
                    'previous_month' => $previousMonth,
                    'change' => $change,
                    'percent_change' => $percentChange,
                ],
                'impact_amount' => abs($change),
                'detected_at' => now(),
            ]];
        }

        return [];
    }

    /**
     * Explain expense changes
     */
    protected function explainExpenseChanges(): array
    {
        $currentMonth = $this->query(Expense::class)
            ->whereYear('date', now()->year)
            ->whereMonth('date', now()->month)
            ->sum('amount');

        $previousMonth = $this->query(Expense::class)
            ->whereYear('date', now()->subMonth()->year)
            ->whereMonth('date', now()->subMonth()->month)
            ->sum('amount');

        if ($previousMonth == 0) {
            return [];
        }

        $change = $currentMonth - $previousMonth;
        $percentChange = ($change / $previousMonth) * 100;

        if (abs($percentChange) > 10) {
            // Find which category changed most
            $currentByCategory = $this->query(Expense::class)
                ->selectRaw('category, SUM(amount) as total')
                ->whereYear('date', now()->year)
                ->whereMonth('date', now()->month)
                ->groupBy('category')
                ->pluck('total', 'category');

            $previousByCategory = $this->query(Expense::class)
                ->selectRaw('category, SUM(amount) as total')
                ->whereYear('date', now()->subMonth()->year)
                ->whereMonth('date', now()->subMonth()->month)
                ->groupBy('category')
                ->pluck('total', 'category');

            $maxChange = 0;
            $maxCategory = null;

            foreach ($currentByCategory as $category => $current) {
                $previous = $previousByCategory->get($category, 0);
                $catChange = $current - $previous;
                
                if (abs($catChange) > abs($maxChange)) {
                    $maxChange = $catChange;
                    $maxCategory = $category;
                }
            }

            $direction = $change > 0 ? 'increased' : 'decreased';
            $description = sprintf(
                'Operating expenses %s by $%s (%.1f%%) this month, mainly due to "%s" which changed by $%s.',
                $direction,
                number_format(abs($change), 2),
                abs($percentChange),
                $maxCategory ?? 'Unknown',
                number_format(abs($maxChange), 2)
            );

            return [[
                'type' => 'explanation',
                'category' => 'vendor_change',
                'severity' => 'low',
                'title' => sprintf('Expenses %s %.1f%% MoM', $direction, abs($percentChange)),
                'description' => $description,
                'metadata' => [
                    'current_month' => $currentMonth,
                    'previous_month' => $previousMonth,
                    'change' => $change,
                    'percent_change' => $percentChange,
                    'top_category' => $maxCategory,
                    'top_category_change' => $maxChange,
                ],
                'impact_amount' => abs($change),
                'detected_at' => now(),
            ]];
        }

        return [];
    }

    /**
     * Create an alert for users
     */
    public function createAlert(array $data): Alert
    {
        if ($this->user) {
            $data['target_user_id'] = $this->user->id;
        }
        
        return Alert::create(array_merge([
            'triggered_at' => now(),
        ], $data));
    }

    /**
     * Check and trigger cash flow warnings
     */
    public function checkCashFlowWarnings(): void
    {
        $outstanding = $this->query(Invoice::class)
            ->whereIn('status', ['pending', 'overdue', 'sent'])
            ->sum('total_amount');

        $monthlyRevenue = $this->query(Payment::class)
            ->where('status', 'completed')
            ->where('date', '>=', now()->subMonth())
            ->sum('amount');

        if ($outstanding > ($monthlyRevenue * 2) && $monthlyRevenue > 0) {
            $this->createAlert([
                'type' => 'cash_flow_warning',
                'priority' => 'high',
                'title' => 'High outstanding invoices',
                'message' => sprintf(
                    'You have $%s in outstanding invoices, which is more than twice your monthly revenue.',
                    number_format((float)$outstanding, 2)
                ),
                'target_role' => 'admin',
                'is_actionable' => true,
                'action_url' => route('invoices.index', ['status' => 'overdue']),
            ]);
        }
    }
}
