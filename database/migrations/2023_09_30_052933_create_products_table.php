<?php

use App\Models\Admin\Column;
use App\Models\Admin\Table;
use App\Services\MigrateService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */

    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable();
            $table->string('name')->nullable();

            $table->integer('product_type_id')->default(0)->nullable(); // là loại sp: HH, dich vu, gói, thẻ
            $table->integer('product_application_id')->default(0)->nullable();
            // $table->text('product_type_ids_apply')->nullable();
            $table->integer('thoi_luong')->default(0)->nullable(); // dich vu
            $table->integer('product_group_id')->default(0)->nullable(); // HH, dich vu, gói,
            $table->text('product_group_ids_apply')->nullable(); // thẻ(chọn nhiều)
            $table->integer('thuong_hieu_id')->default(0)->nullable(); // HH, dich vu, gói, thẻ
            $table->integer('vi_tri_id')->default(0)->nullable(); // HH

            $table->integer('gia_von')->default(0)->nullable();  // HH
            $table->integer('gia_ban')->default(0)->nullable(); // HH, dich vu, gói, thẻ
            $table->integer('gia_khuyen_mai')->default(0)->nullable();

            $table->integer('best_saler')->default(0)->nullable();
            $table->integer('is_hot')->default(2)->nullable();

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
            $table->text('loai_hang_hoa')->nullable(); // thẻ - chọn nhiều loại sản phẩm dc dùng trong thẻ
            $table->text('hang_hoa_ap_dung')->nullable();  // thẻ - chọn nhiều các sp dc dùng trong thẻ

            // số lượng trong 1 thẻ LT
            $table->integer('so_luong')->default(0)->nullable();

            $table->integer('ton_kho')->default(0)->nullable();
            $table->text('ton_kho_detail')->nullable();
            $table->integer('ton_kho_total')->default(0)->nullable();

            $table->integer('dinh_muc_ton_it_nhat')->default(0)->nullable();
            $table->integer('dinh_muc_ton_nhieu_nhat')->default(0)->nullable();

            $table->integer('product_status_id')->default(1)->nullable();

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
            $table->text('images')->nullable();
            $table->integer('ton_kho_toi_thieu')->default(1)->nullable();
            $table->integer('ton_kho_toi_da')->default(99999)->nullable();
            $table->text('description')->nullable();

            $table->integer('is_active')->default(1)->nullable();

            // đơn vị tính mặc định, hiện tại đang ko hiển thị trên data vì đang có nhiều đơn vị quy đổi

            $table->integer('ngung_kinh_doanh')->default(0)->nullable();

            $table->integer('views')->default(99)->nullable();
            $table->integer('is_front')->default(0)->nullable();
            $table->integer('menu_id')->default(0)->nullable();
            $table->integer('category_id')->default(0)->nullable();
            $table->text('product_color_ids')->nullable();
            $table->text('product_size_ids')->nullable();

            $table->string('file')->nullable();

            $table->integer('is_parent')->default(0)->nullable(); //

            MigrateService::createBaseColumn($table);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
