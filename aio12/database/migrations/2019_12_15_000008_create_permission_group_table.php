<?php

use App\Services\MigrateService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('permission_group', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->text('description')->nullable();

            $table->longText('permission')->nullable();
            
            MigrateService::createBaseColumn($table);
        });

        $order_col = 1;

        $tbl = MigrateService::createTable02('permission_group', 'Nhóm quyền', [
            'is_edit' => 1,
            'form_data_type' => 1
        ]);
        
        MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++,['edit' =>0]);
        MigrateService::createColumn02($tbl->id, 'name', 'Nhóm quyền', 'VARCHAR', 'text', $order_col++,
        ['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'code', 'Mã Quyền', 'VARCHAR', 'text', $order_col++, 
        ['edit' => 0,'auto_generate_code' => '{"edit":0, "prefix":"PER", "length":5}']);
        MigrateService::createColumn02($tbl->id, 'description', 'Mô tả', 'TEXT', 'textarea', $order_col++, 
        ['show_in_list' => 1, 'fast_edit' => 1]);
        MigrateService::createColumn02($tbl->id,'permission', 'Chọn quyền', 'longtext', 'permission_list', $order_col++);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permission_group');
    }
};
