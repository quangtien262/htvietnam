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
        Schema::create('nha_cung_cap', function (Blueprint $table) {  //Nhà cung cấp
            $table->id();
            $table->string('code')->nullable(); //mã nhà cung cấp
            $table->string('name')->nullable(); //tên nhà cung cấp
            $table->string('tax_code')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('nha_cung_cap_status_id')->nullable(); //trạng thái nhà cung cấp
            $table->string('loai_nha_cung_cap_id')->nullable(); //trạng thái nhà cung cấp
            $table->string('email')->nullable();
            $table->string('link_web')->nullable();
            $table->string('note')->nullable(); //Ghi chú
            $table->string('user_contact')->nullable(); //người liên hệ

           MigrateService::createBaseColumn($table);
        });

        Table::create([
            //require
            'name' => 'nha_cung_cap',
            'display_name' => 'Nhà cung cấp ',
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
        $tbl = Table::where('name', 'nha_cung_cap')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($tableId, 'name', 'Tên nhà cung cấp', 'VARCHAR', 'text', $order_col++, ['require' => 1, 'show_in_list' => 1, 'is_view_detail' => 1]);
        MigrateService::createColumn02($tableId, 'code', 'Mã nhà cung cấp', 'VARCHAR', 'text', $order_col++, 
        ['show_in_list' => 1, 'add2search' => 1,'placeholder' => 'Tự động tạo nếu bỏ trống' ,'auto_generate_code' => '{"edit":0, "prefix":"NCC", "length":5}']);
        MigrateService::createColumn02($tableId, 'tax_code', 'Mã số thuế', 'VARCHAR', 'text', $order_col++);
        MigrateService::createColumn02($tableId, 'phone', 'Số điện thoại', 'VARCHAR', 'text', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tableId, 'user_contact', 'Người liên hệ', 'VARCHAR', 'text', $order_col++);

        $loai = Table::where('name', 'loai_nha_cung_cap')->first();
        MigrateService::createColumn02($tableId, 'loai_nha_cung_cap_id', 'Loại NCC', 'INT', 'select', $order_col++,
        ['select_table_id'=> $loai->id,'show_in_list'=>1,'add2search'=>1,'require' => 0]);

        $cungcap = Table::where('name', 'nha_cung_cap_status')->first();
        MigrateService::createColumn02($tableId, 'nha_cung_cap_status_id', 'Trạng thái', 'INT', 'select', $order_col++,
        ['select_table_id'=> $cungcap->id,'show_in_list'=>1,'add2search'=>1,'require' => 0]);
        MigrateService::createColumn02($tableId, 'email', 'Email', 'VARCHAR', 'text', $order_col++,[]);
        MigrateService::createColumn02($tableId, 'address', 'Địa chỉ', 'VARCHAR', 'text', $order_col++, ['col'=>12]);

        MigrateService::createColumn02($tableId, 'link_web', 'Link Website', 'VARCHAR', 'text', $order_col++,['col'=>12]);
        MigrateService::createColumn02($tableId, 'note', 'Ghi chú', 'TEXT',  'textarea', $order_col++,['col'=>12]);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nha_cung_cap');
    }
};
