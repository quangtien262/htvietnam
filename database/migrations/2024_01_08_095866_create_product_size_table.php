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
        Schema::create('product_size', function (Blueprint $table) {
            $table->id();
            $table->integer('name')->nullable();
            $table->text('price_up')->nullable();
            $table->text('count')->nullable();
            $table->integer('products_id')->nullable();

            $table->integer('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->integer('create_by')->default(0)->nullable();
            $table->timestamps();
        });

        $order = 1;
        $table =  MigrateService::createTable02('product_size', 'Size', 
        ['parent_id' => 0, 'is_edit' => 0, 'is_multiple_language' => 0, 'type_show' => 0]);

        $size = Table::where('name', 'size')->first();
        MigrateService::createColumn02($table->id, 'name', 'size_id', 'INT', 'select', $order++,['show_in_list' => 1, 'edit' => 1, 'select_table_id' => $size->id]);
        MigrateService::createColumn02($table->id, 'price_up', 'Tiền cộng thêm', 'INT', 'number', $order++,['show_in_list' => 1, 'edit' => 1]);
        MigrateService::createColumn02($table->id, 'count', 'Số lượng', 'INT', 'number', $order++,['show_in_list' => 1, 'edit' => 1]);
        
        // $product = Table::where('name', 'products')->first();
        MigrateService::createColumn02($table->id, 'products_id', 'Sản phẩm', 'INT', 'select', $order++,
        ['show_in_list' => 0, 'edit' => 0]);

        MigrateService::baseColumn($table);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_size');
    }
};
