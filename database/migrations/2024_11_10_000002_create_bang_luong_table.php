<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Services\MigrateService;
use App\Models\Admin\Table;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bang_luong', function (Blueprint $table) {
            $table->id();
            $table->string('ma_bang_luong')->unique()->comment('Mã bảng lương: BL-YYYY-MM-001');
            $table->unsignedBigInteger('admin_user_id')->comment('ID nhân viên');
            $table->integer('thang')->comment('Tháng');
            $table->integer('nam')->comment('Năm');

            // Lương cơ bản
            $table->decimal('luong_co_ban', 15, 2)->default(0)->comment('Lương cơ bản từ admin_users');
            $table->integer('loai_luong')->default(4)->comment('1:Ca, 2:Giờ, 3:Ngày công, 4:Cố định');

            // Ngày công
            $table->decimal('so_ngay_cong_chuan', 10, 2)->default(26)->comment('Số ngày công chuẩn trong tháng');
            $table->decimal('so_ngay_cong_thuc_te', 10, 2)->default(0)->comment('Số ngày công thực tế');
            $table->decimal('luong_theo_ngay_cong', 15, 2)->default(0)->comment('Lương = (cơ bản / chuẩn) * thực tế');

            // Làm thêm giờ
            $table->decimal('gio_lam_them_ngay_thuong', 10, 2)->default(0)->comment('Giờ làm thêm ngày thường');
            $table->decimal('gio_lam_them_thu7', 10, 2)->default(0)->comment('Giờ làm thêm thứ 7');
            $table->decimal('gio_lam_them_chu_nhat', 10, 2)->default(0)->comment('Giờ làm thêm chủ nhật');
            $table->decimal('gio_lam_them_ngay_le', 10, 2)->default(0)->comment('Giờ làm thêm ngày lễ');
            $table->decimal('tien_lam_them', 15, 2)->default(0)->comment('Tổng tiền làm thêm');

            // Thưởng, phụ cấp, hoa hồng
            $table->decimal('tong_thuong', 15, 2)->default(0)->comment('Tổng thưởng (từ thuong_setting)');
            $table->decimal('tong_hoa_hong', 15, 2)->default(0)->comment('Tổng hoa hồng');
            $table->decimal('tong_phu_cap', 15, 2)->default(0)->comment('Tổng phụ cấp');
            $table->longText('chi_tiet_thuong')->nullable()->comment('Chi tiết thưởng JSON');
            $table->longText('chi_tiet_hoa_hong')->nullable()->comment('Chi tiết hoa hồng JSON');
            $table->longText('chi_tiet_phu_cap')->nullable()->comment('Chi tiết phụ cấp JSON');

            // Giảm trừ
            $table->decimal('tong_giam_tru', 15, 2)->default(0)->comment('Tổng giảm trừ');
            $table->longText('chi_tiet_giam_tru')->nullable()->comment('Chi tiết giảm trừ JSON');

            // Bảo hiểm
            $table->decimal('tru_bhxh', 15, 2)->default(0)->comment('Trừ BHXH (8%)');
            $table->decimal('tru_bhyt', 15, 2)->default(0)->comment('Trừ BHYT (1.5%)');
            $table->decimal('tru_bhtn', 15, 2)->default(0)->comment('Trừ BHTN (1%)');

            // Thuế TNCN
            $table->decimal('tru_thue_tncn', 15, 2)->default(0)->comment('Thuế thu nhập cá nhân');

            // Tổng kết
            $table->decimal('tong_thu_nhap', 15, 2)->default(0)->comment('Lương + thêm giờ + thưởng + hoa hồng + phụ cấp');
            $table->decimal('tong_khau_tru', 15, 2)->default(0)->comment('Giảm trừ + BHXH + BHYT + BHTN + Thuế');
            $table->decimal('thuc_nhan', 15, 2)->default(0)->comment('Thu nhập - Khấu trừ');

            // Trạng thái
            $table->string('trang_thai')->default('draft')->comment('draft, approved, paid');
            $table->unsignedBigInteger('nguoi_duyet_id')->nullable();
            $table->timestamp('ngay_duyet')->nullable();
            $table->date('ngay_phat_luong')->nullable()->comment('Ngày phát lương thực tế');

            $table->text('ghi_chu')->nullable();

            $table->unsignedBigInteger('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->unsignedBigInteger('create_by')->default(0);
            $table->integer('is_recycle_bin')->default(0);
            $table->timestamps();

            // Indexes
            $table->index('admin_user_id');
            $table->index(['thang', 'nam']);
            $table->index('trang_thai');
            $table->unique(['admin_user_id', 'thang', 'nam'], 'unique_user_month');
        });

        // Create Table record
        $table_id = Table::insertGetId([
            'name' => 'bang_luong',
            'display_name' => 'Bảng lương',
            'type_show' => 0,
            'count_item_of_page' => 30,
            'route_name' => 'admin.data.bang_luong',
            'parent_id' => 0,
            'sort_order' => 0,
        ]);

        // Create columns
        MigrateService::createColumn02($table_id, 'ma_bang_luong', 'Mã bảng lương', 'text', 'basic', 1);
        MigrateService::createColumn02($table_id, 'admin_user_id', 'Nhân viên', 'select_api', 'basic', 2, ['table' => 'admin_users']);
        MigrateService::createColumn02($table_id, 'thang', 'Tháng', 'number', 'basic', 3);
        MigrateService::createColumn02($table_id, 'nam', 'Năm', 'number', 'basic', 4);
        MigrateService::createColumn02($table_id, 'luong_co_ban', 'Lương cơ bản', 'number', 'basic', 5);
        MigrateService::createColumn02($table_id, 'so_ngay_cong_thuc_te', 'Ngày công', 'number', 'basic', 6);
        MigrateService::createColumn02($table_id, 'thuc_nhan', 'Thực nhận', 'number', 'basic', 7);
        MigrateService::createColumn02($table_id, 'trang_thai', 'Trạng thái', 'select', 'basic', 8, [
            'options' => [
                ['value' => 'draft', 'label' => 'Nháp'],
                ['value' => 'approved', 'label' => 'Đã duyệt'],
                ['value' => 'paid', 'label' => 'Đã thanh toán'],
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bang_luong');
        Table::where('name', 'bang_luong')->delete();
    }
};

