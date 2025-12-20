<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ExpenseController extends Controller
{
    /**
     * Display a listing of expenses
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Expense::class);

        $query = Expense::query();
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('description', 'like', "%{$search}%")
                  ->orWhere('merchant', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
        }
        
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        
        return Inertia::render('Expenses', [
            'expenses' => $query->latest()->paginate(15),
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    /**
     * Show the form for creating a new expense
     */
    public function create()
    {
        $this->authorize('create', Expense::class);

        return Inertia::render('Expenses/Create');
    }

    /**
     * Store a newly created expense
     */
    public function store(Request $request)
    {
        $this->authorize('create', Expense::class);

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'category' => 'required|string',
            'merchant' => 'nullable|string',
            'receipt' => 'nullable|image|max:2048', // 2MB Max
        ]);
        
        $data = $request->only(['description', 'amount', 'date', 'category', 'merchant']);
        
        if ($request->hasFile('receipt')) {
            // Store file in public/receipts
            $file = $request->file('receipt');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('receipts'), $filename);
            $data['receipt_path'] = '/receipts/' . $filename;
        }

        $expense = Expense::create($data);
        
        return redirect()->route('expenses.show', $expense->id)
            ->with('success', 'Expense recorded successfully.');
    }

    /**
     * Display the specified expense
     */
    public function show(Expense $expense)
    {
        $this->authorize('view', $expense);

        $expense->load(['activityLogs.user']);
        $expense->logActivity('viewed');
        return Inertia::render('Expenses/Show', [
            'expense' => $expense,
        ]);
    }

    /**
     * Show the form for editing the specified expense
     */
    public function edit(Expense $expense)
    {
        $this->authorize('update', $expense);

        return Inertia::render('Expenses/Edit', [
            'expense' => $expense,
        ]);
    }

    /**
     * Update the specified expense
     */
    public function update(Request $request, Expense $expense)
    {
        $this->authorize('update', $expense);

        // Validating
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'category' => 'required|string',
        ]);
        
        $expense->update($validated);
        
        return redirect()->route('expenses.show', $expense->id)->with('success', 'Expense updated successfully.');
    }

    /**
     * Remove the specified expense
     */
    public function destroy(Expense $expense)
    {
        $this->authorize('delete', $expense);

        $expense->delete();
        
        return redirect()->route('expenses.index')
            ->with('success', 'Expense deleted successfully.');
    }
}
