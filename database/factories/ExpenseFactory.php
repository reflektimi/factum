<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Expense>
 */
class ExpenseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['Office', 'Travel', 'Software', 'Utilities', 'Marketing', 'Contractors'];
        
        return [
            'user_id' => \App\Models\User::factory(),
            'description' => $this->faker->bs(),
            'amount' => $this->faker->randomFloat(2, 10, 5000),
            'date' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'category' => $this->faker->randomElement($categories),
            'merchant' => $this->faker->company(),

            'created_at' => function (array $attributes) {
                return $attributes['date'];
            }
        ];
    }
}
