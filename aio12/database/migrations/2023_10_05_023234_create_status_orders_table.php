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
        Schema::create('status_orders', function (Blueprint $table) { // trạng thái phiếu dặt hàng
            $table->id();
            $table->string('name')->nullable();

            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });

        $order_col = 1;
        $tbl = MigrateService::createTable(0, 'status_orders', 'Trạng thái đơn hàng', 0, 1, 1, 0, 0);

         MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($tbl->id, 'name', 'Trạng thái', 'VARCHAR', 'text', $order_col++, ['require' => 1,'is_view_detail' => 1]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('status_orders');
    }
};
