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
        Schema::create('card_service', function (Blueprint $table) {
            $table->id();
            $table->string(column: 'name')->nullable();
            $table->integer('data_id')->nullable(); // card_id
            $table->string('product_id')->nullable();
            $table->string('khach_hang_id')->nullable();

            
            $table->integer('so_luong_tmp')->default(0)->nullable(); // chỉ để lưu tạm
            $table->integer('so_luong_da_su_dung')->default(0)->nullable();

            // tạm bỏ
            $table->integer('so_luong')->default(1)->nullable(); // bỏ
            $table->integer('so_luong_con_lai')->default(0)->nullable();  // bỏ
            
            $table->integer('don_gia')->nullable();
            $table->integer('phan_tram_chiet_khau')->nullable();
            $table->integer('tien_chiet_khau')->nullable();
            $table->integer('thanh_toan')->nullable();
            $table->text('note')->nullable();
            $table->integer('so_luong_tang')->default(0)->nullable();
            $table->text('tang_kem')->nullable();

            $table->text('lucky_id')->nullable();
            
            $table->integer('is_recycle_bin')->default(0)->nullable();
            
            $table->timestamps();
        });
        Table::create([
            'name' => 'card_service',
            'display_name' => 'Chi Tiết thẻ',
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 0,
            'form_data_type' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,
            'parent_id' => 0,
            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
            'statistical_select' => '',
        ]);


        $tbl = Table::where('name', 'card_service')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        $tt_chung = MigrateService::createColumn02(
            $tableId,
            'product_id',
            'SP/DV',
            'INT',
            'number',
            3,

            [
                'block_type' => 'block_basic','show_in_list' => 1
            ]
        );
        MigrateService::createColumn02(
            $tableId,
            'id',
            'id',
            'INT',
            'number',
            $order_col++,
            ['edit' => 0],

        );
        MigrateService::createColumn02(
            $tableId,
            'so_luong',
            'Số lượng',
            'INT',
            'number',
            $order_col++,
            ['parent_id' => $tt_chung->id, 'require' => 1, 'show_in_list' => 1, 'is_view_detail' => 1]
        );
        MigrateService::createColumn02(
            $tableId,
            'don_gia',
            'Đơn giá',
            'INT',
            'number',
            $order_col++,
            ['parent_id' => $tt_chung->id, 'show_in_list' => 1, 'is_view_detail' => 1, 'add2search' => 1]
        );

        MigrateService::createColumn02($tableId, 'data_id', 'Thẻ', 'INT', 'number', $order_col++, 
        ['edit' => 0, 'show_in_list' => 0]);
        
        MigrateService::createColumn02($tableId, 'phan_tram_chiet_khau', 'Chiết khấu (%)', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($tableId, 'tien_chiet_khau', 'Chiết khấu (Vnđ)', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($tableId, 'thanh_toan', 'Chiết khấu (Vnđ)', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($tableId, 'note', 'Ghi chú', 'TEXT', 'textarea', $order_col++);
        MigrateService::createColumn02($tableId, 'so_luong_tang', 'Số lượng tặng', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($tableId, 'tang_kem', 'Tặng kèm', 'INT', 'number', $order_col++);


}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_service');
    }
};
// 0971779999