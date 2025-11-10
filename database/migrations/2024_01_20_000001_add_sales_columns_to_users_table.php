<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Thông tin khách hàng bán hàng (sales)
            $table->string('ma_khach_hang', 50)->nullable()->unique()->after('id')->comment('Mã khách hàng: KH0001');
            $table->enum('role', ['admin', 'nhan_vien', 'khach_hang'])->default('khach_hang')->after('user_type');
            
            // Đã có: phone, email, address, name
            $table->string('tinh_thanh', 100)->nullable()->after('address');
            $table->string('quan_huyen', 100)->nullable()->after('tinh_thanh');
            $table->string('xa_phuong', 100)->nullable()->after('quan_huyen');
            
            // Phân loại khách hàng
            $table->enum('loai_khach_hang', ['ca_nhan', 'doanh_nghiep'])->default('ca_nhan')->after('customer_group_id');
            $table->string('ma_so_thue', 50)->nullable()->after('loai_khach_hang')->comment('Mã số thuế doanh nghiệp');
            $table->enum('nhom_khach_hang', ['vip', 'thuong', 'moi', 'tiem_nang'])->default('moi')->after('ma_so_thue');
            
            // Nhân viên phụ trách
            $table->unsignedBigInteger('nhan_vien_phu_trach_id')->nullable()->after('nhom_khach_hang');
            
            // Tài chính (đã có một số trường tương tự)
            $table->decimal('han_muc_no', 15, 2)->default(0)->after('cong_no_hien_tai')->comment('Hạn mức công nợ cho phép');
            $table->decimal('tong_mua', 15, 2)->default(0)->after('han_muc_no')->comment('Tổng giá trị đã mua');
            $table->integer('diem_tich_luy')->default(0)->after('tong_mua')->comment('Điểm tích lũy khách hàng');
            
            // Trạng thái (đã có customer_status_id, có thể dùng luôn)
            // note đã có
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'ma_khach_hang',
                'role',
                'tinh_thanh',
                'quan_huyen',
                'xa_phuong',
                'loai_khach_hang',
                'ma_so_thue',
                'nhom_khach_hang',
                'nhan_vien_phu_trach_id',
                'han_muc_no',
                'tong_mua',
                'diem_tich_luy',
            ]);
        });
    }
};
