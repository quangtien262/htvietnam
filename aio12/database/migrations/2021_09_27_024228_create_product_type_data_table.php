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
        Schema::create('product_type_data', function (Blueprint $table) {
            $table->id();
            $table->string('name_data')->nullable();
            $table->integer('data_id')->nullable();
            $table->integer('languages_id')->nullable();
            
            MigrateService::createBaseColumn($table);
        });
        $order_col = 1;
        $tbl = MigrateService::createTable(0, 'product_type_data', 'Loại sản phẩm', 0,
        1, 1, 0, 0);

        MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($tbl->id, 'name_data', 'Tên', 'VARCHAR', 'text', $order_col++,['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_type_data');
    }
};
