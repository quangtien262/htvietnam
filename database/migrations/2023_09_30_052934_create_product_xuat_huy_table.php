<?php

use App\Models\Admin\Column;
use App\Models\Admin\Table;
use App\Services\MigrateService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

    public function up(): void
    {
        Schema::create('product_xuat_huy', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->default(0)->nullable();

            $table->integer('ly_do_xuat_huy_id')->default(0)->nullable();
            $table->integer('kho_hang_id')->default(0)->nullable();

            $table->integer('nhan_vien_id')->default(0)->nullable();

            $table->integer('so_luong_huy')->default(0)->nullable();
            $table->integer('gia_tri_huy')->default(0)->nullable();
            $table->text('note')->nullable();
            
            $table->text('sub_data_ids')->nullable();
            $table->longText('info')->nullable();

            MigrateService::createBaseColumn($table);

        });



        Table::create([
            'name' => 'product_xuat_huy',
            'display_name' => 'Xuất kho',
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 1,
            'form_data_type' => 2,
            'have_delete' => 0,
            'have_add_new' => 1,
            'parent_id' => 0,
            'is_show_btn_edit' => 0,
            'is_show_btn_detail' => 0,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
            'expandable' => 0
        ]);
        $tbl = Table::where('name', 'product_xuat_huy')->first();
        $tableId = $tbl->id;
        $order_col = 1;

        MigrateService::createColumn02(
            $tableId,
            'id',
            'id',
            'INT',
            'number',
            $order_col++,
            ['edit' => 0]
        );

        MigrateService::createColumn02($tableId, 'name', 'Tiêu đề', 'VARCHAR', 'text', $order_col++, 
        ['show_in_list' => 1, 'edit' => 1]);

        MigrateService::createColumn02($tableId, 'code', 'Mã xuất kho', 'VARCHAR', 'text', $order_col++,
            ['is_view_detail' => 1, 'show_in_list' => 1, 'edit' => 0, 'auto_generate_code' => '{"edit":0, "prefix":"XK", "length":5}']);
        
        
        MigrateService::createColumn02($tableId, 'so_luong_huy', 'SL xuất kho', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 0,'show_in_detail' => 1]);

        MigrateService::createColumn02($tableId, 'gia_tri_huy', 'Giá trị ', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 0,'show_in_detail' => 1]);

        $lydo = DB::table('tables')->where('name', 'ly_do_xuat_huy')->first();
        MigrateService::createColumn02($tableId, 'ly_do_xuat_huy_id', 'Lý do xuất kho', 'INT', 'select', $order_col++, 
        ['show_in_list' => 1, 'edit' => 1, 'col'=> 12,'show_in_detail' => 1, 'fast_edit' => 1, 'select_table_id' => $lydo->id, 'require' => 1]);

        $khoHang = DB::table('tables')->where('name', 'kho_hang')->first();
        MigrateService::createColumn02($tableId, 'kho_hang_id', 'Kho hàng', 'INT', 'select', $order_col++, 
        ['show_in_list' => 1, 'require' => 1,'edit' => 1, 'col'=> 12,'show_in_detail' => 1, 'fast_edit' => 1, 'select_table_id' => $khoHang->id]);

        $nv = DB::table('tables')->where('name', 'users')->first();
        MigrateService::createColumn02($tableId, 'nhan_vien_id', 'Nhân viên xuất kho', 'INT', 'select', $order_col++, 
        ['show_in_list' => 0, 'edit' => 1, 'col'=> 12,'show_in_detail' => 1, 'fast_edit' => 1, 'select_table_id' => $nv->id]);

        MigrateService::createColumn02($tableId, 'create_by', 'Người tạo', 'INT', 'select', $order_col++, 
        ['show_in_list' => 0, 'edit' => 0, 'col'=> 12,'show_in_detail' => 1, 'fast_edit' => 0, 'select_table_id' => $nv->id]);


        MigrateService::createColumn02($tableId, 'note', 'Ghi chú', 'TEXT', 'textarea', $order_col++, 
        ['show_in_list' => 0, 'edit' => 1, 'col'=> 24,'show_in_detail' => 1]);

        $status = DB::table('tables')->where('name', 'xuat_huy_status')->first();
        MigrateService::createColumn02($tableId, 'is_draft', 'Trạng thái', 'INT', 'select', $order_col++, 
        ['show_in_list' => 0, 'edit' => 0, 'edit' => 0, 'col'=> 24,'show_in_detail' => 1, 'fast_edit' => 0, 'select_table_id' => $status->id]);
         
        // info
        MigrateService::createColumn02($tableId, 'info', 'Info', 'TEXT', 'textarea', $order_col++, 
        ['show_in_list' => 0, 'edit' => 0, 'col'=> 24,'show_in_detail' =>0]);
         
        MigrateService::createColumn02($tableId, 'sub_data_ids', 'subdata', 'TEXT', 'textarea', $order_col++, 
        ['show_in_list' => 0, 'edit' => 0, 'col'=> 24,'show_in_detail' => 0]);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_xuat_huy');
    }
};
