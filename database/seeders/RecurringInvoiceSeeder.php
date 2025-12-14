<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RecurringInvoice;
use App\Models\Account;

class RecurringInvoiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Account::where('type', 'customer')->get();

        if ($customers->count() > 0) {
            RecurringInvoice::create([
                'profile_name' => 'Monthly Retainer - Acme Corp',
                'customer_id' => $customers->first()->id,
                'interval' => 'monthly',
                'start_date' => now(),
                'next_run_date' => now()->addMonth(),
                'status' => 'active',
                'auto_send' => true,
                'items' => [
                    ['description' => 'Monthly Retainer Service', 'quantity' => 1, 'price' => 5000.00, 'total' => 5000.00]
                ],
                'total_amount' => 5000.00,
            ]);

            RecurringInvoice::create([
                'profile_name' => 'Quarterly Maintenance - TechStart',
                'customer_id' => $customers->get(1) ? $customers->get(1)->id : $customers->first()->id,
                'interval' => 'quarterly',
                'start_date' => now()->subMonths(1),
                'next_run_date' => now()->addMonths(2),
                'status' => 'active',
                'auto_send' => false,
                'items' => [
                    ['description' => 'Server Maintenance', 'quantity' => 5, 'price' => 150.00, 'total' => 750.00]
                ],
                'total_amount' => 750.00,
            ]);

            RecurringInvoice::create([
                'profile_name' => 'Annual Hosting - Global Retail',
                'customer_id' => $customers->get(2) ? $customers->get(2)->id : $customers->first()->id,
                'interval' => 'yearly',
                'start_date' => now()->subMonths(6),
                'next_run_date' => now()->addMonths(6),
                'status' => 'active',
                'auto_send' => true,
                'items' => [
                    ['description' => 'Enterprise Hosting Plan', 'quantity' => 1, 'price' => 2400.00, 'total' => 2400.00]
                ],
                'total_amount' => 2400.00,
            ]);
        }
    }
}
