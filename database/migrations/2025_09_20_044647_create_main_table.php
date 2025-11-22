<?php

use App\Models\Admin\Table;
use App\Services\MigrateService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('main', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('route')->nullable();
            $table->string('icon')->nullable();
            $table->string('table_id')->nullable();
            MigrateService::createBaseColumn($table);


        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('main');
    }
};
