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
        Schema::create('calendar', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->string('code')->nullable();
            $table->integer('chi_nhanh_dat_lich_id')->nullable();
            $table->integer('chi_nhanh_nhan_lich_id')->nullable();
            $table->dateTime('calendar')->nullable();
            $table->integer('admin_users_id')->nullable();
            // $table->integer('service_group_id')->nullable();
            $table->integer('users_id')->nullable();
            $table->string('sdt')->nullable();
            $table->text('anh')->nullable();
            $table->integer('trang_thai_dat_lich_id')->nullable();
            $table->integer('nhan_vien_nhan_lich_id')->nullable();
            $table->text('note')->nullable(); // note
            $table->text('service_id')->nullable();
            $table->text('nhan_vien_da_chon_id')->nullable();
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
        Schema::dropIfExists('calendar');
    }
};
