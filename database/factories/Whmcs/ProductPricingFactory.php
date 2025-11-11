<?php

namespace Database\Factories\Whmcs;

use App\Models\Whmcs\Product;
use App\Models\Whmcs\ProductPricing;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductPricingFactory extends Factory
{
    protected $model = ProductPricing::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'cycle' => $this->faker->randomElement(['monthly', 'quarterly', 'semiannually', 'annually', 'biennially', 'triennially']),
            'price' => $this->faker->randomFloat(2, 50000, 500000),
            'setup_fee' => $this->faker->randomFloat(2, 0, 100000),
        ];
    }

    public function monthly(): static
    {
        return $this->state(fn (array $attributes) => [
            'cycle' => 'monthly',
            'price' => $this->faker->randomFloat(2, 50000, 200000),
        ]);
    }

    public function annually(): static
    {
        return $this->state(fn (array $attributes) => [
            'cycle' => 'annually',
            'price' => $this->faker->randomFloat(2, 500000, 2000000),
        ]);
    }
}
