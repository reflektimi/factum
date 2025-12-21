<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Payment::class);

        $query = Payment::with(['invoice', 'customer']);
        
        // Search
        if ($request->filled('search')) {
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
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        $payments = $query->latest()->paginate(15);
        
        return $this->render('Payments', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new payment
     */
    public function create()
    {
        $this->authorize('create', Payment::class);

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

        return $this->render('Payments/Create', [
            'invoices' => $invoices,
        ]);
    }

    /**
     * Store a newly created payment
     */
    public function store(Request $request)
    {
        $this->authorize('create', Payment::class);

        $validated = $request->validate([
            'invoice_id' => [
                'required',
                Rule::exists('invoices', 'id')->where(fn ($q) => $q->where('user_id', Auth::id()))
            ],
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
        
        return $this->success('Payment recorded successfully.', ['payment' => $payment], 'payments.show', [$payment->id]);
    }

    /**
     * Display the specified payment
     */
    public function show(Payment $payment)
    {
        $this->authorize('view', $payment);
        
        $payment->load(['invoice.customer', 'activityLogs.user']);
        $payment->logActivity('viewed');

        return $this->render('Payments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Show the form for editing the specified payment
     */
    public function edit(Payment $payment)
    {
        $this->authorize('update', $payment);

        $payment->load('invoice.customer');
        $payment->logActivity('viewed');
        
        return $this->render('Payments/Edit', [
            'payment' => $payment,
        ]);
    }

    /**
     * Update the specified payment
     */
    public function update(Request $request, Payment $payment)
    {
        $this->authorize('update', $payment);

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
        
        return $this->success('Payment updated successfully.', ['payment' => $payment], 'payments.show', [$payment->id]);
    }

    /**
     * Remove the specified payment
     */
    public function destroy(Payment $payment)
    {
        $this->authorize('delete', $payment);

        $payment->delete();
        
        return $this->success('Payment deleted successfully.');
    }
}
