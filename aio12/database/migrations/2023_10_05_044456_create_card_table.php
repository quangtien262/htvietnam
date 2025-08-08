<?php

use App\Models\Admin\Column;
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
        Schema::create('card', function (Blueprint $table) {
            $table->id();
            
            $table->text('card_service_ids')->nullable();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->string('product_id')->default(0)->nullable();

            $table->integer('so_luong')->default(1)->nullable();
            $table->integer('so_luong_da_su_dung')->default(0)->nullable();
            $table->integer('so_luong_con_lai')->default(0)->nullable();

            $table->string('hoa_don_chi_tiet_id')->default(0)->nullable();
            $table->integer('card_group_id')->nullable();
            $table->date('ngay_mua')->nullable();
            $table->date('ngay_ap_dung')->nullable();
            $table->date('ngay_het_han')->nullable();
            $table->integer('users_id')->nullable(); // khach hang
            $table->integer('menh_gia_the')->default(0)->nullable();
            $table->integer('giamn_gia')->default(0)->nullable();
            $table->integer('thanh_tien')->default(0)->nullable();


            $table->integer('chi_nhanh_id')->default(1)->nullable(); // ID_DonVi
            $table->integer('phan_tram_tang_them')->nullable();
            $table->integer('tien_tang_them')->nullable();
            
            // $table->string('HuyThe')->nullable();
            // $table->integer('SoLanDuocSuDung')->nullable();
            // $table->string('ID_DacDiemKhachHang')->nullable();
            // $table->string('MaNhanVienTuVan')->nullable();
            $table->string('TenNhanVienTuVan')->nullable();

            // $table->string('quan_li_the_id')->nullable();


            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });
        Table::create([
            'name' => 'card',
            'display_name' => 'Thẻ',
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 0,
            'form_data_type' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,
            'parent_id' => 0,
            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
            'statistical_select' => 'card_group_id',
        ]);


        $tbl = Table::where('name', 'card')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        $tt_chung = MigrateService::createColumn02(
            $tableId,
            'tt_chung',
            'Thông tin thẻ',
            'INT',
            'number',
            3,

            [
                'block_type' => 'block_basic',
            ]
        );
        MigrateService::createColumn02(
            $tableId,
            'id',
            'id',
            'INT',
            'number',
            $order_col++,
            ['edit' => 0],

        );
        MigrateService::createColumn02(
            $tableId,
            'name',
            'Tên thẻ',
            'VARCHAR',
            'text',
            $order_col++,
            ['require' => 1, 'is_view_detail' => 1]
        );
        MigrateService::createColumn02(
            $tableId,
            'code',
            'Mã thẻ',
            'VARCHAR',
            'text',
            $order_col++,
            ['show_in_list' => 1, 'auto_generate_code' => '{"edit":0, "prefix":"CAR", "length":5}', 'is_view_detail' => 1, 'add2search' => 1]
        );
        MigrateService::createColumn02($tbl->id, 'ngay_mua', 'Ngày mua', 'DATETIME', 'datetime', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'ngay_ap_dung', 'Ngày áp dụng', 'DATETIME', 'datetime', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'ngay_het_han', 'Ngày hết hạn', 'DATETIME', 'datetime', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'NgayVaoSo', 'Ngày vào sổ', 'DATETIME', 'datetime', $order_col++, ['show_in_list' => 1]);

        $user = Table::where('name', 'users')->first();
        MigrateService::createColumn02($tbl->id, 'users_id', 'Khách hàng', 'INT', 'select', $order_col++, 
        ['show_in_list' => 1, 'select_table_id' => $user->id]);

        MigrateService::createColumn02($tbl->id, 'MenhGiaThe', 'Mệnh giá thẻ', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'PTChietKhau', 'PT chiết khấu', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'TienChietKhau', 'Tiên chiết khấu', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'PhaiThanhToan', 'Phải thanh toán', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'ID_TienTe', 'Tiền tệ', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'TyGia', 'Tỷ giá', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'nhan_vien_idLap', 'NV lập', 'INT', 'select', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'ApDungTatCaSanPham', 'Áp dụng tất cả SP', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'DuocChoMuon', 'Được cho mượn', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'TheGiaTri_SoLan_GiamGia', 'Số lần giảm giá', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
        
        $aduser = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($tbl->id, 'UserTao', 'Người tạo', 'INT', 'select', $order_col++, 
        ['show_in_list' => 0, 'select_table_id' => $aduser->id]);
        MigrateService::createColumn02($tbl->id, 'UserSuaCuoi', 'Người sửa cuối', 'INT', 'select', $order_col++, 
        ['show_in_list' => 0, 'select_table_id' => $aduser->id]);
        MigrateService::createColumn02($tbl->id, 'NgaySuaCuoi', 'Ngày sửa cuối', 'DATETIME', 'datetime', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'description', 'Ghi chú', 'TEXT', 'textarea', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'chi_nhanh_id', 'Đơn vị tính', 'INT', 'select', $order_col++, 
        ['show_in_list' => 0,'edit' =>0]);
        MigrateService::createColumn02($tbl->id, 'phan_tram_tang_them', 'PT tăng thêm', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tbl->id, 'tien_tang_them', 'Tiền tăng thêm', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
        
        
        $nhomThe = Table::where('name', 'card_group')->first();
        MigrateService::createColumn02($tableId, 'card_group_id', 'Nhóm thẻ', 'INT', 'select', $order_col++, ['select_table_id' => $nhomThe->id, 'add_express' => 1, 'add2search' => 1, 'show_in_list' => 1]);
        
        MigrateService::createColumn02($tableId, 'phai_thanh_toan', 'Phải thanh toán', 'INT', 'number', $order_col++);

        // $kh = Table::where('name', 'quan_li_the')->first();
        // MigrateService::createColumn02($tbl->id, 'quan_li_the_id', 'Quản lí thẻ', 'TEXT', 'selects', $order_col++, ['select_table_id' => $kh->id, 'parent_id' => $tt_chung->id,'add2search' => 1]);
        
        
        MigrateService::createColumn02($tableId, 'created_at', 'Ngày tạo', 'INT', 'date', $order_col++, ['edit' => 0, 'show_in_detail' => 1]);
        
        // card detail
        $kh = Table::where('name', 'card_service')->first();
        MigrateService::createColumn02($tbl->id, 'card_service_ids', 'SP/DV', 'TEXT', 'selects_table', $order_col++, ['select_table_id' => $kh->id, 'parent_id' => $tt_chung->id,'add2search' => 1]);

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card');
    }
};
