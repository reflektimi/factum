<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Expense;
use App\Models\CreditNote;
use App\Models\Report;
use App\Models\ReportLineItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportService
{
    private ?\App\Models\User $user;

    public function __construct(?\App\Models\User $user = null)
    {
        $this->user = $user ?? auth()->user();
    }

    /**
     * Helper to get a user-scoped query for any model
     */
    private function query(string $model)
    {
        if ($this->user) {
            return $model::where('user_id', $this->user->id);
        }
        return $model::query();
    }

    /**
     * Generate Profit & Loss report (income-based, simplified SMB approach)
     */
    public function generateProfitAndLoss(Carbon $startDate, Carbon $endDate): Report
    {
        $report = Report::create([
            'title' => sprintf('Profit & Loss - %s to %s', $startDate->format('M d, Y'), $endDate->format('M d, Y')),
            'type' => 'profit_loss',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'currency' => 'USD',
            'data' => ['summary' => []], // Initialize with empty required structure
            'parameters' => [],
            'generated_at' => now(),
            'generated_by' => $this->user ? $this->user->id : auth()->id(),
        ]);

        $displayOrder = 0;

        // REVENUE SECTION
        $totalRevenue = $this->query(Invoice::class)
            ->whereBetween('date', [$startDate, $endDate])
            ->whereNotIn('status', ['draft'])
            ->sum('total_amount');

        $revenueInvoices = $this->query(Invoice::class)
            ->whereBetween('date', [$startDate, $endDate])
            ->whereNotIn('status', ['draft'])
            ->get();

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'revenue',
            'category' => 'Operating Revenue',
            'line_item_name' => 'Total Revenue',
            'amount' => $totalRevenue,
            'description' => 'Revenue from invoices',
            'source_transactions' => $revenueInvoices->map(fn($inv) => ['type' => 'invoice', 'id' => $inv->id])->toArray(),
            'display_order' => ++$displayOrder,
        ]);

        // Credit Notes (if exists)
        $creditNotes = $this->query(CreditNote::class)->whereBetween('date', [$startDate, $endDate])->sum('amount');
        if ($creditNotes > 0) {
            $creditNoteRecords = $this->query(CreditNote::class)->whereBetween('date', [$startDate, $endDate])->get();
            
            ReportLineItem::create([
                'report_id' => $report->id,
                'section' => 'revenue',
                'category' => 'Adjustments',
                'line_item_name' => 'Less: Credit Notes',
                'amount' => -$creditNotes,
                'description' => 'Credit notes issued',
                'source_transactions' => $creditNoteRecords->map(fn($cn) => ['type' => 'credit_note', 'id' => $cn->id])->toArray(),
                'display_order' => ++$displayOrder,
            ]);
        }

        $netRevenue = $totalRevenue - $creditNotes;

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'revenue',
            'category' => 'Total',
            'line_item_name' => 'Net Revenue',
            'amount' => $netRevenue,
            'description' => 'Total revenue after credits',
            'display_order' => ++$displayOrder,
        ]);

        // EXPENSES SECTION - By Category
        $expensesByCategory = $this->query(Expense::class)
            ->whereBetween('date', [$startDate, $endDate])
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get();

        $totalExpenses = 0;

        foreach ($expensesByCategory as $categoryExpense) {
            $categoryName = $categoryExpense->category ?: 'Uncategorized';
            $categoryAmount = $categoryExpense->total;
            $totalExpenses += $categoryAmount;

            $categoryRecords = $this->query(Expense::class)
                ->whereBetween('date', [$startDate, $endDate])
                ->where('category', $categoryExpense->category)
                ->get();

            ReportLineItem::create([
                'report_id' => $report->id,
                'section' => 'expenses',
                'category' => 'Operating Expenses',
                'subcategory' => $categoryName,
                'line_item_name' => $categoryName,
                'amount' => $categoryAmount,
                'description' => sprintf('%d expenses in %s', count($categoryRecords), $categoryName),
                'source_transactions' => $categoryRecords->map(fn($exp) => ['type' => 'expense', 'id' => $exp->id])->toArray(),
                'display_order' => ++$displayOrder,
            ]);
        }

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'expenses',
            'category' => 'Total',
            'line_item_name' => 'Total Expenses',
            'amount' => $totalExpenses,
            'description' => 'Sum of all expenses',
            'display_order' => ++$displayOrder,
        ]);

        // NET PROFIT
        $netProfit = $netRevenue - $totalExpenses;

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'profit',
            'category' => 'Bottom Line',
            'line_item_name' => 'Net Profit',
            'amount' => $netProfit,
            'description' => 'Revenue minus expenses',
            'display_order' => ++$displayOrder,
        ]);

        // Store summary in report data
        $report->update([
            'data' => [
                'summary' => [
                    'total_revenue' => $totalRevenue,
                    'credit_notes' => $creditNotes,
                    'net_revenue' => $netRevenue,
                    'total_expenses' => $totalExpenses,
                    'net_profit' => $netProfit,
                    'profit_margin' => $netRevenue > 0 ? ($netProfit / $netRevenue) * 100 : 0,
                ],
            ],
        ]);

        return $report->load('lineItems');
    }

    /**
     * Generate Balance Sheet (as of specific date)
     */
    public function generateBalanceSheet(Carbon $asOfDate): Report
    {
        $report = Report::create([
            'title' => sprintf('Balance Sheet - As of %s', $asOfDate->format('M d, Y')),
            'type' => 'balance_sheet',
            'as_of_date' => $asOfDate,
            'currency' => 'USD',
            'data' => ['summary' => []],
            'parameters' => [],
            'generated_at' => now(),
            'generated_by' => $this->user ? $this->user->id : auth()->id(),
        ]);

        $displayOrder = 0;

        // ASSETS
        // Cash (total payments received - total expenses paid)
        $totalPayments = $this->query(Payment::class)
            ->where('status', 'completed')
            ->where('date', '<=', $asOfDate)
            ->sum('amount');

        $totalExpensesPaid = $this->query(Expense::class)
            ->where('date', '<=', $asOfDate)
            ->sum('amount');
        
        $cash = $totalPayments - $totalExpensesPaid;

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'assets',
            'category' => 'Current Assets',
            'subcategory' => 'Cash',
            'line_item_name' => 'Cash',
            'amount' => $cash,
            'description' => 'Cash on hand',
            'display_order' => ++$displayOrder,
        ]);

        // Accounts Receivable (outstanding invoices)
        $accountsReceivable = $this->query(Invoice::class)
            ->whereNotIn('status', ['draft', 'paid'])
            ->where('date', '<=', $asOfDate)
            ->sum('total_amount');

        $outstandingInvoices = $this->query(Invoice::class)
            ->whereNotIn('status', ['draft', 'paid'])
            ->where('date', '<=', $asOfDate)
            ->get();

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'assets',
            'category' => 'Current Assets',
            'subcategory' => 'Accounts Receivable',
            'line_item_name' => 'Accounts Receivable',
            'amount' => $accountsReceivable,
            'description' => 'Unpaid invoices',
            'source_transactions' => $outstandingInvoices->map(fn($inv) => ['type' => 'invoice', 'id' => $inv->id])->toArray(),
            'display_order' => ++$displayOrder,
        ]);

        $totalAssets = $cash + $accountsReceivable;

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'assets',
            'category' => 'Total',
            'line_item_name' => 'Total Assets',
            'amount' => $totalAssets,
            'description' => 'Sum of all assets',
            'display_order' => ++$displayOrder,
        ]);

        // LIABILITIES (simplified - assuming no liabilities tracked yet)
        $totalLiabilities = 0;

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'liabilities',
            'category' => 'Total',
            'line_item_name' => 'Total Liabilities',
            'amount' => $totalLiabilities,
            'description' => 'No liabilities currently tracked',
            'display_order' => ++$displayOrder,
        ]);

        // EQUITY
        // Retained Earnings = Total Assets - Total Liabilities
        $equity = $totalAssets - $totalLiabilities;

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'equity',
            'category' => 'Owner\'s Equity',
            'subcategory' => 'Retained Earnings',
            'line_item_name' => 'Retained Earnings',
            'amount' => $equity,
            'description' => 'Accumulated profits',
            'display_order' => ++$displayOrder,
        ]);

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'equity',
            'category' => 'Total',
            'line_item_name' => 'Total Equity',
            'amount' => $equity,
            'description' => 'Total owner\'s equity',
            'display_order' => ++$displayOrder,
        ]);

        // Store summary
        $report->update([
            'data' => [
                'summary' => [
                    'total_assets' => $totalAssets,
                    'total_liabilities' => $totalLiabilities,
                    'total_equity' => $equity,
                    'balanced' => abs(($totalAssets - ($totalLiabilities + $equity))) < 0.01, // Accounting equation
                ],
                'breakdown' => [
                    'cash' => $cash,
                    'accounts_receivable' => $accountsReceivable,
                ],
            ],
        ]);

        return $report->load('lineItems');
    }

    /**
     * Generate Cash Flow Statement
     */
    public function generateCashFlowStatement(Carbon $startDate, Carbon $endDate): Report
    {
        $report = Report::create([
            'title' => sprintf('Cash Flow Statement - %s to %s', $startDate->format('M d, Y'), $endDate->format('M d, Y')),
            'type' => 'cash_flow',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'currency' => 'USD',
            'data' => ['summary' => []],
            'parameters' => [],
            'generated_at' => now(),
            'generated_by' => $this->user ? $this->user->id : auth()->id(),
        ]);

        $displayOrder = 0;

        // OPERATING ACTIVITIES
        $cashFromCustomers = $this->query(Payment::class)
            ->where('status', 'completed')
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');

        $paymentsReceived = $this->query(Payment::class)
            ->where('status', 'completed')
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'operating',
            'category' => 'Cash Inflows',
            'line_item_name' => 'Cash Received from Customers',
            'amount' => $cashFromCustomers,
            'description' => 'Payments received',
            'source_transactions' => $paymentsReceived->map(fn($p) => ['type' => 'payment', 'id' => $p->id])->toArray(),
            'display_order' => ++$displayOrder,
        ]);

        $cashPaidExpenses = $this->query(Expense::class)->whereBetween('date', [$startDate, $endDate])->sum('amount');

        $expenseRecords = $this->query(Expense::class)->whereBetween('date', [$startDate, $endDate])->get();

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'operating',
            'category' => 'Cash Outflows',
            'line_item_name' => 'Cash Paid for Expenses',
            'amount' => -$cashPaidExpenses,
            'description' => 'Expenses paid',
            'source_transactions' => $expenseRecords->map(fn($e) => ['type' => 'expense', 'id' => $e->id])->toArray(),
            'display_order' => ++$displayOrder,
        ]);

        $netCashFromOperations = $cashFromCustomers - $cashPaidExpenses;

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'operating',
            'category' => 'Total',
            'line_item_name' => 'Net Cash from Operating Activities',
            'amount' => $netCashFromOperations,
            'description' => 'Net operating cash flow',
            'display_order' => ++$displayOrder,
        ]);

        // Beginning and Ending Cash Balance
        $beginningCash = $this->query(Payment::class)
            ->where('status', 'completed')
            ->where('date', '<', $startDate)
            ->sum('amount') - $this->query(Expense::class)->where('date', '<', $startDate)->sum('amount');

        $endingCash = $beginningCash + $netCashFromOperations;

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'summary',
            'category' => 'Cash Position',
            'line_item_name' => 'Beginning Cash Balance',
            'amount' => $beginningCash,
            'description' => 'Cash at start of period',
            'display_order' => ++$displayOrder,
        ]);

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'summary',
            'category' => 'Cash Position',
            'line_item_name' => 'Net Change in Cash',
            'amount' => $netCashFromOperations,
            'description' => 'Change during period',
            'display_order' => ++$displayOrder,
        ]);

        ReportLineItem::create([
            'report_id' => $report->id,
            'section' => 'summary',
            'category' => 'Cash Position',
            'line_item_name' => 'Ending Cash Balance',
            'amount' => $endingCash,
            'description' => 'Cash at end of period',
            'display_order' => ++$displayOrder,
        ]);

        $report->update([
            'data' => [
                'summary' => [
                    'cash_from_customers' => $cashFromCustomers,
                    'cash_paid_expenses' => $cashPaidExpenses,
                    'net_cash_operations' => $netCashFromOperations,
                    'beginning_cash' => $beginningCash,
                    'ending_cash' => $endingCash,
                ],
            ],
        ]);

        return $report->load('lineItems');
    }

    /**
     * Get drill-down transactions for a report line item
     */
    public function getDrillDownTransactions(ReportLineItem $lineItem): array
    {
        $sourceTransactions = $lineItem->source_transactions ?? [];
        
        $transactions = [];

        foreach ($sourceTransactions as $source) {
            $type = $source['type'];
            $id = $source['id'];

            switch ($type) {
                case 'invoice':
                    $invoice = $this->query(Invoice::class)->find($id);
                    if ($invoice) {
                        $transactions[] = [
                            'type' => 'Invoice',
                            'number' => $invoice->number,
                            'date' => $invoice->date->format('Y-m-d'),
                            'description' => $invoice->customer->name ?? 'Unknown',
                            'amount' => $invoice->total_amount,
                            'status' => $invoice->status,
                        ];
                    }
                    break;
 
                case 'payment':
                    $payment = $this->query(Payment::class)->find($id);
                    if ($payment) {
                        $transactions[] = [
                            'type' => 'Payment',
                            'number' => 'PAY-' . $payment->id,
                            'date' => $payment->date->format('Y-m-d'),
                            'description' => $payment->payment_method,
                            'amount' => $payment->amount,
                            'status' => $payment->status,
                        ];
                    }
                    break;
 
                case 'expense':
                    $expense = $this->query(Expense::class)->find($id);
                    if ($expense) {
                        $transactions[] = [
                            'type' => 'Expense',
                            'number' => 'EXP-' . $expense->id,
                            'date' => $expense->date->format('Y-m-d'),
                            'description' => $expense->description,
                            'amount' => $expense->amount,
                            'status' => 'paid',
                        ];
                    }
                    break;
 
                case 'credit_note':
                    $creditNote = $this->query(CreditNote::class)->find($id);
                    if ($creditNote) {
                        $transactions[] = [
                            'type' => 'Credit Note',
                            'number' => $creditNote->number,
                            'date' => $creditNote->date->format('Y-m-d'),
                            'description' => $creditNote->reason ?? 'Credit issued',
                            'amount' => $creditNote->amount,
                            'status' => 'issued',
                        ];
                    }
                    break;
            }
        }

        return $transactions;
    }
}
