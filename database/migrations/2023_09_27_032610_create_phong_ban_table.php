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
        Schema::create('phong_ban', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->integer('phong_ban_status_id')->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->date('ngay_thanh_lap')->nullable();
            $table->string('bo_phan')->nullable();
            $table->text('link_map')->nullable();
            $table->text('image')->nullable();
            $table->text('bed_id')->nullable();

            $table->integer('da_ngung_hoat_dong')->default(0)->nullable();

            $table->integer('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->integer('create_by')->default(0);
            $table->integer('is_recycle_bin')->default(0);
            $table->timestamps();
            $table->string('lucky_id')->nullable();
        });



    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phong_ban');
    }
};
