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
        Schema::create('data_telesales', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->date('ngay')->nullable();
            $table->integer('users_id')->nullable();
            $table->integer('telesale_status_id')->nullable();
            $table->integer('chi_nhanh_id')->nullable();
            $table->integer('nhan_vien_id')->nullable();
            $table->integer('code_nv_id')->nullable();
            $table->text('note')->nullable();
            $table->text('phan_hoi')->nullable();
            $table->text('nd_cs')->nullable();

            $table->string('muc_dich')->nullable();
            $table->string('phone')->nullable();

            $table->text('dinh_kem')->nullable();
            $table->string('product_id')->nullable();
            
            MigrateService::createBaseColumn($table);
        });
        Table::create([
            //require
            'name' => 'data_telesales',
            'display_name' => 'Telesales',
            'parent_id' => 0,
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 1, // 1 hiển thị ở menu; 0 không hiển thị
            'form_data_type' => 2,
            'expandable' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,

            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);
        $tbl = Table::where('name', 'data_telesales')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($tableId, 'name', 'Tên khách hàng', 'VARCHAR', 'text', $order_col++, 
        ['edit' => 1, 'show_in_list' => 1, 'is_view_detail' => 1,]);
        MigrateService::createColumn02(
            $tableId,
            'code',
            'Mã telesales',
            'VARCHAR',
            'text',
            $order_col++,
            ['show_in_list' => 1, 'is_view_detail' => 1, 'auto_generate_code' => '{"edit":0, "prefix":"TELE", "length":5}']
        );
        MigrateService::createColumn02($tableId, 'ngay', 'Ngày telesales', 'DATE', 'date', $order_col++, []);

        MigrateService::createColumn02($tableId, 'muc_dich', 'Mục đích', 'VARCHAR', 'text', $order_col++);
        $kh = Table::where('name', 'users')->first();
        MigrateService::createColumn02($tableId, 'users_id', 'Mã-Tên khách hàng telesales', 'INT', 'select', $order_col++, ['select_table_id' => $kh->id, 'data_select' => '{"value":"id", "name":{"0":"code", "1":"name"}}']);
        MigrateService::createColumn02($tableId, 'phone', 'Điện thoại', 'VARCHAR', 'text', $order_col++, []);

       
        MigrateService::createColumn02($tableId, 'dinh_kem', 'Đính kèm', 'TEXT', 'image', $order_col++);
        
        $nv = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($tableId, 'nhan_vien_id', 'Sale', 'INT', 'select', $order_col++, 
        ['select_table_id' => $nv->id, 'show_in_list' => 1, 'data_select' => '{"value":"id", "name":{"0":"code", "1":"name"}}']);
        
        $product = Table::where('name', 'products')->first();
        MigrateService::createColumn02($tableId, 'product_id', 'Sản phẩm', 'INT', 'select', $order_col++, 
        ['select_table_id' => $product->id, 'show_in_list' => 1]);

        $chiNhanh = Table::where('name', 'chi_nhanh')->first();
        MigrateService::createColumn02($tableId, 'chi_nhanh_id', 'Chi nhánh', 'INT', 'select', $order_col++, ['select_table_id' => $chiNhanh->id, 'add2search' => 1]);
        
        // $status = Table::where('name', 'trang_thai_telesales')->first();
        // MigrateService::createColumn02($tableId, 'status_id', 'Trạng thái', 'INT', 'select', $order_col++, 
        // ['select_table_id' => $status->id, 'require' => 1, 'add_express' => 1, 'show_in_list' => 1, 'fast_edit' => 1]);

        
        MigrateService::createColumn02($tableId, 'phan_hoi', 'Phản hồi khách hàng', 'TEXT', 'textarea', $order_col++, ['col' => 12]);

        MigrateService::createColumn02($tableId, 'nd_cs', 'Nội dung tư vấn ', 'TEXT', 'textarea', $order_col++, ['col' => 12]);


        $user = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02(
            $tableId,
            'create_by',
            'Người tạo',
            'INT',
            'select',
            $order_col++,
            ['edit' => 0,  'show_in_detail' => 1, 'select_table_id' => $user->id]
        );
        MigrateService::createColumn02($tableId, 'note', 'Ghi chú', 'TEXT', 'text', $order_col++, 
            ['col' => 24, 'show_in_list' => 1, 'fast_edit' => 1]);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_telesales');
    }
};
