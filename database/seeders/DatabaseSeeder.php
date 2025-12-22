<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Account;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Quote;
use App\Models\Expense;
use App\Models\RecurringInvoice;
use App\Models\CreditNote;
use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create System Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@finances.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $accountant = User::firstOrCreate(
            ['email' => 'accountant@finances.com'],
            [
                'name' => 'John Accountant',
                'password' => bcrypt('password'),
                'role' => 'accountant',
                'email_verified_at' => now(),
            ]
        );

        $users = collect([$admin]); // Only use Admin for demo data visibility

        // 2. Company Settings
        if (Setting::count() === 0) {
            Setting::create([
                'company_name' => 'FinancesPro SaaS',
                'address' => '123 Business Street, New York, NY 10001',
                'phone' => '+1 (555) 123-4567',
                'email' => 'info@financespro.com',
                'tax_rules' => [
                    ['name' => 'VAT', 'rate' => 20],
                    ['name' => 'Sales Tax', 'rate' => 8.5],
                ],
                'currencies' => ['USD', 'EUR', 'GBP'],
            ]);
        }

        // 2. Create Customers (Accounts)
        // High Value: 2 customers
        $highValueCustomers = Account::factory()->customer()->recycle($users)->count(2)->create(['name' => function() { return 'VIP - ' . fake()->company(); }]);
        // Regular: 5 customers
        $regularCustomers = Account::factory()->customer()->recycle($users)->count(5)->create();
        
        $allCustomers = $highValueCustomers->merge($regularCustomers);

        // 3. Create Suppliers (Accounts)
        // 2 Suppliers
        $suppliers = Account::factory()->supplier()->recycle($users)->count(2)->create();

        // 5. Generate Invoices & History
        foreach ($allCustomers as $index => $customer) {
            // Determine invoice count based on customer tier
            if (str_contains($customer->name, 'VIP')) {
                // VIPs get 3-5 invoices
                $invoiceCount = rand(3, 5);
            } else {
                // Regulars get 1-2 invoices
                $invoiceCount = rand(1, 2);
            }
            
            Invoice::factory()
                ->recycle($users)
                ->count($invoiceCount)
                ->for($customer)
                ->state(function (array $attributes) {
                    // Distribute dates over last 6 months
                    return [
                        'date' => fake()->dateTimeBetween('-6 months', 'now'),
                    ];
                })
                ->create()
                ->each(function (Invoice $invoice) {
                    // 5a. Handle Payments for Paid Invoices
                    if ($invoice->status === 'paid') {
                        Payment::factory()->create([
                            'user_id' => $invoice->user_id,
                            'invoice_id' => $invoice->id,
                            'customer_id' => $invoice->customer_id,
                            'amount' => $invoice->total_amount,
                            'date' => fake()->dateTimeBetween($invoice->date, 'now'),
                            'status' => 'completed',
                            'reference_number' => 'REF-' . strtoupper(Str::random(8)),
                        ]);
                    }
                    // 5b. Handle Partial Payments for some Sent invoices
                    elseif ($invoice->status === 'sent' && rand(0, 100) > 80) {
                        Payment::factory()->create([
                            'user_id' => $invoice->user_id,
                            'invoice_id' => $invoice->id,
                            'customer_id' => $invoice->customer_id,
                            'amount' => $invoice->total_amount * 0.5,
                            'date' => fake()->dateTimeBetween($invoice->date, 'now'),
                            'status' => 'completed',
                            'reference_number' => 'REF-' . strtoupper(Str::random(8)),
                        ]);
                    }
                });
        }

        // 6. Create Expenses (For charts)
        // Generate 15 expenses over last 6 months
        Expense::factory()->count(15)->recycle($users)->create();

        // 7. Generate Quotes (Current & Converted)
        Quote::factory()
            ->recycle($users)
            ->count(10)
            ->recycle($allCustomers)
            ->create();

        // 8. Recurring Logic
        RecurringInvoice::factory()
            ->recycle($users)
            ->count(5)
            ->recycle($allCustomers)
            ->create();

        // 9. Credit Notes
        CreditNote::factory()
            ->recycle($users)
            ->count(5)
            ->recycle($allCustomers)
            ->create();

        // Call other seeders
        $this->call([
            // Legacy seeders removed as they are incompatible with new schema
            // and covered by the factory logic above.
            NotificationSeeder::class,
        ]);

        // 10. Update Account Balances (Optional but helpful)
        // In a real app, this would be calculated dynamically, but we can seed it roughly
        $allCustomers->each(function ($customer) {
            $unpaid = Invoice::where('customer_id', $customer->id)
                ->whereIn('status', ['sent', 'overdue'])
                ->sum('total_amount');
            
            $customer->update(['balance' => $unpaid]);
        });

        // 11. Create Anomalies for Financial Insights
        $this->command->info('Creating financial anomalies...');

        // 11a. Unusual Expense (> 3 std dev)
        // Average expense is ~100-500. Create one big one.
        Expense::factory()->create([
            'user_id' => $admin->id,
            'amount' => 5000.00, // Significant outlier
            'category' => 'One-time Purchase',
            'date' => now()->subDays(5),
            'description' => 'Unexpected Server Hardware Replacement',
        ]);

        // 11b. Duplicate Payments
        $dupInvoice = Invoice::factory()->create([
            'user_id' => $admin->id,
            'customer_id' => $regularCustomers->first()->id,
            'status' => 'paid',
            'total_amount' => 150.00,
            'date' => now()->subDays(3),
        ]);
        
        // Create two identical payments
        Payment::factory()->count(2)->create([
            'user_id' => $admin->id,
            'invoice_id' => $dupInvoice->id,
            'customer_id' => $dupInvoice->customer_id,
            'amount' => 150.00,
            'date' => now()->subDays(2),
            'status' => 'completed',
        ]);

        // 11c. Payment Delays (Overdue Invoices)
        Invoice::factory()->count(6)->create([
            'user_id' => $admin->id,
            'customer_id' => $regularCustomers->random()->id,
            'status' => 'overdue',
            'date' => now()->subMonths(2),
            'due_date' => now()->subDays(45), // 45 days late
        ]);

        // 11d. Burn Rate (Increasing expenses over 3 months)
        // Month -2: $1000
        Expense::factory()->count(5)->create([
            'user_id' => $admin->id,
            'amount' => 200,
            'date' => now()->subMonths(2)->startOfMonth()->addDays(5),
        ]);
        // Month -1: $1500
        Expense::factory()->count(5)->create([
            'user_id' => $admin->id,
            'amount' => 300,
            'date' => now()->subMonth()->startOfMonth()->addDays(5),
        ]);
        // Current Month: $2500
        Expense::factory()->count(5)->create([
            'user_id' => $admin->id,
            'amount' => 500,
            'date' => now()->startOfMonth()->addDays(5),
        ]);

        // 12. Generate Insights based on the data
        $this->command->info('Generating financial insights...');
        
        // Run the specific insight seeder for guaranteed diversity
        $this->call(FinancialInsightSeeder::class);

        // Also run the dynamic service to catch any real anomalies from seeded data
        $service = new \App\Services\FinancialIntelligenceService($admin);
        $service->generateInsights();
        $service->checkCashFlowWarnings();
    }
}
