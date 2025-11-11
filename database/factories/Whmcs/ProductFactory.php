<?php

namespace Database\Factories\Whmcs;

use App\Models\Whmcs\Product;
use App\Models\Whmcs\ProductGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'group_id' => ProductGroup::factory(),
            'name' => $this->faker->words(3, true),
            'type' => $this->faker->randomElement(['hosting', 'vps', 'domain', 'dedicated', 'ssl']),
            'description' => $this->faker->paragraph(),
            'status' => 'active',
            'auto_setup' => $this->faker->boolean(50),
            'module' => $this->faker->randomElement(['cpanel', 'plesk', 'directadmin', null]),
            'package_name' => $this->faker->optional()->word(),
        ];
    }

    public function hosting(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'hosting',
            'require_domain' => true,
        ]);
    }

    public function vps(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'vps',
        ]);
    }

    public function domain(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'domain',
            'require_domain' => true,
        ]);
    }
}
