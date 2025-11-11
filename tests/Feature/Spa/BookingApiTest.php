<?php

namespace Tests\Feature\Spa;

use Tests\TestCase;
use App\Models\AdminUser;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingApiTest extends TestCase
{
    use WithFaker;

    protected $adminUser;
    protected $customerId;
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

        // Create test customer in spa_khach_hang
        $this->customerId = DB::table('spa_khach_hang')->insertGetId([
            'ma_khach_hang' => 'KH' . rand(10000, 99999),
            'ho_ten' => 'Nguyen Van Test',
            'sdt' => '0888777' . rand(100, 999),
            'email' => 'test' . rand(100, 999) . '@example.com',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Ensure chi_nhanh exists
        if (!DB::table('spa_chi_nhanh')->where('id', 1)->exists()) {
            DB::table('spa_chi_nhanh')->insert([
                'id' => 1,
                'ma_chi_nhanh' => 'CN001',
                'ten_chi_nhanh' => 'Test Branch',
                'dia_chi' => 'Test Address',
                'thanh_pho' => 'Ha Noi',
                'sdt' => '0246287878',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->serviceId = DB::table('spa_dich_vu')->insertGetId([
            'ten_dich_vu' => 'Booking Test Service',
            'ma_dich_vu' => 'BKS' . rand(1000, 9999),
            'gia_ban' => 500000,
            'thoi_gian_thuc_hien' => 60,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->staffId = DB::table('spa_ktv')->insertGetId([
            'ma_ktv' => 'KTV' . rand(100, 999),
            'admin_user_id' => $this->adminUser->id,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->roomId = DB::table('spa_phong')->insertGetId([
            'ten_phong' => 'Test Room',
            'ma_phong' => 'R' . rand(100, 999),
            'chi_nhanh_id' => 1,
            'trang_thai' => 'trong',
            'is_active' => true,
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
            'khach_hang_id' => $this->customerId,
            'chi_nhanh_id' => 1,
            'nguon_booking' => 'web',
            'dich_vus' => [
                [
                    'dich_vu_id' => $this->serviceId,
                    'ktv_id' => $this->staffId,
                ]
            ],
            'ngay_hen' => Carbon::tomorrow()->format('Y-m-d'),
            'gio_hen' => '10:00',
            'gio_bat_dau' => '10:00:00',
            'gio_ket_thuc' => '11:00:00',
            'phong_id' => $this->roomId,
            'ghi_chu_khach' => 'Test booking',
        ];

        $response = $this->postJson('/aio/api/spa/bookings', $bookingData);
        
        if ($response->status() !== 201) {
            $this->fail('Create booking failed with status ' . $response->status() . ': ' . json_encode($response->json()));
        }

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'ma_booking',
                    'khach_hang_id',
                    'ngay_hen',
                ],
            ]);

        $this->assertDatabaseHas('spa_bookings', [
            'khach_hang_id' => $this->customerId,
            'nguon_booking' => 'web',
        ]);
    }

    /**
     * Test PUT /api/spa/bookings/{id} - Update booking
     */
    public function test_can_update_booking()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $bookingId = DB::table('spa_bookings')->insertGetId([
            'ma_booking' => 'BK' . rand(10000, 99999),
            'khach_hang_id' => $this->customerId,
            'nguon_booking' => 'web',
            'ngay_hen' => Carbon::tomorrow()->format('Y-m-d'),
            'gio_bat_dau' => '10:00:00',
            'gio_ket_thuc' => '11:00:00',
            'dich_vu_ids' => json_encode([$this->serviceId]),
            'trang_thai' => 'cho_xac_nhan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $updatedData = [
            'gio_bat_dau' => '14:00:00',
            'gio_ket_thuc' => '15:00:00',
            'ktv_id' => $this->staffId,
        ];

        $response = $this->putJson("/aio/api/spa/bookings/{$bookingId}", $updatedData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('spa_bookings', [
            'id' => $bookingId,
            'gio_bat_dau' => '14:00:00',
        ]);
    }

    /**
     * Test POST /api/spa/bookings/{id}/confirm - Confirm booking
     */
    public function test_can_confirm_booking()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $bookingId = DB::table('spa_bookings')->insertGetId([
            'ma_booking' => 'BK' . rand(10000, 99999),
            'khach_hang_id' => $this->customerId,
            'nguon_booking' => 'web',
            'ngay_hen' => Carbon::tomorrow()->format('Y-m-d'),
            'gio_bat_dau' => '10:00:00',
            'gio_ket_thuc' => '11:00:00',
            'dich_vu_ids' => json_encode([$this->serviceId]),
            'trang_thai' => 'cho_xac_nhan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->postJson("/aio/api/spa/bookings/{$bookingId}/confirm");

        $response->assertStatus(200);

        $this->assertDatabaseHas('spa_bookings', [
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

        $bookingId = DB::table('spa_bookings')->insertGetId([
            'ma_booking' => 'BK' . rand(10000, 99999),
            'khach_hang_id' => $this->customerId,
            'nguon_booking' => 'web',
            'ngay_hen' => now()->format('Y-m-d'),
            'gio_bat_dau' => now()->format('H:i:s'),
            'gio_ket_thuc' => now()->addHour()->format('H:i:s'),
            'dich_vu_ids' => json_encode([$this->serviceId]),
            'trang_thai' => 'da_xac_nhan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->postJson("/aio/api/spa/bookings/{$bookingId}/start");

        $response->assertStatus(200);

        $this->assertDatabaseHas('spa_bookings', [
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

        $bookingId = DB::table('spa_bookings')->insertGetId([
            'ma_booking' => 'BK' . rand(10000, 99999),
            'khach_hang_id' => $this->customerId,
            'nguon_booking' => 'web',
            'ngay_hen' => now()->format('Y-m-d'),
            'gio_bat_dau' => now()->format('H:i:s'),
            'gio_ket_thuc' => now()->addHour()->format('H:i:s'),
            'dich_vu_ids' => json_encode([$this->serviceId]),
            'trang_thai' => 'dang_thuc_hien',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->postJson("/aio/api/spa/bookings/{$bookingId}/complete");

        $response->assertStatus(200);

        $this->assertDatabaseHas('spa_bookings', [
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

        $bookingId = DB::table('spa_bookings')->insertGetId([
            'ma_booking' => 'BK' . rand(10000, 99999),
            'khach_hang_id' => $this->customerId,
            'nguon_booking' => 'web',
            'ngay_hen' => Carbon::tomorrow()->format('Y-m-d'),
            'gio_bat_dau' => '10:00:00',
            'gio_ket_thuc' => '11:00:00',
            'dich_vu_ids' => json_encode([$this->serviceId]),
            'trang_thai' => 'cho_xac_nhan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->postJson("/aio/api/spa/bookings/{$bookingId}/cancel", [
            'ly_do' => 'Test cancellation',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('spa_bookings', [
            'id' => $bookingId,
            'trang_thai' => 'huy',
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

        $params = [
            'date' => Carbon::tomorrow()->format('Y-m-d'),
            'time' => '10:00:00',
            'duration' => 60,
        ];

        $response = $this->getJson('/aio/api/spa/bookings/available-ktvs?' . http_build_query($params));

        $response->assertStatus(200);
    }

    /**
     * Test GET /api/spa/bookings/available-rooms - Get available rooms
     */
    public function test_can_get_available_rooms()
    {
        $this->actingAs($this->adminUser, 'admin_users');

        $params = [
            'date' => Carbon::tomorrow()->format('Y-m-d'),
            'time' => '10:00:00',
            'duration' => 60,
        ];

        $response = $this->getJson('/aio/api/spa/bookings/available-rooms?' . http_build_query($params));

        $response->assertStatus(200);
    }

    protected function tearDown(): void
    {
        DB::table('spa_bookings')->where('khach_hang_id', $this->customerId)->delete();
        DB::table('spa_dich_vu')->where('id', $this->serviceId)->delete();
        DB::table('spa_ktv')->where('id', $this->staffId)->delete();
        DB::table('spa_phong')->where('id', $this->roomId)->delete();
        DB::table('spa_khach_hang')->where('id', $this->customerId)->delete();
        
        parent::tearDown();
    }
}
