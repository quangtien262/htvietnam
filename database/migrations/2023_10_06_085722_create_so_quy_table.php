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


        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('so_quy');
        }
    };
