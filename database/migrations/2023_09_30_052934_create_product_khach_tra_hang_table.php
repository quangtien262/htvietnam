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
        Schema::create('product_khach_tra_hang', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->default(0)->nullable();

            $table->integer('chi_nhanh_id')->default(0)->nullable();
            $table->integer('nhan_vien_id')->default(0)->nullable();
            $table->integer('khach_hang_id')->default(0)->nullable();

            $table->integer('user_id')->default(0)->nullable();
            $table->integer('hinh_thuc_chi_id')->default(0)->nullable();
            $table->integer('gia_ban')->default(0)->nullable();
            $table->integer('so_luong')->default(0)->nullable();
            
            $table->integer('giam_gia')->default(0)->nullable();
            $table->integer('phi_tra_hang')->default(0)->nullable();
            $table->integer('thanh_tien')->default(0)->nullable();
            $table->integer('hinh_thuc_thanh_toan_id')->default(0)->nullable();

            $table->integer('cong_no_status_id')->default(0)->nullable();
            $table->integer('da_thanh_toan')->default(0)->nullable();
            $table->integer('cong_no')->default(0)->nullable();
            $table->date('ngay_tat_toan')->nullable();

            $table->text('note')->nullable();

            $table->text('sub_data_ids')->nullable();
            $table->longText('info')->nullable();

            MigrateService::createBaseColumn($table);

        });

        Table::create([
            'name' => 'product_khach_tra_hang',
            'display_name' => 'Khách trả hàng',
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
        $tbl = Table::where('name', 'product_khach_tra_hang')->first();
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

        MigrateService::createColumn02($tableId, 'code', 'Mã trả hàng', 'VARCHAR', 'text', $order_col++,
            ['is_view_detail' => 1, 'show_in_list' => 1, 'edit' => 0,'auto_generate_code' => '{"edit":0, "prefix":"KTH", "length":5}']);
        $prod = Table::where('name', 'products')->first();

        // nv nhap
        $chinhanh = Table::where('name', 'chi_nhanh')->first();
        MigrateService::createColumn02($tableId, 'chi_nhanh_id', 'Chi nhánh', 'INT', 'select', $order_col++, 
        ['show_in_list' => 0, 'require' => 1,'select_table_id' => $chinhanh->id, 'add2search' => 1]);

        // nv nhap
        $admin = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($tableId, 'nhan_vien_id', 'Người nhập', 'INT', 'select', $order_col++, 
        ['show_in_list' => 1, 'require' => 1,'select_table_id' => $admin->id]);
        
        $user = Table::where('name', 'users')->first();
        MigrateService::createColumn02($tableId, 'khach_hang_id', 'Khách hàng', 'INT', 'select', $order_col++, 
        ['show_in_list' => 1, 'require' => 1, 'show_in_detail' => 1, 'select_table_id' => $user->id]);

        MigrateService::createColumn02($tableId, 'so_luong', 'Số lượng', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 0, 'require' => 0]);
        MigrateService::createColumn02($tableId, 'gia_ban', 'Giá bán', 'INT', 'number', $order_col++, 
        ['show_in_list' => 0, 'require' => 0, 'edit' => 0]);
        MigrateService::createColumn02($tableId, 'giam_gia', 'Giảm giá', 'INT', 'number', $order_col++, 
        ['show_in_list' => 0, 'edit' => 0]);
        // MigrateService::createColumn02($tableId, 'phi_tra_hang', 'Phí trả hàng', 'INT', 'number', $order_col++, 
        // ['show_in_list' => 1, 'edit' => 1]);

        $status = Table::where('name', 'cong_no_status')->first();
        MigrateService::createColumn02($tableId, 'cong_no_status_id', 'Trạng thái', 'INT', 'select', $order_col++, 
             ['select_table_id' => $status->id, 'require' => 0, 'edit' => 0 , 'add_express' => 0, 'show_in_list' => 1]);

        MigrateService::createColumn02($tableId, 'thanh_tien', 'Tổng tiền trả khách', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 0]);
        MigrateService::createColumn02($tableId, 'note', 'Ghi chú', 'TEXT', 'textarea', $order_col++, 
        ['show_in_list' => 0, 'edit' => 1, 'show_in_detail' => 1, 'col' => 12]);

        $status = \DB::table('tables')->where('name', 'status_kiem_kho')->first();
        MigrateService::createColumn02($tableId, 'is_draft', 'Trạng thái', 'INT', 'select', $order_col++, 
        ['show_in_list' => 1, 'edit' => 0, 'col'=> 24,'show_in_detail' => 1, 'fast_edit' => 0, 'select_table_id' => $status->id]);

        MigrateService::createColumn02($tableId, 'created_at', 'Ngày tạo', 'DATETIME', 'datetime', $order_col++, 
        ['show_in_list' => 1, 'edit' => 0, 'col'=> 24,'show_in_detail' => 1, 'fast_edit' => 0]);


        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_khach_tra_hang');
    }
};
