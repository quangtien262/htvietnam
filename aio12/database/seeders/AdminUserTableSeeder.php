<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AdminUser;
use Illuminate\Support\Facades\DB;

class AdminUserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('admin_users')->truncate();
        AdminUser::create([
            // 'id' => 1,
            'code' => 'NV00001',
            'username' => 'admin',
            // 'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'password' => '$2y$10$AgayGUGyViJqcEB4eaDGVOWKbjHPNdW4SPuHLAv.GsFzuLLuTwKve', // abcd@1234
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'permission_group_id' => 1,
            'chi_nhanh_id' => 1,
            'admin_user_status_id' => 1
        ]);
        AdminUser::create([
            // 'id' => 2,
            'code' => 'NV00002',
            'username' => 'an_himalaya',
            // 'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'password' => '$2y$10$AgayGUGyViJqcEB4eaDGVOWKbjHPNdW4SPuHLAv.GsFzuLLuTwKve', // abcd@1234
            'name' => 'An',
            'email' => 'an@gmail.com',
            'permission_group_id' => 1,
            'chi_nhanh_id' => 1,
            'admin_user_status_id' => 1
        ]);
        AdminUser::create([
            // 'id' => 3,
            'code' => 'NV00003',
            'username' => 'thao',
            // 'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'password' => '$2y$10$AgayGUGyViJqcEB4eaDGVOWKbjHPNdW4SPuHLAv.GsFzuLLuTwKve', // abcd@1234
            'name' => 'Thảo',
            'email' => 'thao@gmail.com',
            'permission_group_id' => 1,
            'chi_nhanh_id' => 1,
            'admin_user_status_id' => 1
        ]);
        AdminUser::create([
            'code' => 'NV00004',
            'username' => 'thont',
            // 'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'password' => '$2y$10$AgayGUGyViJqcEB4eaDGVOWKbjHPNdW4SPuHLAv.GsFzuLLuTwKve', // abcd@1234
            'name' => 'ThoNT',
            'email' => 'thont@htvietnam.vn',
            'permission_group_id' => 1,
            'chi_nhanh_id' => 1,
            'admin_user_status_id' => 1
        ]);
        AdminUser::create([
            'code' => 'NV00004',
            'username' => 'hanhnt',
            // 'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'password' => '$2y$10$AgayGUGyViJqcEB4eaDGVOWKbjHPNdW4SPuHLAv.GsFzuLLuTwKve', // abcd@1234
            'name' => 'HanhNT',
            'email' => 'hanhnt@htvietnam.vn',
            'permission_group_id' => 1,
            'chi_nhanh_id' => 1,
            'admin_user_status_id' => 1
        ]);
    }
}
