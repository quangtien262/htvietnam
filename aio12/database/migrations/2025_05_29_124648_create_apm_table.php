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
        Schema::create('apm', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->integer('so_luong_phong')->nullable();
            $table->text('description')->nullable();
            $table->integer('apm_status_id')->default(1)->nullable(); // todo, doing, done
            $table->text('mk_cong')->nullable();

            $table->integer('gia_thue')->nullable(); // nv thực hiện
            $table->text('gia_tang')->nullable(); // json người theo dõi hoặc làm cùng
            $table->integer('ngay_tang_gia')->nullable();

            $table->integer('tien_mg')->nullable();
            $table->integer('tien_mua_nhuong')->nullable();
            $table->integer('gia_ban')->nullable();

            $table->date('date_start')->nullable();
            $table->date('date_end')->nullable();

            MigrateService::createBaseColumn($table);

            Table::create([
                //require
                'name' => 'apm',
                'display_name' => 'Quản lý công việc',
                'parent_id' => 0,
                'sort_order' => 0,
                'type_show' => config('constant.type_show.basic'),
                'count_item_of_page' => 30,
                'is_edit' => 1, // 1 hiển thị ở menu; 0 không hiển thị
                'form_data_type' => 1,
                'have_delete' => 1,
                'have_add_new' => 1,

                'is_show_btn_edit' => 1,
                'tab_table_id' => 0,
                'tab_table_name' => '',
                'table_data' => '',
                'is_label' => 0,
            ]);
            $tbl = Table::where('name', 'apm')->first();
            $tableId = $tbl->id;
            $order_col = 1;
            MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
            MigrateService::createColumn02($tableId, 'name', 'Tên tài sản', 'VARCHAR', 'text', $order_col++, ['show_in_list' => 1]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apm');
    }
};
