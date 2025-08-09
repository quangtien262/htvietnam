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
        Schema::create('product_nhap_hang', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();

            $table->integer('tong_tien_hang')->default(0)->nullable();
            $table->integer('giam_gia')->default(0)->nullable();
            $table->integer('thanh_tien')->default(0)->nullable();
            $table->integer('so_luong')->default(0)->nullable();
            $table->integer('tong_phi_van_chuyen')->default(0)->nullable();

            
            $table->integer('cong_no_status_id')->default(1)->nullable(); 

            // $table->integer('nhap_hang_status_id')->default(1)->nullable();
            $table->integer('nha_cung_cap_id')->default(0)->nullable();
            $table->integer('nhan_vien_id')->default(0)->nullable();
            $table->integer('chi_nhanh_id')->default(0)->nullable();
            
            $table->integer('hinh_thuc_thanh_toan_id')->nullable();

            $table->integer('da_thanh_toan')->default(0)->nullable();
            $table->integer('cong_no')->default(0)->nullable();
            $table->date('ngay_tat_toan')->nullable();

            $table->text('note')->nullable();

            $table->text('sub_data_ids')->nullable();

            // format array info
            //     product_id: null,
            //     product_name: '',
            //     product_code: '',
            //     so_luong: 0, // so_luong_thuc_te
            //     gia_von: 0,
            //     giam_gia: 0,
            //     thanh_tien: 0,
            //     phi_van_chuyen:0
            $table->longText('info')->nullable();

            MigrateService::createBaseColumn($table);

        });



        Table::create([
            'name' => 'product_nhap_hang',
            'display_name' => 'Nhập hàng',
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 1,
            'form_data_type' => 2,
            'have_delete' => 1,
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
        $tbl = Table::where('name', 'product_nhap_hang')->first();
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

        MigrateService::createColumn02($tableId, 'code', 'Mã nhập hàng', 'VARCHAR', 'text', $order_col++,
        [
            'is_view_detail' => 1, 
            'show_in_list' => 1, 
            'show_in_detail' => 1, 
            'placeholder' => 'Tự động tạo nếu bỏ trống',
            'auto_generate_code' => '{"edit":0, "prefix":"NH", "length":5}'
        ]);
        $prod = Table::where('name', 'products')->first();

        MigrateService::createColumn02($tableId, 'ton_kho', 'Tồn kho', 'INT', 'number', $order_col++, 
        ['show_in_list' => 0, 'require' => 1, 'edit' => 0, 'show_in_detail' => 1]);

        // chinhanh
        $chinhanh = Table::where('name', 'chi_nhanh')->first();
        MigrateService::createColumn02($tableId, 'chi_nhanh_id', 'Chi nhánh', 'INT', 'select', $order_col++, 
        ['show_in_list' => 1, 'require' => 1,'select_table_id' => $chinhanh->id, 'add2search' => 1, 'show_in_detail' => 1]);

        // nv nhap
        $admin = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($tableId, 'nhan_vien_id', 'Người nhập', 'INT', 'select', $order_col++, 
        ['show_in_list' => 1, 'require' => 1,'select_table_id' => $admin->id, 'show_in_detail' => 1]);
        
        // status
        // $status = Table::where('name', 'nhap_hang_status')->first();
        // MigrateService::createColumn02($tableId, 'nhap_hang_status_id', 'Trạng thái', 'INT', 'select', $order_col++, 
        // ['select_table_id' => $status->id, 'show_in_list' => 0, 'add2search' => 1]);

        
        
        $ncc = Table::where('name', 'nha_cung_cap')->first();
        MigrateService::createColumn02($tableId, 'nha_cung_cap_id', 'Nhà cung cấp', 'INT', 'select', $order_col++, 
        ['select_table_id' => $ncc->id, 'require' => 1, 'show_in_list' => 1, 'add2search' => 1, 'show_in_detail' => 1]);
        
        MigrateService::createColumn02($tableId, 'so_luong', 'Số lượng', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'require' => 0, 'col' => 24, 'show_in_detail' => 1, 'edit' => 0]);
        MigrateService::createColumn02($tableId, 'giam_gia', 'Giảm giá', 'INT', 'number', $order_col++, 
        ['show_in_list' => 0, 'edit' => 0, 'col' => 24, 'show_in_detail' => 1]);
        MigrateService::createColumn02($tableId, 'thanh_tien', 'Thành tiền', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 0, 'show_in_detail' => 1]);

        MigrateService::createColumn02($tableId, 'note', 'Ghi chú', 'INT', 'number', $order_col++, 
        ['show_in_list' => 0, 'edit' => 1, 'col' => 24]);



        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_nhap_hang');
    }
};
