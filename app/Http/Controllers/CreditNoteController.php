<?php

namespace App\Http\Controllers;

use App\Models\CreditNote;
use App\Models\Invoice;
use App\Models\Account;
use App\Http\Requests\StoreCreditNoteRequest;
use App\Http\Requests\UpdateCreditNoteRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CreditNoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', CreditNote::class);

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
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $creditNotes = $query->paginate(10)->withQueryString();

        return $this->render('CreditNotes', [
            'creditNotes' => $creditNotes,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', CreditNote::class);

        $customers = Account::where('type', 'customer')->orderBy('name')->get();
        
        return $this->render('CreditNotes/Create', [
            'customers' => $customers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCreditNoteRequest $request)
    {
        $this->authorize('create', CreditNote::class);

        $validated = $request->validated();
        $items = $validated['items'];
        unset($validated['items']);

        $amount = collect($items)->sum(function ($item) {
            return $item['quantity'] * $item['price'];
        });

        return DB::transaction(function () use ($validated, $items, $amount) {
            $creditNote = CreditNote::create([
                ...$validated,
                'amount' => $amount,
            ]);

            foreach ($items as $index => $item) {
                $creditNote->lineItems()->create([
                    'user_id' => Auth::id(),
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'subtotal' => $item['quantity'] * $item['price'],
                    'total' => $item['quantity'] * $item['price'],
                    'sort_order' => $index,
                ]);
            }

            return redirect()->route('credit-notes.show', $creditNote->id)
                ->with('success', 'Credit Note created successfully.');
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(CreditNote $creditNote)
    {
        $this->authorize('view', $creditNote);

        $creditNote->load(['customer', 'invoice', 'lineItems', 'activityLogs.user']);
        $creditNote->logActivity('viewed');
        
        // Map lineItems to the 'items' format expected by the frontend
        $creditNote->items = $creditNote->lineItems->map(function ($item) {
            return [
                'description' => $item->description,
                'quantity' => $item->quantity,
                'price' => $item->unit_price,
                'total' => $item->total,
            ];
        });

        return $this->render('CreditNotes/Show', [
            'creditNote' => $creditNote,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CreditNote $creditNote)
    {
        $this->authorize('update', $creditNote);

        $customers = Account::where('type', 'customer')->orderBy('name')->get();
        return $this->render('CreditNotes/Edit', [
            'creditNote' => $creditNote,
            'customers' => $customers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCreditNoteRequest $request, CreditNote $creditNote)
    {
        $this->authorize('update', $creditNote);

        $validated = $request->validated();
        $items = $validated['items'];
        unset($validated['items']);

        $amount = collect($items)->sum(function ($item) {
            return $item['quantity'] * $item['price'];
        });

        return DB::transaction(function () use ($creditNote, $validated, $items, $amount) {
            $creditNote->update([
                ...$validated,
                'amount' => $amount,
            ]);

            // Sync items: delete existing and recreate
            $creditNote->lineItems()->delete();

            foreach ($items as $index => $item) {
                $creditNote->lineItems()->create([
                    'user_id' => Auth::id(),
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'subtotal' => $item['quantity'] * $item['price'],
                    'total' => $item['quantity'] * $item['price'],
                    'sort_order' => $index,
                ]);
            }

            return redirect()->route('credit-notes.show', $creditNote->id)
                ->with('success', 'Credit Note updated successfully.');
        });
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
