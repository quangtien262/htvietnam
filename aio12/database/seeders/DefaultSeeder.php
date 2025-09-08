<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Services\Admin\TblService;
use App\Services\CommonService;

class DefaultSeeder extends Seeder
{
        /**
     * Seed the application's database.
     */
    public function run()
    {
        DB::table('permission_group')->truncate();
        DB::table('confirm')->truncate();
        $order_col = 1;
        // $per = MigrateService::createTable02('permission_group', 'Nhóm quyền', []);
        // MigrateService::createColumn02($per->id,'id', 'id', 'INT', 'number', $order_col++);
        // MigrateService::createColumn02($per->id,'name', 'Tên nhóm', 'TEXT', 'text', $order_col++, []);
        // MigrateService::createColumn02($per->id,'permission', 'Chọn quyền', 'longtext', 'permission_list', $order_col++);
        // MigrateService::createColumn02($per->id,'create_by', 'Người tạo', 'INT', 'select', $order_col++);
        // MigrateService::createColumn02($per->id,'created_at', 'Ngày tạo', 'INT', 'date', $order_col++);
        // MigrateService::createColumn02($per->id, 'updated_at', 'Ngày tạo', 'INT', 'date', $order_col++);
        $tbls = TblService::getPermissionDefault();
        DB::table('permission_group')->insert(
            [
                ['name' => 'Super Admin', 'permission' => json_encode($tbls['all']), 'create_by' => 1, 'parent_id' => 0, 'sort_order' => 1],
            ]
        );

        // confirm
        DB::table('confirm')->insert([
            ['id' => 1, 'name' => 'Có', 'color' => 'processing'],
            ['id' => 2, 'name' => 'Không', 'color' => 'error']
        ]);

        CommonService::getEditorFolder();
    }

}
