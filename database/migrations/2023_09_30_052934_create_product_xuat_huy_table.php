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
        Schema::create('product_xuat_huy', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->default(0)->nullable();

            $table->integer('ly_do_xuat_huy_id')->default(0)->nullable();
            $table->integer('kho_hang_id')->default(0)->nullable();

            $table->integer('nhan_vien_id')->default(0)->nullable();

            $table->integer('so_luong_huy')->default(0)->nullable();
            $table->integer('gia_tri_huy')->default(0)->nullable();
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
        Schema::dropIfExists('product_xuat_huy');
    }
};
