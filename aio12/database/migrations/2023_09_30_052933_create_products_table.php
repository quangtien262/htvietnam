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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable();
            $table->string('name')->nullable();

            $table->integer('product_type_id')->default(1)->nullable(); // là loại sp: HH, dich vu, gói, thẻ
            // $table->text('product_type_ids_apply')->nullable();
            $table->integer('thoi_luong')->default(0)->nullable(); // dich vu
            $table->integer('product_group_id')->default(0)->nullable(); // HH, dich vu, gói, 
            $table->text('product_group_ids_apply')->nullable(); // thẻ(chọn nhiều)
            $table->integer('thuong_hieu_id')->default(0)->nullable(); // HH, dich vu, gói, thẻ
            $table->integer('vi_tri_id')->default(0)->nullable(); // HH
            $table->integer('gia_von')->default(0)->nullable();  // HH
            $table->integer('gia_ban')->default(0)->nullable(); // HH, dich vu, gói, thẻ
            $table->integer('gia_khuyen_mai')->default(0)->nullable();
            $table->integer('menh_gia')->default(0)->nullable(); // thẻ: nhập số tiền mệnh giá
            $table->integer('trong_luong')->default(0)->nullable(); // HH,
            $table->integer('ban_truc_tiep')->default(0)->default(0)->nullable(); // HH, dich vu
            $table->text('product_thuoc_tinh_id')->nullable(); // HH, dich vu: luu ở bảng thuộc tính riêng


            $table->integer('don_vi_id')->nullable();
            $table->text('don_vi_ids')->nullable();
            $table->longText('don_vi_quy_doi_data')->nullable(); // lưu đơn vị quy đổi dạng json, ngoài ra vẫn lưu cả ở bảng don_vi_quy_doi

            $table->text('mo_ta')->nullable(); // HH, dich vu, gói, thẻ
            $table->text('ghi_chu')->nullable(); // dich vu, gói,thẻ
            $table->text('nguyen_lieu_tieu_hao')->nullable(); // dich vu

            // gói : Tự do, hàng ngày, hàng tuần, hàng tháng
            $table->integer('lich_trinh_sd')->nullable(); //Tự do, Ngày, Tháng, Năm
            $table->integer('lich_trinh_sd__khoang_cach_moi_buoi')->nullable();

            // Hạn sử dụng
            $table->integer('han_su_dung')->default(0)->nullable(); //gói, thẻ: Vô hạn, ngày cụ thể, khoảng tg
            $table->date('hsd_ngay_cu_the')->nullable();
            $table->integer('hsd_khoang_thoi_gian')->default(0)->nullable();
            $table->string('hsd_khoang_thoi_gian_don_vi')->nullable(); // Ngày, Tháng, Năm


            $table->text('product_apply')->nullable(); // product_dich_vu_apply // gói: chọn các dv dc dùng trong gói

            // the
            $table->text('loai_hang_hoa')->nullable(); // thẻ - chọn nhiều loại hàng hóa dc dùng trong thẻ
            $table->text('hang_hoa_ap_dung')->nullable();  // thẻ - chọn nhiều các sp dc dùng trong thẻ

            // số lượng trong 1 thẻ LT
            $table->integer('so_luong')->default(0)->nullable();

            $table->integer('ton_kho')->default(0)->nullable();
            $table->text('ton_kho_detail')->nullable();
            $table->integer('ton_kho_total')->default(0)->nullable();

            $table->integer('dinh_muc_ton_it_nhat')->default(0)->nullable();
            $table->integer('dinh_muc_ton_nhieu_nhat')->default(0)->nullable();

            $table->integer('status_product_id')->default(0)->nullable();

            // ck
            $table->integer('ck_nv_tu_van')->nullable();
            $table->integer('ck_nv_cham_soc')->nullable();
            $table->integer('ck_chi_nhanh')->nullable();
            $table->integer('ck_toan_he_thong')->nullable();

            $table->integer('is_ck_nv_tu_van_percen')->default(1)->nullable();
            $table->integer('is_ck_nv_cham_soc_percen')->default(1)->nullable();
            $table->integer('is_ck_chi_nhanh_percen')->default(1)->nullable();
            $table->integer('is_ck_toan_he_thong_percen')->default(1)->nullable();

            $table->text('ck_other')->nullable();
            $table->text(column: 'is_ck_percen')->nullable();

            $table->integer('thoi_gian_khau_hao')->nullable();
            // $table->integer('status_product_id')->nullable();
            $table->text('images')->nullable();
            $table->integer('ton_kho_toi_thieu')->nullable();
            $table->integer('ton_kho_toi_da')->nullable();
            $table->text('description')->nullable();

            // đơn vị tính mặc định, hiện tại đang ko hiển thị trên data vì đang có nhiều đơn vị quy đổi

            $table->integer('ngung_kinh_doanh')->default(0)->nullable();

            $table->integer('views')->default(99)->nullable();
            $table->integer('is_front')->default(0)->nullable();
            $table->integer('menu_id')->default(0)->nullable();
            $table->integer('category_id')->default(0)->nullable();
            $table->text('product_color_ids')->nullable();
            $table->text('product_size_ids')->nullable();
            

            $table->integer('is_parent')->default(0)->nullable(); // 

            MigrateService::createBaseColumn($table);
        });

        Table::create([
            'name' => 'products',
            'display_name' => 'Hàng hóa',
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 1,
            'form_data_type' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,
            'parent_id' => 0,
            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
            'search_position' => 1
        ]);
        $tbl = Table::where('name', 'products')->first();
        $tableId = $tbl->id;
        $order_col = 1;

        MigrateService::createColumn02(
            $tableId,
            'block_hh',
            'Thông tin hàng hóa',
            'INT',
            'number',
            0,
            [
                'block_type' => 'block_basic',
            ]
        );
        $hh = Column::where('table_id', $tableId)->where('name', 'block_hh')->first();

        MigrateService::createColumn02(
            $tableId,
            'block_tt_khac',
            'Thông tin khác',
            'INT',
            'number',
            3,
            [
                'block_type' => 'block_basic',
            ]
        );
        $tt_khac = Column::where('table_id', $tableId)->where('name', 'block_tt_khac')->first();


        // $quyDoiDV = MigrateService::createColumn02(
        //     $tableId,
        //     'block_quy_doi',
        //     'ĐƠN VỊ QUY ĐỔI',
        //     'INT',
        //     'number',
        //     4,
        //     [
        //         'block_type' => 'block_basic',
        //     ]
        // );

        // $donVi = Table::where('name', 'product_unit')->first();
        // MigrateService::createColumn02($tableId, 'don_vi_id', 'Đơn vị tính', 'INT', 'select', $order_col++, 
        // ['select_table_id' => $donVi->id, 'add_express' => 1, 'parent_id' => $quyDoiDV->id]);
        // $chuyenDoiDonVi = Table::where('name', 'product_conversion_unit')->first();
        // MigrateService::createColumn02($tableId, 'conversion_unit_id', 'Danh sách quy đổi ', 'INT', 'select', $order_col++, 
        // ['select_table_id' => $chuyenDoiDonVi->id, 'add_express' => 1, 'parent_id' => $quyDoiDV->id]);
        // MigrateService::createColumn02($tableId, 'he_so', 'Hệ số quy đổi', 'VARCHAR', 'text', $order_col++, 
        // ['parent_id' => $quyDoiDV->id]);
        // MigrateService::createColumn02($tableId, 'gia_tien', 'Giá tiền(Giá vốn)', 'INT', 'number', $order_col++, 
        // ['parent_id' => $quyDoiDV->id]);

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
            'Mã hàng hóa',
            'VARCHAR',
            'text',
            $order_col++,
            ['parent_id' => $hh->id, 'show_in_list' => 1, 'auto_generate_code' => '{"edit":0, "prefix":"HH", "length":5}']
        );

        MigrateService::createColumn02(
            $tableId,
            'name',
            'Tên hàng hóa',
            'VARCHAR',
            'text',
            $order_col++,
            ['parent_id' => $hh->id, 'show_in_list' => 1, 'is_view_detail' => 1]
        );

        $nhomHangHoa = Table::where('name', 'product_group')->first();
        MigrateService::createColumn02(
            $tableId,
            'product_group_id',
            'Nhóm hàng hóa',
            'INT',
            'select',
            $order_col++,
            ['select_table_id' => $nhomHangHoa->id, 'add_express' => 1, 'parent_id' => $hh->id, 'show_in_list' => 1, 'add2search' => 1]
        );

        $trangThai = Table::where('name', 'status_product')->first();
        MigrateService::createColumn02($tableId, 'status_product_id', 'Trạng thái', 'INT', 'select', $order_col++, ['select_table_id' => $trangThai->id, 'add_express' => 1, 'parent_id' => $hh->id, 'add2search' => 1, 'show_in_list' => 1]);


        MigrateService::createColumn02($tableId, 'images', 'Ảnh', 'text', 'image', $order_col++, ['parent_id' => $hh->id]);
        MigrateService::createColumn02($tableId, 'capital_price', 'Giá vốn', 'INT', 'number', $order_col++, ['require' => 1, 'parent_id' => $hh->id]);
        MigrateService::createColumn02($tableId, 'thoi_gian_khau_hao', 'Thời gian khấu hao(Tháng)', 'INT', 'number', $order_col++, ['parent_id' => $hh->id]);

        MigrateService::createColumn02(
            $tableId,
            'ton_kho_toi_thieu',
            'Tồn kho tối thiểu',
            'INT',
            'number',
            $order_col++,
            ['parent_id' => $tt_khac->id]
        );
        MigrateService::createColumn02(
            $tableId,
            'ton_kho_toi_da',
            'Tồn kho tối đa',
            'INT',
            'number',
            $order_col++,
            ['parent_id' => $tt_khac->id]
        );

        MigrateService::createColumn02(
            $tableId,
            'description',
            'Mô tả',
            'TEXT',
            'textarea',
            $order_col++,
            ['parent_id' => $tt_khac->id, 'col' => 12]
        );

        $qd = Table::where('name', 'don_vi_quy_doi')->first();
        MigrateService::createColumn02(
            $tableId,
            'don_vi_quy_doi_id',
            'Đơn vị quy đổi',
            'TEXT',
            'selects_table',
            $order_col++,
            ['select_table_id' => $qd->id, 'add_express' => 1, 'parent_id' => $tt_khac->id]
        );

        MigrateService::createColumn02($tableId, 'price', 'Giá niêm yết(Giá bán)', 'INT', 'number', $order_col++, ['parent_id' => $hh->id]);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
