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
        // lucky: tang gia tri the
        Schema::create('card_history', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();

            $table->integer('card_id')->nullable();
            $table->integer('card_service_id')->default(0)->nullable();
            $table->integer('card_gt_id')->default(0)->nullable();

            $table->integer('users_id')->nullable();
            $table->integer('chi_nhanh_id')->default(12)->nullable();
            $table->integer('hoa_don_id')->default(0)->nullable();
            $table->integer('hoa_don_chi_tiet_id')->nullable();
            $table->integer('so_luong')->default(0)->nullable();

            $table->integer('price')->nullable();
            $table->integer('admin_users_id')->nullable();
            $table->integer('so_luong_duoc_tang')->default(0)->nullable();
            $table->integer('product_id')->default(0)->nullable();
            $table->integer('ton_luy_ke')->default(0)->nullable();
            $table->integer('vat')->default(0)->nullable();
            $table->integer('vat_money')->default(0)->nullable();
            $table->text('note')->nullable();
            $table->integer('user_edit')->default(0)->nullable();

            $table->string('lucky_id')->default(0)->nullable();

            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });
        Table::create([
            //require
            'name' => 'card_history',
            'display_name' => 'Lịch sử thẻ',
            'parent_id' => 0,
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 0, // 1 hiển thị ở menu; 0 không hiển thị
            'form_data_type' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,
            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);

        $tbl = Table::where('name', 'card_history')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        // MigrateService::createColumn02($tableId, 'name', 'Chiết khấu nhân viên bán hàng', 'VARCHAR', 'text', $order_col++, ['edit' => 0]);
        

        $admin_users = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($tableId, 'admin_users_id', 'Nhân viên', 'INT', 'select', $order_col++, 
        ['select_table_id' => $admin_users->id,  'show_in_list' => 1, 'is_view_detail' => 1]);

        $card = Table::where('name', 'card')->first();
        MigrateService::createColumn02($tableId, 'card_id', 'Thẻ', 'INT', 'select', $order_col++, 
        ['select_table_id' => $card->id, 'show_in_list' => 1]);

        MigrateService::createColumn02($tableId, 'hoa_don_id', 'Hóa đơn', 'INT', 'number', $order_col++, 
        ['select_table_id' => $card->id, 'show_in_list' => 0, 'edit' => 0, ]);

        MigrateService::createColumn02($tableId, 'hoa_don_chi_tiet_id', 'Hóa đơn chi tiết', 'INT', 'number', $order_col++, 
        ['show_in_list' => 0, 'edit' => 0, ]);

        MigrateService::createColumn02($tableId, 'so_luong', 'Số lượng', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 1, ]);
        MigrateService::createColumn02($tableId, 'price', 'Giá', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 1, ]);

        $admUser = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($tableId, 'admin_users_id', 'Nhân viên', 'INT', 'number', $order_col++, 
        ['select_table_id' => $admUser->id, 'show_in_list' => 1, 'edit' => 1, ]);
        
        MigrateService::createColumn02($tableId, 'user_edit', 'Nhân viên sửa', 'INT', 'number', $order_col++, 
        ['select_table_id' => $admUser->id, 'show_in_list' => 1, 'edit' => 1, ]);

        MigrateService::createColumn02($tableId, 'so_luong_duoc_tang', 'Số lượng dc tặng', 'INT', 'number', $order_col++, 
        ['show_in_list' => 1, 'edit' => 1, ]);

        MigrateService::createColumn02($tableId, 'note', 'Ghi chú', 'TEXT', 'textarea', $order_col++, 
        ['show_in_list' => 1, 'edit' => 1, ]);

        $product = Table::where('name', 'products')->first();
        MigrateService::createColumn02($tableId, 'product_id', 'Hàng hóa', 'INT', 'number', $order_col++, 
        ['select_table_id' => $product->id, 'show_in_list' => 1, 'edit' => 0, ]);
        
        
        MigrateService::createColumn02($tableId, 'created_at', 'Ngày tạo', 'DATETIME', 'datetime', $order_col++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_history');
    }
};
