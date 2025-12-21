<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Stats
        $totalInvoices = Invoice::count();
        
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        
        $outstandingAmount = Invoice::whereIn('status', ['pending', 'overdue', 'sent']) // 'sent' is also unpaid
            ->sum('total_amount');
            // Note: This assumes full amount is outstanding. Partial payments logic would be more complex.
            // For now, simpler Chef-Overview.
            
        $paymentsReceived = Payment::where('status', 'completed')
            ->whereMonth('date', Carbon::now()->month)
            ->sum('amount');
            
        $overdueCount = Invoice::where('status', 'overdue')->count();

        // Recent Activity
        $recentInvoices = Invoice::with('customer')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'number' => $invoice->number,
                    'customer' => $invoice->customer ? $invoice->customer->name : 'Unknown',
                    'amount' => $invoice->total_amount,
                    'status' => $invoice->status,
                ];
            });

        $recentPayments = Payment::with('invoice')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'invoice' => $payment->invoice ? $payment->invoice->number : 'N/A',
                    'method' => $payment->payment_method,
                    'amount' => $payment->amount,
                    'status' => $payment->status,
                ];
            });

        // Chart Data (Last 6 months)
        $chartData = collect([]);
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthName = $date->format('M');
            $year = $date->year;
            $month = $date->month;

            $monthlyRevenue = Payment::where('status', 'completed')
                ->whereYear('date', $year)
                ->whereMonth('date', $month)
                ->sum('amount');

            $monthlyExpenses = Expense::whereYear('date', $year)
                ->whereMonth('date', $month)
                ->sum('amount');

            $chartData->push([
                'name' => $monthName,
                'revenue' => $monthlyRevenue,
                'expenses' => $monthlyExpenses,
            ]);
        }

        // Financial Insights
        $insights = \App\Models\FinancialInsight::active()
            ->orderBy('severity', 'desc') // Critical first
            ->orderBy('detected_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($insight) {
                return [
                    'id' => $insight->id,
                    'type' => $insight->type,
                    'category' => $insight->category,
                    'severity' => $insight->severity,
                    'title' => $insight->title,
                    'description' => $insight->description,
                    'recommendation' => $insight->recommendation,
                    'impact_amount' => $insight->impact_amount,
                    'detected_at' => $insight->detected_at->diffForHumans(),
                ];
            });

        // Cash Flow Forecasts
        $forecastData = null;
        $latestConservative = \App\Models\CashFlowForecast::scenario('conservative')
            ->where('generated_at', '>=', now()->subDay())
            ->orderBy('forecast_date')
            ->first();

        if ($latestConservative) {
            // Get all scenarios for the same generation time
            $generatedAt = $latestConservative->generated_at;
            
            $forecastData = [
                'optimistic' => \App\Models\CashFlowForecast::scenario('optimistic')
                    ->where('generated_at', $generatedAt)
                    ->orderBy('forecast_date')
                    ->get()
                    ->map(function ($f) {
                        return [
                            'forecast_date' => $f->forecast_date->toDateString(),
                            'projected_balance' => $f->projected_balance,
                            'total_inflow' => $f->total_inflow,
                            'total_outflow' => $f->total_outflow,
                            'net_cash_flow' => $f->net_cash_flow,
                            'confidence_score' => $f->confidence_score,
                        ];
                    }),
                'conservative' => \App\Models\CashFlowForecast::scenario('conservative')
                    ->where('generated_at', $generatedAt)
                    ->orderBy('forecast_date')
                    ->get()
                    ->map(function ($f) {
                        return [
                            'forecast_date' => $f->forecast_date->toDateString(),
                            'projected_balance' => $f->projected_balance,
                            'total_inflow' => $f->total_inflow,
                            'total_outflow' => $f->total_outflow,
                            'net_cash_flow' => $f->net_cash_flow,
                            'confidence_score' => $f->confidence_score,
                        ];
                    }),
                'pessimistic' => \App\Models\CashFlowForecast::scenario('pessimistic')
                    ->where('generated_at', $generatedAt)
                    ->orderBy('forecast_date')
                    ->get()
                    ->map(function ($f) {
                        return [
                            'forecast_date' => $f->forecast_date->toDateString(),
                            'projected_balance' => $f->projected_balance,
                            'total_inflow' => $f->total_inflow,
                            'total_outflow' => $f->total_outflow,
                            'net_cash_flow' => $f->net_cash_flow,
                            'confidence_score' => $f->confidence_score,
                        ];
                    }),
            ];
        }

        $data = [
            'stats' => [
                'totalInvoices' => $totalInvoices,
                'totalRevenue' => $totalRevenue,
                'outstandingAmount' => $outstandingAmount,
                'paymentsReceived' => $paymentsReceived, // This month
                'overdueCount' => $overdueCount,
            ],
            'recentInvoices' => $recentInvoices,
            'recentPayments' => $recentPayments,
            'chartData' => $chartData,
            'insights' => $insights,
            'forecasts' => $forecastData,
        ];

        return $this->render('Dashboard', $data);
    }
}
