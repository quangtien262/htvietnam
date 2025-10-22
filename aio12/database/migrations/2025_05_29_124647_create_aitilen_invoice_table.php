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
        Schema::create('aitilen_invoice', function (Blueprint $table) {
            $table->id();

            $table->text('name')->nullable();
            $table->text('code')->nullable();
            $table->text('aitilen_dich_vu_id')->nullable();
            $table->integer('room_id')->nullable();
            $table->text('apartment_id')->nullable();
            $table->text('user_id')->nullable();
            $table->text('aitilen_invoice_status_id')->nullable();
            $table->text('hop_dong_id')->nullable();
            $table->integer('is_active')->default(0)->nullable();
            $table->text('note')->nullable();

            // info
            $table->integer('tien_phong')->default(0)->nullable();
            $table->integer('tien_coc')->default(0)->nullable();
            $table->integer('tra_coc')->default(0)->nullable();
            $table->integer('tien_dien')->default(0)->nullable();
            $table->integer('tien_nuoc')->default(0)->nullable();
            $table->integer('tien_vs')->default(0)->nullable();
            $table->integer('tien_mang')->default(0)->nullable();
            $table->integer('dien_chung')->default(0)->nullable();
            $table->integer('nong_lanh')->default(0)->nullable();
            $table->integer('xe_dap_dien')->default(0)->nullable();
            $table->integer('tu_lanh')->default(0)->nullable();
            $table->integer('thang_may')->default(0)->nullable();
            $table->integer('quan_ly_chung')->default(0)->nullable();
            $table->integer('ho_tro_gui_xe')->default(0)->nullable();

            $table->integer('phi_bao_tri')->default(0)->nullable();


            $table->integer('giam_gia')->default(0)->nullable();
            $table->integer('giam_gia_description')->default(0)->nullable();

            $table->integer('other')->default(0)->nullable();
            $table->text('other_description')->nullable();

            $table->integer('total')->default(0)->nullable();


            $table->integer('dat_thanh_toan')->default(0)->nullable();
            $table->integer('cong_no')->default(0)->nullable();

            $table->integer('thu_ho')->default(0)->nullable();
            $table->integer('nguoi_thu')->default(0)->nullable();
            $table->integer('tong_tien_thu_ho')->default(0)->nullable();


            //
            $table->integer('tong_so_dien')->default(0)->nullable();
            $table->integer('tong_so_nuoc')->default(0)->nullable();

            $table->integer('month')->default(0)->nullable();
            $table->integer('year')->default(0)->nullable();


            $table->integer('so_luong')->default(0)->nullable();
            $table->date('ngay_hen_dong_tien')->nullable();


            //

            MigrateService::createBaseColumn($table);

            Table::create([
                //require
                'name' => 'aitilen_invoice',
                'display_name' => 'Hóa đơn',
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
            $tbl = Table::where('name', 'aitilen_invoice')->first();
            $tableId = $tbl->id;
            $order_col = 1;
            MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
            MigrateService::createColumn02($tableId, 'name', 'Tên', 'VARCHAR', 'text', $order_col++, ['show_in_list' => 1]);
            MigrateService::baseColumn($tbl);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aitilen_invoice');
    }
};
