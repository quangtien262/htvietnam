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
        // lucky: nhanvienthuchien
        Schema::create('nhan_vien_thuc_hien_1', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();

            $table->integer('data_id')->nullable();

            $table->integer('admin_users_id')->nullable();
            
            $table->integer('loai_chung_tu')->default(8)->nullable();
            $table->integer('hoa_don_id')->nullable(); // id chứng từ
            $table->integer('hoa_don_chi_tiet_id')->nullable(); // id chứng từ chi tiết
            $table->string('lucky_hoa_don_id')->nullable();
            $table->string('lucky_hoa_don_chi_tiet_id')->nullable();
            $table->integer('tien_chiet_khau')->nullable();
            $table->integer('phan_tram_chiet_khau')->default(0)->nullable();
            $table->integer('phan_tram_doanh_thu_duoc_huong')->default(0)->nullable();
            $table->text('note')->nullable();

            $table->string('lucky_id')->default(0)->nullable();

            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });

        Table::create([
            //require
            'name' => 'nhan_vien_thuc_hien_1',
            'display_name' => 'Chiết khấu nhân viên bán hàng',
            'parent_id' => 0,
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
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

        $tbl = Table::where('name', 'nhan_vien_thuc_hien_1')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($tableId, 'name', 'Tiêu đề', 'VARCHAR', 'text', $order_col++, ['edit' => 0]);
        
        $admin_users = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($tableId, 'admin_users_id', 'Mã nhân viên', 'VARCHAR', 'select', $order_col++, 
        ['select_table_id' => $admin_users->id,  'show_in_list' => 1, 'is_view_detail' => 1]);

        MigrateService::createColumn02($tableId, 'loai_chung_tu', 'Loại chứng từ', 'INT', 'number', $order_col++, 
        ['require' => 1,'show_in_list' => 1, 'edit' => 0]);

        MigrateService::createColumn02($tableId, 'tien_chiet_khau', 'Chiết khấu (Vnđ)', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 1]);
        MigrateService::createColumn02($tableId, 'phan_tram_chiet_khau', 'Chiết khấu (%)', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 1]);
        MigrateService::createColumn02($tableId, 'phan_tram_doanh_thu_duoc_huong', 'Doanh thu được hưởng (%)', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 1]);

        MigrateService::createColumn02($tableId, 'hoa_don_id', 'Hóa đơn', 'INT', 'number', $order_col++, 
        ['show_in_list' => 0, 'edit' =>0]);

        MigrateService::createColumn02($tableId, 'hoa_don_chi_tiet_id', 'Hóa đơn', 'INT', 'number', $order_col++, 
        ['show_in_list' => 0, 'edit' => 0, 'show_in_detail' =>0]);

        MigrateService::createColumn02($tableId, 'lucky_hoa_don_id', 'lucky_hoa_don_id', 'TEXT', 'text', $order_col++, 
        ['show_in_list' => 0, 'edit' => 0, 'show_in_detail' =>0]);
        MigrateService::createColumn02($tableId, 'lucky_hoa_don_chi_tiet_id', 'lucky_hoa_don_chi_tiet_id', 'TEXT', 'text', $order_col++, 
        ['show_in_list' => 0, 'edit' => 0, 'show_in_detail' =>0]);
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nhan_vien_thuc_hien_1');
    }
};
