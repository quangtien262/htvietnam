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
        Schema::create('type_product', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('color')->nullable();
           
            MigrateService::createBaseColumn($table);
        });

        $order_col = 1;
        $tbl = MigrateService::createTable02('type_product', 'Loại sản phẩm', 
        ['is_edit' => 0]);

        MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($tbl->id, 'name', 'Tên', 'VARCHAR', 'text', $order_col++, 
        ['require' => 1, 'is_view_detail' => 1, 'add2search' => 1, 'show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'color', 'Màu sắc', 'VARCHAR', 'text', $order_col++, 
        ['require' => 0, 'is_view_detail' => 1, 'add2search' => 1, 'show_in_list' => 1, 'edit' => 0]);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('type_product');
    }
};
