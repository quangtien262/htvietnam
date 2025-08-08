<?php

use App\Services\MigrateService;
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
        Schema::create('task_prority', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('color')->default('#000000')->nullable();

            MigrateService::createBaseColumn($table);

            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_prority');
    }
};
