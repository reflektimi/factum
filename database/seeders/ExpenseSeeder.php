<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Expense;

class ExpenseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Expense::create([
            'description' => 'Office Supplies',
            'amount' => 150.75,
            'date' => now()->subDays(2),
            'category' => 'Office',
            'merchant' => 'Staples',
        ]);

        Expense::create([
            'description' => 'Software Subscription (Adobe)',
            'amount' => 59.99,
            'date' => now()->subDays(15),
            'category' => 'Software',
            'merchant' => 'Adobe',
        ]);

        Expense::create([
            'description' => 'Client Dinner',
            'amount' => 245.50,
            'date' => now()->subDays(5),
            'category' => 'Meals',
            'merchant' => 'Local Bistro',
        ]);

        Expense::create([
            'description' => 'Server Hosting (AWS)',
            'amount' => 450.00,
            'date' => now()->subMonth(),
            'category' => 'Infrastructure',
            'merchant' => 'Amazon Web Services',
        ]);
    }
}
