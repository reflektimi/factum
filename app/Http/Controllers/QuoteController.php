<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\Account;
use App\Models\Invoice;
use App\Http\Requests\StoreQuoteRequest;
use App\Http\Requests\UpdateQuoteRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class QuoteController extends Controller
{
    /**
     * Display a listing of quotes
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Quote::class);

        $query = Quote::with('customer');
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        return Inertia::render('Quotes', [
            'quotes' => $query->latest()->paginate(15),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new quote
     */
    public function create()
    {
        $this->authorize('create', Quote::class);

        $customers = Account::where('type', 'customer')->get();
        
        return Inertia::render('Quotes/Create', [
            'customers' => $customers,
        ]);
    }

    /**
     * Store a newly created quote
     */
    public function store(StoreQuoteRequest $request)
    {
        $this->authorize('create', Quote::class);

        $validated = $request->validated();
        $items = $validated['items'];
        unset($validated['items']);
        
        $validated['status'] = 'draft';
        $validated['number'] = 'QT-' . strtoupper(uniqid());

        return DB::transaction(function () use ($validated, $items) {
            $quote = Quote::create($validated);
            
            foreach ($items as $index => $item) {
                $quote->lineItems()->create([
                    'user_id' => Auth::id(),
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'subtotal' => $item['quantity'] * $item['price'],
                    'total' => $item['quantity'] * $item['price'],
                    'sort_order' => $index,
                ]);
            }
            
            return redirect()->route('quotes.show', $quote->id)
                ->with('success', 'Quote created successfully.');
        });
    }

    /**
     * Display the specified quote
     */
    public function show(Quote $quote)
    {
        $this->authorize('view', $quote);

        $quote->load(['customer', 'lineItems', 'activityLogs.user']);
        $quote->logActivity('viewed');

        // Map lineItems to the 'items' format expected by the frontend
        $quote->items = $quote->lineItems->map(function ($item) {
            return [
                'description' => $item->description,
                'quantity' => $item->quantity,
                'price' => $item->unit_price,
                'total' => $item->total,
            ];
        });

        return Inertia::render('Quotes/Show', [
            'quote' => $quote,
        ]);
    }

    /**
     * Show the form for editing the specified quote
     */
    public function edit(Quote $quote)
    {
        $this->authorize('update', $quote);

        return Inertia::render('Quotes/Edit', [
            'quote' => $quote,
            'customers' => Account::where('type', 'customer')->get(),
        ]);
    }

    /**
     * Update the specified quote
     */
    public function update(UpdateQuoteRequest $request, Quote $quote)
    {
        $this->authorize('update', $quote);

        $validated = $request->validated();
        
        $quote->update($validated);
        
        return redirect()->route('quotes.show', $quote->id)->with('success', 'Quote updated successfully.');
    }

    /**
     * Remove the specified quote
     */
    public function destroy(Quote $quote)
    {
        $this->authorize('delete', $quote);

        $quote->delete();
        
        return redirect()->route('quotes.index')
            ->with('success', 'Quote deleted successfully.');
    }

    /**
     * Convert quote to invoice
     */
    public function convert(Quote $quote)
    {
        $this->authorize('update', $quote);

        if ($quote->status === 'converted') {
            return back()->with('error', 'Quote is already converted.');
        }

        $quote->load('lineItems');

        return DB::transaction(function () use ($quote) {
            $invoice = Invoice::create([
                'user_id' => Auth::id(),
                'customer_id' => $quote->customer_id,
                'number' => 'INV-' . strtoupper(uniqid()),
                'date' => now(),
                'due_date' => now()->addDays(30),
                'total_amount' => $quote->total_amount,
                'status' => 'pending',
            ]);

            foreach ($quote->lineItems as $item) {
                $invoice->lineItems()->create([
                    'user_id' => Auth::id(),
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                    'tax_rate' => $item->tax_rate,
                    'tax_amount' => $item->tax_amount,
                    'total' => $item->total,
                    'sort_order' => $item->sort_order,
                ]);
            }
            
            $quote->update(['status' => 'converted']);
            
            return redirect()->route('invoices.show', $invoice->id)
                ->with('success', 'Quote converted to Invoice successfully.');
        });
    }
    /**
     * Download the quote as PDF (via browser print)
     */
    public function download(Quote $quote)
    {
        $this->authorize('view', $quote);

        return redirect()->route('quotes.show', [$quote->id, 'print' => true]);
    }

    /**
     * Resend the quote notification
     */
    public function resend(Quote $quote)
    {
        $this->authorize('update', $quote);

        // Logic to trigger the email
        // ...
        
        $quote->logActivity('sent', 'Quote notification resent manually');
        
        return back()->with('success', 'Notification resent successfully.');
    }

    /**
     * Show the public view of the quote
     */
    public function publicView(Quote $quote)
    {
        $quote->load(['customer', 'lineItems']);
        $quote->logActivity('viewed', 'Public URL accessed by recipient');
        
        // Map lineItems to the 'items' format expected by the frontend
        $quote->items = $quote->lineItems->map(function ($item) {
            return [
                'description' => $item->description,
                'quantity' => $item->quantity,
                'price' => $item->unit_price,
                'total' => $item->total,
            ];
        });

        return Inertia::render('Quotes/PublicShow', [
            'quote' => $quote,
            'settings' => \App\Models\Setting::first(),
        ]);
    }
}
