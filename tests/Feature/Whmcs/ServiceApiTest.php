<?php

namespace Tests\Feature\Whmcs;

use App\Models\User;
use App\Models\Whmcs\Product;
use App\Models\Whmcs\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_list_services(): void
    {
        $product = Product::factory()->create(['name' => 'Hosting Plan']);
        
        Service::factory()->create([
            'client_id' => $this->user->id,
            'product_id' => $product->id,
            'domain' => 'example.com',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/aio/api/whmcs/services');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'domain',
                        'status',
                        'payment_cycle',
                        'billing_cycle',
                        'recurring_amount',
                        'next_due_date',
                        'client',
                        'product',
                    ],
                ],
            ])
            ->assertJsonFragment(['domain' => 'example.com']);
    }

    public function test_can_create_service(): void
    {
        $product = Product::factory()->create();

        $data = [
            'client_id' => $this->user->id,
            'product_id' => $product->id,
            'domain' => 'newdomain.com',
            'billing_cycle' => 'monthly',
            'recurring_amount' => 100000,
            'next_due_date' => now()->addMonth()->format('Y-m-d'),
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/aio/api/whmcs/services', $data);

        $response->assertCreated()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'domain', 'status'],
            ]);

        $this->assertDatabaseHas('whmcs_services', [
            'domain' => 'newdomain.com',
            'payment_cycle' => 'monthly',
            'status' => 'pending',
        ]);
    }

    public function test_can_update_service_status(): void
    {
        $service = Service::factory()->create([
            'client_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/aio/api/whmcs/services/{$service->id}", [
                'status' => 'active',
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('whmcs_services', [
            'id' => $service->id,
            'status' => 'active',
        ]);
    }

    public function test_can_suspend_service(): void
    {
        $service = Service::factory()->create([
            'client_id' => $this->user->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/aio/api/whmcs/services/{$service->id}/suspend", [
                'reason' => 'Non-payment',
            ]);

        $response->assertOk()
            ->assertJsonFragment(['message' => 'Service suspended successfully']);

        $this->assertDatabaseHas('whmcs_services', [
            'id' => $service->id,
            'status' => 'suspended',
        ]);
    }

    public function test_can_terminate_service(): void
    {
        $service = Service::factory()->create([
            'client_id' => $this->user->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/aio/api/whmcs/services/{$service->id}/terminate");

        $response->assertOk();

        $this->assertDatabaseHas('whmcs_services', [
            'id' => $service->id,
            'status' => 'terminated',
        ]);

        $this->assertNotNull(Service::find($service->id)->termination_date);
    }

    public function test_cannot_create_service_without_required_fields(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/aio/api/whmcs/services', [
                'domain' => 'test.com',
                // Missing required fields
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['client_id', 'product_id', 'billing_cycle', 'next_due_date']);
    }

    public function test_cannot_create_service_with_invalid_billing_cycle(): void
    {
        $product = Product::factory()->create();

        $response = $this->actingAs($this->user)
            ->postJson('/aio/api/whmcs/services', [
                'client_id' => $this->user->id,
                'product_id' => $product->id,
                'domain' => 'test.com',
                'billing_cycle' => 'invalid_cycle',
                'recurring_amount' => 100000,
                'next_due_date' => now()->addMonth()->format('Y-m-d'),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['billing_cycle']);
    }

    public function test_can_filter_services_by_status(): void
    {
        Service::factory()->create([
            'client_id' => $this->user->id,
            'status' => 'active',
            'domain' => 'active.com',
        ]);

        Service::factory()->create([
            'client_id' => $this->user->id,
            'status' => 'suspended',
            'domain' => 'suspended.com',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/aio/api/whmcs/services?status=active');

        $response->assertOk()
            ->assertJsonFragment(['domain' => 'active.com'])
            ->assertJsonMissing(['domain' => 'suspended.com']);
    }
}
