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
        Schema::create('pro___task_supporters', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->unsignedBigInteger('admin_user_id');
            $table->timestamps();

            $table->foreign('task_id')->references('id')->on('pro___tasks')->onDelete('cascade');
            $table->foreign('admin_user_id')->references('id')->on('admin_users')->onDelete('cascade');

            $table->unique(['task_id', 'admin_user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pro___task_supporters');
    }
};
