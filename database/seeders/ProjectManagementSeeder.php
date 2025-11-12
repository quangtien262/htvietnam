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
            ['name' => 'Lên kế hoạch', 'color' => '#faad14', 'icon' => 'ClockCircleOutlined', 'sort_order' => 1, 'is_active' => true],
            ['name' => 'Đang thực hiện', 'color' => '#1890ff', 'icon' => 'SyncOutlined', 'sort_order' => 2, 'is_active' => true],
            ['name' => 'Tạm dừng', 'color' => '#ff4d4f', 'icon' => 'PauseCircleOutlined', 'sort_order' => 3, 'is_active' => true],
            ['name' => 'Hoàn thành', 'color' => '#52c41a', 'icon' => 'CheckCircleOutlined', 'sort_order' => 4, 'is_active' => true],
            ['name' => 'Đã hủy', 'color' => '#d9d9d9', 'icon' => 'CloseCircleOutlined', 'sort_order' => 5, 'is_active' => true],
        ];

        foreach ($projectStatuses as $status) {
            DB::table('pro___project_statuses')->insert(array_merge($status, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Seed Project Types
        $projectTypes = [
            ['name' => 'Website', 'note' => 'Dự án phát triển website', 'color' => '#1890ff', 'icon' => 'GlobalOutlined', 'sort_order' => 1, 'is_active' => true],
            ['name' => 'Mobile App', 'note' => 'Dự án phát triển ứng dụng di động', 'color' => '#52c41a', 'icon' => 'MobileOutlined', 'sort_order' => 2, 'is_active' => true],
            ['name' => 'Hệ thống ERP', 'note' => 'Dự án hệ thống quản lý doanh nghiệp', 'color' => '#722ed1', 'icon' => 'AppstoreOutlined', 'sort_order' => 3, 'is_active' => true],
            ['name' => 'Marketing', 'note' => 'Dự án marketing và quảng cáo', 'color' => '#fa8c16', 'icon' => 'RocketOutlined', 'sort_order' => 4, 'is_active' => true],
            ['name' => 'Khác', 'note' => 'Các loại dự án khác', 'color' => '#8c8c8c', 'icon' => 'FolderOutlined', 'sort_order' => 5, 'is_active' => true],
        ];

        foreach ($projectTypes as $type) {
            DB::table('pro___project_types')->insert(array_merge($type, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Seed Priorities
        $priorities = [
            ['name' => 'Thấp', 'cap_do' => 1, 'color' => '#52c41a', 'sort_order' => 1, 'note' => 'Độ ưu tiên thấp'],
            ['name' => 'Trung bình', 'cap_do' => 2, 'color' => '#1890ff', 'sort_order' => 2, 'note' => 'Độ ưu tiên trung bình'],
            ['name' => 'Cao', 'cap_do' => 3, 'color' => '#faad14', 'sort_order' => 3, 'note' => 'Độ ưu tiên cao'],
            ['name' => 'Khẩn cấp', 'cap_do' => 4, 'color' => '#ff4d4f', 'sort_order' => 4, 'note' => 'Cần xử lý ngay lập tức'],
        ];

        foreach ($priorities as $priority) {
            DB::table('pro___priorities')->insert(array_merge($priority, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Seed Task Statuses
        $taskStatuses = [
            ['name' => 'Chưa bắt đầu', 'color' => '#d9d9d9', 'icon' => 'MinusCircleOutlined', 'sort_order' => 1, 'note' => 'Task chưa được bắt đầu', 'is_done' => false, 'is_active' => true],
            ['name' => 'Đang làm', 'color' => '#1890ff', 'icon' => 'SyncOutlined', 'sort_order' => 2, 'note' => 'Đang thực hiện task', 'is_done' => false, 'is_active' => true],
            ['name' => 'Đang review', 'color' => '#faad14', 'icon' => 'EyeOutlined', 'sort_order' => 3, 'note' => 'Chờ review/kiểm tra', 'is_done' => false, 'is_active' => true],
            ['name' => 'Hoàn thành', 'color' => '#52c41a', 'icon' => 'CheckCircleOutlined', 'sort_order' => 4, 'note' => 'Task đã hoàn thành', 'is_done' => true, 'is_active' => true],
            ['name' => 'Bị block', 'color' => '#ff4d4f', 'icon' => 'StopOutlined', 'sort_order' => 5, 'note' => 'Bị chặn/cần hỗ trợ', 'is_done' => false, 'is_active' => true],
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
