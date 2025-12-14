<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\Account;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuoteController extends Controller
{
    /**
     * Display a listing of quotes
     */
    public function index(Request $request)
    {
        $query = Quote::with('customer');
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }
        
        if ($request->has('status')) {
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
        return Inertia::render('Quotes/Create', [
            'customers' => Account::where('type', 'customer')->get(),
        ]);
    }

    /**
     * Store a newly created quote
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:accounts,id',
            'date' => 'required|date',
            'expiry_date' => 'required|date|after_or_equal:date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.price' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric',
            'notes' => 'nullable|string',
        ]);
        
        $validated['status'] = 'draft';
        $validated['number'] = 'QT-' . strtoupper(uniqid());

        $quote = Quote::create($validated);
        
        return redirect()->route('quotes.show', $quote->id)
            ->with('success', 'Quote created successfully.');
    }

    /**
     * Display the specified quote
     */
    public function show(Quote $quote)
    {
        return Inertia::render('Quotes/Show', [
            'quote' => $quote->load('customer'),
        ]);
    }

    /**
     * Show the form for editing the specified quote
     */
    public function edit(Quote $quote)
    {
        return Inertia::render('Quotes/Edit', [
            'quote' => $quote,
            'customers' => Account::where('type', 'customer')->get(),
        ]);
    }

    /**
     * Update the specified quote
     */
    public function update(Request $request, Quote $quote)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:accounts,id',
            'date' => 'required|date',
            'expiry_date' => 'required|date|after_or_equal:date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.price' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric',
            'status' => 'required|in:draft,sent,accepted,rejected,converted',
            'notes' => 'nullable|string',
        ]);
        
        $quote->update($validated);
        
        return back()->with('success', 'Quote updated successfully.');
    }

    /**
     * Remove the specified quote
     */
    public function destroy(Quote $quote)
    {
        $quote->delete();
        
        return redirect()->route('quotes.index')
            ->with('success', 'Quote deleted successfully.');
    }

    /**
     * Convert quote to invoice
     */
    public function convert(Quote $quote)
    {
        if ($quote->status === 'converted') {
            return back()->with('error', 'Quote is already converted.');
        }

        $invoice = Invoice::create([
            'customer_id' => $quote->customer_id,
            'number' => 'INV-' . strtoupper(uniqid()),
            'date' => now(),
            'due_date' => now()->addDays(30),
            'items' => $quote->items,
            'total_amount' => $quote->total_amount,
            'status' => 'pending',
        ]);
        
        $quote->update(['status' => 'converted']);
        
        return redirect()->route('invoices.show', $invoice->id)
            ->with('success', 'Quote converted to Invoice successfully.');
    }
}
