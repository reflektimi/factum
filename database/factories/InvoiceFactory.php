<?php

namespace Database\Factories;

use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $date = $this->faker->dateTimeBetween('-6 months', 'now');
        $dueDate = (clone $date)->modify('+ ' . $this->faker->numberBetween(14, 45) . ' days');
        
        // Generate realistic items
        $items = [];
        $total = 0;
        $numItems = $this->faker->numberBetween(1, 5);
        
        $services = [
            'Consulting', 'Development', 'Design', 'Hosting', 'Maintenance', 
            'SEO Audit', 'Content Writing', 'API Integration', 'Mobile App', 'Support'
        ];

        for ($i = 0; $i < $numItems; $i++) {
            $price = $this->faker->numberBetween(50, 500) * 10;
            $qty = $this->faker->numberBetween(1, 10);
            $lineTotal = $price * $qty;
            
            $items[] = [
                'description' => $this->faker->randomElement($services) . ' - ' . $this->faker->word(),
                'quantity' => $qty,
                'price' => $price,
                'total' => $lineTotal
            ];
            $total += $lineTotal;
        }

        return [
            'user_id' => \App\Models\User::factory(),
            'number' => 'INV-' . $this->faker->unique()->regexify('[A-Z0-9]{6}'),
            'customer_id' => Account::factory()->customer(),
            'date' => $date,
            'due_date' => $dueDate,
            'status' => $this->faker->randomElement(['draft', 'sent', 'paid', 'overdue']),
            'total_amount' => 0, // Will be updated after creating items
            'created_at' => $date,
            'updated_at' => $date,
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (\App\Models\Invoice $invoice) {
            $numItems = $this->faker->numberBetween(1, 5);
            $total = 0;
            
            $services = [
                'Consulting', 'Development', 'Design', 'Hosting', 'Maintenance', 
                'SEO Audit', 'Content Writing', 'API Integration', 'Mobile App', 'Support'
            ];

            for ($i = 0; $i < $numItems; $i++) {
                $price = $this->faker->numberBetween(50, 500) * 10;
                $qty = $this->faker->numberBetween(1, 10);
                $lineTotal = $price * $qty;
                
                $invoice->lineItems()->create([
                    'user_id' => $invoice->user_id,
                    'description' => $this->faker->randomElement($services) . ' - ' . $this->faker->word(),
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'subtotal' => $lineTotal,
                    'total' => $lineTotal,
                    'sort_order' => $i,
                ]);
                
                $total += $lineTotal;
            }

            $invoice->update(['total_amount' => $total]);
        });
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'overdue',
            'due_date' => $this->faker->dateTimeBetween('-2 months', '-1 day'),
        ]);
    }
}
