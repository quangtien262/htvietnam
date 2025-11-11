<?php

namespace Tests\Feature\Whmcs;

use App\Models\User;
use App\Models\Whmcs\Product;
use App\Models\Whmcs\ProductGroup;
use App\Models\Whmcs\ProductPricing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_list_products(): void
    {
        $group = ProductGroup::factory()->create(['name' => 'Web Hosting']);
        $product = Product::factory()->create([
            'group_id' => $group->id,
            'name' => 'Basic Hosting',
            'type' => 'hosting',
        ]);

        ProductPricing::factory()->create([
            'product_id' => $product->id,
            'cycle' => 'monthly',
            'price' => 100000,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/aio/api/whmcs/products');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'type',
                        'description',
                        'group_id',
                        'pricings' => [
                            '*' => [
                                'cycle',
                                'price',
                            ],
                        ],
                    ],
                ],
            ])
            ->assertJsonFragment(['name' => 'Basic Hosting']);
    }

    public function test_can_create_product(): void
    {
        $group = ProductGroup::factory()->create();

        $data = [
            'group_id' => $group->id,
            'name' => 'Premium Hosting',
            'type' => 'hosting',
            'description' => 'Premium hosting plan',
            'status' => 'active',
            'pricings' => [
                [
                    'cycle' => 'monthly',
                    'price' => 150000,
                ],
                [
                    'cycle' => 'annually',
                    'price' => 1500000,
                ],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/aio/api/whmcs/products', $data);

        $response->assertCreated()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'name', 'type'],
            ]);

        $this->assertDatabaseHas('whmcs_products', [
            'name' => 'Premium Hosting',
            'type' => 'hosting',
        ]);

        $this->assertDatabaseHas('whmcs_product_pricing', [
            'cycle' => 'monthly',
            'price' => 150000,
        ]);
    }

    public function test_can_update_product(): void
    {
        $product = Product::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($this->user)
            ->putJson("/aio/api/whmcs/products/{$product->id}", [
                'name' => 'New Name',
                'description' => 'Updated description',
            ]);

        $response->assertOk()
            ->assertJsonFragment(['name' => 'New Name']);

        $this->assertDatabaseHas('whmcs_products', [
            'id' => $product->id,
            'name' => 'New Name',
        ]);
    }

    public function test_can_delete_product(): void
    {
        $product = Product::factory()->create();

        $response = $this->actingAs($this->user)
            ->deleteJson("/aio/api/whmcs/products/{$product->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('whmcs_products', ['id' => $product->id]);
    }

    public function test_guests_cannot_access_products(): void
    {
        $response = $this->getJson('/aio/api/whmcs/products');
        $response->assertUnauthorized();
    }

    public function test_validation_fails_for_invalid_product_data(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/aio/api/whmcs/products', [
                'name' => '', // Invalid: empty name
                'type' => 'invalid_type', // Invalid type
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'type']);
    }
}
