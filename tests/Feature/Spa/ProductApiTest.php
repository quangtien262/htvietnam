<?php

namespace Tests\Feature\Spa;

use Tests\TestCase;
use App\Models\AdminUser;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;

class ProductApiTest extends TestCase
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
     * Test GET /api/spa/products - List products
     */
    public function test_can_get_product_list()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
            ]);
    }

    /**
     * Test GET /api/spa/products with filters
     */
    public function test_can_filter_products_by_status()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/products?trang_thai=active');

        $response->assertStatus(200);
    }

    /**
     * Test GET /api/spa/products with search
     */
    public function test_can_search_products()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/products?search=cream');

        $response->assertStatus(200);
    }

    /**
     * Test POST /api/spa/products - Create product
     */
    public function test_can_create_product()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $productData = [
            'ten_san_pham' => 'Test Product',
            'ma_san_pham' => 'PRD' . rand(1000, 9999),
            'gia_ban' => 300000,
            'gia_thanh_vien' => 270000,
            'gia_nhap' => 200000,
            'ton_kho' => 100,
            'ton_kho_toi_thieu' => 10,
            'trang_thai' => 'active',
        ];

        $response = $this->postJson('/aio/api/spa/products', $productData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'ten_san_pham',
                'ma_san_pham',
                'gia_ban',
            ]);

        $this->assertDatabaseHas('spa_san_pham', [
            'ten_san_pham' => 'Test Product',
        ]);
    }

    /**
     * Test PUT /api/spa/products/{id} - Update product
     */
    public function test_can_update_product()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $productId = DB::table('spa_san_pham')->insertGetId([
            'ten_san_pham' => 'Original Product',
            'ma_san_pham' => 'PRD001',
            'gia_ban' => 250000,
            'ton_kho' => 50,
            'trang_thai' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $updatedData = [
            'ten_san_pham' => 'Updated Product',
            'gia_ban' => 280000,
        ];

        $response = $this->putJson("/aio/api/spa/products/{$productId}", $updatedData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('spa_san_pham', [
            'id' => $productId,
            'ten_san_pham' => 'Updated Product',
        ]);
    }

    /**
     * Test DELETE /api/spa/products/{id} - Delete product
     */
    public function test_can_delete_product()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $productId = DB::table('spa_san_pham')->insertGetId([
            'ten_san_pham' => 'Product to Delete',
            'ma_san_pham' => 'PRD999',
            'gia_ban' => 150000,
            'ton_kho' => 20,
            'trang_thai' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->deleteJson("/aio/api/spa/products/{$productId}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('spa_san_pham', [
            'id' => $productId,
        ]);
    }

    /**
     * Test inventory tracking
     */
    public function test_product_inventory_is_tracked()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $productData = [
            'ten_san_pham' => 'Inventory Test Product',
            'ma_san_pham' => 'INV001',
            'gia_ban' => 100000,
            'ton_kho' => 50,
            'ton_kho_toi_thieu' => 10,
            'trang_thai' => 'active',
        ];

        $response = $this->postJson('/aio/api/spa/products', $productData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('spa_san_pham', [
            'ten_san_pham' => 'Inventory Test Product',
            'ton_kho' => 50,
            'ton_kho_toi_thieu' => 10,
        ]);
    }

    /**
     * Test product categories API
     */
    public function test_can_get_product_categories()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/product-categories');

        $response->assertStatus(200);
    }

    protected function tearDown(): void
    {
        DB::table('spa_san_pham')
            ->where('ten_san_pham', 'like', '%Test%')
            ->orWhere('ten_san_pham', 'like', '%Updated%')
            ->orWhere('ten_san_pham', 'like', '%Inventory%')
            ->delete();
        
        parent::tearDown();
    }
}
