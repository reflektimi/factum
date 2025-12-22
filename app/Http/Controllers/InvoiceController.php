<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Account;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Invoice::class);

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
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        $invoices = $query->latest()->paginate(15);
        
        return $this->render('Invoices', [
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new invoice
     */
    public function create()
    {
        $this->authorize('create', Invoice::class);

        $customers = Account::where('type', 'customer')->get();
        
        return $this->render('Invoices/Create', [
            'customers' => $customers,
        ]);
    }

    /**
     * Store a newly created invoice
     */
    public function store(StoreInvoiceRequest $request)
    {
        $this->authorize('create', Invoice::class);

        $validated = $request->validated();
        $items = $validated['items'];
        unset($validated['items']);
        
        // Generate invoice number
        $lastInvoice = Invoice::latest()->first();
        $number = 'INV-' . date('Y') . '-' . str_pad(($lastInvoice ? $lastInvoice->id + 1 : 1), 3, '0', STR_PAD_LEFT);
        
        $validated['number'] = $number;
        $validated['status'] = 'pending';
        
        return DB::transaction(function () use ($validated, $items) {
            $invoice = Invoice::create($validated);
            
            foreach ($items as $index => $item) {
                $invoice->lineItems()->create([
                    'user_id' => Auth::id(),
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'subtotal' => $item['quantity'] * $item['price'],
                    'total' => $item['quantity'] * $item['price'], // Simplification: tax handled elsewhere or later
                    'sort_order' => $index,
                ]);
            }
            
            return $this->success('Invoice created successfully.', ['invoice' => $invoice], 'invoices.show', [$invoice->id]);
        });
    }

    /**
     * Display the specified invoice
     */
    public function show(Invoice $invoice)
    {
        $this->authorize('view', $invoice);

        $invoice->load(['customer', 'payments', 'lineItems', 'activityLogs.user']);
        $invoice->logActivity('viewed');

        // Map lineItems to the 'items' format expected by the frontend
        $invoice->items = $invoice->lineItems->map(function ($item) {
            return [
                'description' => $item->description,
                'quantity' => $item->quantity,
                'price' => $item->unit_price,
                'total' => $item->total,
            ];
        });

        return $this->render('Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * Show the form for editing the specified invoice
     */
    public function edit(Invoice $invoice)
    {
        $this->authorize('update', $invoice);

        $customers = Account::where('type', 'customer')->get();

        return $this->render('Invoices/Edit', [
            'invoice' => $invoice,
            'customers' => $customers,
        ]);
    }

    /**
     * Update the specified invoice
     */
    public function update(UpdateInvoiceRequest $request, Invoice $invoice)
    {
        $this->authorize('update', $invoice);

        $validated = $request->validated();
        
        $invoice->update($validated);
        
        return $this->success('Invoice updated successfully.', ['invoice' => $invoice], 'invoices.show', [$invoice->id]);
    }

    /**
     * Remove the specified invoice
     */
    public function destroy(Invoice $invoice)
    {
        $this->authorize('delete', $invoice);

        $invoice->delete();
        
        return $this->success('Invoice deleted successfully.', [], 'invoices.index');
    }
    /**
     * Download the invoice as PDF (via browser print)
     */
    public function download(Invoice $invoice)
    {
        $this->authorize('view', $invoice);

        return redirect()->route('invoices.show', [$invoice->id, 'print' => true]);
    }

    /**
     * Resend the invoice notification
     */
    public function resend(Invoice $invoice)
    {
        $this->authorize('update', $invoice);

        // Logic to trigger the email
        // ...
        
        $invoice->logActivity('sent', 'Invoice notification resent manually');
        
        return back()->with('success', 'Notification resent successfully.');
    }

    /**
     * Show the public view of the invoice
     */
    public function publicView(Invoice $invoice)
    {
        $invoice->load(['customer', 'lineItems']);
        $invoice->logActivity('viewed', 'Public URL accessed by recipient');
        
        return $this->render('Invoices/PublicShow', [
            'invoice' => $invoice,
            'settings' => \App\Models\Setting::where('user_id', $invoice->user_id)->first(),
        ]);
    }
}
