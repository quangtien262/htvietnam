<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProjectManagementSeeder extends Seeder
{
    public function run(): void
    {
        // Seed Project Statuses
        $projectStatuses = [
            ['ten_trang_thai' => 'Lên kế hoạch', 'ma_mau' => '#faad14', 'thu_tu' => 1, 'is_active' => true],
            ['ten_trang_thai' => 'Đang thực hiện', 'ma_mau' => '#1890ff', 'thu_tu' => 2, 'is_active' => true],
            ['ten_trang_thai' => 'Tạm dừng', 'ma_mau' => '#ff4d4f', 'thu_tu' => 3, 'is_active' => true],
            ['ten_trang_thai' => 'Hoàn thành', 'ma_mau' => '#52c41a', 'thu_tu' => 4, 'is_active' => true],
            ['ten_trang_thai' => 'Đã hủy', 'ma_mau' => '#d9d9d9', 'thu_tu' => 5, 'is_active' => true],
        ];

        foreach ($projectStatuses as $status) {
            DB::table('pro___project_statuses')->insert(array_merge($status, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Seed Project Types
        $projectTypes = [
            ['ten_loai' => 'Website', 'mo_ta' => 'Dự án phát triển website', 'icon' => 'GlobalOutlined', 'is_active' => true],
            ['ten_loai' => 'Mobile App', 'mo_ta' => 'Dự án phát triển ứng dụng di động', 'icon' => 'MobileOutlined', 'is_active' => true],
            ['ten_loai' => 'Hệ thống ERP', 'mo_ta' => 'Dự án hệ thống quản lý doanh nghiệp', 'icon' => 'AppstoreOutlined', 'is_active' => true],
            ['ten_loai' => 'Marketing', 'mo_ta' => 'Dự án marketing và quảng cáo', 'icon' => 'RocketOutlined', 'is_active' => true],
            ['ten_loai' => 'Khác', 'mo_ta' => 'Các loại dự án khác', 'icon' => 'FolderOutlined', 'is_active' => true],
        ];

        foreach ($projectTypes as $type) {
            DB::table('pro___project_types')->insert(array_merge($type, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Seed Priorities
        $priorities = [
            ['ten_uu_tien' => 'Thấp', 'cap_do' => 1, 'ma_mau' => '#52c41a'],
            ['ten_uu_tien' => 'Trung bình', 'cap_do' => 2, 'ma_mau' => '#1890ff'],
            ['ten_uu_tien' => 'Cao', 'cap_do' => 3, 'ma_mau' => '#faad14'],
            ['ten_uu_tien' => 'Khẩn cấp', 'cap_do' => 4, 'ma_mau' => '#ff4d4f'],
        ];

        foreach ($priorities as $priority) {
            DB::table('pro___priorities')->insert(array_merge($priority, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Seed Task Statuses
        $taskStatuses = [
            ['ten_trang_thai' => 'Chưa bắt đầu', 'ma_mau' => '#d9d9d9', 'thu_tu' => 1, 'is_done' => false, 'is_active' => true],
            ['ten_trang_thai' => 'Đang làm', 'ma_mau' => '#1890ff', 'thu_tu' => 2, 'is_done' => false, 'is_active' => true],
            ['ten_trang_thai' => 'Đang review', 'ma_mau' => '#faad14', 'thu_tu' => 3, 'is_done' => false, 'is_active' => true],
            ['ten_trang_thai' => 'Hoàn thành', 'ma_mau' => '#52c41a', 'thu_tu' => 4, 'is_done' => true, 'is_active' => true],
            ['ten_trang_thai' => 'Bị block', 'ma_mau' => '#ff4d4f', 'thu_tu' => 5, 'is_done' => false, 'is_active' => true],
        ];

        foreach ($taskStatuses as $status) {
            DB::table('pro___task_statuses')->insert(array_merge($status, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Seed sample projects (nếu muốn)
        $sampleProjects = [
            [
                'ma_du_an' => 'PRJ-001',
                'ten_du_an' => 'Website Bán hàng XYZ',
                'mo_ta' => 'Phát triển website bán hàng trực tuyến cho công ty XYZ',
                'loai_du_an_id' => 1,
                'trang_thai_id' => 2,
                'uu_tien_id' => 3,
                'ngay_bat_dau' => now()->subDays(15),
                'ngay_ket_thuc_du_kien' => now()->addDays(45),
                'ngan_sach_du_kien' => 100000000,
                'tien_do' => 35,
                'mau_sac' => '#1890ff',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'ma_du_an' => 'PRJ-002',
                'ten_du_an' => 'App Mobile Banking',
                'mo_ta' => 'Ứng dụng ngân hàng di động',
                'loai_du_an_id' => 2,
                'trang_thai_id' => 1,
                'uu_tien_id' => 4,
                'ngay_bat_dau' => now()->addDays(5),
                'ngay_ket_thuc_du_kien' => now()->addDays(90),
                'ngan_sach_du_kien' => 300000000,
                'tien_do' => 0,
                'mau_sac' => '#722ed1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($sampleProjects as $project) {
            DB::table('pro___projects')->insert($project);
        }
    }
}
