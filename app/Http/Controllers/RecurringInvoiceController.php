<?php

namespace App\Http\Controllers;

use App\Models\RecurringInvoice;
use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecurringInvoiceController extends Controller
{
    /**
     * Display a listing of the recurring invoices.
     */
    public function index(Request $request)
    {
        $query = RecurringInvoice::with('customer')
            ->orderBy('next_run_date', 'asc');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('profile_name', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $recurringInvoices = $query->paginate(10)->withQueryString();

        return Inertia::render('RecurringInvoices', [
            'recurringInvoices' => $recurringInvoices,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new recurring invoice.
     */
    public function create()
    {
        $customers = Account::where('type', 'customer')->orderBy('name')->get();
        return Inertia::render('RecurringInvoices/Create', [
            'customers' => $customers,
        ]);
    }

    /**
     * Store a newly created recurring invoice in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'profile_name' => 'required|string|max:255',
            'customer_id' => 'required|exists:accounts,id',
            'interval' => 'required|in:monthly,quarterly,yearly',
            'start_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.price' => 'required|numeric|min:0',
            'auto_send' => 'boolean',
        ]);

        $totalAmount = collect($request->items)->sum(function ($item) {
            return $item['quantity'] * $item['price'];
        });

        // Next run date starts as start_date
        $nextRunDate = $request->start_date;

        RecurringInvoice::create([
            ...$validated,
            'status' => 'active',
            'items' => $request->items,
            'total_amount' => $totalAmount,
            'next_run_date' => $nextRunDate,
        ]);

        return redirect()->route('recurring-invoices.index')
            ->with('success', 'Recurring invoice profile created successfully.');
    }

    /**
     * Show the form for editing the specified recurring invoice.
     */
    public function edit(RecurringInvoice $recurringInvoice)
    {
        $customers = Account::where('type', 'customer')->orderBy('name')->get();
        return Inertia::render('RecurringInvoices/Edit', [
            'recurringInvoice' => $recurringInvoice,
            'customers' => $customers,
        ]);
    }
    /**
     * Display the specified recurring invoice.
     */
    public function show(RecurringInvoice $recurringInvoice)
    {
        $recurringInvoice->load('customer');
        return Inertia::render('RecurringInvoices/Show', [
            'recurringInvoice' => $recurringInvoice,
        ]);
    }

    /**
     * Update the specified recurring invoice in storage.
     */
    public function update(Request $request, RecurringInvoice $recurringInvoice)
    {
        $validated = $request->validate([
            'profile_name' => 'required|string|max:255',
            'customer_id' => 'required|exists:accounts,id',
            'interval' => 'required|in:monthly,quarterly,yearly',
            'start_date' => 'required|date',
            'status' => 'required|in:active,paused,ended',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.price' => 'required|numeric|min:0',
            'auto_send' => 'boolean',
        ]);

        $totalAmount = collect($request->items)->sum(function ($item) {
            return $item['quantity'] * $item['price'];
        });

        $recurringInvoice->update([
            ...$validated,
            'items' => $request->items,
            'total_amount' => $totalAmount,
        ]);

        return redirect()->route('recurring-invoices.index')
            ->with('success', 'Recurring invoice profile updated successfully.');
    }

    /**
     * Remove the specified recurring invoice from storage.
     */
    public function destroy(RecurringInvoice $recurringInvoice)
    {
        $recurringInvoice->delete();
        return redirect()->route('recurring-invoices.index')
            ->with('success', 'Recurring invoice profile deleted successfully.');
    }
}
