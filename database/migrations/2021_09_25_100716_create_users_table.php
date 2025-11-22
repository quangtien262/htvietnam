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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('user_type')->default('Aitilen')->nullable(); // Aitilen, HTVietNam, spa

            // Mã khách hàng (Sales)
            $table->string('ma_khach_hang', 50)->nullable()->unique()->comment('Mã khách hàng: KH0001');

            // Basic info
            $table->string('name')->nullable();
            $table->string('ho_ten')->nullable()->comment('Alias for name (SPA compatibility)');
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->string('email')->nullable();

            // Role & permissions
            $table->enum('role', ['admin', 'nhan_vien', 'khach_hang'])->default('khach_hang')->nullable();

            // Contact info
            $table->string('phone')->nullable();
            $table->string('phone02')->nullable();
            $table->string('sdt')->nullable()->comment('Alias for phone (SPA compatibility)');
            $table->string('facebook')->nullable();

            // Personal info
            $table->string('code')->nullable();
            $table->date('ngay_sinh')->nullable();
            $table->integer('gioi_tinh_id')->nullable();

            // Address info
            $table->text('address')->nullable();
            $table->text('dia_chi')->nullable()->comment('Alias for address (SPA compatibility)');
            $table->string('tinh_thanh', 100)->nullable();
            $table->string('quan_huyen', 100)->nullable();
            $table->string('xa_phuong', 100)->nullable();
            $table->text('hktt')->nullable()->comment('Hộ khẩu thường trú');

            // CCCD/CMND
            $table->text('cccd')->nullable();
            $table->text('cccd_front')->nullable();
            $table->text('cccd_back')->nullable();
            $table->date('ngay_cap')->nullable();
            $table->text('noi_cap')->nullable();

            // Company info
            $table->text('cong_ty')->nullable();
            $table->string('tax_code')->nullable();
            $table->text('mst')->nullable()->comment('Mã số thuế');
            $table->string('ma_so_thue', 50)->nullable()->comment('Mã số thuế doanh nghiệp (Sales)');

            // Customer classification
            $table->integer('customer_group_id')->nullable();
            $table->enum('loai_khach_hang', ['ca_nhan', 'doanh_nghiep'])->default('ca_nhan')->nullable()->comment('Sales: loại khách hàng');
            $table->enum('nhom_khach_hang', ['vip', 'thuong', 'moi', 'tiem_nang'])->default('moi')->nullable()->comment('Sales: nhóm khách hàng');
            $table->enum('loai_khach', ['VIP', 'Thuong', 'Moi'])->default('Moi')->nullable()->comment('SPA: loại khách hàng');

            // Customer source & status
            $table->integer('customer_status_id')->default(1)->nullable();
            $table->integer('user_status_id')->nullable();
            $table->string('trang_thai')->default('active')->nullable()->comment('SPA: trạng thái');
            $table->integer('user_source_id')->nullable();
            $table->string('nguon_khach')->nullable()->comment('SPA: Facebook, Google, Referral, Walk-in');

            // Branch & assignment
            $table->integer('chi_nhanh_id')->nullable();
            $table->unsignedBigInteger('nhan_vien_phu_trach_id')->nullable()->comment('Sales: nhân viên phụ trách');

            // Financial - VIP card
            $table->integer('tong_tien_da_nap')->default(0)->nullable();
            $table->integer('tien_con_lai')->default(0)->nullable();
            $table->integer('tien_da_su_dung')->default(0)->nullable();

            // Financial - Debt (công nợ)
            $table->integer('tong_cong_no')->default(0)->nullable();
            $table->integer('cong_no_da_thanh_toan')->default(0)->nullable();
            $table->integer('cong_no_hien_tai')->default(0)->nullable();
            $table->decimal('han_muc_no', 15, 2)->default(0)->nullable()->comment('Sales: hạn mức công nợ cho phép');

            // Financial - Purchase & spending
            $table->decimal('tong_mua', 15, 2)->default(0)->nullable()->comment('Sales: tổng giá trị đã mua');
            $table->decimal('tong_chi_tieu', 15, 2)->default(0)->nullable()->comment('SPA: tổng chi tiêu');

            // Points & rewards
            $table->integer('diem_tich_luy')->default(0)->nullable();
            $table->integer('points')->default(0)->nullable()->comment('Alias for diem_tich_luy');

            // Wallet expiry
            $table->date('han_su_dung_vi')->nullable()->comment('Hạn sử dụng tiền trong ví');

            // Activity tracking
            $table->dateTime('lan_mua_cuoi')->nullable()->comment('SPA: lần mua cuối');

            // Notes & additional info
            $table->text('note')->nullable();
            $table->text('ghi_chu')->nullable()->comment('Alias for note (SPA compatibility)');
            $table->text('merge_description')->nullable();
            $table->text('data_related')->nullable();
            $table->integer('merge_id')->default(0)->nullable();

            // Media
            $table->text('image')->nullable();
            $table->string('link_website')->nullable();

            // Security & verification
            $table->integer('require_changepw')->default(0)->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('phone_verified')->nullable();
            $table->rememberToken();

            MigrateService::createBaseColumn($table);
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });




    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
