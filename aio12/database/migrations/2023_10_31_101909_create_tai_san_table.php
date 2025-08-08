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
        Schema::create('tai_san', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->text('barcode')->nullable();
            $table->integer('kho_tai_san_id')->nullable();
            $table->integer('chi_nhanh_id')->nullable();
            $table->integer('nhan_vien_id')->nullable();
            $table->date('ngay_mua')->nullable();

            // so_luong: Nếu là tài sản sử dụng sl luôn là 1, ts tiêu hao thì số lượng tùy chỉnh
            $table->integer('so_luong')->default(1)->nullable(); 
            
            $table->integer('gia_mua')->nullable();
            $table->integer('gia_tri_hien_tai')->default(0)->nullable();
            $table->integer('tai_san_status_used_id')->default(0)->nullable(); 
            $table->integer('tai_san_status_id')->nullable();
            $table->integer('tai_san_type_id')->nullable();
            $table->date('ngay_kiem')->nullable(); // ngày kiểm
            $table->text('note')->nullable();
            $table->integer('users_id')->nullable();

            MigrateService::createBaseColumn($table);
        });
        Table::create([
            //require
            'name' => 'tai_san',
            'display_name' => 'Tài sản',
            'parent_id' => 0,
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 0, // 1 hiển thị ở menu; 0 không hiển thị
            'form_data_type' => 2,
            'have_delete' => 1,
            'have_add_new' => 1,

            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);
        $tbl = Table::where('name', 'tai_san')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);


        MigrateService::createColumn02(
            $tableId,
            'code',
            'Mã tài sản',
            'VARCHAR',
            'barcode',
            $order_col++,
            ['show_in_list' => 1, 'edit' => 0, 'is_view_detail' => 1, 'auto_generate_code' => '{"edit":0, "prefix":"TS", "length":5}']
        );

        MigrateService::createColumn02(
            $tableId,
            'name',
            'Tên tài sản',
            'VARCHAR',
            'text',
            $order_col++,
            ['show_in_list' => 1, 'require' => 1]
        );

        $type = Table::where('name', 'tai_san_type')->first();
        MigrateService::createColumn02(
            $tableId,
            'tai_san_type_id',
            'Loại tài sản',
            'INT',
            'select',
            $order_col++,
            ['require' => 1, 'select_table_id' => $type->id, 'show_in_list' => 1, 'add_express' => 1]
        );

        MigrateService::createColumn02(
            $tableId,
            'ngay_mua',
            'Ngày mua',
            'DATE',
            'date',
            $order_col++,
            ['require' => 1, 'show_in_list' => 0]
        );
        
        $kho = Table::where('name', 'kho_tai_san')->first();
        MigrateService::createColumn02(
            $tableId,
            'kho_tai_san_id',
            'Vị trí kho tài sản',
            'INT',
            'select',
            $order_col++,
            ['select_table_id' => $kho->id, 'show_in_list' => 1, 'add2search' => 1, 'add_express' => 1, 'edit' => 1,'require' => 1]
        );

        $trangThai = Table::where('name', 'tai_san_status')->first();
        MigrateService::createColumn02(
            $tableId,
            'tai_san_status_id',
            'Tình trạng',
            'INT',
            'select',
            $order_col++,
            ['select_table_id' => $trangThai->id, 'show_in_list' => 1, 'add_express' => 1, 'require' => 1]
        );

        MigrateService::createColumn02(
            $tableId,
            'gia_mua',
            'Giá mua ban đầu',
            'INT',
            'number',
            $order_col++,
            ['show_in_list' => 1, 'require' => 1]
        );

        MigrateService::createColumn02(
            $tableId,
            'so_luong',
            ' Số lượng',
            'INT',
            'number',
            $order_col++,
            ['show_in_list' => 0, 'edit' => 1, 'require' => 1]
        );

        MigrateService::createColumn02(
            $tableId,
            'gia_tri_hien_tai',
            'Định giá hiện tại',
            'INT',
            'number',
            $order_col++,
            ['show_in_list' => 0]
        );

        

        $used = Table::where('name', 'tai_san_status_used')->first();
        MigrateService::createColumn02(
            $tableId,
            'tai_san_status_used_id',
            'Trạng thái sử dụng',
            'INT',
            'select',
            $order_col++,
            ['select_table_id' => $used->id, 'show_in_list' => 1, 'add2search' => 1, 'add_express' => 1, 'edit' => 0,'require' => 1]
        );
        

        $chiNhanh = Table::where('name', 'chi_nhanh')->first();
        MigrateService::createColumn02(
            $tableId,
            'chi_nhanh_id',
            'Chi nhánh sử dụng',
            'INT',
            'select',
            $order_col++,
            ['select_table_id' => $chiNhanh->id, 'show_in_list' => 0, 'add2search' => 1, 'add_express' => 1, 'edit' => 0]
        );

        $u = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02(
            $tableId,
            'nhan_vien_id',
            'Nhân viên sử dụng',
            'INT',
            'select',
            $order_col++,
            ['select_table_id' => $u->id, 'show_in_list' => 0, 'add2search' => 1, 'add_express' => 0, 'edit' => 0]
        );


        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tai_san');
    }
};
