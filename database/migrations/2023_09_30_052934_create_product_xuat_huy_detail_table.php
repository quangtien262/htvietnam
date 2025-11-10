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
        Schema::create('product_xuat_huy_detail', function (Blueprint $table) {
            $table->id();
            $table->string('data_id')->nullable();
            $table->string('name')->nullable();
            $table->integer('code')->default(0)->nullable();

            $table->integer('product_id')->default(0)->nullable();
            $table->string('product_name')->nullable();
            $table->string('product_code')->nullable();

            $table->integer('so_luong_huy')->default(0)->nullable();
            $table->integer('gia_von')->default(0)->nullable();
            $table->integer('gia_tri_huy')->default(0)->nullable();

            $table->integer('ton_kho_truoc_khi_huy')->default(0)->nullable();
            $table->integer('ton_kho_sau_khi_huy')->default(0)->nullable();

           MigrateService::createBaseColumn($table);

        });



    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_xuat_huy_detail');
    }
};
