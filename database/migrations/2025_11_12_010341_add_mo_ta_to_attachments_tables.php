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
        // Create project_attachments table
        Schema::create('pro___project_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->string('ten_file');
            $table->string('duong_dan', 500);
            $table->string('loai_file', 100)->nullable();
            $table->bigInteger('kich_thuoc')->nullable();
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->text('mo_ta')->nullable();
            $table->timestamps();

            $table->foreign('project_id')->references('id')->on('pro___projects')->onDelete('cascade');
            $table->foreign('uploaded_by')->references('id')->on('admin_users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pro___project_attachments');
    }
};
