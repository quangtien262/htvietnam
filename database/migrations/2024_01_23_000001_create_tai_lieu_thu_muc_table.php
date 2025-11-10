<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tai_lieu_thu_muc', function (Blueprint $table) {
            $table->id();
            $table->string('ma_thu_muc', 20)->unique()->comment('TM0001, TM0002...');
            $table->unsignedBigInteger('parent_id')->nullable()->comment('Thư mục cha');
            $table->string('ten_thu_muc', 255);
            $table->text('mo_ta')->nullable();
            $table->unsignedBigInteger('nguoi_tao_id');
            $table->unsignedBigInteger('phong_ban_id')->nullable();
            
            $table->boolean('is_public')->default(false)->comment('Public cho toàn công ty');
            $table->enum('loai', ['ca_nhan', 'phong_ban', 'cong_ty', 'du_an'])->default('ca_nhan');
            
            // Tích hợp với module khác
            $table->unsignedBigInteger('lien_ket_id')->nullable()->comment('ID liên kết (nếu có)');
            $table->string('loai_lien_ket', 50)->nullable()->comment('hop_dong_nhan_vien, don_hang, bao_gia...');
            
            $table->integer('thu_tu_sap_xep')->default(0);
            $table->string('mau_sac', 7)->nullable()->comment('Hex color #FF5733');
            $table->string('icon', 50)->nullable()->comment('Ant Design icon name');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('parent_id')->references('id')->on('tai_lieu_thu_muc')->onDelete('cascade');
            $table->foreign('nguoi_tao_id')->references('id')->on('admin_users')->onDelete('cascade');
            
            $table->index(['parent_id', 'nguoi_tao_id', 'phong_ban_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tai_lieu_thu_muc');
    }
};
