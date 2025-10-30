<?php

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
        Schema::create('products_bds_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            $table->integer('languages_id')->nullable();
            $table->integer('data_id')->nullable();
            $table->longtext('description')->nullable();
            $table->longtext('description02')->nullable();
            $table->longtext('content')->nullable();
            $table->longtext('content02')->nullable();
            $table->longtext('content03')->nullable();


            $table->text('meta_title')->nullable();
            $table->text('meta_keyword')->nullable();
            $table->text('meta_description')->nullable();
            $table->longtext('content_promo')->nullable();

            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });

        $order = 1;
        $productData = MigrateService::createTable02('products_bds_data', 'Sản phẩm', ['is_edit' => 0]);
        MigrateService::createColumn02(
            $productData->id,
            'name_data',
            'Tiêu đề',
            'VARCHAR',
            'text',
            $order++,
            ['col' => 24, 'require' => 1]
        );
        MigrateService::createColumn02(
            $productData->id,
            'description',
            'Mô tả ngắn',
            'TEXT',
            'textarea',
            $order++,
            ['show_in_list' => 1, 'col' => 24]
        );

        MigrateService::createColumn02(
            $productData->id,
            'meta_title',
            '[SEO] Tiêu đề',
            'TEXT',
            'text',
            $order++,
            ['col' => 24, 'require' => 0]
        );


        MigrateService::createColumn02(
            $productData->id,
            'content',
            'Ứng dụng',
            'LONGTEXT',
            'tiny',
            $order++,
            ['show_in_list' => 0, 'col' => 24]
        );
        MigrateService::createColumn02(
            $productData->id,
            'content02',
            'Mô tả sản phẩm',
            'LONGTEXT',
            'tiny',
            $order++,
            ['show_in_list' => 0, 'col' => 24]
        );
        MigrateService::createColumn02(
            $productData->id,
            'content03',
            'Thông số kỹ thuật',
            'LONGTEXT',
            'tiny',
            $order++,
            ['show_in_list' => 0, 'col' => 24]
        );

        MigrateService::columnSEO($productData, $order++);

        MigrateService::baseColumn($productData, 100, true);

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products_bds_data');
    }
};
