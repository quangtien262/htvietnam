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
        Schema::create('ngan_hang', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            MigrateService::createBaseColumn($table);

        });
        $order_col = 1;
        $tbl = MigrateService::createTable(0, 'ngan_hang', 'Ngân hàng', 
        0, 1, 0, 0, 
        0);
        
         MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($tbl->id, 'name', 'Ngân hàng', 'VARCHAR', 'text', $order_col++,['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ngan_hang');
    }
};
