<?php

namespace Tests\Feature\Spa;

use Tests\TestCase;
use App\Models\AdminUser;
use App\Models\User;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingApiTest extends TestCase
{
    use WithFaker;

    protected $adminUser;
    protected $customer;
    protected $serviceId;
    protected $staffId;
    protected $roomId;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->adminUser = AdminUser::first();
        if (!$this->adminUser) {
            $this->adminUser = AdminUser::factory()->create();
        }

        // Create test data
        $this->customer = User::create([
            'name' => 'Booking Test Customer',
            'phone' => '0888777666',
            'email' => 'bookingtest@example.com',
        ]);

        $this->serviceId = DB::table('spa_dich_vu')->insertGetId([
            'ten_dich_vu' => 'Booking Test Service',
            'ma_dich_vu' => 'BKS001',
            'gia_ban' => 500000,
            'thoi_gian_thuc_hien' => 60,
            'trang_thai' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->staffId = DB::table('spa_ktv')->insertGetId([
            'ten_ktv' => 'Test Staff',
            'ma_ktv' => 'KTV001',
            'trang_thai' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->roomId = DB::table('spa_phong')->insertGetId([
            'ten_phong' => 'Test Room',
            'ma_phong' => 'R001',
            'trang_thai' => 'trong',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Test GET /api/spa/bookings - List bookings
     */
    public function test_can_get_booking_list()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/bookings');

        $response->assertStatus(200);
    }

    /**
     * Test POST /api/spa/bookings - Create booking
     */
    public function test_can_create_booking()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $bookingData = [
            'khach_hang_id' => $this->customer->id,
            'dich_vu_id' => $this->serviceId,
            'ktv_id' => $this->staffId,
            'phong_id' => $this->roomId,
            'ngay_hen' => Carbon::tomorrow()->format('Y-m-d'),
            'gio_hen' => '10:00:00',
            'ghi_chu' => 'Test booking',
            'trang_thai' => 'cho_xac_nhan',
        ];

        $response = $this->postJson('/aio/api/spa/bookings', $bookingData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'khach_hang_id',
                'dich_vu_id',
                'ngay_hen',
            ]);

        $this->assertDatabaseHas('spa_dat_lich', [
            'khach_hang_id' => $this->customer->id,
            'dich_vu_id' => $this->serviceId,
        ]);
    }

    /**
     * Test PUT /api/spa/bookings/{id} - Update booking
     */
    public function test_can_update_booking()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $bookingId = DB::table('spa_dat_lich')->insertGetId([
            'khach_hang_id' => $this->customer->id,
            'dich_vu_id' => $this->serviceId,
            'ngay_hen' => Carbon::tomorrow()->format('Y-m-d'),
            'gio_hen' => '10:00:00',
            'trang_thai' => 'cho_xac_nhan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $updatedData = [
            'gio_hen' => '14:00:00',
            'ktv_id' => $this->staffId,
        ];

        $response = $this->putJson("/aio/api/spa/bookings/{$bookingId}", $updatedData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('spa_dat_lich', [
            'id' => $bookingId,
            'gio_hen' => '14:00:00',
        ]);
    }

    /**
     * Test POST /api/spa/bookings/{id}/confirm - Confirm booking
     */
    public function test_can_confirm_booking()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $bookingId = DB::table('spa_dat_lich')->insertGetId([
            'khach_hang_id' => $this->customer->id,
            'dich_vu_id' => $this->serviceId,
            'ngay_hen' => Carbon::tomorrow()->format('Y-m-d'),
            'gio_hen' => '10:00:00',
            'trang_thai' => 'cho_xac_nhan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->postJson("/aio/api/spa/bookings/{$bookingId}/confirm");

        $response->assertStatus(200);

        $this->assertDatabaseHas('spa_dat_lich', [
            'id' => $bookingId,
            'trang_thai' => 'da_xac_nhan',
        ]);
    }

    /**
     * Test POST /api/spa/bookings/{id}/start - Start service
     */
    public function test_can_start_booking()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $bookingId = DB::table('spa_dat_lich')->insertGetId([
            'khach_hang_id' => $this->customer->id,
            'dich_vu_id' => $this->serviceId,
            'ngay_hen' => now()->format('Y-m-d'),
            'gio_hen' => now()->format('H:i:s'),
            'trang_thai' => 'da_xac_nhan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->postJson("/aio/api/spa/bookings/{$bookingId}/start");

        $response->assertStatus(200);

        $this->assertDatabaseHas('spa_dat_lich', [
            'id' => $bookingId,
            'trang_thai' => 'dang_thuc_hien',
        ]);
    }

    /**
     * Test POST /api/spa/bookings/{id}/complete - Complete service
     */
    public function test_can_complete_booking()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $bookingId = DB::table('spa_dat_lich')->insertGetId([
            'khach_hang_id' => $this->customer->id,
            'dich_vu_id' => $this->serviceId,
            'ngay_hen' => now()->format('Y-m-d'),
            'gio_hen' => now()->format('H:i:s'),
            'trang_thai' => 'dang_thuc_hien',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->postJson("/aio/api/spa/bookings/{$bookingId}/complete");

        $response->assertStatus(200);

        $this->assertDatabaseHas('spa_dat_lich', [
            'id' => $bookingId,
            'trang_thai' => 'hoan_thanh',
        ]);
    }

    /**
     * Test POST /api/spa/bookings/{id}/cancel - Cancel booking
     */
    public function test_can_cancel_booking()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $bookingId = DB::table('spa_dat_lich')->insertGetId([
            'khach_hang_id' => $this->customer->id,
            'dich_vu_id' => $this->serviceId,
            'ngay_hen' => Carbon::tomorrow()->format('Y-m-d'),
            'gio_hen' => '10:00:00',
            'trang_thai' => 'cho_xac_nhan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->postJson("/aio/api/spa/bookings/{$bookingId}/cancel");

        $response->assertStatus(200);

        $this->assertDatabaseHas('spa_dat_lich', [
            'id' => $bookingId,
            'trang_thai' => 'da_huy',
        ]);
    }

    /**
     * Test GET /api/spa/bookings/calendar - Get calendar view
     */
    public function test_can_get_booking_calendar()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/bookings/calendar');

        $response->assertStatus(200);
    }

    /**
     * Test GET /api/spa/bookings/available-ktvs - Get available staff
     */
    public function test_can_get_available_staff()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/bookings/available-ktvs?ngay_hen=' . Carbon::tomorrow()->format('Y-m-d') . '&gio_hen=10:00:00');

        $response->assertStatus(200);
    }

    /**
     * Test GET /api/spa/bookings/available-rooms - Get available rooms
     */
    public function test_can_get_available_rooms()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $response = $this->getJson('/aio/api/spa/bookings/available-rooms?ngay_hen=' . Carbon::tomorrow()->format('Y-m-d') . '&gio_hen=10:00:00');

        $response->assertStatus(200);
    }

    protected function tearDown(): void
    {
        DB::table('spa_dat_lich')->where('khach_hang_id', $this->customer->id)->delete();
        DB::table('spa_dich_vu')->where('id', $this->serviceId)->delete();
        DB::table('spa_ktv')->where('id', $this->staffId)->delete();
        DB::table('spa_phong')->where('id', $this->roomId)->delete();
        $this->customer->delete();
        
        parent::tearDown();
    }
}
