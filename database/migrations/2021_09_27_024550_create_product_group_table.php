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
        Schema::create('product_group', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->text('description')->nullable();

            MigrateService::createBaseColumn($table);

        });

        $order_col = 1;
        $config = ['search_position' => 1];
        $tbl = MigrateService::createTable02( 'product_group', 'Nhóm hàng hóa',  $config);
        
        MigrateService::createColumn02($tbl->id, 'code', 'Mã nhóm', 'VARCHAR', 'text', $order_col++,['auto_generate_code' => '{"edit":0, "prefix":"NH", "length":5}']);
        MigrateService::createColumn02($tbl->id, 'name', 'Nhóm hàng hóa', 'VARCHAR', 'text', $order_col++,['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'description', 'Mô tả', 'VARCHAR', 'text', $order_col++,[]);
        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_group');
    }
};
