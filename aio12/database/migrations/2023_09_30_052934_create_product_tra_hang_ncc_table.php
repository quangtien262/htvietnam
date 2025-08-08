<?php

use App\Models\Admin\Column;
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
        Schema::create('product_tra_hang_ncc', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->default(0)->nullable();
            $table->integer('chi_nhanh_id')->default(0)->nullable();

            $table->integer('tong_tien_hang')->default(0)->nullable();
            $table->integer('giam_gia')->default(0)->nullable();
            $table->integer('phi_tra_hang')->default(0)->nullable();
            $table->integer('so_luong')->default(0)->nullable();
            $table->integer('thanh_tien')->default(0)->nullable();

            $table->integer('cong_no_status_id')->default(0)->nullable();
            $table->integer('da_thanh_toan')->default(0)->nullable();
            $table->integer('cong_no')->default(0)->nullable();
            $table->date('ngay_tat_toan')->nullable();

            $table->integer('nha_cung_cap_id')->default(0)->nullable();
            $table->integer('nhan_vien_id')->default(0)->nullable();

            $table->text('note')->nullable();
            $table->integer('hinh_thuc_thanh_toan_id')->nullable();

            $table->text('sub_data_ids')->nullable();
            $table->longText('info')->nullable();

            MigrateService::createBaseColumn($table);

        });



        Table::create([
            'name' => 'product_tra_hang_ncc',
            'display_name' => 'Trả hàng nhập',
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
        $tbl = Table::where('name', 'product_tra_hang_ncc')->first();
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
        ['show_in_list' => 0, 'edit' => 0]);

        MigrateService::createColumn02($tableId, 'code', 'Mã trả hàng nhập', 'VARCHAR', 'text', $order_col++,
            ['is_view_detail' => 1, 'show_in_list' => 0, 'edit' => 0,'auto_generate_code' => '{"edit":0, "prefix":"THN", "length":5}']);
        

        // nv nhap
        $chinhanh = Table::where('name', 'chi_nhanh')->first();
        MigrateService::createColumn02($tableId, 'chi_nhanh_id', 'Chi nhánh', 'INT', 'select', $order_col++, 
        ['show_in_list' => 1, 'require' => 1,'select_table_id' => $chinhanh->id, 'add2search' => 1]);

        // nv nhap
        $admin = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($tableId, 'nhan_vien_id', 'Nhân viên trả', 'INT', 'select', $order_col++, 
        ['show_in_list' => 0, 'require' => 1,'select_table_id' => $admin->id]);
        
        

        $supplier = Table::where('name', 'nha_cung_cap')->first();
        MigrateService::createColumn02($tableId, 'nha_cung_cap_id', 'Nhà cung cấp', 'INT', 'select', $order_col++, 
        [ 'show_in_list' => 1,'select_table_id' => $supplier->id, 'require' => 1, 'col'=>12]);

        MigrateService::createColumn02($tableId, 'so_luong', 'Số lượng', 'INT', 'number', $order_col++, 
        ['show_in_list' => 0, 'require' => 0, 'edit' => 0]);
        MigrateService::createColumn02($tableId, 'giam_gia', 'Giảm giá', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 0]);
        MigrateService::createColumn02($tableId, 'phi_tra_hang', 'Phí trả hàng', 'INT', 'number', $order_col++, 
        ['show_in_list' => 0, 'edit' => 0]);
        MigrateService::createColumn02($tableId, 'thanh_tien', 'Tổng tiền trả', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 0]);

        $status = Table::where('name', 'cong_no_status')->first();
        MigrateService::createColumn02($tableId, 'cong_no_status_id', 'Trạng thái', 'INT', 'select', $order_col++, 
             ['select_table_id' => $status->id, 'require' => 0, 'edit' => 0 , 'add_express' => 0, 'show_in_list' => 1]);

        
        MigrateService::createColumn02($tableId, 'note', 'Ghi chú', 'INT', 'number', $order_col++, 
        ['show_in_list' => 0, 'edit' => 1, 'col' => 12]);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_tra_hang_ncc');
    }
};
