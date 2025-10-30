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
        Schema::create('customer_group', function (Blueprint $table) {
            $table->id();
            $table->string('lucky_id')->nullable();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->string('description')->nullable();
            
            MigrateService::createBaseColumn($table);
        });
        $order_col = 1;
        $tbl = MigrateService::createTable(0, 'customer_group', 'Nhóm khách hàng', 
        0, 1, 0, 
        0, 0);
        
        MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($tbl->id, 'name', 'Nhóm khách hàng', 'VARCHAR', 'text',$order_col++,['require' => 1 ,'is_view_detail' => 1]);
        MigrateService::createColumn02($tbl->id, 'code', 'Mã nhóm', 'VARCHAR', 'text',$order_col++,['is_view_detail' => 1, 'auto_generate_code' => '{"edit":0, "prefix":"KH", "length":5}']);
        MigrateService::createColumn02($tbl->id, 'description', 'Ghi chú', 'VARCHAR', 'text',$order_col++,[]);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_group');
    }
}; 
