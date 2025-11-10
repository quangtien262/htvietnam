<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tai_lieu_binh_luan', function (Blueprint $table) {
            $table->id();
            
            $table->unsignedBigInteger('file_id')->nullable();
            $table->unsignedBigInteger('thu_muc_id')->nullable();
            $table->enum('loai_doi_tuong', ['file', 'folder']);
            
            $table->unsignedBigInteger('parent_comment_id')->nullable()->comment('For nested comments/replies');
            
            $table->unsignedBigInteger('user_id');
            $table->text('noi_dung');
            
            $table->boolean('is_resolved')->default(false)->comment('Đã xử lý/giải quyết');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('file_id')->references('id')->on('tai_lieu_file')->onDelete('cascade');
            $table->foreign('thu_muc_id')->references('id')->on('tai_lieu_thu_muc')->onDelete('cascade');
            $table->foreign('parent_comment_id')->references('id')->on('tai_lieu_binh_luan')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Short index names
            $table->index('file_id', 'tl_cmt_file_idx');
            $table->index('user_id', 'tl_cmt_user_idx');
            $table->index('is_resolved', 'tl_cmt_resolved_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tai_lieu_binh_luan');
    }
};
