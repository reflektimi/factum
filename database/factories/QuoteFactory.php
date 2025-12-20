<?php

namespace Database\Factories;

use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Quote>
 */
class QuoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
         // Generate realistic items
         $items = [];
         $total = 0;
         $numItems = $this->faker->numberBetween(1, 3);
         
         for ($i = 0; $i < $numItems; $i++) {
             $price = $this->faker->numberBetween(100, 1000);
             $qty = $this->faker->numberBetween(1, 4);
             $lineTotal = $price * $qty;
             
             $items[] = [
                 'description' => 'Estimate: ' . $this->faker->bs(),
                 'quantity' => $qty,
                 'price' => $price,
                 'total' => $lineTotal
             ];
             $total += $lineTotal;
         }

        return [
            'user_id' => \App\Models\User::factory(),
            'number' => 'QTE-' . $this->faker->unique()->regexify('[A-Z0-9]{6}'),
            'customer_id' => Account::factory()->customer(),
            'date' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'expiry_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'status' => $this->faker->randomElement(['draft', 'sent', 'accepted', 'declined']),
            'total_amount' => 0,
            'created_at' => function (array $attributes) {
                return $attributes['date'];
            }
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (\App\Models\Quote $quote) {
            $numItems = $this->faker->numberBetween(1, 3);
            $total = 0;
            
            for ($i = 0; $i < $numItems; $i++) {
                $price = $this->faker->numberBetween(100, 1000);
                $qty = $this->faker->numberBetween(1, 4);
                $lineTotal = $price * $qty;
                
                $quote->lineItems()->create([
                    'user_id' => $quote->user_id,
                    'description' => 'Estimate: ' . $this->faker->bs(),
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'subtotal' => $lineTotal,
                    'total' => $lineTotal,
                    'sort_order' => $i,
                ]);
                
                $total += $lineTotal;
            }

            $quote->update(['total_amount' => $total]);
        });
    }
}
