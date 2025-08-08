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
        Schema::create('trang_thai_hoa_don', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            
            MigrateService::createBaseColumn($table);
        });
        $order_col = 1;
        $tbl = MigrateService::createTable(0, 'trang_thai_hoa_don', 'Trạng thái hóa đơn', 0, 1, 1, 0, 0);
        
        MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++);

        MigrateService::createColumn02($tbl->id, 'name', 'Trạng thái hóa đơn', 'VARCHAR', 'text', $order_col++,  ['require' => 1,'is_view_detail' => 1]);
        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trang_thai_hoa_don');
    }
};
