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
        Schema::create('product_colors', function (Blueprint $table) {
            $table->id();
            $table->integer('name')->nullable();
            $table->text('price_up')->nullable();
            $table->text('count')->nullable();
            $table->text('image')->nullable();
            $table->longText('images')->nullable();
            $table->integer('products_id')->nullable();

            $table->integer('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->integer('create_by')->default(0)->nullable();
            $table->timestamps();
        });

        $order = 1;
        $table =  MigrateService::createTable02('product_colors', 'Màu sắc sản phẩm', 
        ['parent_id' => 0, 'is_edit' => 0, 'is_multiple_language' => 0, 'type_show' => 0]);

        $colors = Table::where('name', 'colors')->first();
        MigrateService::createColumn02($table->id, 'name', 'Màu sắc', 'INT', 'select', $order++,
        ['show_in_list' => 1, 'edit' => 1, 'select_table_id' => $colors->id]);

        MigrateService::createColumn02($table->id, 'image', 'Hình ảnh', 'TEXT', 'image_crop', $order++,
        ['show_in_list' => 0, 'edit' => 0]);

        MigrateService::createColumn02($table->id, 'images', 'Hình ảnh', 'TEXT', 'images_crop', $order++,
        ['show_in_list' => 0, 'edit' => 0]);

        MigrateService::createColumn02($table->id, 'price_up', 'Tiền cộng thêm', 'INT', 'number', $order++,
        ['show_in_list' => 1, 'edit' => 1]);
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
        Schema::dropIfExists('product_colors');
    }
};
