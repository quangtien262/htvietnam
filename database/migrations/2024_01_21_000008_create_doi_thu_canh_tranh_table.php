<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doi_thu_canh_tranh', function (Blueprint $table) {
            $table->id();
            $table->string('ten_doi_thu');
            $table->string('website')->nullable();
            $table->string('linh_vuc')->nullable();
            $table->text('diem_manh')->nullable();
            $table->text('diem_yeu')->nullable();
            $table->text('chien_luoc_canh_tranh')->nullable();
            $table->json('bang_gia_tham_khao')->nullable()->comment('Bảng giá sản phẩm đối thủ');
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doi_thu_canh_tranh');
    }
};
