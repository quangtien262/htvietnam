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
                Schema::create('phieu_chi', function (Blueprint $table) {
                        $table->id();
                        $table->string('lucky_id')->nullable();
                        $table->string('name')->nullable();
                        $table->string('code')->nullable(); //Mã phiếu thu

                        $table->string('chung_tu_id')->nullable();
                        $table->string('loai_chung_tu')->nullable(); // ten bang
                        $table->string('ma_chung_tu')->nullable();
                        
                        //
                        $table->integer('gia_tri_phieu')->nullable();

                        $table->integer('hinh_thuc_chi_id')->nullable();

                        $table->integer('chi_nhanh_id')->nullable(); //chi nhánh
                        // $table->integer('hinh_thuc_thu_id')->nullable(); //hình thức
                        $table->integer('loai_chi_id')->nullable(); //Loại chi
                        $table->integer('menh_gia_id')->nullable(); //mệnh GIá
                        $table->integer('user_nop_id')->nullable(); //tên người chi
                        $table->integer('khach_hang_id')->nullable(); //tên người chi
                         $table->integer('nha_cung_cap_id')->default(0)->nullable(); //ncc
                        
                        $table->datetime('thoi_gian')->nullable(); //thời gian
                        $table->integer('nhan_vien_id')->nullable(); //tên người nhan 
                        $table->integer('ngan_hang_id')->nullable(); //Ngân hàng
                        $table->integer('phi_the')->nullable(); //Phí cà thẻ
                        $table->text('ghi_chu')->nullable(); //diễn giải

                        $table->text('info')->nullable(); // phiếu chi chi tiết id


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
                Schema::dropIfExists('phieu_chi');
        }
};
