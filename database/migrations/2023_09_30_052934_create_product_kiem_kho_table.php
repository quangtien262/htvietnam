<?php

use App\Models\Admin\Column;
use App\Models\Admin\Table;
use App\Services\MigrateService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

    public function up(): void
    {
        Schema::create('product_kiem_kho', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->default(0)->nullable();

            $table->integer('nhan_vien_id')->default(0)->nullable();
            $table->integer('kho_hang_id')->default(0)->nullable();

            $table->integer('tong_ton_kho')->default(0)->nullable();

            $table->integer('tong_tien_chenh_lech')->default(0)->nullable();
            $table->integer('tong_tien_lech_tang')->default(0)->nullable();
            $table->integer('tong_tien_lech_giam')->default(0)->nullable();

            $table->integer('tong_sl_chenh_lech')->default(0)->nullable();
            $table->integer('so_luong_lech_tang')->default(0)->nullable();
            $table->integer('so_luong_lech_giam')->default(0)->nullable();
            $table->text('note')->nullable();
            
            $table->text('sub_data_ids')->nullable();
            $table->longText('info')->nullable();

            MigrateService::createBaseColumn($table);

        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_kiem_kho');
    }
};
