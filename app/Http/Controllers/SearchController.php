<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Account;
use App\Models\Quote;
use App\Models\Payment;
use App\Models\RecurringInvoice;

class SearchController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $query = $request->input('query');

        if (!$query) {
            return response()->json([]);
        }

        $results = [];

        // Search Invoices
        $invoices = Invoice::with('customer')
            ->where('number', 'like', "%{$query}%")
            ->orWhereHas('customer', function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'title' => $invoice->number,
                    'subtitle' => $invoice->customer->name,
                    'type' => 'Invoice',
                    'url' => route('invoices.show', $invoice->id),
                    'status' => $invoice->status,
                ];
            });

        // Search Accounts
        $accounts = Account::where('name', 'like', "%{$query}%")
            ->orWhere('contact_info->email', 'like', "%{$query}%")
            ->limit(5)
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'title' => $account->name,
                    'subtitle' => $account->type,
                    'type' => 'Account',
                    'url' => route('accounts.edit', $account->id), // Accounts usually edit/show
                    'status' => null,
                ];
            });

        // Search Quotes
        $quotes = Quote::with('customer')
            ->where('number', 'like', "%{$query}%")
             ->orWhereHas('customer', function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%");
            })
            ->limit(3)
            ->get()
            ->map(function ($quote) {
                return [
                    'id' => $quote->id,
                    'title' => $quote->number,
                    'subtitle' => $quote->customer->name,
                    'type' => 'Quote',
                    'url' => route('quotes.show', $quote->id),
                    'status' => $quote->status,
                ];
            });

        // Search Recurring Profiles
         $recurring = RecurringInvoice::where('profile_name', 'like', "%{$query}%")
            ->limit(3)
            ->get()
            ->map(function ($profile) {
                return [
                    'id' => $profile->id,
                    'title' => $profile->profile_name,
                    'subtitle' => $profile->interval,
                    'type' => 'Recurring',
                    'url' => route('recurring-invoices.edit', $profile->id),
                    'status' => $profile->status,
                ];
            });

        return response()->json([
            ...$invoices,
            ...$accounts,
            ...$quotes,
            ...$recurring,
        ]);
    }
}
