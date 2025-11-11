<?php

namespace Database\Factories\Whmcs;

use App\Models\Whmcs\Invoice;
use App\Models\Whmcs\InvoiceItem;
use App\Models\Whmcs\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceItemFactory extends Factory
{
    protected $model = InvoiceItem::class;

    public function definition(): array
    {
        $qty = $this->faker->numberBetween(1, 5);
        $unitPrice = $this->faker->randomFloat(2, 50000, 500000);
        
        return [
            'invoice_id' => Invoice::factory(),
            'product_id' => Product::factory(),
            'service_id' => null,
            'type' => $this->faker->randomElement(['product', 'domain', 'addon', 'setup']),
            'description' => $this->faker->sentence(),
            'qty' => $qty,
            'unit_price' => $unitPrice,
            'total' => $qty * $unitPrice,
        ];
    }
}
