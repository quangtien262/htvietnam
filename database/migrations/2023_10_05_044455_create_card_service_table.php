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



}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_service');
    }
};
