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
            Schema::create('phieu_thu', function (Blueprint $table) {
                $table->id();
                $table->string('name')->nullable();
                $table->string('code')->nullable(); //Mã phiếu thu

                $table->string('loai_chung_tu')->nullable(); // ten bang
                $table->string('chung_tu_id')->nullable();
                $table->string('ma_chung_tu')->nullable();

                $table->integer('chi_nhanh_id')->nullable(); //chi nhánh
                $table->integer('khach_hang_id')->nullable();
                $table->integer('hinh_thuc_thu_id')->nullable(); //hình thức
                $table->integer('loai_thu_id')->nullable(); //Laoij thu
                $table->integer('so_tien')->nullable(); //số tiền, TongTienThu
                // $table->integer('user_nop_id')->nullable(); //tên người nộp
                $table->dateTime('thoi_gian')->nullable(); //thời gian
                $table->integer('nhan_vien_id')->nullable(); //tên người thu, nhan_vien_id
                $table->integer('ngan_hang_id')->nullable(); //Ngân hàng
                $table->string('phi_the')->nullable(); //Phí cà thẻ
                $table->string('file')->nullable(); //tệp đính kèm
                $table->text('note')->nullable(); //NoiDungThu

                $table->text('info')->nullable();
                $table->text('sub_data_ids')->nullable();

                $table->integer('users_id')->nullable();// khach hang id
                
                // chi tiet
                $table->integer('hoa_don_id')->nullable();

                $table->date('ngay_tao')->default(now())->nullable();

                $table->string('display_name')->nullable();
                $table->integer('parent_id')->default(0)->nullable();
                $table->integer('sort_order')->default(0)->nullable();
                $table->integer('create_by')->default(0)->nullable();
                $table->integer('is_recycle_bin')->default(0)->nullable();
                $table->timestamps();
            });

            Table::create([
                //require
                'name' => 'phieu_thu',
                'display_name' => 'Phiếu thu',
                'parent_id' => 0,
                'sort_order' => 0,
                'type_show' => config('constant.type_show.basic'),
                'count_item_of_page' => 30,
                'is_edit' => 0, // 1 hiển thị ở menu; 0 không hiển thị
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
            $tbl = Table::where('name', 'phieu_thu')->first();
            $tableId = $tbl->id;
            $order_col = 1;
            MigrateService::createColumn($tableId, 'id', 'id', 'INT', 'number', $order_col++, 0, 0, 0, 1, 0);
            MigrateService::createColumn02($tableId, 'code', 'Mã phiếu thu', 'VARCHAR', 'text', $order_col++, ['is_view_detail' => 1, 'auto_generate_code' => '{"edit":0, "prefix":"PTHU", "length":5}']);
            $chi_nhanh = Table::where('name', 'chi_nhanh')->first();
            MigrateService::createColumn02($tableId, 'chi_nhanh_id', 'Chi nhánh/PB', 'INT', 'select', $order_col++,  ['select_table_id' => $chi_nhanh->id, 'require' => 1]);
            
            $loai_thu = Table::where('name', 'loai_thu')->first();
            MigrateService::createColumn02($tableId, 'loai_thu_id', 'Loại thu', 'INT', 'select', $order_col++,  
            ['require' => 0,  'select_table_id' => $loai_thu->id,]);
            
            $loai_chi = Table::where('name', 'loai_chi')->first();
            MigrateService::createColumn02($tableId, 'loai_chi_id', 'Loại chi', 'INT', 'select', $order_col++, 
            ['require' => 0,  'select_table_id' => $loai_chi->id,  'show_in_list' => 0]);

            MigrateService::createColumn02($tableId, 'so_tien', 'Số tiền', 'INT', 'number', $order_col++, ['require' => 1]);
            // $user_nop = Table::where('name', 'users')->first();
            // MigrateService::createColumn($tableId, 'user_nop_id', 'Mã-Tên người nộp', 'INT', 'select', $order_col++, 1, 1, 1, 1, $user_nop->id, '', 1, 0);
            MigrateService::createColumn($tableId, 'thoi_gian', 'Thời gian', 'DATETIME', 'datetime', $order_col++, 1);

            $user_thu = Table::where('name', 'admin_users')->first();
            MigrateService::createColumn02($tableId, 'create_by', 'Người tạo', 'INT', 'select', $order_col++, ['select_table_id' => $user_thu->id, 'edit' => 0, 'show_in_detail' => 1]);
            MigrateService::createColumn02(
                $tableId,
                'nhan_vien_id',
                'Mã-Tên người thu',
                'INT',
                'select',
                $order_col++,
                ['select_table_id' => $user_thu->id, 'show_in_list' => 1, 'require' => 1, 'data_select' => '{"value":"id", "name":{"0":"code", "1":"name"}}']
            );

            MigrateService::createColumn($tableId, 'explain', 'Diễn giải(Lý do)', 'VARCHAR', 'text', $order_col++, 0);
            $tai_khoan = Table::where('name', 'ngan_hang')->first();
            MigrateService::createColumn02($tableId, 'ngan_hang_id', 'Số TK - Ngân hàng', 'INT', 'select', $order_col++,  ['select_table_id' => $tai_khoan->id, 'add_express' => 1]);
            MigrateService::createColumn($tableId, 'phi_the', 'Chủ TK', 'VARCHAR', 'text', $order_col++, 0);
            MigrateService::createColumn($tableId, 'file', 'Chứng từ đính kèm', 'VARCHAR', 'image', $order_col++, 0);
            $kh = Table::where('name', 'users')->first();
            MigrateService::createColumn02(
                $tableId,
                'users_id',
                'Khách hàng',
                'INT',
                'select',
                $order_col++,
                ['select_table_id' => $kh->id, 'show_in_list' => 0, 'add2search' => 1,'is_view_detail' => 1, 'edit' => 0]
            );
            MigrateService::createColumn($tableId, 'tien_mat', 'Tiền mặt', 'INT', 'number', $order_col++, 1);
            MigrateService::createColumn($tableId, 'tien_gui', 'Tiền gửi', 'INT', 'number', $order_col++, 1);
            MigrateService::createColumn02($tableId, 'tien_thu', 'Tiền thu', 'INT', 'number', $order_col++);
            MigrateService::createColumn02($tableId, 'description', 'Ghi chú', 'TEXT', 'textarea', $order_col++, ['col' => 24, 'show_in_list' => 1]);
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('phieu_thu');
        }
    };
