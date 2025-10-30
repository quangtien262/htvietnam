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
        Schema::create('loai_thu_chi', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->string('lucky_id')->nullable();
            $table->string('admin_users_id')->nullable();
            $table->dateTime('ngay_lap')->nullable();
            $table->integer('don_vi_id')->nullable();

            $table->integer('tong_tien')->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });
        $order_col = 1;
        $tbl = MigrateService::createTable(0, 'loai_thu_chi', 'Loại chi', 0, 1, 1, 0, 0);

        MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($tbl->id, 'name', 'Loại chi', 'VARCHAR', 'text', $order_col++, ['require' => 1, 'is_view_detail' => 1]);
        MigrateService::createColumn02(
            $tbl->id,
            'code',
            'Mã loại chi',
            'VARCHAR',
            'text',
            $order_col++,
            ['auto_generate_code' => '{"edit":0, "prefix":"LCHI", "length":5}']
        );

        MigrateService::createColumn02($tbl->id, 'tong_tien', 'Tổng tiền chi', 'INT', 'number', $order_col++);
        $user = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($tbl->id, 'create_by', 'Người tạo', 'VARCHAR', 'text', $order_col++, ['edit' => 0, 'select_table_id' => $user->id, 'add_express' => 1]);
        MigrateService::createColumn02($tbl->id, 'admin_users_id', 'Mã Nhân Viên', 'VARCHAR', 'text', $order_col++, ['select_table_id' => $user->id, 'add_express' => 1]);
        MigrateService::createColumn02($tbl->id, 'ngay_lap', 'Ngày lập phiếu', 'DATETIME', 'datetime', $order_col++,['show_in_detail' => 1, 'edit' => 0]);
        $donVi = Table::where('name', 'don_vi')->first();
        MigrateService::createColumn02($tbl->id, 'don_vi_id', 'Đơn vị', 'INT', 'select', $order_col++, ['select_table_id' => $donVi->id]);
        MigrateService::createColumn02($tbl->id, 'created_at', 'Ngày vào sổ', 'DATETIME', 'datetime', $order_col++, ['show_in_detail' => 1, 'edit' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loai_thu_chi');
    }
};
