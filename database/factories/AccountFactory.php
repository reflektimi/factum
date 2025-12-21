<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Account>
 */
class AccountFactory extends Factory
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
            'name' => $this->faker->company(),
            'type' => 'customer', // Default to customer, use supplier() state method for suppliers
            'contact_info' => [
                'email' => $this->faker->companyEmail(),
                'phone' => $this->faker->phoneNumber(),
                'address' => $this->faker->address(),
                'website' => $this->faker->url(),
                'vat_number' => $this->faker->regexify('[A-Z]{2}[0-9]{9}'),
            ],
            'balance' => 0,
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => now(),
        ];
    }

    public function customer(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'customer',
        ]);
    }

    public function supplier(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'supplier',
        ]);
    }
}
