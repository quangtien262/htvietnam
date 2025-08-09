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
     *
     * @return void
     */
    public function up()
    {
        Schema::create('doi_tac', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('image')->nullable();
            $table->string('link')->nullable();
            $table->string('sort_order')->default(0)->nullable();
            $table->string('parent_id')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->timestamps();
        });
        $order_col = 1;
        $doiTac =  MigrateService::createTable02('doi_tac', 'Đối tác', ['parent_id' => 0, 'is_edit' => 0]);
        MigrateService::createColumn02($doiTac->id, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($doiTac->id, 'name', 'Tên', 'TEXT', 'text', $order_col++, ['show_in_list' => 1, 'is_view_detail' => 1]);
        MigrateService::createColumn02($doiTac->id, 'link', 'Đường dẫn', 'TEXT', 'text', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($doiTac->id, 'image', 'Ảnh đối tác', 'TEXT', 'image', $order_col++, ['show_in_list' => 1]);
        
        $adminUser = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($doiTac->id, 'create_by', 'Tạo bởi', 'INT', config('constant.config_table.type_edit.select'), $order_col++, ['select_table_id' => $adminUser->id, 'edit' => 0]);
        MigrateService::createColumn02($doiTac->id, 'created_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($doiTac->id, 'updated_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order_col++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('doi_tac');
    }
};
