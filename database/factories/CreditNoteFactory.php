<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CreditNote>
 */
class CreditNoteFactory extends Factory
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
            'number' => 'CN-' . $this->faker->unique()->regexify('[A-Z0-9]{6}'),
            'customer_id' => Account::factory()->customer(),
            'date' => $this->faker->dateTimeBetween('-2 months', 'now'),
            'status' => $this->faker->randomElement(['draft', 'sent', 'refunded']),
            'amount' => 0,
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (\App\Models\CreditNote $creditNote) {
            $amount = $this->faker->numberBetween(100, 2000);
            
            $creditNote->lineItems()->create([
                'user_id' => $creditNote->user_id,
                'description' => 'Refund / Credit Adjustment',
                'quantity' => 1,
                'unit_price' => $amount,
                'subtotal' => $amount,
                'total' => $amount,
                'sort_order' => 0,
            ]);

            $creditNote->update(['amount' => $amount]);
        });
    }
}
