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
        Schema::create('hop_dong_lao_dong', function (Blueprint $table) {
            $table->id();
            $table->string('ma_hop_dong')->unique()->comment('Mã hợp đồng: HD-YYYY-001');
            $table->unsignedBigInteger('admin_user_id')->comment('Nhân viên');

            $table->string('loai_hop_dong')->comment('thu_viec, co_thoi_han, khong_thoi_han, mua_vu');
            $table->date('ngay_bat_dau')->comment('Ngày bắt đầu');
            $table->date('ngay_ket_thuc')->nullable()->comment('Ngày kết thúc');

            $table->decimal('luong_hop_dong', 15, 2)->default(0)->comment('Lương ghi trong hợp đồng');
            $table->decimal('muc_dong_bao_hiem', 15, 2)->default(0)->comment('Mức đóng bảo hiểm');

            $table->string('file_hop_dong')->nullable()->comment('Path file hợp đồng PDF');
            $table->string('trang_thai')->default('active')->comment('active, expired, terminated');

            $table->date('ngay_ky')->comment('Ngày ký hợp đồng');
            $table->unsignedBigInteger('nguoi_dai_dien_cong_ty')->comment('Người đại diện công ty ký');

            $table->text('ghi_chu')->nullable();

            $table->unsignedBigInteger('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->unsignedBigInteger('create_by')->default(0);
            $table->integer('is_recycle_bin')->default(0);
            $table->timestamps();

            // Indexes
            $table->index('admin_user_id');
            $table->index('trang_thai');
            $table->index(['ngay_bat_dau', 'ngay_ket_thuc']);
        });

        // Create Table record
        $table_id = Table::insertGetId([
            'name' => 'hop_dong_lao_dong',
            'display_name' => 'Hợp đồng lao động',
            'type_show' => 0,
            'count_item_of_page' => 30,
            'route_name' => 'admin.data.hop_dong_lao_dong',
            'parent_id' => 0,
            'sort_order' => 0,
        ]);

        // Create columns
        MigrateService::createColumn02($table_id, 'ma_hop_dong', 'Mã hợp đồng', 'text', 'basic', 1);
        MigrateService::createColumn02($table_id, 'admin_user_id', 'Nhân viên', 'select_api', 'basic', 2, ['table' => 'admin_users']);
        MigrateService::createColumn02($table_id, 'loai_hop_dong', 'Loại hợp đồng', 'select', 'basic', 3, [
            'options' => [
                ['value' => 'thu_viec', 'label' => 'Thử việc'],
                ['value' => 'co_thoi_han', 'label' => 'Có thời hạn'],
                ['value' => 'khong_thoi_han', 'label' => 'Không thời hạn'],
                ['value' => 'mua_vu', 'label' => 'Mùa vụ'],
            ]
        ]);
        MigrateService::createColumn02($table_id, 'ngay_bat_dau', 'Ngày bắt đầu', 'date', 'basic', 4);
        MigrateService::createColumn02($table_id, 'ngay_ket_thuc', 'Ngày kết thúc', 'date', 'basic', 5);
        MigrateService::createColumn02($table_id, 'luong_hop_dong', 'Lương hợp đồng', 'number', 'basic', 6);
        MigrateService::createColumn02($table_id, 'trang_thai', 'Trạng thái', 'select', 'basic', 7, [
            'options' => [
                ['value' => 'active', 'label' => 'Đang hiệu lực'],
                ['value' => 'expired', 'label' => 'Hết hạn'],
                ['value' => 'terminated', 'label' => 'Đã chấm dứt'],
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hop_dong_lao_dong');
        Table::where('name', 'hop_dong_lao_dong')->delete();
    }
};

