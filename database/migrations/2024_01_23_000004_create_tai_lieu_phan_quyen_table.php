<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tai_lieu_phan_quyen', function (Blueprint $table) {
            $table->id();
            
            // Đối tượng được phân quyền (file hoặc folder)
            $table->unsignedBigInteger('file_id')->nullable();
            $table->unsignedBigInteger('thu_muc_id')->nullable();
            $table->enum('loai_doi_tuong', ['file', 'folder']);
            
            // Người/nhóm được cấp quyền
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('phong_ban_id')->nullable();
            $table->enum('loai_nguoi_dung', ['user', 'department', 'public'])->default('user');
            
            // Quyền
            $table->enum('quyen', ['owner', 'editor', 'viewer', 'commenter'])->default('viewer');
            
            // Thời hạn
            $table->timestamp('ngay_het_han')->nullable();
            $table->boolean('is_active')->default(true);
            
            // Người chia sẻ
            $table->unsignedBigInteger('nguoi_chia_se_id');
            
            $table->timestamps();
            
            $table->foreign('file_id')->references('id')->on('tai_lieu_file')->onDelete('cascade');
            $table->foreign('thu_muc_id')->references('id')->on('tai_lieu_thu_muc')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('nguoi_chia_se_id')->references('id')->on('users')->onDelete('cascade');
            
            // Short index names
            $table->index('file_id', 'tl_perm_file_idx');
            $table->index('user_id', 'tl_perm_user_idx');
            $table->index('quyen', 'tl_perm_role_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tai_lieu_phan_quyen');
    }
};
