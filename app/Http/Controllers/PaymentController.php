<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments
     */
    public function index(Request $request)
    {
        $query = Payment::with(['invoice', 'customer']);
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('invoice', function($q) use ($search) {
                    $q->where('number', 'like', "%{$search}%");
                })
                ->orWhereHas('customer', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            });
        }
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $payments = $query->latest()->paginate(15);
        
        return Inertia::render('Payments', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new payment
     */
    public function create()
    {
        $invoices = Invoice::where('status', '!=', 'paid')
            ->with('customer')
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'number' => $invoice->number,
                    'customer_name' => $invoice->customer->name,
                    'amount' => $invoice->total_amount,
                    'balance' => $invoice->total_amount - $invoice->payments()->where('status', 'completed')->sum('amount'),
                ];
            });

        return Inertia::render('Payments/Create', [
            'invoices' => $invoices,
        ]);
    }

    /**
     * Store a newly created payment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'date' => 'required|date',
            'status' => 'required|in:pending,completed',
        ]);
        
        $invoice = Invoice::findOrFail($validated['invoice_id']);
        $validated['customer_id'] = $invoice->customer_id;
        
        $payment = Payment::create($validated);
        
        // Update invoice status if fully paid
        if ($validated['status'] === 'completed') {
            $totalPaid = $invoice->payments()->where('status', 'completed')->sum('amount');
            if ($totalPaid >= $invoice->total_amount) {
                $invoice->update(['status' => 'paid']);
            }
        }
        
        return back()->with('success', 'Payment recorded successfully.');
    }

    /**
     * Display the specified payment
     */
    public function show(Payment $payment)
    {
        return Inertia::render('Payments/Show', [
            'payment' => $payment->load('invoice.customer'),
        ]);
    }

    /**
     * Show the form for editing the specified payment
     */
    public function edit(Payment $payment)
    {
        $payment->load('invoice.customer');
        
        return Inertia::render('Payments/Edit', [
            'payment' => $payment,
        ]);
    }

    /**
     * Update the specified payment
     */
    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'date' => 'required|date',
            'status' => 'required|in:pending,completed',
        ]);
        
        $payment->update($validated);
        
        // Update invoice status
        $invoice = $payment->invoice;
        $totalPaid = $invoice->payments()->where('status', 'completed')->sum('amount');
        
        if ($totalPaid >= $invoice->total_amount) {
            $invoice->update(['status' => 'paid']);
        } else {
            $invoice->update(['status' => 'pending']);
        }
        
        return back()->with('success', 'Payment updated successfully.');
    }

    /**
     * Remove the specified payment
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();
        
        return back()->with('success', 'Payment deleted successfully.');
    }
}
