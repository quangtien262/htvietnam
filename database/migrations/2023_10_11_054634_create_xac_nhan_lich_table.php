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
        Schema::create('xac_nhan_lich', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->integer('chi_nhanh_id')->nullable();
            $table->integer('admin_users_id')->nullable();
            $table->dateTime('calendar')->nullable();

            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });
        Table::create([
            //require
            'name' => 'xac_nhan_lich',
            'display_name' => 'Xác nhận lịch',
            'parent_id' => 0,
            'sort_order' => 0,
            'type_show' => config('constant.type_show.drag_drop'),
            'count_item_of_page' => 30,
            'is_edit' => 0, // 1 hiển thị ở menu; 0 không hiển thị
            'form_data_type' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,

            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);
        $tbl = Table::where('name', 'xac_nhan_lich')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($tableId, 'name', 'Xác nhận lịch', 'VARCHAR', 'text', $order_col++, ['edit' => 0]);
        $chi_nhanh = Table::where('name', 'chi_nhanh')->first();
        MigrateService::createColumn02($tableId, 'chi_nhanh_id', 'Chi nhánh/PB', 'INT', 'select', $order_col++, ['select_table_id' => $chi_nhanh->id, 'require' => 1, 'show_in_list', 'is_view_detail' => 1]);
        $user = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($tbl->id, 'admin_users_id', 'NV xác nhận', 'VARCHAR', 'select', $order_col++, ['select_table_id' => $user->id, 'show_in_detail' => 1]);
        MigrateService::createColumn02($tbl->id, 'create_by', 'Người tạo', 'VARCHAR', 'select', $order_col++, ['select_table_id' => $user->id, 'edit' => 0, 'show_in_detail' => 1]);
        MigrateService::createColumn02($tableId, 'calendar', 'Ngày giờ đặt lịch', 'DATETIME', 'datetime', $order_col++);


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('xac_nhan_lich');
    }
};
