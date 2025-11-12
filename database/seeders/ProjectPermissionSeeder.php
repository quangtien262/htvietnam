<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProjectPermissionSeeder extends Seeder
{
    /**
     * Seed permissions and roles for Project Management RBAC
     */
    public function run(): void
    {
        // 1. Create Permissions
        $permissions = [
            // Project Permissions
            ['name' => 'project.view', 'display_name' => 'Xem dự án', 'group' => 'project', 'description' => 'Xem thông tin dự án'],
            ['name' => 'project.create', 'display_name' => 'Tạo dự án', 'group' => 'project', 'description' => 'Tạo dự án mới'],
            ['name' => 'project.update', 'display_name' => 'Sửa dự án', 'group' => 'project', 'description' => 'Chỉnh sửa thông tin dự án'],
            ['name' => 'project.delete', 'display_name' => 'Xóa dự án', 'group' => 'project', 'description' => 'Xóa dự án'],
            ['name' => 'project.manage_members', 'display_name' => 'Quản lý thành viên', 'group' => 'project', 'description' => 'Thêm/xóa thành viên dự án'],

            // Task Permissions
            ['name' => 'task.view', 'display_name' => 'Xem nhiệm vụ', 'group' => 'task', 'description' => 'Xem danh sách và chi tiết nhiệm vụ'],
            ['name' => 'task.create', 'display_name' => 'Tạo nhiệm vụ', 'group' => 'task', 'description' => 'Tạo nhiệm vụ mới'],
            ['name' => 'task.update', 'display_name' => 'Sửa nhiệm vụ', 'group' => 'task', 'description' => 'Chỉnh sửa nhiệm vụ'],
            ['name' => 'task.update_own', 'display_name' => 'Sửa nhiệm vụ của mình', 'group' => 'task', 'description' => 'Chỉnh sửa nhiệm vụ được assign cho mình'],
            ['name' => 'task.delete', 'display_name' => 'Xóa nhiệm vụ', 'group' => 'task', 'description' => 'Xóa nhiệm vụ'],
            ['name' => 'task.assign', 'display_name' => 'Giao việc', 'group' => 'task', 'description' => 'Assign nhiệm vụ cho người khác'],

            // Comment Permissions
            ['name' => 'comment.create', 'display_name' => 'Bình luận', 'group' => 'comment', 'description' => 'Thêm bình luận vào nhiệm vụ'],
            ['name' => 'comment.delete', 'display_name' => 'Xóa bình luận', 'group' => 'comment', 'description' => 'Xóa bất kỳ bình luận nào'],
            ['name' => 'comment.delete_own', 'display_name' => 'Xóa bình luận của mình', 'group' => 'comment', 'description' => 'Chỉ xóa bình luận của mình'],

            // Attachment Permissions
            ['name' => 'attachment.upload', 'display_name' => 'Upload file', 'group' => 'attachment', 'description' => 'Upload file đính kèm'],
            ['name' => 'attachment.download', 'display_name' => 'Download file', 'group' => 'attachment', 'description' => 'Tải xuống file'],
            ['name' => 'attachment.delete', 'display_name' => 'Xóa file', 'group' => 'attachment', 'description' => 'Xóa file đính kèm'],

            // Time Tracking Permissions
            ['name' => 'time.log', 'display_name' => 'Log thời gian', 'group' => 'time', 'description' => 'Ghi nhận thời gian làm việc'],
            ['name' => 'time.view_all', 'display_name' => 'Xem tất cả time log', 'group' => 'time', 'description' => 'Xem time log của mọi người'],
            ['name' => 'time.delete', 'display_name' => 'Xóa time log', 'group' => 'time', 'description' => 'Xóa time log của người khác'],

            // Dashboard Permissions
            ['name' => 'dashboard.view', 'display_name' => 'Xem dashboard', 'group' => 'dashboard', 'description' => 'Xem dashboard và báo cáo'],
            ['name' => 'dashboard.export', 'display_name' => 'Export báo cáo', 'group' => 'dashboard', 'description' => 'Xuất báo cáo ra Excel/PDF'],
        ];

        foreach ($permissions as $permission) {
            DB::table('pro___permissions')->insert([
                'name' => $permission['name'],
                'display_name' => $permission['display_name'],
                'group' => $permission['group'],
                'description' => $permission['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Create Roles
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Quản trị viên',
                'description' => 'Toàn quyền trên tất cả dự án',
                'priority' => 100,
            ],
            [
                'name' => 'manager',
                'display_name' => 'Quản lý dự án',
                'description' => 'Quản lý dự án, thành viên, và nhiệm vụ',
                'priority' => 80,
            ],
            [
                'name' => 'member',
                'display_name' => 'Thành viên',
                'description' => 'Tạo và quản lý nhiệm vụ được giao',
                'priority' => 50,
            ],
            [
                'name' => 'viewer',
                'display_name' => 'Người xem',
                'description' => 'Chỉ xem, không chỉnh sửa',
                'priority' => 10,
            ],
        ];

        foreach ($roles as $role) {
            DB::table('pro___roles')->insert([
                'name' => $role['name'],
                'display_name' => $role['display_name'],
                'description' => $role['description'],
                'priority' => $role['priority'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Assign Permissions to Roles
        $rolePermissions = [
            'admin' => [
                // Admin has ALL permissions
                'project.view', 'project.create', 'project.update', 'project.delete', 'project.manage_members',
                'task.view', 'task.create', 'task.update', 'task.delete', 'task.assign',
                'comment.create', 'comment.delete',
                'attachment.upload', 'attachment.download', 'attachment.delete',
                'time.log', 'time.view_all', 'time.delete',
                'dashboard.view', 'dashboard.export',
            ],
            'manager' => [
                // Manager can do everything except delete project
                'project.view', 'project.update', 'project.manage_members',
                'task.view', 'task.create', 'task.update', 'task.delete', 'task.assign',
                'comment.create', 'comment.delete',
                'attachment.upload', 'attachment.download', 'attachment.delete',
                'time.log', 'time.view_all', 'time.delete',
                'dashboard.view', 'dashboard.export',
            ],
            'member' => [
                // Member can work on tasks
                'project.view',
                'task.view', 'task.create', 'task.update_own',
                'comment.create', 'comment.delete_own',
                'attachment.upload', 'attachment.download',
                'time.log',
                'dashboard.view',
            ],
            'viewer' => [
                // Viewer can only view
                'project.view',
                'task.view',
                'attachment.download',
                'dashboard.view',
            ],
        ];

        foreach ($rolePermissions as $roleName => $permissionNames) {
            $roleId = DB::table('pro___roles')->where('name', $roleName)->value('id');

            foreach ($permissionNames as $permissionName) {
                $permissionId = DB::table('pro___permissions')->where('name', $permissionName)->value('id');

                if ($roleId && $permissionId) {
                    DB::table('pro___role_permission')->insert([
                        'role_id' => $roleId,
                        'permission_id' => $permissionId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        $this->command->info('✅ Permissions and Roles seeded successfully!');
        $this->command->info('   - Permissions: ' . count($permissions));
        $this->command->info('   - Roles: ' . count($roles));
        $this->command->info('   - Role-Permission mappings created');
    }
}
