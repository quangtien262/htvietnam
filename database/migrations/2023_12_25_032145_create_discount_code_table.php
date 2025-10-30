<?php

use App\Models\Admin\Table;
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
        Schema::create('discount_code', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->string('image')->nullable();
            $table->date('time_start')->nullable();
            $table->date('time_end')->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->timestamps();
        });
        $order = 1;
        $user = Table::where('name', 'admin_users')->first();
       
        $mail_maketting = MigrateService::createTable02('discount_code', 'Mã giảm giá',['is_edit' => 1]);
        
        MigrateService::createColumn02($mail_maketting->id, 'id', 'id', 'INT', 'number', $order++);

        MigrateService::createColumn02($mail_maketting->id, 'image', 'Hình ảnh', 'TEXT', 'image', $order++, 
        ['show_in_list' => 1, 'is_view_detail' => 1]);

        MigrateService::createColumn02($mail_maketting->id, 'name', 'Tên', 'VARCHAR', 'text', $order++, 
        ['show_in_list' => 1, 'is_view_detail' => 1]);

        

        MigrateService::createColumn02($mail_maketting->id, 'code', 'Mã', 'VARCHAR', 'text', $order++, 
        ['show_in_list' => 1, 'is_view_detail' => 1]);

        MigrateService::createColumn02($mail_maketting->id, 'time_start', 'Ngày bắt đầu', 'DATE', 'date', $order++, 
        ['show_in_list' => 1, 'is_view_detail' => 1]);

        MigrateService::createColumn02($mail_maketting->id, 'time_end', 'Ngày kết thúc', 'DATE', 'date', $order++, 
        ['show_in_list' => 1, 'is_view_detail' => 1]);

        MigrateService::createColumn02($mail_maketting->id, 'create_by', 'Tạo bởi', 'INT', config('constant.config_table.type_edit.select'), $order++, ['select_table_id' => $user->id, 'edit' => 0]);
        MigrateService::createColumn02($mail_maketting->id, 'sort_order', 'sort_order', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($mail_maketting->id, 'created_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
        MigrateService::createColumn02($mail_maketting->id, 'updated_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discount_code');
    }
};
