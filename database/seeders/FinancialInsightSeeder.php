<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FinancialInsight;
use App\Models\User;
use Carbon\Carbon;

class FinancialInsightSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();

        $insights = [
            // 1. CRITICAL
            [
                'type' => 'anomaly',
                'severity' => 'critical',
                'title' => 'Unusual Expense Spike',
                'description' => 'Marketing expenses are 200% higher than average. Investigate ad spend immediately.',
                'impact_amount' => 12500.00,
                'category' => 'expense',
            ],
            // 2. HIGH
            [
                'type' => 'forecast',
                'severity' => 'high',
                'title' => 'Cash Flow Shortfall Forecast',
                'description' => 'Projected cash flow dip in 14 days based on current AP/AR aging.',
                'impact_amount' => 8400.00,
                'category' => 'cash_flow',
            ],
            // 3. HIGH
            [
                'type' => 'anomaly',
                'severity' => 'high',
                'title' => 'Duplicate Vendor Payment',
                'description' => 'Potential duplicate payment detected for vendor "Acme Corp" ($450.50).',
                'impact_amount' => 450.50,
                'category' => 'expense',
            ],
            // 4. MEDIUM
            [
                'type' => 'trend',
                'severity' => 'medium',
                'title' => 'Revenue Growth Trend',
                'description' => 'Monthly Recurring Revenue (MRR) has grown by 15% over the last quarter.',
                'impact_amount' => 3200.00,
                'category' => 'revenue',
            ],
            // 5. MEDIUM
            [
                'type' => 'optimization',
                'severity' => 'medium',
                'title' => 'Subscription Redundancy',
                'description' => 'Multiple similar software subscriptions detected. Consolidation recommended.',
                'impact_amount' => 890.00,
                'category' => 'expense',
            ],
            // 6. LOW
            [
                'type' => 'optimization',
                'severity' => 'low',
                'title' => 'Tax Deduction Opportunity',
                'description' => 'Recent equipment purchases may qualify for Section 179 deduction.',
                'impact_amount' => 0,
                'category' => 'tax',
            ],
            // 7. LOW
            [
                'type' => 'trend',
                'severity' => 'low',
                'title' => 'Utility Cost Reduction',
                'description' => 'Energy costs have decreased by 5% following the new office policy.',
                'impact_amount' => 150.00,
                'category' => 'expense',
            ],
            // 8. MEDIUM (Analytics)
            [
                'type' => 'forecast',
                'severity' => 'medium',
                'title' => 'Inventory Turnover Slowdown',
                'description' => 'Stock rotation has slowed by 10% this month. Consider a promotional discount.',
                'impact_amount' => 1200.00,
                'category' => 'inventory',
            ],
        ];

        foreach ($insights as $index => $data) {
            FinancialInsight::create(array_merge($data, [
                'user_id' => $user->id,
                'detected_at' => Carbon::now()->subHours($index * 4), // Stagger times
                'is_dismissed' => false,
                'metadata' => ['source' => 'system_seeder'],
            ]));
        }
    }
}
