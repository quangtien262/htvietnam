<?php

namespace Tests\Feature\Spa;

use Tests\TestCase;
use App\Models\AdminUser;
use App\Models\User;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;

class POSApiTest extends TestCase
{
    use WithFaker;

    protected $adminUser;
    protected $customer;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->adminUser = AdminUser::first();
        if (!$this->adminUser) {
            $this->adminUser = AdminUser::factory()->create();
        }

        // Create test customer
        $this->customer = User::create([
            'name' => 'Test POS Customer',
            'phone' => '0999888777',
            'email' => 'poscustomer@example.com',
        ]);
    }

    /**
     * Test GET /api/spa/pos/invoices - List invoices
     */
    public function test_can_get_invoice_list()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/pos/invoices');

        $response->assertStatus(200);
    }

    /**
     * Test POST /api/spa/pos/invoices - Create invoice
     */
    public function test_can_create_invoice()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        // Create test service
        $serviceId = DB::table('spa_dich_vu')->insertGetId([
            'ten_dich_vu' => 'Test Service',
            'ma_dich_vu' => 'SV' . rand(10000, 99999),
            'gia_ban' => 500000,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create test product
        $productId = DB::table('spa_san_pham')->insertGetId([
            'ten_san_pham' => 'Test Product',
            'ma_san_pham' => 'PRD' . rand(10000, 99999),
            'gia_ban' => 200000,
            'don_vi_tinh' => 'chai',
            'ton_kho' => 100,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $invoiceData = [
            'khach_hang_id' => $this->customer->id,
            'chi_tiets' => [
                [
                    'dich_vu_id' => $serviceId,
                    'so_luong' => 1,
                    'don_gia' => 500000,
                ],
                [
                    'san_pham_id' => $productId,
                    'so_luong' => 2,
                    'don_gia' => 200000,
                ],
            ],
            'thanh_toan' => false, // Don't process payment in test
            'giam_gia' => 0,
            'diem_su_dung' => 0,
            'tien_tip' => 0,
            'nguoi_ban' => 'Admin',
        ];

        $response = $this->postJson('/aio/api/spa/pos/invoices', $invoiceData);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('spa_hoa_don', [
            'khach_hang_id' => $this->customer->id,
        ]);
    }

    /**
     * Test GET /api/spa/pos/invoices/{id} - Get invoice detail
     */
    public function test_can_get_invoice_detail()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        // Create test invoice
        $invoiceId = DB::table('spa_hoa_don')->insertGetId([
            'ma_hoa_don' => 'HD' . rand(10000, 99999),
            'khach_hang_id' => $this->customer->id,
            'ngay_ban' => now(),
            'tong_tien_dich_vu' => 500000,
            'tong_tien_san_pham' => 400000,
            'tong_tien' => 900000,
            'tong_thanh_toan' => 900000,
            'trang_thai' => 'da_thanh_toan',
            'phuong_thuc_thanh_toan' => 'tien_mat',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->getJson("/aio/api/spa/pos/invoices/{$invoiceId}");

        $response->assertStatus(200);
    }

    /**
     * Test POST /api/spa/pos/invoices/{id}/payment - Process payment
     */
    public function test_can_process_payment()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $invoiceId = DB::table('spa_hoa_don')->insertGetId([
            'ma_hoa_don' => 'HD' . rand(10000, 99999),
            'khach_hang_id' => $this->customer->id,
            'ngay_ban' => now(),
            'tong_tien' => 1000000,
            'tong_thanh_toan' => 1000000,
            'trang_thai' => 'cho_thanh_toan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $paymentData = [
            'phuong_thuc_thanh_toan' => ['chuyen_khoan'],
            'so_tien_thanh_toan' => 1000000,
        ];

        $response = $this->postJson("/aio/api/spa/pos/invoices/{$invoiceId}/payment", $paymentData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('spa_hoa_don', [
            'id' => $invoiceId,
            'trang_thai' => 'da_thanh_toan',
        ]);
    }

    /**
     * Test invoice with discount
     */
    public function test_can_create_invoice_with_discount()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $serviceId = DB::table('spa_dich_vu')->insertGetId([
            'ten_dich_vu' => 'Discount Test Service',
            'ma_dich_vu' => 'DS' . rand(10000, 99999),
            'gia_ban' => 1000000,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $invoiceData = [
            'khach_hang_id' => $this->customer->id,
            'chi_tiets' => [
                [
                    'dich_vu_id' => $serviceId,
                    'so_luong' => 1,
                    'don_gia' => 1000000,
                ],
            ],
            'thanh_toan' => false,
            'giam_gia' => 100000, // 10% discount
            'diem_su_dung' => 0,
            'tien_tip' => 0,
            'nguoi_ban' => 'Admin',
        ];

        $response = $this->postJson('/aio/api/spa/pos/invoices', $invoiceData);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);
    }

    /**
     * Test GET /api/spa/pos/today-sales - Get today's sales
     */
    public function test_can_get_today_sales()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/pos/today-sales');

        $response->assertStatus(200);
    }

    /**
     * Test invoice cancellation
     */
    public function test_can_cancel_invoice()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $invoiceId = DB::table('spa_hoa_don')->insertGetId([
            'ma_hoa_don' => 'HD' . rand(10000, 99999),
            'khach_hang_id' => $this->customer->id,
            'ngay_ban' => now(),
            'tong_tien' => 500000,
            'tong_thanh_toan' => 500000,
            'trang_thai' => 'cho_thanh_toan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->postJson("/aio/api/spa/pos/invoices/{$invoiceId}/cancel", [
            'reason' => 'Test cancellation',
        ]);

        $response->assertStatus(200);
    }

    protected function tearDown(): void
    {
        // Clean up
        DB::table('spa_hoa_don_chi_tiet')
            ->whereIn('hoa_don_id', function($query) {
                $query->select('id')
                    ->from('spa_hoa_don')
                    ->where('khach_hang_id', $this->customer->id);
            })->delete();

        DB::table('spa_hoa_don')->where('khach_hang_id', $this->customer->id)->delete();
        
        DB::table('spa_dich_vu')
            ->where('ten_dich_vu', 'like', '%Test%')
            ->orWhere('ten_dich_vu', 'like', '%Discount%')
            ->delete();
        
        DB::table('spa_san_pham')
            ->where('ten_san_pham', 'like', '%Test%')
            ->delete();

        $this->customer->delete();
        
        parent::tearDown();
    }
}
