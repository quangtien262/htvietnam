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
        Schema::create('hoa_don_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->string( 'lucky_id')->nullable();
            $table->integer('name')->nullable();
            // $table->integer('service_id')->nullable();
            // $table->text('product_service')->nullable();

            $table->integer( 'data_id')->nullable(); // id hoa_don
            $table->integer( 'data_code')->nullable();

            $table->integer( 'product_id')->nullable();
            $table->string('product_code')->nullable();
            $table->string('product_name')->nullable();

            $table->integer('khach_hang_id')->nullable();

            $table->integer('card_id')->nullable();
            $table->integer('card_service_id')->nullable();

            $table->integer('don_vi_id')->nullable();
            $table->integer('so_luong')->default(1)->nullable();
            $table->integer('don_gia')->default(0)->nullable();
            $table->integer('giam_gia')->default(0)->nullable();
            $table->integer('chiet_khau_persen')->default(0)->nullable();
            $table->integer('chiet_khau_money')->default(0)->nullable();
            $table->integer('vat')->default(0)->nullable(); // PTThue
            $table->integer('vat_money')->default(0)->nullable(); // TienThue
            $table->integer('thanh_tien')->default(0)->nullable();
            $table->text('ghi_chu')->nullable();

            $table->integer('users_id')->nullable();

            $table->integer('is_draft')->default(0)->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });

        Table::create([
            //require
            'name' => 'hoa_don_chi_tiet',
            'display_name' => 'Hàng hóa dịch vụ',
            'parent_id' => 0,
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 0, // 1 hiển thị ở menu; 0 không hiển thị
            'form_data_type' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,
            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);
        $tbl = Table::where('name', 'hoa_don_chi_tiet')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($tableId, 'name', 'Hàng hóa dịch vụ', 'VARCHAR', 'text', $order_col++, ['edit' => 0]);

        // product
        $product = Table::where('name', 'products')->first();
        MigrateService::createColumn02($tableId, 'product_id', 'Tên hàng hóa ', 'INT', 'select', $order_col++,
        ['edit' => 1, 'select_table_id' => $product->id,  'show_in_list' => 1, 'col' => 12, 'data_select' => '{"value":"id", "name":{"0":"code", "1":"name", "2":"price", "3":"don_vi_id"}}']);

        $nv = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($tableId, 'nv_thuc_hien_id', 'Nhân viên thực hiện', 'text', 'selects', $order_col++,
        ['select_table_id' => $nv->id, 'show_in_list' => 1, 'col' => 6]);

      

        MigrateService::createColumn02($tableId, 'don_gia', 'Đơn giá', 'INT', 'number', $order_col++,
        ['show_in_list' => 1, 'require' => 1, 'col' => 12]);
        MigrateService::createColumn02($tableId, 'so_luong', 'Số lượng', 'INT', 'number', $order_col++,
        ['show_in_list' => 1, 'require' => 1, 'col' => 12]);
        MigrateService::createColumn02($tableId, 'chiet_khau_persen', 'Chiết khấu(%)', 'INT', 'number', $order_col++,
        ['show_in_list' => 1, 'col' => 12]);
        MigrateService::createColumn02($tableId, 'chiet_khau_money', 'Tiền chiết khấu', 'INT', 'number', $order_col++,
        ['show_in_list' => 1, 'col' => 12]);

        MigrateService::createColumn02($tableId, 'vat', 'VAT(%)', 'INT', 'number', $order_col++,
        ['show_in_list' => 1, 'col' => 12]);
        MigrateService::createColumn02($tableId, 'vat_money', 'VAT(vnđ)', 'INT', 'number', $order_col++,
        ['show_in_list' => 1, 'col' => 12]);

        MigrateService::createColumn02($tableId, 'thanh_tien', 'Thành tiền', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tableId, 'thanh_toan', 'Thanh toán', 'INT', 'number', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tableId, 'ghi_chu', 'Ghi chú', 'TEXT', 'textarea', $order_col++, ['show_in_list' => 1, 'col' => 24]);

        $kh = Table::where('name', 'users')->first();
        MigrateService::createColumn02($tableId, 'users_id', 'Mã-Tên khách hàng', 'INT', 'select', $order_col++,
        ['select_table_id' => $kh->id, "show_in_detail" => 1, 'edit' => 0]);



        $user = Table::where('name', 'admin_users')->first();
        MigrateService::createColumn02($tableId, 'create_by', 'Người tạo', 'INT', 'select', $order_col++,
        ['edit' => 0, 'select_table_id' => $user->id, 'add_express' => 1]);


        // lucky
        MigrateService::createColumn02($tableId, 'SoThuTu', 'Thứ tự', 'INT', 'number', $order_col++,
        []);
        MigrateService::createColumn02($tableId, 'ThoiGian', 'Thời gian', 'INT', 'number', $order_col++,
        []);
        MigrateService::createColumn02($tableId, 'ThoiGianBaoHanh', 'TG bảo hành', 'INT', 'number', $order_col++,
        []);
        MigrateService::createColumn02($tableId, 'LoaiThoiGianBH', 'Loại TG bảo hành', 'INT', 'number', $order_col++,
        []);
        MigrateService::createColumn02($tableId, 'ID_KhoHang', 'Kho hàng', 'INT', 'number', $order_col++,
        []);

        $donVi = Table::where('name', 'product_unit')->first();
        MigrateService::createColumn02($tableId, 'ID_DonViTinh', 'Đơn vị tính', 'INT', 'select', $order_col++,
        ['select_table_id' => $donVi->id, 'show_in_list' => 1, 'add_express' => 1, 'col' => 6]);

        // MigrateService::createColumn02($tableId, 'ID_LoHang', 'Lô hàng', 'INT', 'number', $order_col++,
        // []);
        // MigrateService::createColumn02($tableId, 'ID_MaVach', 'Mã vạch', 'INT', 'number', $order_col++,
        // []);
        // MigrateService::createColumn02($tableId, 'ChatLieu', 'Chất liệu', 'INT', 'number', $order_col++,
        // []);
        // MigrateService::createColumn02($tableId, 'MauSac', 'Màu sắc', 'INT', 'number', $order_col++,
        // []);
        // MigrateService::createColumn02($tableId, 'KichCo', 'Kích cở', 'INT', 'number', $order_col++,
        // []);
        // MigrateService::createColumn02($tableId, 'ID_ThueSuat', 'Thuế suất', 'INT', 'number', $order_col++,
        // []);
        // MigrateService::createColumn02($tableId, 'PTChiPhi', 'Chi phí (%)', 'INT', 'number', $order_col++,
        // []);
        // MigrateService::createColumn02($tableId, 'TienChiPhi', 'Chi phí (vnđ)', 'INT', 'number', $order_col++,
        // []);
        // MigrateService::createColumn02($tableId, 'GiaVon', 'Giá vốn', 'INT', 'number', $order_col++,
        // []);
        MigrateService::createColumn02($tableId, 'UserNhap', 'Người nhập', 'TEXT', 'text', $order_col++,
        []);
        MigrateService::createColumn02($tableId, 'SoLanDaIn', 'Số lần đã in', 'INT', 'number', $order_col++,
        []);
     
        MigrateService::createColumn02($tableId, 'ThoiGianThucHien', 'TG thực hiện', 'INT', 'number', $order_col++,
        []);
        MigrateService::createColumn02($tableId, 'SoLuong_TL', 'Số lượng TL', 'INT', 'number', $order_col++,
        []);
        MigrateService::createColumn02($tableId, 'SoLuong_YC', 'Số lượng YC', 'INT', 'number', $order_col++,
        []);
        // MigrateService::createColumn02($tableId, 'Chieu', 'Chiều', 'INT', 'number', $order_col++,
        // []);
        // MigrateService::createColumn02($tableId, 'Sang', 'Sáng', 'INT', 'number', $order_col++,
        // []);
        // MigrateService::createColumn02($tableId, 'MaNhanVienThucHien', 'NV Thực hiện', 'INT', 'number', $order_col++,
        // []);
        // MigrateService::createColumn02($tableId, 'MaNhanVienTuVan', 'NV Tư vấn', 'INT', 'number', $order_col++,
        // []);
   
        MigrateService::createColumn02($tableId, 'TenNhanVienThucHien', 'Tên NV thực hiện', 'TEXT', 'textarea', $order_col++,
        []);
        MigrateService::createColumn02($tableId, 'TenNhanVienTuVan', 'Tên NV tư vấn', 'TEXT', 'textarea', $order_col++,
        []);



    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hoa_don_chi_tiet');
    }
};
