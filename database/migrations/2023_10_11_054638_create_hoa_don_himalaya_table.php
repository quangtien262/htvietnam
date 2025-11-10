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
            Schema::create('hoa_don_himalaya', function (Blueprint $table) {
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


        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('hoa_don_himalaya');
        }
    };
