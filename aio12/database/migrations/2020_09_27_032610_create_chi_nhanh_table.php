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
        Schema::create('chi_nhanh', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->integer('chi_nhanh_status_id')->default(1)->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->date('ngay_thanh_lap')->nullable();
            $table->string('bo_phan')->nullable();
            $table->text('link_map')->nullable();
            $table->text('image')->nullable();
            $table->string('color')->nullable();

            MigrateService::createBaseColumn($table);
        });
        Table::create([
            'name' => 'chi_nhanh',
            'display_name' => 'Chi nhánh',
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 0,
            'form_data_type' => 2, //1: new page, 2: popup
            'expandable' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,
            'parent_id' => 0,
            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);
        $tbl = Table::where('name', 'chi_nhanh')->first();
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

        MigrateService::createColumn02(
            $tableId,
            'code',
            'Mã chi nhánh',
            'VARCHAR',
            'text',
            $order_col++,
            ['show_in_list' => 1, 'add2search' => 1, 'auto_generate_code' => '{"edit":0, "prefix":"CN", "length":5}']
        );
        // 'auto_generate_code' => '{"edit":0, "prefix":"PB", "length":5}'

        MigrateService::createColumn02($tableId, 'name', 'Tên chi nhánh', 'VARCHAR', 'text', $order_col++, ['require' => 1, 'show_in_list' => 1, 'is_view_detail' => 1]);

        $trangThai = Table::where('name', 'chi_nhanh_status')->first();
        MigrateService::createColumn02(
            $tableId,
            'chi_nhanh_status_id',
            'Trạng thái',
            'INT',
            'select',
            $order_col++,
            ['select_table_id' =>  $trangThai->id, 'require' => 1, 'show_in_list' => 1, 'add2search' => 1, 'add_express' => 1]
        );

        MigrateService::createColumn02($tableId, 'phone', 'Hotline', 'VARCHAR', 'text', $order_col++, ['require' => 1]);
        MigrateService::createColumn02($tableId, 'address', 'Địa chỉ', 'TEXT', 'textarea', $order_col++, ['require' => 1, 'add_express' => 1, 'is_view_detail' => 1]);
        MigrateService::createColumn02($tableId, 'ngay_thanh_lap', 'Ngày thành lập', 'DATE', 'date', $order_col++);
        MigrateService::createColumn02($tableId, 'bo_phan', 'Bộ phận', 'VARCHAR', 'text', $order_col++, ['add_express' => 1, 'show_in_list' => 1]);
        MigrateService::createColumn02($tableId, 'image', 'Ảnh', 'text', 'images', $order_col++);

        MigrateService::createColumn02($tableId, 'sort_order', 'sort_order', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($tableId, 'link_map', 'Link nhúng bản đồ', 'text', 'text', $order_col++, ['col' => 24]);
        MigrateService::createColumn02(
            $tableId,
            'color',
            'Màu đánh dấu',
            'VARCHAR',
            'color',
            $order_col++,
            ['show_in_list' => 0, 'edit' => 0]
        );
        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chi_nhanh');
    }
};
