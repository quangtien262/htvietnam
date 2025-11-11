<?php

namespace Database\Factories\Whmcs;

use App\Models\User;
use App\Models\Whmcs\Product;
use App\Models\Whmcs\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'client_id' => User::factory(),
            'product_id' => Product::factory(),
            'server_id' => null,
            'domain' => $this->faker->domainName(),
            'username' => $this->faker->userName(),
            'password' => null,
            'status' => 'pending',
            'payment_cycle' => $this->faker->randomElement(['monthly', 'quarterly', 'semiannually', 'annually']),
            'recurring_amount' => $this->faker->randomFloat(2, 50000, 500000),
            'registration_date' => now(),
            'next_due_date' => now()->addMonth(),
            'termination_date' => null,
            'config_options' => null,
            'notes' => null,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'registration_date' => now()->subMonth(),
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'suspended',
        ]);
    }

    public function terminated(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'terminated',
            'termination_date' => now(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }
}
