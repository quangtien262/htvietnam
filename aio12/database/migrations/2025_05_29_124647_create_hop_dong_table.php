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
        Schema::create('hop_dong', function (Blueprint $table) {
            $table->id();

            $table->text('name')->nullable();
            $table->text('code')->nullable();
            $table->text('aitilen_dich_vu_id')->nullable();
            $table->integer('room_id')->nullable(); // nv thực hiện
            $table->text('apartment_id')->nullable(); // // json người theo dõi hoặc làm cùng

            // info
            $table->date('ngay_ky')->nullable();
            $table->date('ngay_bat_dau')->nullable();
            $table->date('ngay_ket_thuc')->nullable();
            $table->integer('gia_thue')->nullable();
            $table->integer('tien_coc')->nullable();
            $table->integer('ky_thanh_toan')->nullable();
            $table->integer('so_luong')->nullable();
            $table->integer('ngay_thanh_toan')->nullable();

            // khach hang
            $table->integer('user_id')->default(0)->nullable();
            $table->string('ho_ten')->nullable();
            $table->date('dob')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('cccd')->nullable();
            $table->date('ngay_cap')->nullable();
            $table->text('noi_cap')->nullable();
            $table->string('hktt')->nullable();

            //
            $table->string('phi_moi_gioi')->nullable();
            $table->string('phi_quan_ly')->nullable();


            $table->text('note')->nullable();

            MigrateService::createBaseColumn($table);

            Table::create([
                //require
                'name' => 'hop_dong',
                'display_name' => 'Check list',
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
            $tbl = Table::where('name', 'hop_dong')->first();
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
        Schema::dropIfExists('hop_dong');
    }
};
