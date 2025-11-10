<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tai_lieu_quota', function (Blueprint $table) {
            $table->id();
            
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('phong_ban_id')->nullable();
            $table->enum('loai', ['user', 'department', 'company'])->default('user');
            
            $table->bigInteger('dung_luong_gioi_han')->default(10737418240)->comment('Bytes, default 10GB');
            $table->bigInteger('dung_luong_su_dung')->default(0)->comment('Bytes');
            $table->decimal('ty_le_su_dung', 5, 2)->default(0)->comment('Percentage %');
            
            $table->integer('canh_bao_tu')->default(80)->comment('Warning threshold %');
            $table->boolean('da_canh_bao')->default(false);
            
            $table->timestamp('updated_at');
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->unique(['user_id', 'loai']);
            $table->index(['loai', 'ty_le_su_dung']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tai_lieu_quota');
    }
};
