<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Quote;
use App\Models\Account;

class QuoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Account::where('type', 'customer')->get();

        if ($customers->count() > 0) {
            Quote::create([
                'number' => 'QUO-2024-001',
                'customer_id' => $customers->first()->id,
                'date' => now(),
                'expiry_date' => now()->addDays(30),

                'status' => 'sent',
                'items' => [
                    ['description' => 'Website Redesign Proposal', 'quantity' => 1, 'price' => 8000.00, 'total' => 8000.00]
                ],
                'total_amount' => 8000.00,
                'notes' => 'Looking forward to doing business with you.',
            ]);

             Quote::create([
                'number' => 'QUO-2024-002',
                'customer_id' => $customers->get(1) ? $customers->get(1)->id : $customers->first()->id,
                'date' => now()->subDays(5),
                'expiry_date' => now()->addDays(25),
                'status' => 'accepted',
                'items' => [
                    ['description' => 'Mobile App Prototype', 'quantity' => 1, 'price' => 3500.00, 'total' => 3500.00]
                ],
                'total_amount' => 3500.00,
            ]);

             Quote::create([
                'number' => 'QUO-2024-003',
                'customer_id' => $customers->get(2) ? $customers->get(2)->id : $customers->first()->id,
                'date' => now()->subDays(10),
                'expiry_date' => now()->addDays(10),
                'status' => 'draft',
                'items' => [
                    ['description' => 'SEO Consultation', 'quantity' => 10, 'price' => 150.00, 'total' => 1500.00]
                ],
                'total_amount' => 1500.00,
            ]);
        }
    }
}
