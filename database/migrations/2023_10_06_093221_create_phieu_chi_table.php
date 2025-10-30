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
                Schema::create('phieu_chi', function (Blueprint $table) {
                        $table->id();
                        $table->string('lucky_id')->nullable();
                        $table->string('name')->nullable();
                        $table->string('code')->nullable(); //Mã phiếu thu

                        $table->string('chung_tu_id')->nullable();
                        $table->string('loai_chung_tu')->nullable(); // ten bang
                        $table->string('ma_chung_tu')->nullable();
                        
                        //
                        $table->integer('gia_tri_phieu')->nullable();

                        $table->integer('hinh_thuc_chi_id')->nullable();

                        $table->integer('chi_nhanh_id')->nullable(); //chi nhánh
                        // $table->integer('hinh_thuc_thu_id')->nullable(); //hình thức
                        $table->integer('loai_chi_id')->nullable(); //Loại chi
                        $table->integer('menh_gia_id')->nullable(); //mệnh GIá
                        $table->integer('user_nop_id')->nullable(); //tên người chi
                        $table->integer('khach_hang_id')->nullable(); //tên người chi
                         $table->integer('nha_cung_cap_id')->default(0)->nullable(); //ncc
                        
                        $table->datetime('thoi_gian')->nullable(); //thời gian
                        $table->integer('nhan_vien_id')->nullable(); //tên người nhan 
                        $table->integer('ngan_hang_id')->nullable(); //Ngân hàng
                        $table->integer('phi_the')->nullable(); //Phí cà thẻ
                        $table->text('ghi_chu')->nullable(); //diễn giải

                        $table->text('info')->nullable(); // phiếu chi chi tiết id

                        // lucky
                        // $table->datetime('NgayLapPhieu')->nullable();
                        // $table->datetime('NgayVaoSo')->nullable();
                        // $table->integer('nhan_vien_id')->nullable();
                        // $table->string('ID_NgoaiTe')->default(1)->nullable();
                        // $table->string('TyGia')->default(1)->nullable();
                        // $table->string('NguoiNhan')->nullable();
                        // $table->string('NguoiNhan_id')->nullable();
                        // $table->text('NoiDungChi')->nullable();
                        // $table->integer('TongTienChi')->nullable();
                        // $table->integer('ChiChoNhieuDoiTuong')->default(0)->nullable();
                        // $table->string('chi_nhanh_id')->nullable(); //ID_DonVi
                        // $table->string('UserLap')->nullable(); 
                        // $table->datetime('NgaySuaCuoi')->nullable();
                        // $table->string('UserSuaCuoi')->nullable();


                        $table->integer('parent_id')->default(0)->nullable();
                        $table->integer('sort_order')->default(0)->nullable();
                        $table->integer('create_by')->default(0)->nullable();
                        $table->integer('is_recycle_bin')->default(0)->nullable();
                        $table->timestamps();
                });

                Table::create([
                        //require
                        'name' => 'phieu_chi',
                        'display_name' => 'Phiếu chi',
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
                $tbl = Table::where('name', 'phieu_chi')->first();
                $tableId = $tbl->id;
                $order_col = 1;
                MigrateService::createColumn02(
                        $tableId,
                        'code',
                        'Mã phiếu chi',
                        'VARCHAR',
                        'text',
                        $order_col++,
                        ['show_in_list' => 1, 'is_view_detail' => 1, 'auto_generate_code' => '{"edit":0, "prefix":"PC", "length":5}']
                );

                MigrateService::createColumn02($tableId, 'name', 'Tiêu đề', 'INT', 'number', $order_col++,
                ['edit' => 1, 'show_in_list' => 1]);

                MigrateService::createColumn02($tableId, 'ma_chung_tu', 'Mã chứng từ', 'INT', 'number', $order_col++,
                ['edit' => 1, 'show_in_list' => 1]);
                
                MigrateService::createColumn02($tableId, 'gia_tri_phieu', 'Giá trị', 'INT', 'number', $order_col++,
                ['edit' => 1, 'show_in_list' => 1]);
                

                $user = Table::where('name', 'admin_users')->first();
                // MigrateService::createColumn02($tableId, 'nhan_vien_id', 'Mã-Tên người chi', 'INT', 'select', $order_col++, ['select_table_id' => $user->id,'data_select' => '{"value":"id", "name":{"0":"code", "1":"name"}}']);
                MigrateService::createColumn02($tableId, 'create_by', 'Người tạo', 'INT', 'select', $order_col++, ['select_table_id' => $user->id, 'add2search' => 1]);


                MigrateService::createColumn02($tableId, 'user_thu_id', 'Mã-Tên người nhận', 'INT', 'select', $order_col++, ['select_table_id' => $user->id,'data_select' => '{"value":"id", "name":{"0":"code", "1":"name"}}']);

                $chi_nhanh = Table::where('name', 'chi_nhanh')->first();
                MigrateService::createColumn02($tableId, 'chi_nhanh_id', 'Chi nhánh/PB', 'INT', 'select', $order_col++, ['select_table_id' => $chi_nhanh->id, 'add2search' => 1, 'require' => 1]);
                
                // MigrateService::createColumn02($tableId, 'hinh_thuc_thu_id', 'Hình thức', 'INT', 'select', $order_col++,  ['require' => 1,  'select_table_id' => $hinh_thuc->id]);
                
                $loai_chi = Table::where('name', 'loai_chi')->first();
                MigrateService::createColumn02($tableId, 'loai_chi_id', 'Loại chi', 'INT', 'select', $order_col++, 
                ['require' => 1,  'select_table_id' => $loai_chi->id, 'add_express' => 1, 'show_in_list' => 1]);

                MigrateService::createColumn02($tableId, 'thoi_gian', 'Thời gian', 'DATE', 'date', $order_col++);
                MigrateService::createColumn02($tableId, 'chu_tk', 'Chủ tài khoản', 'VARCHAR', 'text', $order_col++);

                // $tai_khoan = Table::where('name', 'ngan_hang_cart')->first();
                // MigrateService::createColumn02($tableId, 'ngan_hang_id', 'Số TK - Ngân hàng', 'INT', 'select', $order_col++, ['select_table_id' => $tai_khoan->id, 'add_express' => 1]);
                
                MigrateService::createColumn02($tableId, 'file', 'Chứng từ đính kèm', 'VARCHAR', 'image', $order_col++);
                MigrateService::createColumn02($tableId, 'create_by', 'Người tạo', 'INT', 'select', $order_col++, ['select_table_id' => $user->id, 'add2search' => 1, 'add_express' => 1, 'edit' => 0]);
                MigrateService::createColumn02($tableId, 'ghi_chu', 'Ghi chú', 'TEXT', 'textarea', $order_col++,['col'=>24]);

        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
                Schema::dropIfExists('phieu_chi');
        }
};
