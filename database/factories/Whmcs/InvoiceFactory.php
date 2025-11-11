<?php

namespace Database\Factories\Whmcs;

use App\Models\User;
use App\Models\Whmcs\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        return [
            'client_id' => User::factory(),
            'number' => 'INV-' . $this->faker->unique()->numerify('######'),
            'status' => 'unpaid',
            'subtotal' => $this->faker->randomFloat(2, 100000, 1000000),
            'tax_total' => function (array $attributes) {
                return $attributes['subtotal'] * 0.1; // 10% tax
            },
            'total' => function (array $attributes) {
                return $attributes['subtotal'] + ($attributes['subtotal'] * 0.1);
            },
            'due_date' => now()->addDays(7),
            'paid_at' => null,
            'notes' => $this->faker->optional()->sentence(),
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }

    public function unpaid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'unpaid',
            'paid_at' => null,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'unpaid',
            'due_date' => now()->subDays(7),
        ]);
    }
}
