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
        Schema::create('phong_ban', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->integer('phong_ban_status_id')->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->date('ngay_thanh_lap')->nullable();
            $table->string('bo_phan')->nullable();
            $table->text('link_map')->nullable();
            $table->text('image')->nullable();
            $table->text('bed_id')->nullable();

            $table->integer('da_ngung_hoat_dong')->default(0)->nullable();

            $table->integer('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->integer('create_by')->default(0);
            $table->integer('is_recycle_bin')->default(0);
            $table->timestamps();
            $table->string('lucky_id')->nullable();
        });
        Table::create([
            'name' => 'phong_ban',
            'display_name' => 'Phòng ban',
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
        $tbl = Table::where('name', 'phong_ban')->first();
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

        MigrateService::createColumn02($tableId, 'name', 'Tên phòng ban', 'VARCHAR', 'text', $order_col++, ['require' => 1,'show_in_list' => 1,'is_view_detail' => 1]);
        
        MigrateService::createColumn02($tableId, 'code', 'Mã phòng', 'VARCHAR', 'text', $order_col++,
        ['show_in_list' => 1,'add2search' => 1, 'auto_generate_code' => '{"edit":0, "prefix":"CN", "length":5}', 'placeholder' => 'Tự động nếu bỏ trống']);
        // 'auto_generate_code' => '{"edit":0, "prefix":"PB", "length":5}'

        

        $trangThai = Table::where('name', 'chi_nhanh_status')->first();
        MigrateService::createColumn02($tableId, 'phong_ban_status_id', 'Trạng thái', 'INT', 'select', $order_col++, ['select_table_id' =>  $trangThai->id, 'require' => 1,'show_in_list' => 1,'add2search' => 1,'add_express' => 1]);

        MigrateService::createColumn02($tableId, 'phone', 'Hotline', 'VARCHAR', 'text', $order_col++,['require' => 1]);
        MigrateService::createColumn02($tableId, 'address', 'Địa chỉ', 'TEXT', 'textarea', $order_col++, ['require' => 1, 'add_express' => 1,'is_view_detail' => 1]);
        MigrateService::createColumn02($tableId, 'ngay_thanh_lap', 'Ngày thành lập', 'DATE', 'date', $order_col++);
        MigrateService::createColumn02($tableId, 'bo_phan', 'Bộ phận', 'VARCHAR', 'text', $order_col++, ['add_express' => 1,'show_in_list' => 1]);
        MigrateService::createColumn02($tableId, 'image', 'Ảnh', 'text', 'images', $order_col++);
        $block = Table::where('name', 'bed')->first();
        MigrateService::createColumn02($tableId, 'bed_id', 'Danh sách phòng giường', 'VARCHAR', 'selects_table', $order_col++, ['select_table_id' => $block->id,'add_express' => 1]);
        MigrateService::createColumn02($tableId, 'sort_order', 'sort_order', 'INT', 'number', $order_col++,['edit' => 0]);
        MigrateService::createColumn02($tableId, 'link_map', 'Link nhúng bản đồ', 'text', 'text', $order_col++,['col'=>24]);

    }
 
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phong_ban');
    }
};
