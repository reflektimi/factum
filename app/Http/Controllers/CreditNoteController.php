<?php

namespace App\Http\Controllers;

use App\Models\CreditNote;
use App\Models\Invoice;
use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class CreditNoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CreditNote::with(['customer', 'invoice'])
            ->orderBy('date', 'desc');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $creditNotes = $query->paginate(10)->withQueryString();

        return Inertia::render('CreditNotes', [
            'creditNotes' => $creditNotes,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $customers = Account::where('type', 'customer')->orderBy('name')->get();
        // Allow linking to invoices? Ideally fetch invoices via AJAX based on customer, 
        // but for now, we can list recent invoices or just allow unlinked.
        // Or pass invoices if 'invoice_id' is in query string (Convert invoice to credit note?).
        
        return Inertia::render('CreditNotes/Create', [
            'customers' => $customers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|string|unique:credit_notes,number',
            'customer_id' => 'required|exists:accounts,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.price' => 'required|numeric|min:0',
            'status' => 'required|in:draft,sent,refunded',
            'notes' => 'nullable|string',
        ]);

        $amount = collect($request->items)->sum(function ($item) {
            return $item['quantity'] * $item['price'];
        });

        CreditNote::create([
            ...$validated,
            'amount' => $amount,
        ]);

        return redirect()->route('credit-notes.index')
            ->with('success', 'Credit Note created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(CreditNote $creditNote)
    {
        $creditNote->load(['customer', 'invoice']);
        return Inertia::render('CreditNotes/Show', [
            'creditNote' => $creditNote,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CreditNote $creditNote)
    {
        $customers = Account::where('type', 'customer')->orderBy('name')->get();
        return Inertia::render('CreditNotes/Edit', [
            'creditNote' => $creditNote,
            'customers' => $customers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CreditNote $creditNote)
    {
        $validated = $request->validate([
            'number' => ['required', 'string', Rule::unique('credit_notes')->ignore($creditNote->id)],
            'customer_id' => 'required|exists:accounts,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.price' => 'required|numeric|min:0',
            'status' => 'required|in:draft,sent,refunded',
            'notes' => 'nullable|string',
        ]);

        $amount = collect($request->items)->sum(function ($item) {
            return $item['quantity'] * $item['price'];
        });

        $creditNote->update([
            ...$validated,
            'amount' => $amount,
        ]);

        return redirect()->route('credit-notes.index')
            ->with('success', 'Credit Note updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CreditNote $creditNote)
    {
        $creditNote->delete();
        return redirect()->route('credit-notes.index')
            ->with('success', 'Credit Note deleted successfully.');
    }
}
