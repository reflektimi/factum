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
        $this->authorize('viewAny', Report::class);

        $reports = Report::with('generatedBy')->latest()->paginate(10);
        
        return $this->render('Reports', [
            'reports' => $reports,
        ]);
    }

    /**
     * Generate a new report
     */
    public function store(Request $request)
    {
        $this->authorize('create', Report::class);

        $validated = $request->validate([
            'type' => 'required|in:profit_loss,balance_sheet,cash_flow',
            'start_date' => 'required_if:type,profit_loss,cash_flow|date',
            'end_date' => 'required_if:type,profit_loss,cash_flow|date|after_or_equal:start_date',
            'as_of_date' => 'required_if:type,balance_sheet|date',
        ]);

        $reportService = new \App\Services\ReportService(Auth::user());
        
        try {
            $report = match($validated['type']) {
                'profit_loss' => $reportService->generateProfitAndLoss(
                    \Carbon\Carbon::parse($validated['start_date']),
                    \Carbon\Carbon::parse($validated['end_date'])
                ),
                'balance_sheet' => $reportService->generateBalanceSheet(
                    \Carbon\Carbon::parse($validated['as_of_date'])
                ),
                'cash_flow' => $reportService->generateCashFlowStatement(
                    \Carbon\Carbon::parse($validated['start_date']),
                    \Carbon\Carbon::parse($validated['end_date'])
                ),
            };

            return redirect()->route('reports.show', $report->id)
                ->with('success', 'Report generated successfully.');
                
        } catch (\Exception $e) {
            \Log::error('Report Generation Failed: ' . $e->getMessage(), [
                'type' => $validated['type'],
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['error' => 'Failed to generate report: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified report
     */
    public function show(Report $report)
    {
        $this->authorize('view', $report);

        return $this->render('Reports/Show', [
            'report' => $report->load(['generatedBy', 'lineItems']),
        ]);
    }

    /**
     * Get drill-down transactions for a report line item
     */
    public function drillDown(Request $request, Report $report)
    {
        $this->authorize('view', $report);

        $validated = $request->validate([
            'line_item_id' => 'required|exists:report_line_items,id',
        ]);

        $lineItem = \App\Models\ReportLineItem::findOrFail($validated['line_item_id']);

        // Double check ownership via report_id (though findOrFail on scoped model already handles it)
        if ($lineItem->report_id !== $report->id) {
            abort(403);
        }

        $reportService = new \App\Services\ReportService(Auth::user());
        $transactions = $reportService->getDrillDownTransactions($lineItem);

        return response()->json([
            'line_item' => $lineItem,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Download the report as PDF (via browser print)
     */
    public function download(Report $report)
    {
        $this->authorize('view', $report);

        return redirect()->route('reports.show', [$report->id, 'print' => true]);
    }
}
