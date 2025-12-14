<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices
     */
    public function index(Request $request)
    {
        $query = Invoice::with('customer');
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $invoices = $query->latest()->paginate(15);
        
        return Inertia::render('Invoices', [
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new invoice
     */
    public function create()
    {
        $customers = Account::where('type', 'customer')->get();
        
        return Inertia::render('Invoices/Create', [
            'customers' => $customers,
        ]);
    }

    /**
     * Store a newly created invoice
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:accounts,id',
            'date' => 'required|date',
            'due_date' => 'required|date|after:date',
            'items' => 'required|array',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
        ]);
        
        // Generate invoice number
        $lastInvoice = Invoice::latest()->first();
        $number = 'INV-' . date('Y') . '-' . str_pad(($lastInvoice ? $lastInvoice->id + 1 : 1), 3, '0', STR_PAD_LEFT);
        
        $validated['number'] = $number;
        $validated['status'] = 'pending';
        
        Invoice::create($validated);
        
        return redirect()->route('invoices.index')
            ->with('success', 'Invoice created successfully.');
    }

    /**
     * Display the specified invoice
     */
    public function show(Invoice $invoice)
    {
        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice->load('customer', 'payments'),
        ]);
    }

    /**
     * Show the form for editing the specified invoice
     */
    public function edit(Invoice $invoice)
    {
        $customers = Account::where('type', 'customer')->get();

        return Inertia::render('Invoices/Edit', [
            'invoice' => $invoice,
            'customers' => $customers,
        ]);
    }

    /**
     * Update the specified invoice
     */
    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,paid,overdue',
        ]);
        
        $invoice->update($validated);
        
        return back()->with('success', 'Invoice updated successfully.');
    }

    /**
     * Remove the specified invoice
     */
    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        
        return redirect()->route('invoices.index')
            ->with('success', 'Invoice deleted successfully.');
    }
}
