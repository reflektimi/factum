<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FinancialInsight;
use App\Models\User;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Expense;
use Carbon\Carbon;

class FinancialInsightSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::first() ?? User::factory()->create();
        $customer = \App\Models\Account::first() ?? \App\Models\Account::factory()->create(['user_id' => $admin->id, 'type' => 'customer', 'name' => 'Demo Client']);
        
        // Clear previous insights to avoid duplication if re-run
        FinancialInsight::truncate();

        // 1. Trigger Expense Spike & Unusual Transaction
        // Last month: Low expenses
        Expense::factory()->count(5)->create([
            'user_id' => $admin->id,
            'amount' => 100, // $500 total
            'date' => now()->subMonth()->startOfMonth()->addDays(5),
            'category' => 'Office Supplies',
        ]);
        // This month: Massive expense
        Expense::factory()->create([
            'user_id' => $admin->id,
            'amount' => 5000.00, // Outlier & Spike
            'date' => now()->startOfMonth()->addDays(2),
            'category' => 'Equipment',
            'description' => 'Unexpected Server Replacement', // Specific description
        ]);

        // 2. Trigger Revenue Drop & Margin Erosion
        // Last month: High Revenue
        // Create an invoice first for the payments
        $pastInvoice = Invoice::factory()->create([
            'user_id' => $admin->id,
            'customer_id' => $customer->id,
            'status' => 'paid',
            'total_amount' => 10000.00,
            'date' => now()->subMonth()->startOfMonth()->addDays(1),
        ]);
        
        Payment::factory()->count(10)->create([
            'user_id' => $admin->id,
            'invoice_id' => $pastInvoice->id,
            'amount' => 1000, // $10,000 Total
            'date' => now()->subMonth()->startOfMonth()->addDays(10),
            'status' => 'completed',
        ]);
        
        // This month: Low Revenue (only one payment)
        $currentInvoice = Invoice::factory()->create([
            'user_id' => $admin->id,
            'customer_id' => $customer->id,
            'status' => 'paid',
            'total_amount' => 1000.00,
            'date' => now()->startOfMonth()->addDays(1),
        ]);

        Payment::factory()->create([
            'user_id' => $admin->id,
            'invoice_id' => $currentInvoice->id,
            'amount' => 1000, // $1,000 Total (-90% drop)
            'date' => now()->startOfMonth()->addDays(5),
            'status' => 'completed',
        ]);

        // 3. Trigger Missing Invoices (Gap in sequence)
        $startNum = 10000;
        foreach ([1, 2, 4, 5] as $inc) { // Skip 3
            Invoice::factory()->create([
                'user_id' => $admin->id,
                'customer_id' => $customer->id,
                'number' => 'INV-' . ($startNum + $inc),
                'date' => now()->subDays(5),
            ]);
        }

        // 4. Trigger Duplicate Payments
        $dupInvoice = Invoice::factory()->create([
            'user_id' => $admin->id,
            'customer_id' => $customer->id,
            'status' => 'paid',
            'total_amount' => 500.00,
        ]);
        Payment::factory()->count(2)->create([ // 2 identical payments
            'user_id' => $admin->id,
            'invoice_id' => $dupInvoice->id,
            'amount' => 500.00,
            'date' => now()->subDays(2),
            'status' => 'completed',
        ]);

        // 5. Trigger Payment Delays
        Invoice::factory()->count(6)->create([
            'user_id' => $admin->id,
            'customer_id' => $customer->id,
            'status' => 'overdue',
            'due_date' => now()->subDays(45), // 45 days late
            'total_amount' => 1200.00,
        ]);

        // 6. Trigger Burn Rate (Increasing expenses)
        // Month -3
        Expense::factory()->create(['user_id' => $admin->id, 'amount' => 500, 'date' => now()->subMonths(3)]);
        // Month -2
        Expense::factory()->create(['user_id' => $admin->id, 'amount' => 800, 'date' => now()->subMonths(2)]);
        // Month -1
        Expense::factory()->create(['user_id' => $admin->id, 'amount' => 1200, 'date' => now()->subMonths(1)]);

        // 7. Trigger Inventory/Stock (Forecast) - Manually create forecast insight as it's not data-driven yet
        FinancialInsight::create([
             'user_id' => $admin->id,
             'type' => 'forecast',
             'category' => 'inventory',
             'severity' => 'medium',
             'title' => 'Inventory Turnover Slowdown',
             'description' => 'Stock rotation has slowed by 10% this month. Consider a promotional discount.',
             'impact_amount' => 1200.00,
             'detected_at' => now(),
             'metadata' => ['source' => 'system_forecast_model'],
        ]);
        
        // 8. Trigger Cash Flow Warning (High outstanding vs low revenue from step 2)
        // High outstanding created in step 5 covers this.
    }
}
