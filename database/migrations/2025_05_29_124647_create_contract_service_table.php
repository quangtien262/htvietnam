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
        Schema::create('contract_service', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->integer('contract_id')->nullable();
            $table->integer('service_id')->nullable(); // nv thực hiện
            $table->integer('price')->nullable(); // json người theo dõi hoặc làm cùng
            $table->string('per')->nullable();
            $table->integer('so_nguoi')->nullable();
            $table->integer('total')->nullable();

            MigrateService::createBaseColumn($table);


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contract_service');
    }
};
