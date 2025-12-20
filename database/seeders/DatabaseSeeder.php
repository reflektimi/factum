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

        $users = collect([$admin, $accountant]);

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
        // High Value: 3 customers
        $highValueCustomers = Account::factory()->customer()->count(3)->create(['name' => function() { return 'VIP - ' . fake()->company(); }]);
        // Regular: 20 customers
        $regularCustomers = Account::factory()->customer()->count(20)->create();
        
        $allCustomers = $highValueCustomers->merge($regularCustomers);

        // 3. Create Suppliers (Accounts)
        // 5 Suppliers
        $suppliers = Account::factory()->supplier()->count(5)->create();

        // 5. Generate Invoices & History
        foreach ($allCustomers as $index => $customer) {
            // Determine invoice count based on customer tier
            if (str_contains($customer->name, 'VIP')) {
                // VIPs get 5-10 invoices
                $invoiceCount = rand(5, 10);
            } else {
                // Regulars get 1-3 invoices
                $invoiceCount = rand(1, 3);
            }
            
            Invoice::factory()
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
                            'invoice_id' => $invoice->id,
                            'customer_id' => $invoice->customer_id,
                            'amount' => $invoice->total_amount,
                            'date' => fake()->dateTimeBetween($invoice->date, 'now'),
                            'status' => 'completed',
                        ]);
                    }
                    // 5b. Handle Partial Payments for some Sent invoices
                    elseif ($invoice->status === 'sent' && rand(0, 100) > 80) {
                        Payment::factory()->create([
                            'invoice_id' => $invoice->id,
                            'customer_id' => $invoice->customer_id,
                            'amount' => $invoice->total_amount * 0.5,
                            'date' => fake()->dateTimeBetween($invoice->date, 'now'),
                            'status' => 'completed',
                        ]);
                    }
                });
        }

        // 6. Create Expenses (For charts)
        // Generate 50 expenses over last 6 months
        Expense::factory()->count(50)->recycle($users)->create();

        // 7. Generate Quotes (Current & Converted)
        Quote::factory()
            ->count(30)
            ->recycle($allCustomers)
            ->create();

        // 8. Recurring Logic
        RecurringInvoice::factory()
            ->count(15)
            ->recycle($allCustomers)
            ->create();

        // 9. Credit Notes
        CreditNote::factory()
            ->count(10)
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
    }
}
