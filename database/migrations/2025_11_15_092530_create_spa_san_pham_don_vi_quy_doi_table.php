<?php

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
        Schema::create('spa_san_pham_don_vi_quy_doi', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('san_pham_id');
            $table->string('don_vi', 50);
            $table->decimal('ty_le', 10, 4);
            $table->string('ghi_chu')->nullable();
            $table->tinyInteger('is_active')->default(1);
            $table->timestamps();

            // Indexes
            $table->index('san_pham_id');
            $table->index('don_vi');

            // Foreign key
            $table->foreign('san_pham_id')
                  ->references('id')
                  ->on('spa_san_pham')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spa_san_pham_don_vi_quy_doi');
    }
};
