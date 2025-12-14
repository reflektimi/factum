<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CreditNote;
use App\Models\Invoice;
use App\Models\Account;

class CreditNoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Account::where('type', 'customer')->get();
        // Just pick first customer and first invoice if available
        $customer = $customers->first();
        $invoice = Invoice::where('customer_id', $customer ? $customer->id : 0)->first();

        if ($customer) {
            CreditNote::create([
                'number' => 'CN-2024-001',
                'customer_id' => $customer->id,
                'invoice_id' => $invoice ? $invoice->id : null,
                'date' => now(),
                'amount' => 500.00,
                'status' => 'sent',
                'items' => [
                    ['description' => 'Refund for damaged goods', 'quantity' => 1, 'price' => 500.00, 'total' => 500.00]
                ],
                'notes' => 'Customer complained about scratch on item.',
            ]);

            CreditNote::create([
                'number' => 'CN-2024-002',
                'customer_id' => $customer->id,
                'invoice_id' => null,
                'date' => now()->subDays(10),
                'amount' => 1000.00,
                'status' => 'refunded',
                'items' => [
                    ['description' => 'Service Cancellation Refund', 'quantity' => 1, 'price' => 1000.00, 'total' => 1000.00]
                ],
                'notes' => 'Full refund processed.',
            ]);
        }
    }
}
