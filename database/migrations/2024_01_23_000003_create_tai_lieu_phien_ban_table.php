<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tai_lieu_phien_ban', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('file_id');
            
            $table->integer('phien_ban')->comment('v1, v2, v3...');
            $table->string('duong_dan', 500);
            $table->bigInteger('kich_thuoc')->default(0);
            $table->string('hash_md5', 32)->nullable();
            
            $table->unsignedBigInteger('nguoi_tai_len_id');
            $table->text('ghi_chu_thay_doi')->nullable()->comment('Change notes');
            
            $table->timestamps();
            
            $table->foreign('file_id')->references('id')->on('tai_lieu_file')->onDelete('cascade');
            $table->foreign('nguoi_tai_len_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->unique(['file_id', 'phien_ban']);
            $table->index(['file_id', 'phien_ban']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tai_lieu_phien_ban');
    }
};
