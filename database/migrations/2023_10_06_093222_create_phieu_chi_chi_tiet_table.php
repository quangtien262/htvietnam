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
                Schema::create('phieu_chi_chi_tiet', function (Blueprint $table) {
                        $table->id();
                        $table->string('name')->nullable();
                        $table->integer('phieu_chi_id')->nullable();
                        $table->dateTime('thoi_gian')->nullable();
                        $table->integer('gia_tri_phieu')->nullable();
                        $table->integer('note')->nullable();

                        // product_info
                        $table->integer('product_id')->nullable();
                        $table->integer('product_code')->nullable();

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
                Schema::dropIfExists('phieu_chi_chi_tiet');
        }
};
