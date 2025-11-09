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
        Schema::create('loai_hang_hoa', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('color')->default('#1890ff');
            $table->integer('sort_order')->default(0);
            $table->string('icon')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loai_hang_hoa');
    }
};
