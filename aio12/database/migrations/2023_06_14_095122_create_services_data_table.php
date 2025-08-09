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
        Schema::create('services_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            $table->string('data_id')->nullable();
            $table->string('languages_id')->nullable();
            $table->longtext('description')->nullable();
            $table->longtext('meta_title')->nullable();
            $table->longtext('meta_keyword')->nullable();
            $table->longtext('meta_description')->nullable();
            $table->longtext('content')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services_data');
    }
};
