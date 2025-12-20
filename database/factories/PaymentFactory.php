<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'customer_id' => function (array $attributes) {
                return Invoice::find($attributes['invoice_id'])->customer_id;
            },
            'amount' => function (array $attributes) {
                return Invoice::find($attributes['invoice_id'])->total_amount;
            },
            'date' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'payment_method' => $this->faker->randomElement(['Bank Transfer', 'Credit Card', 'PayPal', 'Cash']),
            'status' => 'completed',
        ];
    }
}
