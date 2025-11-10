<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tai_lieu_chia_se_link', function (Blueprint $table) {
            $table->id();
            
            $table->unsignedBigInteger('file_id')->nullable();
            $table->unsignedBigInteger('thu_muc_id')->nullable();
            $table->enum('loai_doi_tuong', ['file', 'folder']);
            
            $table->string('ma_link', 64)->unique()->comment('Unique hash for public link');
            $table->string('mat_khau', 255)->nullable()->comment('Optional password');
            
            $table->enum('quyen', ['viewer', 'editor', 'commenter'])->default('viewer');
            
            $table->integer('luot_truy_cap')->default(0);
            $table->integer('luot_truy_cap_toi_da')->nullable()->comment('Max access limit');
            
            $table->timestamp('ngay_het_han')->nullable();
            $table->boolean('is_active')->default(true);
            
            $table->unsignedBigInteger('nguoi_tao_id');
            
            $table->timestamps();
            
            $table->foreign('file_id')->references('id')->on('tai_lieu_file')->onDelete('cascade');
            $table->foreign('thu_muc_id')->references('id')->on('tai_lieu_thu_muc')->onDelete('cascade');
            $table->foreign('nguoi_tao_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->index('ma_link', 'tl_link_hash_idx');
            $table->index('is_active', 'tl_link_active_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tai_lieu_chia_se_link');
    }
};
