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
        Schema::create('apartment', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();

            $table->integer('gia_thue')->nullable();
            $table->integer('tien_coc')->nullable();
            $table->integer('ky_thanh_toan')->nullable();

            $table->integer('tien_moi_gioi')->nullable();
            $table->integer('tien_mua_nhuong')->nullable();
            $table->integer('gia_thue_tang')->nullable();

            $table->date('start')->nullable();
            $table->date('end')->nullable();
            $table->date('thoi_gian_tang_gia')->nullable();

            $table->string('password')->nullable();
            $table->text('description')->nullable();

            MigrateService::createBaseColumn($table);

            Table::create([
                //require
                'name' => 'apartment',
                'display_name' => 'Tòa nhà',
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
            $tbl = Table::where('name', 'apartment')->first();
            $tableId = $tbl->id;
            $order_col = 1;
            MigrateService::createColumn02(
                $tableId,
                'id',
                'id',
                'INT',
                'number',
                $order_col++,
                ['edit' => 0]
            );

            MigrateService::createColumn02(
                $tableId,
                'code',
                'Mã',
                'VARCHAR',
                'text',
                $order_col++,
                ['show_in_list' => 1]
            );
            MigrateService::createColumn02(
                $tableId,
                'name',
                'Tên',
                'VARCHAR',
                'text',
                $order_col++,
                ['show_in_list' => 1]
            );

            MigrateService::createColumn02(
                $tableId,
                'gia_thue',
                'Giá thuê',
                'INT',
                'number',
                $order_col++,
                ['show_in_list' => 1]
            );

            MigrateService::createColumn02(
                $tableId,
                'tien_coc',
                'Tiền cọc',
                'INT',
                'number',
                $order_col++,
                ['show_in_list' => 0]
            );

            MigrateService::createColumn02(
                $tableId,
                'ky_thanh_toan',
                'Kỳ thanh toán (tháng)',
                'INT',
                'number',
                $order_col++,
                ['show_in_list' => 0]
            );

            MigrateService::createColumn02(
                $tableId,
                'tien_moi_gioi',
                'Tiền môi giới',
                'INT',
                'number',
                $order_col++,
                ['show_in_list' => 0]
            );

            MigrateService::createColumn02(
                $tableId,
                'tien_mua_nhuong',
                'Tiền mua nhượng',
                'INT',
                'number',
                $order_col++,
                ['show_in_list' => 0]
            );

            MigrateService::createColumn02(
                $tableId,
                'gia_thue_tang',
                'Giá thuê tăng',
                'INT',
                'number',
                $order_col++,
                ['show_in_list' => 0]
            );

            MigrateService::createColumn02(
                $tableId,
                'start',
                'Ngày bắt đầu',
                'DATE',
                'date',
                $order_col++,
                ['show_in_list' => 0]
            );
            MigrateService::createColumn02(
                $tableId,
                'end',
                'Ngày kết thúc',
                'DATE',
                'date',
                $order_col++,
                ['show_in_list' => 0]
            );

            MigrateService::createColumn02(
                $tableId,
                'password',
                'Mật khẩu',
                'VARCHAR',
                'text',
                $order_col++,
                ['show_in_list' => 1]
            );


            MigrateService::createColumn02(
                $tableId,
                'description',
                'Mô tả',
                'TEXT',
                'text',
                $order_col++,
                ['show_in_list' => 0]
            );



            MigrateService::baseColumn($tbl);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apartment');
    }
};
