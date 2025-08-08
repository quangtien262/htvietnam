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
        Schema::create('dat_lich', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->string('code')->nullable();
            $table->integer('chi_nhanh_dat_lich_id')->nullable();
            $table->integer('chi_nhanh_nhan_lich_id')->nullable();
            $table->dateTime('calendar')->nullable();
            $table->integer('admin_users_id')->nullable();
            // $table->integer('service_group_id')->nullable();
            $table->integer('users_id')->nullable();
            $table->string('sdt')->nullable();
            $table->text('anh')->nullable();
            $table->integer('trang_thai_dat_lich_id')->nullable();
            $table->integer('nhan_vien_nhan_lich_id')->nullable();
            $table->text('note')->nullable(); // note
            $table->text('service_id')->nullable();
            $table->text('nhan_vien_da_chon_id')->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });
        Table::create([
            //require
            'name' => 'dat_lich',
            'display_name' => 'Đặt lịch',
            'parent_id' => 0,
            'sort_order' => 0,
            'type_show' => config('constant.type_show.calendar'),
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
        $tbl = Table::where('name', 'dat_lich')->first();
        $tableId = $tbl->id;
        $order_col = 1;

        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);

        MigrateService::createColumn02($tableId, 'code', 'Mã lịch hẹn', 'VARCHAR', 'text', $order_col++,
        ['is_view_detail' => 1, 'show_in_list' => 1, 'auto_generate_code' => '{"edit":0, "prefix":"LICH", "length":5}']);

        MigrateService::createColumn02($tableId, 'name', 'Tiêu đề', 'TEXT', 'textarea', $order_col++, 
        ['edit' => 1, 'require'=>1]);

        $chi_nhanh = Table::where('name', 'chi_nhanh')->first();
        MigrateService::createColumn02($tableId, 'chi_nhanh_dat_lich_id', 'Chi nhánh đặt', 'INT', 'select', $order_col++, ['select_table_id' => $chi_nhanh->id]);
        MigrateService::createColumn02($tableId, 'calendar', 'Ngày giờ đặt lịch', 'DATETIME', 'datetime', $order_col++,
        ['require' => 1]);

        $nv = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($tableId, 'create_by', 'Chọn nhân viên', 'INT', 'select', $order_col++, ['select_table_id' => $nv->id, 'edit' => 0]);
        MigrateService::createColumn02($tableId, 'nhan_vien_nhan_lich_id', 'Mã-Tên nhân viên nhận lịch', 'INT', 'select', $order_col++, ['select_table_id' => $nv->id]);

        $kh = Table::where('name', 'users')->first();
        MigrateService::createColumn02($tableId, 'users_id', 'Mã-Tên khách hàng', 'INT', 'select', $order_col++, 
        ['select_table_id' => $kh->id, 'data_select' => '{"value":"id", "name":{"0":"code", "1":"name", "2":"phone"}}', 'is_view_detail' => 1, 'show_in_list' => 1, 'require' => 1]);
        // MigrateService::createColumn02($tableId, 'sdt', 'Số điện thoại', 'VARCHAR', 'text', $order_col++, []);
        $cn = Table::where('name', 'chi_nhanh')->first();
        MigrateService::createColumn02($tableId, 'chi_nhanh_nhan_lich_id', 'Chi nhánh/PB nhận lịch', 'INT', 'select', $order_col++, ['select_table_id' => $cn->id]);
        MigrateService::createColumn02($tableId, 'anh', 'Ảnh', 'TEXT', 'image', $order_col++);
        MigrateService::createColumn02($tableId, 'created_at', 'Ngày tạo', 'DATETIME', 'datetime', $order_col++, ['edit' => 0]);
        
        $tt = Table::where('name', 'trang_thai_dat_lich')->first();
        MigrateService::createColumn02($tableId, 'trang_thai_dat_lich_id', 'Trạng thái', 'INT', 'select', $order_col++, ['select_table_id' => $tt->id, 'show_in_list' => 1, 'add2search' => 1]);
        
        // $dv = Table::where('name', 'service')->first();
        // MigrateService::createColumn02($tableId, 'service_id', 'Dịch vụ đã chọn', 'TEXT', 'selects_normal', $order_col++, ['select_table_id' => $dv->id, 'show_in_list' => 1]);
        
        $admin_users = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($tableId, 'nhan_vien_da_chon_id', 'Nhân viên đã chọn', 'TEXT', 'selects_normal', $order_col++, ['select_table_id' => $admin_users->id, 'show_in_list' => 1]);
        
        MigrateService::createColumn02($tableId, 'note', 'Nội dung', 'TEXT', 'textarea', $order_col++, 
        ['show_in_list' => 1, 'col' => 24, 'require'=>1]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dat_lich');
    }
};
