<?php

namespace Database\Seeders;

use App\Models\User;
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
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@finances.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Create accountant user
        User::create([
            'name' => 'John Accountant',
            'email' => 'accountant@finances.com',
            'password' => bcrypt('password'),
            'role' => 'accountant',
        ]);

        // Create company settings
        \App\Models\Setting::create([
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

        // Create customer accounts
        $customers = [
            \App\Models\Account::create([
                'name' => 'Acme Corporation',
                'type' => 'customer',
                'contact_info' => [
                    'email' => 'billing@acme.com',
                    'phone' => '+1 (555) 234-5678',
                    'address' => '456 Corporate Ave, Los Angeles, CA',
                ],
                'balance' => 15000.00,
            ]),
            \App\Models\Account::create([
                'name' => 'TechStart Inc',
                'type' => 'customer',
                'contact_info' => [
                    'email' => 'finance@techstart.com',
                    'phone' => '+1 (555) 345-6789',
                    'address' => '789 Innovation Drive, San Francisco, CA',
                ],
                'balance' => 8500.00,
            ]),
            \App\Models\Account::create([
                'name' => 'Global Retail Ltd',
                'type' => 'customer',
                'contact_info' => [
                    'email' => 'accounts@globalretail.com',
                    'phone' => '+1 (555) 456-7890',
                    'address' => '321 Commerce Blvd, Chicago, IL',
                ],
                'balance' => 22000.00,
            ]),
        ];

        // Create supplier accounts
        \App\Models\Account::create([
            'name' => 'Office Supplies Co',
            'type' => 'supplier',
            'contact_info' => [
                'email' => 'sales@officesupplies.com',
                'phone' => '+1 (555) 567-8901',
            ],
            'balance' => -3500.00,
        ]);

        // Create invoices
        $invoices = [
            \App\Models\Invoice::create([
                'number' => 'INV-2024-001',
                'customer_id' => $customers[0]->id,
                'date' => now()->subDays(30),
                'due_date' => now()->subDays(15),
                'items' => [
                    ['description' => 'Consulting Services - January', 'quantity' => 40, 'price' => 150.00, 'total' => 6000.00],
                    ['description' => 'Software License', 'quantity' => 1, 'price' => 2000.00, 'total' => 2000.00],
                ],
                'total_amount' => 8000.00,
                'status' => 'overdue',
            ]),
            \App\Models\Invoice::create([
                'number' => 'INV-2024-002',
                'customer_id' => $customers[1]->id,
                'date' => now()->subDays(15),
                'due_date' => now()->addDays(15),
                'items' => [
                    ['description' => 'Web Development Project', 'quantity' => 80, 'price' => 100.00, 'total' => 8000.00],
                ],
                'total_amount' => 8000.00,
                'status' => 'pending',
            ]),
            \App\Models\Invoice::create([
                'number' => 'INV-2024-003',
                'customer_id' => $customers[2]->id,
                'date' => now()->subDays(45),
                'due_date' => now()->subDays(30),
                'items' => [
                    ['description' => 'Annual Support Package', 'quantity' => 1, 'price' => 12000.00, 'total' => 12000.00],
                    ['description' => 'Training Sessions', 'quantity' => 10, 'price' => 500.00, 'total' => 5000.00],
                ],
                'total_amount' => 17000.00,
                'status' => 'paid',
            ]),
            \App\Models\Invoice::create([
                'number' => 'INV-2024-004',
                'customer_id' => $customers[0]->id,
                'date' => now()->subDays(10),
                'due_date' => now()->addDays(20),
                'items' => [
                    ['description' => 'Cloud Infrastructure', 'quantity' => 1, 'price' => 3500.00, 'total' => 3500.00],
                ],
                'total_amount' => 3500.00,
                'status' => 'pending',
            ]),
            \App\Models\Invoice::create([
                'number' => 'INV-2024-005',
                'customer_id' => $customers[1]->id,
                'date' => now()->subDays(5),
                'due_date' => now()->addDays(25),
                'items' => [
                    ['description' => 'Mobile App Development', 'quantity' => 120, 'price' => 125.00, 'total' => 15000.00],
                ],
                'total_amount' => 15000.00,
                'status' => 'pending',
            ]),
        ];

        // Create payments
        \App\Models\Payment::create([
            'invoice_id' => $invoices[2]->id,
            'customer_id' => $customers[2]->id,
            'amount' => 17000.00,
            'payment_method' => 'Bank Transfer',
            'date' => now()->subDays(28),
            'status' => 'completed',
        ]);

        \App\Models\Payment::create([
            'invoice_id' => $invoices[1]->id,
            'customer_id' => $customers[1]->id,
            'amount' => 4000.00,
            'payment_method' => 'Credit Card',
            'date' => now()->subDays(7),
            'status' => 'completed',
        ]);

        \App\Models\Payment::create([
            'invoice_id' => $invoices[3]->id,
            'customer_id' => $customers[0]->id,
            'amount' => 1500.00,
            'payment_method' => 'PayPal',
            'date' => now()->subDays(3),
            'status' => 'pending',
        ]);

        // Create sample reports
        \App\Models\Report::create([
            'title' => 'Monthly Revenue Report - December 2024',
            'type' => 'income',
            'data' => [
                'total_revenue' => 51500.00,
                'invoices_count' => 5,
                'average_invoice' => 10300.00,
                'monthly_breakdown' => [
                    'November' => 22000.00,
                    'December' => 29500.00,
                ],
            ],
            'generated_at' => now(),
            'generated_by' => $admin->id,
        ]);

        \App\Models\Report::create([
            'title' => 'Cash Flow Analysis - Q4 2024',
            'type' => 'cash_flow',
            'data' => [
                'total_inflow' => 38500.00,
                'total_outflow' => 12000.00,
                'net_cash_flow' => 26500.00,
                'period' => 'Q4 2024',
            ],
            'generated_at' => now(),
            'generated_by' => $admin->id,
        ]);

        \App\Models\Report::create([
            'title' => 'Outstanding Invoices Report',
            'type' => 'outstanding',
            'data' => [
                'total_outstanding' => 26500.00,
                'overdue_amount' => 8000.00,
                'overdue_count' => 1,
                'pending_count' => 3,
            ],
            'generated_at' => now(),
            'generated_by' => $admin->id,
        ]);

        // Call other seeders
        $this->call([
            RecurringInvoiceSeeder::class,
            QuoteSeeder::class,
            CreditNoteSeeder::class,
            ExpenseSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
