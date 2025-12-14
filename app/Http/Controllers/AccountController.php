<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    /**
     * Display a listing of accounts
     */
    public function index(Request $request)
    {
        $query = Account::query();
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }
        
        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        $accounts = $query->latest()->paginate(15);
        
        return Inertia::render('Accounts', [
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    /**
     * Show the form for creating a new account
     */
    public function create()
    {
        return Inertia::render('Accounts/Create');
    }

    /**
     * Store a newly created account
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:customer,supplier',
            'contact_info' => 'nullable|array',
            'contact_info.email' => 'nullable|email',
            'contact_info.phone' => 'nullable|string',
            'contact_info.address' => 'nullable|string',
            'balance' => 'nullable|numeric',
        ]);
        
        Account::create($validated);
        
        return back()->with('success', 'Account created successfully.');
    }

    /**
     * Display the specified account
     */
    public function show(Account $account)
    {
        return Inertia::render('Accounts/Show', [
            'account' => $account->load(['invoices', 'payments']),
        ]);
    }

    /**
     * Show the form for editing the specified account
     */
    public function edit(Account $account)
    {
        return Inertia::render('Accounts/Edit', [
            'account' => $account,
        ]);
    }

    /**
     * Update the specified account
     */
    public function update(Request $request, Account $account)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:customer,supplier',
            'contact_info' => 'nullable|array',
            'balance' => 'nullable|numeric',
        ]);
        
        $account->update($validated);
        
        return back()->with('success', 'Account updated successfully.');
    }

    /**
     * Remove the specified account
     */
    public function destroy(Account $account)
    {
        $account->delete();
        
        return redirect()->route('accounts.index')
            ->with('success', 'Account deleted successfully.');
    }
}
