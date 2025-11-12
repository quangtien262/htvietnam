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
        Schema::create('pro___task_time_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->unsignedBigInteger('admin_user_id');
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration')->nullable()->comment('Duration in seconds');
            $table->text('mo_ta')->nullable();
            $table->boolean('is_running')->default(false);
            $table->timestamps();

            $table->foreign('task_id')->references('id')->on('pro___tasks')->onDelete('cascade');
            $table->foreign('admin_user_id')->references('id')->on('admin_users')->onDelete('cascade');
            
            $table->index(['task_id', 'admin_user_id']);
            $table->index('is_running');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pro___task_time_logs');
    }
};
