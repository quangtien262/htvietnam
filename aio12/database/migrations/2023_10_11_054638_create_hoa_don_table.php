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
            Schema::create('hoa_don', function (Blueprint $table) {
                $table->id();
                $table->string('lucky_id')->nullable();
                $table->string('name')->nullable();
                $table->string('code')->nullable();

                $table->integer('users_id')->nullable(); //ID_DoiTuong

                $table->integer('chi_nhanh_id')->nullable(); //cn_pb

                $table->integer('promotion_id')->nullable(); //co r
                $table->integer('calendar_id')->nullable();

                $table->integer('kenh_ban_id')->nullable();
                $table->integer('ghi_so_id')->nullable();
                $table->integer('hoa_don_status_id')->default(2)->nullable(); // 2: chưa thanh toán

                $table->text('hoa_don_chi_tiet_id')->nullable();
                $table->text('nv_tu_van_id')->nullable();
                $table->text('anh_chung_tu')->nullable();
                $table->integer('type_hoa_don_id')->default(1)->nullable();
                $table->integer('nhom_kh_id')->nullable();
                $table->string('phong_giuong_id')->nullable();
                $table->text('note')->nullable();
                $table->integer('chiet_khau_nhan_vien')->nullable();

                $table->date('han_su_dung')->nullable();

                $table->integer('chiet_khau')->default(0)->nullable();
                $table->integer('vat')->default(0)->nullable();
                $table->integer('vat_money')->default(0)->nullable();
                $table->integer('don_vi_id')->default(1)->nullable();

                $table->integer('voucher_id')->nullable();

                $table->integer('tien_trong_the')->default(0)->nullable();
                $table->integer('tien_con_lai')->default(0)->nullable();
                $table->integer('tien_tru_the')->default(0)->nullable();

                $table->integer('the_gia_tri_id')->nullable();
                $table->integer('the_lan_id')->nullable();


                $table->integer('LoaiHoaDon')->default(4)->nullable();
                $table->integer('card_id')->default(0)->nullable();
                $table->integer('card_history_id')->default(0)->nullable();

                ////////////
                $table->integer('nhan_vien_id')->default(0)->nullable();

                // tiền khách thanh toán thực tế sau khi cộng tất cả các chi phí, bao gồm đã trừ công nợ nếu có
                $table->integer('thanh_toan')->default(0)->nullable();

                // chỉ bao gôm tiền hàng: giá_bán * số lượng
                $table->integer('TongTienHang')->default(0)->nullable();

                // chiết khâu cho nv
                $table->integer('TongChietKhau')->default(0)->nullable();

                // tiền vat
                $table->integer('TongTienThue')->default(0)->nullable();


                // tổng chi phí
                $table->integer('TongChiPhi')->default(0)->nullable();

                // tiền tip, nghỉ lễ
                $table->integer('tien_tip')->default(0)->nullable();

                // Số tiền đã thanh toán
                $table->integer('da_thanh_toan')->default(0)->nullable();
                // số tiền còn nợ
                $table->integer('cong_no')->default(0)->nullable();
                // ngày
                $table->date('ngay_tat_toan')->nullable();
                $table->integer('ghi_chu_cong_no')->default(0)->nullable();
                $table->integer('cong_no_status_id')->default(0)->nullable();

                $table->integer('chiet_khau_nv_thuc_hien')->default(0)->nullable();
                $table->integer('chiet_khau_nv_tu_van')->default(0)->nullable();

                $table->integer('giam_gia')->default(0)->nullable();

                $table->integer('hinh_thuc_thanh_toan_id')->default(0)->nullable();
                $table->integer('tien_mat')->default(0)->nullable();
                $table->integer('tien_chuyen_khoan')->default(0)->nullable();
                $table->integer('tien_tru_the_vip')->default(0)->nullable();

                $table->integer('tien_quet_the')->default(0)->nullable();
                $table->integer('phi_ca_the')->default(0)->nullable();

                $table->date('ngay_tao')->default(now())->nullable();

                MigrateService::createBaseColumn($table);
            });


            Table::create([
                //require
                'name' => 'hoa_don',
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
                'auto_add_draft' => 1
            ]);
            $tbl = Table::where('name', 'hoa_don')->first();
            $tableId = $tbl->id;
            $order_col = 1;
            // block khach hang
            $khachHang = MigrateService::createColumn02($tableId, 'block_customer', 'Khách hàng', 'INT','number',$order_col++,
            ['block_type'=> 'block_basic', 'edit' => 1]);

            // block dieu kien
            $dieuKien = MigrateService::createColumn02($tableId, 'block_dk_chung', 'Điều kiện chung', 'INT','number',$order_col++,
            ['block_type'=> 'block_basic', 'edit' => 1]);

            // block thanh toán
            $blockPrice = MigrateService::createColumn02($tableId, 'block_price', 'Thanh toán', 'INT','number',$order_col++,
            ['block_type'=> 'block_basic', 'edit' => 1]);

            // user
            $kh = Table::where('name', 'users')->first();
            MigrateService::createColumn02($tableId, 'users_id', 'Khách hàng', 'INT', 'select', $order_col++,
             ['select_table_id' => $kh->id, 'require' => 1, 'col' => 12 ,'parent_id' => $khachHang->id, 'data_select' => '{"value":"id", "name":{"0":"code", "1":"name", "2":"phone"}}', 'add_express' => 1]);
            // chiNhanh
            $chiNhanh = Table::where('name', 'chi_nhanh')->first();
            MigrateService::createColumn02($tableId, 'chi_nhanh_id', 'Mã-Tên chi nhánh sử dụng', 'INT', 'select', $order_col++,
            ['select_table_id' => $chiNhanh->id, 'require' => 1, 'col' => 12, 'show_in_list' => 1, 'add2search' => 1, 'parent_id' => $khachHang->id, 'data_select' => '{"value":"id", "name":{"0":"code", "1":"name"}}']);

            // card
            $card = Table::where('name', 'card')->first();
            MigrateService::createColumn02($tableId, 'card_tl', 'Thẻ lần', 'INT', 'select', $order_col++,
             ['select_table_id' => $card->id, 'require' => 0, 'col' => 12 ,'parent_id' => $khachHang->id, 'data_select' => '{"value":"id", "name":{"0":"code"}}', 'add_express' => 1]);

            MigrateService::createColumn02($tableId, 'card_gt', 'Thẻ giá trị', 'INT', 'select', $order_col++,
              ['select_table_id' => $card->id, 'require' => 0, 'col' => 12 ,'parent_id' => $khachHang->id, 'data_select' => '{"value":"id", "name":{"0":"code"}}', 'add_express' => 1]);

            MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
            MigrateService::createColumn02($tableId, 'name', 'Hóa đơn', 'VARCHAR', 'text', $order_col++, ['edit' => 0]);

            MigrateService::createColumn02($tableId, 'DienThoai_KhachHang', 'SĐT Khách hàng', 'VARCHAR', 'text', $order_col++, ['edit' => 0]);

            MigrateService::createColumn02($tableId, 'code', 'Mã hóa đơn', 'VARCHAR', 'text', $order_col++,
            ['is_view_detail' => 1, 'show_in_list' => 1, 'parent_id' => $dieuKien->id, 'auto_generate_code' => '{"edit":0, "prefix":"HD", "length":5}']);

            MigrateService::createColumn02($tableId, 'NgayLapHoaDon', 'Ngày bán', 'DATETIME', 'datetime', $order_col++,
            ['require' => 1, 'is_view_detail' => 1, 'parent_id' => $dieuKien->id, 'show_in_list' => 1]);

            MigrateService::createColumn02($tableId, 'han_su_dung', 'Hạn sử dụng', 'DATE', 'date', $order_col++,
            ['require' => 1,  'is_view_detail' => 1, 'parent_id' => $dieuKien->id]);



            $card = Table::where('name', 'card')->first();

            MigrateService::createColumn02($tableId, 'nap_menh_gia', 'Mệnh giá khác', 'VARCHAR', 'text', $order_col++, ['parent_id' => $dieuKien->id]);
            MigrateService::createColumn02($tableId, 'tang', 'Tặng', 'VARCHAR', 'text', $order_col++, ['parent_id' => $dieuKien->id]);

            // MigrateService::createColumn02($tableId, 'thoi_gian_tao', 'Thời gian tạo', 'DATETIME', 'datetime', $order_col++,
            // ['require' => 1, 'is_view_detail' => 1, 'parent_id' => $dieuKien->id]);

            MigrateService::createColumn02($tableId, 'NgayVaoSo', 'Ngày vào sổ', 'DATETIME', 'datetime', $order_col++,
            ['require' => 1, 'is_view_detail' => 1, 'parent_id' => $dieuKien->id]);

            MigrateService::createColumn02($tableId, 'anh_chung_tu', 'Ảnh chứng từ ', 'text', 'image', $order_col++,
            ['parent_id' => $dieuKien->id, 'edit' => 0]);

            // $ctkm = Table::where('name', 'promotion')->first();
            // MigrateService::createColumn02($tableId, 'promotion_id', 'Mã CTKM', 'INT', 'select', $order_col++,
            // ['select_table_id' => $ctkm->id, 'parent_id' => $dieuKien->id, 'data_select' => '{"value":"id", "name":{"0":"code", "1":"name"}}']);

            // $lichHen = Table::where('name', 'code_lich_hen_hoa_don')->first();
            $lichHen = Table::where('name', 'calendar')->first();
            MigrateService::createColumn02($tableId, 'calendar_id', 'Lịch hẹn', 'INT', 'select', $order_col++,
            ['select_table_id' => $lichHen->id, 'parent_id' => $dieuKien->id, 'data_select' => '{"value":"id", "name":{"0":"code", "1":"name"}}']);



            $pg = Table::where('name', 'bed')->first();
            MigrateService::createColumn02($tableId, 'phong_giuong_id', 'Phòng/giường', 'INT', 'select', $order_col++,
            ['select_table_id' => $pg->id, 'add_express' => 1, 'parent_id' => $dieuKien->id]);

            // $dvtl = Table::where('name', 'dich_vu_the_lan')->first();
            // MigrateService::createColumn02($tableId, 'the_lan_id', 'Dịch vụ thẻ lần', 'TEXT', 'selects_table', $order_col++,
            // ['select_table_id' => $dvtl->id, 'parent_id' => $blockPrice->id]);

            $tt = Table::where('name', 'hoa_don_status')->first();
            MigrateService::createColumn02($tableId, 'hoa_don_status_id', 'Trạng thái', 'INT', 'select', $order_col++,
            ['select_table_id' => $tt->id, 'parent_id' => $blockPrice->id, 'show_in_list' => 1]);

            MigrateService::createColumn02($tableId, 'chiet_khau', 'Chiết khấu', 'INT', 'number', $order_col++,
            ['parent_id' => $blockPrice->id]);
            MigrateService::createColumn02($tableId, 'vat', 'VAT(%)', 'INT', 'number', $order_col++,
            ['parent_id' => $blockPrice->id]);
            MigrateService::createColumn02($tableId, 'vat_money', 'VAT', 'INT', 'number', $order_col++,
            ['parent_id' => $blockPrice->id]);
            // MigrateService::createColumn02($tableId, 'giam_gia', 'Giảm giá', 'INT', 'number', $order_col++,
            // ['parent_id' => $blockPrice->id]);

            $donVi = Table::where('name', 'don_vi')->first();
            MigrateService::createColumn02($tbl->id, 'don_vi_id', 'Đơn vị', 'INT', 'select', $order_col++,
            ['select_table_id' => $donVi->id, 'parent_id' => $blockPrice->id]);

            // MigrateService::createColumn02($tableId, 'tien_thue', 'Tiền thuế', 'INT', 'number', $order_col++,
            // ['parent_id' => $blockPrice->id]);

            MigrateService::createColumn02($tableId, 'TongChiPhi', 'Tổng tiền', 'INT', 'number', $order_col++,
            ['parent_id' => $blockPrice->id, 'col' => 24,'show_in_list' => 0]);
            MigrateService::createColumn02($tableId, 'thanh_toan', 'Thanh toán', 'INT', 'number', $order_col++,
            ['parent_id' => $blockPrice->id,'show_in_list' => 1, 'col' => 24]);

            MigrateService::createColumn02($tableId, 'GioVao', 'Giờ vào', 'DATETIME', 'datetime', $order_col++, ['add_express' => 1, 'parent_id' => $dieuKien->id]);
            MigrateService::createColumn02($tableId, 'GioRa', 'Giờ ra', 'DATETIME', 'datetime', $order_col++, ['add_express' => 1, 'parent_id' => $dieuKien->id]);

            $user = Table::where('name', 'admin_users')->first();
            MigrateService::createColumn02($tableId, 'create_by', 'Người tạo', 'INT', 'select', $order_col++, ['select_table_id' => $user->id, 'show_in_list' => 1, 'parent_id' => $dieuKien->id, 'edit' => 0, 'show_in_detail' => 1]);

            $dieuKien = Table::where('name', 'type_hoa_don')->first();
            MigrateService::createColumn02($tableId, 'type_hoa_don_id', 'Loại hóa đơn', 'INT', 'select', 1,
            ['select_table_id' => $dieuKien->id, 'parent_id' => $dieuKien->id, 'show_in_list' => 1]);

            // $voucher = Table::where('name', 'voucher')->first();
            // MigrateService::createColumn02($tableId, 'voucher_id', 'Voucher', 'INT', 'select', $order_col++, ['select_table_id' => $voucher->id, 'parent_id' => $dieuKien->id]);

            MigrateService::createColumn02($tableId, 'note', 'Ghi chú', 'TEXT', 'textarea', $order_col++,
            ['parent_id' => $dieuKien->id, 'col' => 24]);

            $dv = Table::where('name', operator: 'hoa_don_chi_tiet')->first();
            MigrateService::createColumn02($tableId, 'hoa_don_chi_tiet_id', 'Sản phẩm / Dịch vụ', 'TEXT', 'selects_table', $order_col++,
            ['select_table_id' => $dv->id, 'add_express' => 1, 'parent_id' => $blockPrice->id]);

            $chietKhau = Table::where('name', 'nv_tu_van')->first();
            MigrateService::createColumn02($tableId, 'nv_tu_van_id', 'Chiết khấu bán hàng nhân viên', 'TEXT', 'selects_table', $order_col++,
            ['select_table_id' => $chietKhau->id,'add_express' => 1,'parent_id' => $blockPrice->id]);

            // cong_no_status_id
            $status = Table::where('name', 'cong_no_status')->first();
        MigrateService::createColumn02($tableId, 'cong_no_status_id', 'Trạng thái', 'INT', 'select', $order_col++,
             ['select_table_id' => $status->id, 'require' => 0, 'edit' => 0 , 'add_express' => 0, 'show_in_list' => 1]);

            MigrateService::baseColumn($tbl);
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('hoa_don');
        }
    };
