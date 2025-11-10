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
        Schema::create('kpi_danh_gia', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('admin_user_id')->comment('Nhân viên');
            $table->integer('thang')->comment('Tháng');
            $table->integer('nam')->comment('Năm');

            $table->longText('chi_tieu_kpi')->nullable()->comment('JSON: [{ten, trong_so, muc_tieu, thuc_te}]');
            $table->decimal('tong_diem', 10, 2)->default(0)->comment('Tổng điểm KPI');
            $table->string('xep_loai')->nullable()->comment('A, B, C, D');

            $table->unsignedBigInteger('nguoi_danh_gia')->nullable()->comment('Người đánh giá');
            $table->timestamp('ngay_danh_gia')->nullable();
            $table->text('nhan_xet')->nullable()->comment('Nhận xét của người đánh giá');

            $table->unsignedBigInteger('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->unsignedBigInteger('create_by')->default(0);
            $table->integer('is_recycle_bin')->default(0);
            $table->timestamps();

            // Indexes
            $table->index('admin_user_id');
            $table->index(['thang', 'nam']);
            $table->unique(['admin_user_id', 'thang', 'nam'], 'unique_user_kpi_month');
        });

        // Create Table record
        $table_id = Table::insertGetId([
            'name' => 'kpi_danh_gia',
            'display_name' => 'Đánh giá KPI',
            'type_show' => 0,
            'count_item_of_page' => 30,
            'route_name' => 'admin.data.kpi_danh_gia',
            'parent_id' => 0,
            'sort_order' => 0,
        ]);

        // Create columns
        MigrateService::createColumn02($table_id, 'admin_user_id', 'Nhân viên', 'select_api', 'basic', 1, ['table' => 'admin_users']);
        MigrateService::createColumn02($table_id, 'thang', 'Tháng', 'number', 'basic', 2);
        MigrateService::createColumn02($table_id, 'nam', 'Năm', 'number', 'basic', 3);
        MigrateService::createColumn02($table_id, 'tong_diem', 'Tổng điểm', 'number', 'basic', 4);
        MigrateService::createColumn02($table_id, 'xep_loai', 'Xếp loại', 'select', 'basic', 5, [
            'options' => [
                ['value' => 'A', 'label' => 'A - Xuất sắc'],
                ['value' => 'B', 'label' => 'B - Tốt'],
                ['value' => 'C', 'label' => 'C - Trung bình'],
                ['value' => 'D', 'label' => 'D - Yếu'],
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kpi_danh_gia');
        Table::where('name', 'kpi_danh_gia')->delete();
    }
};

