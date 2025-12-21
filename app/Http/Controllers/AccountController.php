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
        $this->authorize('viewAny', Account::class);

        $query = Account::query();
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }
        
        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        $accounts = $query->latest()->paginate(15);
        
        return $this->render('Accounts', [
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    /**
     * Show the form for creating a new account
     */
    public function create()
    {
        $this->authorize('create', Account::class);

        return $this->render('Accounts/Create');
    }

    /**
     * Store a newly created account
     */
    public function store(Request $request)
    {
        $this->authorize('create', Account::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:customer,supplier',
            'contact_info' => 'nullable|array',
            'contact_info.email' => 'nullable|email',
            'contact_info.phone' => 'nullable|string',
            'contact_info.address' => 'nullable|string',
            'balance' => 'nullable|numeric',
        ]);
        
        $account = Account::create($validated);
        
        return $this->success('Account created successfully.', ['account' => $account], 'accounts.show', [$account->id]);
    }

    /**
     * Display the specified account
     */
    public function show(Account $account)
    {
        $this->authorize('view', $account);

        return $this->render('Accounts/Show', [
            'account' => $account->load(['invoices', 'payments']),
        ]);
    }

    /**
     * Show the form for editing the specified account
     */
    public function edit(Account $account)
    {
        $this->authorize('update', $account);

        return $this->render('Accounts/Edit', [
            'account' => $account,
        ]);
    }

    /**
     * Update the specified account
     */
    public function update(Request $request, Account $account)
    {
        $this->authorize('update', $account);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:customer,supplier',
            'contact_info' => 'nullable|array',
            'balance' => 'nullable|numeric',
        ]);
        
        $account->update($validated);
        
        return $this->success('Account updated successfully.', ['account' => $account]);
    }

    /**
     * Remove the specified account
     */
    public function destroy(Account $account)
    {
        $this->authorize('delete', $account);

        $account->delete();
        
        return $this->success('Account deleted successfully.', [], 'accounts.index');
    }
}
