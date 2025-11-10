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
        Schema::create('product_tra_hang_ncc_detail', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->default(0)->nullable();

            $table->integer('data_id')->default(0)->nullable();

            $table->integer('product_id')->default(0)->nullable();
            $table->string('product_code')->default(0)->nullable();
            $table->string('product_name')->default(0)->nullable();

            $table->integer('gia_nhap')->default(0)->nullable();
            $table->integer('gia_tra_lai')->default(0)->nullable();
            $table->integer('thanh_tien')->default(0)->nullable();
            $table->integer('so_luong')->default(0)->nullable();

            

            MigrateService::createBaseColumn($table);

        });



    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_tra_hang_ncc_detail');
    }
};
