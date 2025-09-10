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
     *
     * @return void
     */
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->integer('user_id')->nullable();
            $table->string('product_id')->nullable();
            $table->integer('bds_id')->nullable();
            $table->integer('price')->nullable();
            $table->integer('promo_price')->nullable();
            $table->text('note')->nullable();
            $table->integer('quantity')->nullable();
            $table->integer('is_payment')->default(0)->nullable();
            $table->integer('invoice')->default(0)->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->integer('is_view')->nullable();
            
            MigrateService::createBaseColumn($table);
        });
        $order_col = 1;
        $user = Table::where('name', 'users')->first();
        $cart = MigrateService::createTable02('orders', 'Đơn đặt hàng', 
        ['is_edit'=>1]);
        MigrateService::createColumn02(
            $cart->id,
            'id',
            'id',
            'INT',
            'number',
            $order_col++,
            ['edit' => 0]
        );
        $product = Table::where('name', 'products')->first();
        MigrateService::createColumn02($cart->id, 'product_id', 'Sản phẩm', 'VARCHAR', 'select', $order_col++, ['select_table_id' => $product->id,'show_in_list' => 1, 'is_view_detail' => 1]);
        
        $user = Table::where('name', 'users')->first();
        MigrateService::createColumn02($cart->id, 'user_id', 'Khách hàng', 'INT', 'select', $order_col++,['select_table_id' => $user->id]);

        $bds = Table::where('name', 'bds')->first();
        MigrateService::createColumn02($cart->id, 'bds_id', 'BĐS', 'INT', 'select', $order_col++,
        ['select_table_id' => $bds->id]);

        MigrateService::createColumn02($cart->id, 'price', 'Giá bán', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($cart->id, 'promo_price', 'Số lượng', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($cart->id, 'note', 'Số lượng', 'TEXT', 'textarea', $order_col++);

        $confirm = Table::where('name', 'confirm')->first();
        MigrateService::createColumn02($cart->id, 'is_payment', 'Số lượng', 'INT', 'select', $order_col++,['select_table_id' => $confirm->id]);
        MigrateService::createColumn02($cart->id, 'invoice', 'Xuất hóa đơn', 'INT', 'select', $order_col++,['select_table_id' => $confirm->id]);
        
        MigrateService::createColumn02($cart->id, 'sort_order', 'Số lượng', 'TEXT', 'text', $order_col++);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('orders');
    }
};
