<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ChiNhanhSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $chiNhanhs = [
            [
                'name' => 'Chi nhanh Quan 1',
                'code' => 'CN001',
                'chi_nhanh_status_id' => 1,
                'address' => '123 Nguyen Hue, Quan 1, TP.HCM',
                'phone' => '0281234567',
                'ngay_thanh_lap' => '2020-01-01',
                'bo_phan' => 'Spa',
                'color' => '#FF5733',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Chi nhanh Quan 3',
                'code' => 'CN002',
                'chi_nhanh_status_id' => 1,
                'address' => '456 Vo Van Tan, Quan 3, TP.HCM',
                'phone' => '0282345678',
                'ngay_thanh_lap' => '2020-06-15',
                'bo_phan' => 'Spa',
                'color' => '#33C3FF',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Chi nhanh Binh Thanh',
                'code' => 'CN003',
                'chi_nhanh_status_id' => 1,
                'address' => '789 Xo Viet Nghe Tinh, Binh Thanh, TP.HCM',
                'phone' => '0283456789',
                'ngay_thanh_lap' => '2021-03-20',
                'bo_phan' => 'Spa',
                'color' => '#28A745',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($chiNhanhs as $chiNhanh) {
            $exists = DB::table('chi_nhanh')
                ->where('code', $chiNhanh['code'])
                ->exists();

            if (!$exists) {
                DB::table('chi_nhanh')->insert($chiNhanh);
            }
        }

        $this->command->info('Da tao ' . count($chiNhanhs) . ' chi nhanh mau');
    }
}
