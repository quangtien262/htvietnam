<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tai_lieu_hoat_dong', function (Blueprint $table) {
            $table->id();
            
            $table->unsignedBigInteger('file_id')->nullable();
            $table->unsignedBigInteger('thu_muc_id')->nullable();
            $table->enum('loai_doi_tuong', ['file', 'folder']);
            
            $table->unsignedBigInteger('user_id')->nullable()->comment('Null nếu là public access');
            $table->enum('hanh_dong', [
                'view', 'download', 'upload', 'edit', 'delete', 
                'share', 'revoke', 'comment', 'move', 'copy', 
                'rename', 'restore', 'star', 'unstar'
            ]);
            
            $table->json('chi_tiet')->nullable()->comment('Extra data: version, old/new permissions, etc.');
            
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            
            $table->timestamp('created_at');
            
            $table->foreign('file_id')->references('id')->on('tai_lieu_file')->onDelete('cascade');
            $table->foreign('thu_muc_id')->references('id')->on('tai_lieu_thu_muc')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            
            // Short index names
            $table->index('file_id', 'tl_act_file_idx');
            $table->index('user_id', 'tl_act_user_idx');
            $table->index('hanh_dong', 'tl_act_action_idx');
            $table->index('created_at', 'tl_act_time_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tai_lieu_hoat_dong');
    }
};
