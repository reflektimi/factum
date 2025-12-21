<?php

namespace App\Http\Controllers;

use App\Models\RecurringInvoice;
use App\Models\Account;
use App\Http\Requests\StoreRecurringInvoiceRequest;
use App\Http\Requests\UpdateRecurringInvoiceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RecurringInvoiceController extends Controller
{
    /**
     * Display a listing of the recurring invoices.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', RecurringInvoice::class);

        $query = RecurringInvoice::with('customer')
            ->orderBy('next_run_date', 'asc');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('profile_name', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
 
        $recurringInvoices = $query->paginate(10)->withQueryString();
 
        return $this->render('RecurringInvoices', [
             'recurringInvoices' => $recurringInvoices,
             'filters' => $request->only(['search', 'status']),
         ]);
     }
 
     /**
      * Show the form for creating a new recurring invoice.
      */
     public function create()
     {
         $this->authorize('create', RecurringInvoice::class);
 
         $customers = Account::where('type', 'customer')->orderBy('name')->get();
         
         return $this->render('RecurringInvoices/Create', [
             'customers' => $customers,
         ]);
     }
 
     /**
      * Store a newly created recurring invoice in storage.
      */
     public function store(StoreRecurringInvoiceRequest $request)
     {
         $this->authorize('create', RecurringInvoice::class);
 
         $validated = $request->validated();
         $items = $validated['items'];
         unset($validated['items']);
 
         $totalAmount = collect($items)->sum(function ($item) {
             return $item['quantity'] * $item['price'];
         });
 
         // Next run date starts as start_date
         $nextRunDate = $request->start_date;
 
         return DB::transaction(function () use ($validated, $items, $totalAmount, $nextRunDate) {
             $recurringInvoice = RecurringInvoice::create([
                 ...$validated,
                 'status' => 'active',
                 'total_amount' => $totalAmount,
                 'next_run_date' => $nextRunDate,
             ]);
 
             foreach ($items as $index => $item) {
                 $recurringInvoice->lineItems()->create([
                     'user_id' => Auth::id(),
                     'description' => $item['description'],
                     'quantity' => $item['quantity'],
                     'unit_price' => $item['price'],
                     'subtotal' => $item['quantity'] * $item['price'],
                     'total' => $item['quantity'] * $item['price'],
                     'sort_order' => $index,
                 ]);
             }
 
             return redirect()->route('recurring-invoices.show', $recurringInvoice->id)
                 ->with('success', 'Recurring invoice profile created successfully.');
         });
     }
 
     /**
      * Show the form for editing the specified recurring invoice.
      */
     public function edit(RecurringInvoice $recurringInvoice)
     {
         $this->authorize('update', $recurringInvoice);
 
         $recurringInvoice->load(['customer', 'lineItems']);
         
         // Map lineItems to the 'items' format expected by the frontend
         $recurringInvoice->items = $recurringInvoice->lineItems->map(function ($item) {
             return [
                 'description' => $item->description,
                 'quantity' => $item->quantity,
                 'price' => $item->unit_price,
                 'total' => $item->total,
             ];
         });
 
         $customers = Account::where('type', 'customer')->orderBy('name')->get();
         return $this->render('RecurringInvoices/Edit', [
             'recurringInvoice' => $recurringInvoice,
             'customers' => $customers,
         ]);
     }
     /**
      * Display the specified recurring invoice.
      */
     public function show(RecurringInvoice $recurringInvoice)
     {
         $this->authorize('view', $recurringInvoice);
 
        $recurringInvoice->load(['customer', 'lineItems', 'activityLogs.user']);
        $recurringInvoice->logActivity('viewed');

        // Map lineItems to the 'items' format expected by the frontend
        $recurringInvoice->items = $recurringInvoice->lineItems->map(function ($item) {
            return [
                'description' => $item->description,
                'quantity' => $item->quantity,
                'price' => $item->unit_price,
                'total' => $item->total,
            ];
        });

        return $this->render('RecurringInvoices/Show', [
            'recurringInvoice' => $recurringInvoice,
        ]);
    }
 
     /**
      * Update the specified recurring invoice in storage.
      */
     public function update(UpdateRecurringInvoiceRequest $request, RecurringInvoice $recurringInvoice)
     {
         $this->authorize('update', $recurringInvoice);
 
         $validated = $request->validated();
         $items = $validated['items'];
         unset($validated['items']);
 
         $totalAmount = collect($items)->sum(function ($item) {
             return $item['quantity'] * $item['price'];
         });
 
         return DB::transaction(function () use ($recurringInvoice, $validated, $items, $totalAmount) {
             $recurringInvoice->update([
                 ...$validated,
                 'total_amount' => $totalAmount,
             ]);
 
             // Sync items: delete existing and recreate
             $recurringInvoice->lineItems()->delete();
 
             foreach ($items as $index => $item) {
                 $recurringInvoice->lineItems()->create([
                     'user_id' => Auth::id(),
                     'description' => $item['description'],
                     'quantity' => $item['quantity'],
                     'unit_price' => $item['price'],
                     'subtotal' => $item['quantity'] * $item['price'],
                     'total' => $item['quantity'] * $item['price'],
                     'sort_order' => $index,
                 ]);
             }
 
             return redirect()->route('recurring-invoices.show', $recurringInvoice->id)
                 ->with('success', 'Recurring invoice profile updated successfully.');
         });
     }
 
     /**
      * Remove the specified recurring invoice from storage.
      */
     public function destroy(RecurringInvoice $recurringInvoice)
     {
         $this->authorize('delete', $recurringInvoice);
 
         $recurringInvoice->delete();
         return redirect()->route('recurring-invoices.index')
             ->with('success', 'Recurring invoice profile deleted successfully.');
     }
    /**
     * Force run the recurring invoice.
     */
    public function run(RecurringInvoice $recurringInvoice)
    {
        $this->authorize('update', $recurringInvoice);

        // This would normally call a service class or job
        // For now, we'll just log activity and update the last_run_date
        
        $recurringInvoice->update([
            'last_run_date' => now(),
            // In a real app, you'd calculate the next run date based on interval
            'next_run_date' => now()->addDays(30), // Example logic
        ]);

        $recurringInvoice->logActivity('run', 'Recurring invoice profile executed manually');

        return back()->with('success', 'Recurring invoice profile executed successfully.');
    }
}
