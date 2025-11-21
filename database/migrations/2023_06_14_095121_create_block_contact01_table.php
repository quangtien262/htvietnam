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
        Schema::create('block_contact01', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('icon')->nullable();
            $table->text('note')->nullable();
            $table->text('link')->nullable();
            $table->integer('page_setting_id')->default(0)->nullable();
            $table->integer('menu_id')->default(0)->nullable();
            $table->integer('active')->default(1)->nullable();
            $table->string('images')->nullable();
            $table->text('image')->nullable();

            MigrateService::createBaseColumn($table);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('block_contact01');
    }
};
