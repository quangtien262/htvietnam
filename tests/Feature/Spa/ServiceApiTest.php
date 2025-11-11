<?php

namespace Tests\Feature\Spa;

use Tests\TestCase;
use App\Models\AdminUser;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;

class ServiceApiTest extends TestCase
{
    use WithFaker;

    protected $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->adminUser = AdminUser::first();
        if (!$this->adminUser) {
            $this->adminUser = AdminUser::factory()->create();
        }
    }

    /**
     * Test GET /api/spa/services - List services
     */
    public function test_can_get_service_list()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/services');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
            ]);
    }

    /**
     * Test GET /api/spa/services with filters
     */
    public function test_can_filter_services_by_status()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/services?is_active=1');

        $response->assertStatus(200);
    }

    /**
     * Test GET /api/spa/services with category filter
     */
    public function test_can_filter_services_by_category()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/services?danh_muc_id=1');

        $response->assertStatus(200);
    }

    /**
     * Test GET /api/spa/services with search
     */
    public function test_can_search_services()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/services?search=massage');

        $response->assertStatus(200);
    }

    /**
     * Test POST /api/spa/services - Create service
     */
    public function test_can_create_service()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $serviceData = [
            'ten_dich_vu' => 'Test Service',
            'gia' => 500000,
            'thoi_luong' => 60,
        ];

        $response = $this->postJson('/aio/api/spa/services', $serviceData);

        $response->assertStatus(200)
            ->assertJson(['status_code' => 200]);

        $this->assertDatabaseHas('spa_dich_vu', [
            'ten_dich_vu' => 'Test Service',
        ]);
    }

    /**
     * Test PUT /api/spa/services/{id} - Update service
     */
    public function test_can_update_service()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        // Create a service first
        $serviceId = DB::table('spa_dich_vu')->insertGetId([
            'ten_dich_vu' => 'Original Service',
            'ma_dich_vu' => 'SV' . rand(10000, 99999),
            'gia_ban' => 300000,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $updatedData = [
            'ten_dich_vu' => 'Updated Service',
            'gia' => 350000,
        ];

        $response = $this->putJson("/aio/api/spa/services/{$serviceId}", $updatedData);

        $response->assertStatus(200)
            ->assertJson(['status_code' => 200]);

        $this->assertDatabaseHas('spa_dich_vu', [
            'id' => $serviceId,
            'ten_dich_vu' => 'Updated Service',
        ]);
    }

    /**
     * Test DELETE /api/spa/services/{id} - Delete service
     */
    public function test_can_delete_service()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $serviceId = DB::table('spa_dich_vu')->insertGetId([
            'ten_dich_vu' => 'Service to Delete',
            'ma_dich_vu' => 'SV999',
            'gia_ban' => 200000,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->deleteJson("/aio/api/spa/services/{$serviceId}");

        $response->assertStatus(200)
            ->assertJson(['status_code' => 200]);

        $this->assertDatabaseMissing('spa_dich_vu', [
            'id' => $serviceId,
        ]);
    }

    /**
     * Test service categories API
     */
    public function test_can_get_service_categories()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/service-categories');

        $response->assertStatus(200);
    }

    /**
     * Test unauthorized access
     */
    public function test_unauthorized_access_to_services_is_denied()
    {
        $response = $this->getJson('/aio/api/spa/services');

        $response->assertStatus(401);
    }

    protected function tearDown(): void
    {
        DB::table('spa_dich_vu')
            ->where('ten_dich_vu', 'like', '%Test%')
            ->orWhere('ten_dich_vu', 'like', '%Updated%')
            ->delete();
        
        parent::tearDown();
    }
}
