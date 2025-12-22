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
            [
                'type' => 'anomaly',
                'severity' => 'critical',
                'title' => 'Unusual Expense Spike Detected',
                'description' => 'Marketing expenses are 200% higher than the 3-month average. Investigate ad spend immediately.',
                'impact_amount' => 12500.00,
                'category' => 'expense',
            ],
            [
                'type' => 'forecast',
                'severity' => 'high',
                'title' => 'Projected Cash Flow Shortfall',
                'description' => 'Based on current accounts receivable, a cash flow dip is expected in 14 days.',
                'impact_amount' => 8400.00,
                'category' => 'cash_flow',
            ],
            [
                'type' => 'trend',
                'severity' => 'medium',
                'title' => 'Recurring Revenue Growth',
                'description' => 'Monthly Recurring Revenue (MRR) has grown by 15% over the last quarter.',
                'impact_amount' => 3200.00,
                'category' => 'revenue',
            ],
            [
                'type' => 'optimization',
                'severity' => 'low',
                'title' => 'Tax Deduction Opportunity',
                'description' => 'Recent equipment purchases may qualify for Section 179 deduction.',
                'impact_amount' => 0,
                'category' => 'tax',
            ],
            [
                'type' => 'anomaly',
                'severity' => 'high',
                'title' => 'Duplicate Vendor Payment',
                'description' => 'Potential duplicate payment detected for vendor "Acme Corp" on the same date.',
                'impact_amount' => 450.50,
                'category' => 'expense',
            ],
            [
                'type' => 'forecast',
                'severity' => 'medium',
                'title' => 'Inventory Turnover Slowdown',
                'description' => 'Stock rotation has slowed by 10% this month. Consider a promotional discount.',
                'impact_amount' => 1200.00,
                'category' => 'inventory',
            ],
            [
                'type' => 'trend',
                'severity' => 'low',
                'title' => 'Utility Cost Reduction',
                'description' => 'Energy costs have decreased by 5% following the new office policy.',
                'impact_amount' => 150.00,
                'category' => 'expense',
            ],
            [
                'type' => 'optimization',
                'severity' => 'medium',
                'title' => 'Subscription Consolidation',
                'description' => 'Multiple redundant software subscriptions detected. Consolidating could save funds.',
                'impact_amount' => 890.00,
                'category' => 'expense',
            ],
            [
                'type' => 'anomaly',
                'severity' => 'critical',
                'title' => 'Large Unauthorized Transaction',
                'description' => 'A transaction of $50,000 to an unknown account was flagged for review.',
                'impact_amount' => 50000.00,
                'category' => 'security',
            ],
            [
                'type' => 'forecast',
                'severity' => 'high',
                'title' => 'Contract Renewal Upcoming',
                'description' => 'Major client contract "Globex" expires in 30 days. Prepare renewal terms.',
                'impact_amount' => 25000.00,
                'category' => 'revenue',
            ],
            [
                'type' => 'trend',
                'severity' => 'medium',
                'title' => 'Customer Churn Increase',
                'description' => 'Churn rate slightly elevated (2.5%) compared to last month (1.8%).',
                'impact_amount' => 2100.00,
                'category' => 'revenue',
            ],
            [
                'type' => 'optimization',
                'severity' => 'low',
                'title' => 'Early Payment Discount',
                'description' => 'Paying invoice #9923 early could save 2% ($450).',
                'impact_amount' => 450.00,
                'category' => 'expense',
            ],
             [
                'type' => 'anomaly',
                'severity' => 'medium',
                'title' => 'Weekend Login Activity',
                'description' => 'Unusual account activity detected during non-business hours.',
                'impact_amount' => 0,
                'category' => 'security',
            ],
            [
                'type' => 'forecast',
                'severity' => 'low',
                'title' => 'Server Capacity Warning',
                'description' => 'Server load projected to reach 90% capacity by end of month.',
                'impact_amount' => 0,
                'category' => 'infrastructure',
            ],
            [
                'type' => 'trend',
                'severity' => 'high',
                'title' => 'Mobile Traffic Surge',
                'description' => 'Mobile user traffic has increased by 40%, indicating a shift in platform usage.',
                'impact_amount' => 0,
                'category' => 'analytics',
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
