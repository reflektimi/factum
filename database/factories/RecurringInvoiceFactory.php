<?php

namespace Database\Factories;

use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RecurringInvoice>
 */
class RecurringInvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'profile_name' => 'Retainer - ' . $this->faker->company(),
            'customer_id' => Account::factory()->customer(),
            'interval' => $this->faker->randomElement(['monthly', 'weekly', 'yearly']),
            'status' => 'active',
            'start_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'next_run_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'last_run_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'total_amount' => 0,
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (\App\Models\RecurringInvoice $recurringInvoice) {
            $recurringInvoice->lineItems()->create([
                'user_id' => $recurringInvoice->user_id,
                'description' => 'Monthly Retainer Service',
                'quantity' => 1,
                'unit_price' => 2000.00,
                'subtotal' => 2000.00,
                'total' => 2000.00,
                'sort_order' => 0,
            ]);

            $recurringInvoice->update(['total_amount' => 2000.00]);
        });
    }
}
