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
        Schema::create('contract_status', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('description')->nullable();
            $table->string('parent_name')->nullable();
            $table->string('color')->nullable();
            $table->string('background')->default('#64748b')->nullable();
            $table->string('icon')->default('CaretRightOutlined')->nullable();
            $table->integer('is_active')->default(1)->nullable();
            $table->integer('is_default')->default(1)->nullable();

            MigrateService::createBaseColumn($table);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contract_status');
    }
};
