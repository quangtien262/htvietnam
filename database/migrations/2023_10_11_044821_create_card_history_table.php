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

        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_history');
    }
};
