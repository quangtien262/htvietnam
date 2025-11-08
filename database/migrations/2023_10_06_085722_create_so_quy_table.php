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
            Schema::create('so_quy', function (Blueprint $table) {
                $table->id();
                $table->string('name')->nullable();
                $table->string('code')->nullable(); //Mã phiếu thu
                $table->text('images')->nullable();

                $table->integer('apartment_id')->nullable();
                $table->integer('room_id')->nullable();

                $table->string('loai_chung_tu')->nullable(); //tên bảng
                $table->string('chung_tu_id')->nullable();
                $table->string('ma_chung_tu')->nullable();

                $table->integer('chi_nhanh_id')->nullable(); //chi nhánh
                $table->integer('khach_hang_id')->nullable();
                $table->integer('nha_cung_cap_id')->nullable(); //NCC
                $table->integer('nhom_nguoi_nhan_id')->nullable();
                $table->integer('nhom_nguoi_nop_id')->nullable();
                $table->integer('nhan_vien_id')->nullable(); //Laoij thu

                $table->integer('so_tien')->nullable(); //số tiền, TongTienThu

                $table->integer('tong_tien_hoa_don')->default(0)->nullable();
                $table->integer('cong_no_phai_thu')->default(0)->nullable(); //số tiền, TongTienThu
                $table->integer('cong_no_phai_tra')->default(0)->nullable(); //số tiền, TongTienThu
                $table->integer('so_quy_status_id')->default(1)->nullable(); //mệnh GIá

                $table->integer('so_quy_type_id')->nullable(); //thu/chi
                $table->integer('loai_thu_id')->nullable();
                $table->integer('loai_chi_id')->nullable();

                $table->date('thoi_gian')->nullable(); //thời gian
                $table->string('note')->nullable(); //diễn giải

                $table->string('nguoi_nhan_name')->nullable();
                $table->string('nguoi_nhan_phone')->nullable();
                $table->string('nguoi_nhan_code')->nullable();

                $table->string('display_name')->nullable();
                $table->integer('parent_id')->default(0)->nullable();
                $table->integer('sort_order')->default(0)->nullable();
                $table->integer('create_by')->default(0)->nullable();
                $table->integer('is_recycle_bin')->default(0)->nullable();
                $table->timestamps();
            });

            Table::create([
                //require
                'name' => 'so_quy',
                'display_name' => 'Sổ quỹ',
                'parent_id' => 0,
                'sort_order' => 10,
                'type_show' => config('constant.type_show.basic'),
                'count_item_of_page' => 30,
                'is_edit' => 1, // 1 hiển thị ở menu; 0 không hiển thị
                'form_data_type' => 1,
                'have_delete' => 1,
                'have_add_new' => 1,
                'is_show_btn_detail' => 1,
                'is_show_btn_edit' => 1,
                'tab_table_id' => 0,
                'tab_table_name' => '',
                'table_data' => '',
                'is_label' => 0,
            ]);
            $tbl = Table::where('name', 'so_quy')->first();
            $tableId = $tbl->id;
            $order_col = 1;
            MigrateService::createColumn($tableId, 'id', 'id', 'INT', 'number', $order_col++, 0, 0, 0, 1, 0);
            MigrateService::createColumn02($tableId, 'name', 'Tên', 'VARCHAR', 'text', $order_col++,
            ['is_view_detail' => 1, 'edit' =>0 ]);
            MigrateService::createColumn02($tableId, 'code', 'Mã phiếu thu', 'VARCHAR', 'text', $order_col++,
            ['show_in_list' => 1, 'edit'=> 0,'auto_generate_code' => '{"edit":0, "prefix":"SQ", "length":5}']);

            MigrateService::createColumn02($tableId, 'so_tien', 'Giá trị', 'INT', 'number', $order_col++,
            ['require' => 1, 'placeholder' => 'Nhập số tiền thu/chi']);

            // chung tu
            MigrateService::createColumn02($tableId, 'loai_chung_tu', 'Loại chứng từ', 'VARCHAR', 'text', $order_col++,
            ['is_view_detail' => 0,'show_in_list' => 0, 'edit' =>0 ]);
            MigrateService::createColumn02($tableId, 'ma_chung_tu', 'Mã chứng từ', 'VARCHAR', 'text', $order_col++,
            ['is_view_detail' => 1,'show_in_list' => 0, 'edit' =>0 ]);
            MigrateService::createColumn02($tableId, 'chung_tu_id', 'Chứng từ ID', 'VARCHAR', 'text', $order_col++,
            ['is_view_detail' => 0,'show_in_list' => 0, 'edit' =>0 ]);


            $chi_nhanh = Table::where('name', 'chi_nhanh')->first();
            MigrateService::createColumn02($tableId, 'chi_nhanh_id', 'Chi nhánh', 'INT', 'select', $order_col++,
            ['select_table_id' => $chi_nhanh->id,'is_view_detail' => 1,  'add2search' => 1, 'require' => 1, 'placeholder' => 'Mặc định là hôm nay']);

            MigrateService::createColumn02($tableId, 'thoi_gian', 'Thời gian', 'DATE', 'date', $order_col++,
            ['require' => 0,'is_view_detail' => 1, 'edit' => 1, 'add_express' => 0, 'placeholder' => 'Mặc định là ngày hôm nay']);

            $user = Table::where('name', 'users')->first();
            MigrateService::createColumn02($tableId, 'khach_hang_id', 'Khách hàng', 'INT', 'select', $order_col++,
            ['select_table_id' => $user->id,'is_view_detail' => 1, 'require' => 0, 'edit' => 0, 'add2search' => 1]);

            // so_quy_status
            $so_quy_status = Table::where('name', 'so_quy_status')->first();
            MigrateService::createColumn02($tableId, 'so_quy_status_id', 'Trạng thái', 'INT', 'select', $order_col++,
            ['select_table_id' => $so_quy_status->id,'is_view_detail' => 1, 'require' => 0, 'edit' => 0, 'show_in_list' => 1]);

            // so_quy_type
            $so_quy_type = Table::where('name', 'so_quy_type')->first();
            MigrateService::createColumn02($tableId, 'so_quy_type_id', 'Loại sổ quỹ', 'INT', 'select', $order_col++,
            ['select_table_id' => $so_quy_type->id,'is_view_detail' => 1, 'require' => 0, 'edit' => 0, 'show_in_list' => 1]);

            $loai_thu = Table::where('name', 'loai_thu')->first();
            MigrateService::createColumn02($tableId, 'loai_thu_id', 'Loại thu', 'INT', 'select', $order_col++,
             ['require' => 0,  'select_table_id' => $loai_thu->id, 'add_express' => 1, 'edit' => 0, 'add2search' => 1]);

            $loai_thu = Table::where('name', 'loai_chi')->first();
            MigrateService::createColumn02($tableId, 'loai_chi_id', 'Loại chi', 'INT', 'select', $order_col++,
            ['require' => 0,  'select_table_id' => $loai_thu->id, 'add_express' => 1, 'edit' => 0, 'add2search' => 1]);

            $ngNhan = Table::where('name', 'nhom_nguoi_nhan')->first();
            MigrateService::createColumn02($tableId, 'nhom_nguoi_nhan_id', 'Nhóm người nhận', 'INT', 'select', $order_col++,
            ['require' => 0,'is_view_detail' => 0, 'edit' => 1,  'select_table_id' => $ngNhan->id, 'add_express' => 1, 'add2search' => 1]);

            $ngNhan = Table::where('name', 'nhom_nguoi_nhan')->first();
            MigrateService::createColumn02($tableId, 'nhom_nguoi_nop_id', 'Nhóm người nộp', 'INT', 'select', $order_col++,
            ['require' => 0,'is_view_detail' => 0, 'edit' => 1,  'select_table_id' => $ngNhan->id, 'add_express' => 1, 'add2search' => 1]);

            MigrateService::createColumn02($tableId, 'nguoi_nhan_name', 'Tên người nhận', 'TEXT', 'text', $order_col++,
            ['edit' => 0,'is_view_detail' => 1, ]);
            MigrateService::createColumn02($tableId, 'nguoi_nhan_code', 'Mã người nhận', 'TEXT', 'text', $order_col++,
            ['edit' => 0,'is_view_detail' => 1,]);
            MigrateService::createColumn02($tableId, 'nguoi_nhan_phone', 'SĐT người nhận', 'TEXT', 'text', $order_col++,
            ['edit' => 0,'is_view_detail' => 1,]);

            MigrateService::createColumn02($tableId, 'note', 'Nội dung', 'INT', 'textarea', $order_col++,
            ['require' => 0,'is_view_detail' => 1, 'edit' => 1, 'col' => 12]);

            MigrateService::createColumn02($tableId, 'images', 'Hình ảnh', 'TEXT', 'images', $order_col++,
            ['require' => 0,'is_view_detail' => 1, 'edit' => 1, 'col' => 12]);

            MigrateService::createColumn02($tableId, 'created_at', 'Ngày tạo', 'INT', config('constant.config_table.type_edit.date'), $order_col++,
            ['edit' => 0, 'is_view_detail' => 1, 'show_in_list' => 1]);


            MigrateService::baseColumn($tbl);
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('so_quy');
        }
    };
