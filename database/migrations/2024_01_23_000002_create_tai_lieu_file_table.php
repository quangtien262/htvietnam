<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tai_lieu_file', function (Blueprint $table) {
            $table->id();
            $table->string('ma_tai_lieu', 20)->unique()->comment('TL0001, TL0002...');
            $table->unsignedBigInteger('thu_muc_id')->nullable();
            
            $table->string('ten_file', 255)->comment('Tên hiển thị');
            $table->string('ten_goc', 255)->comment('Tên file gốc khi upload');
            $table->text('mo_ta')->nullable();
            
            $table->string('duong_dan', 500)->comment('storage/documents/...');
            $table->bigInteger('kich_thuoc')->default(0)->comment('Bytes');
            $table->string('mime_type', 100);
            $table->string('extension', 10);
            
            $table->integer('phien_ban')->default(1)->comment('Version number');
            $table->unsignedBigInteger('nguoi_tai_len_id');
            
            // Features
            $table->boolean('is_starred')->default(false);
            $table->json('tags')->nullable()->comment('Array of tags');
            $table->integer('luot_xem')->default(0);
            $table->integer('luot_tai_ve')->default(0);
            $table->timestamp('ngay_truy_cap_cuoi')->nullable();
            
            // Security & duplicate check
            $table->string('hash_md5', 32)->nullable();
            $table->string('hash_sha256', 64)->nullable();
            
            // OCR data (nếu là ảnh hoặc PDF)
            $table->text('ocr_data')->nullable()->comment('Text extracted by OCR');
            
            // Tích hợp với module khác
            $table->unsignedBigInteger('lien_ket_id')->nullable();
            $table->string('loai_lien_ket', 50)->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('thu_muc_id')->references('id')->on('tai_lieu_thu_muc')->onDelete('cascade');
            $table->foreign('nguoi_tai_len_id')->references('id')->on('users')->onDelete('cascade');
            
            // Short index names to avoid MySQL 64-char limit
            $table->index('thu_muc_id', 'tl_file_folder_idx');
            $table->index('nguoi_tai_len_id', 'tl_file_uploader_idx');
            $table->index('is_starred', 'tl_file_starred_idx');
            $table->index('mime_type', 'tl_file_mime_idx');
            $table->index('hash_md5', 'tl_file_md5_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tai_lieu_file');
    }
};
