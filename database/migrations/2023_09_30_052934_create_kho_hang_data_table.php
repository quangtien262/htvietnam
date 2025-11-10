<?php

use App\Models\Admin\Table;
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
        Schema::create('kho_hang_data', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->integer('kho_hang_id')->nullable();
            $table->integer('product_id')->nullable();
            $table->integer('ton_kho')->nullable();
            MigrateService::createBaseColumn($table);
        });


        

    }
 
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kho_hang_data');
    }
};
