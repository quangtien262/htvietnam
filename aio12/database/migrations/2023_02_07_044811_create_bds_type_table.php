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
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bds_type', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('sort_order')->nullable();
            $table->string('parent_id')->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->timestamps();
        });

        $order_col = 1;
        $adminUser = Table::where('name', 'admin_users')->first();
        $bdsType =  MigrateService::createTable02('bds_type', 'Loại BĐS', ['parent_id' => 0, 'is_edit' => 0]);
        // $this->createTable($id, 'bds_type', 'Loại BĐS', $order++, 1, 0, 190);
        MigrateService::createColumn02($bdsType->id, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($bdsType->id, 'name', 'Tên', 'TEXT', 'text', $order_col++);

        MigrateService::createColumn02($bdsType->id, 'create_by', 'Tạo bởi', 'INT', 'select', $order_col++, 
        ['select_table_id' => $adminUser->id, 'edit' => 0]);
        MigrateService::createColumn02($bdsType->id, 'created_at', 'Ngày tạo', 'DATETIME', 'datetime', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($bdsType->id, 'updated_at', 'Ngày tạo', 'DATETIME', 'datetime', $order_col++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('bds_type');
    }
};
