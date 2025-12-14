<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    /**
     * Display a listing of reports
     */
    public function index()
    {
        $reports = Report::with('generatedBy')->latest()->paginate(10);
        
        return Inertia::render('Reports', [
            'reports' => $reports,
        ]);
    }

    /**
     * Generate a new report
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expenses,cash_flow,outstanding',
            'title' => 'required|string',
        ]);
        
        $data = [];
        
        switch ($validated['type']) {
            case 'income': // Treat as Profit & Loss
                $data = $this->generateIncomeData();
                break;
            case 'outstanding':
                $data = $this->generateOutstandingData();
                break;
            case 'cash_flow':
                $data = $this->generateCashFlowData();
                break;
            case 'expenses':
                $data = $this->generateExpenseReport();
                break;
            default:
                $data = ['message' => 'Report type not implemented yet'];
        }
        
        Report::create([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'data' => $data,
            'generated_at' => now(),
            'generated_by' => Auth::id(),
        ]);
        
        return back()->with('success', 'Report generated successfully.');
    }

    /**
     * Display the specified report
     */
    public function show(Report $report)
    {
        return Inertia::render('Reports/Show', [
            'report' => $report->load('generatedBy'),
        ]);
    }

    // Helper methods for report generation
    private function generateIncomeData()
    {
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $totalExpenses = Expense::sum('amount');
        
        $monthlyRevenue = Payment::where('status', 'completed')
            ->whereMonth('date', now()->month)
            ->sum('amount');
            
        return [
            'total_revenue' => $totalRevenue,
            'total_expenses' => $totalExpenses,
            'net_profit' => $totalRevenue - $totalExpenses,
            'monthly_revenue' => $monthlyRevenue,
            'generated_at' => now()->toDateTimeString(),
        ];
    }
    
    private function generateOutstandingData()
    {
        $outstanding = Invoice::whereNotIn('status', ['paid', 'draft'])->sum('total_amount');
        $overdue = Invoice::where('status', 'overdue')->sum('total_amount');
        $draft = Invoice::where('status', 'draft')->sum('total_amount');
        
        return [
            'total_outstanding' => $outstanding,
            'total_overdue' => $overdue,
            'total_draft' => $draft,
            'generated_at' => now()->toDateTimeString(),
        ];
    }
    
    private function generateCashFlowData()
    {
        $inflow = Payment::where('status', 'completed')->sum('amount');
        $outflow = Expense::sum('amount');
        
        return [
            'inflow' => $inflow,
            'outflow' => $outflow,
            'net' => $inflow - $outflow,
            'generated_at' => now()->toDateTimeString(),
        ];
    }

    private function generateExpenseReport()
    {
        // Expenses by Category
        $byCategory = Expense::selectRaw('category, sum(amount) as total')
            ->groupBy('category')
            ->pluck('total', 'category');

        return [
            'total_expenses' => Expense::sum('amount'),
            'by_category' => $byCategory,
            'generated_at' => now()->toDateTimeString(),
        ];
    }
}
