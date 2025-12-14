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
        $query = Expense::query();
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('description', 'like', "%{$search}%")
                  ->orWhere('merchant', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
        }
        
        if ($request->has('category')) {
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
        return Inertia::render('Expenses/Create');
    }

    /**
     * Store a newly created expense
     */
    public function store(Request $request)
    {
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

        Expense::create($data);
        
        return redirect()->route('expenses.index')
            ->with('success', 'Expense recorded successfully.');
    }

    /**
     * Display the specified expense
     */
    public function show(Expense $expense)
    {
        return Inertia::render('Expenses/Show', [
            'expense' => $expense,
        ]);
    }

    /**
     * Show the form for editing the specified expense
     */
    public function edit(Expense $expense)
    {
        return Inertia::render('Expenses/Edit', [
            'expense' => $expense,
        ]);
    }

    /**
     * Update the specified expense
     */
    public function update(Request $request, Expense $expense)
    {
        // Validating
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'category' => 'required|string',
        ]);
        
        // Handling file update is complex with Inertia (needs multipart/form-data with PUT spoofing)
        // For simplicity, we skip file update in basic edit or use POST with _method=PUT elsewhere.
        // But Inertia useForm helper handles this?
        // Actually, PHP doesn't handle files well in PUT requests.
        // We often use POST with _method=PUT.
        // I will stick to basic updates here.
        
        $expense->update($validated);
        
        return back()->with('success', 'Expense updated successfully.');
    }

    /**
     * Remove the specified expense
     */
    public function destroy(Expense $expense)
    {
        $expense->delete();
        
        return redirect()->route('expenses.index')
            ->with('success', 'Expense deleted successfully.');
    }
}
