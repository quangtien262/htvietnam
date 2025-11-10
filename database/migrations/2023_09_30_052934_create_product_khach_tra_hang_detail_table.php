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
        Schema::create('product_khach_tra_hang_detail', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->default(0)->nullable();
            $table->integer('data_id')->default(0)->nullable();

            $table->integer('product_id')->default(0)->nullable();
            $table->string('product_name')->default(0)->nullable();
            $table->string('product_code')->default(0)->nullable();

            $table->integer('gia_ban')->default(0)->nullable();
            $table->integer('so_luong')->default(0)->nullable();
            $table->integer('so_luong_detail')->default(0)->nullable();
            $table->integer('giam_gia')->default(0)->nullable();
            $table->integer('phi_tra_hang')->default(0)->nullable();
            $table->integer('tien_tra_khach')->default(0)->nullable();
            $table->integer('is_percen')->default(0)->nullable();

            MigrateService::createBaseColumn($table);

        });



    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_khach_tra_hang_detail');
    }
};
