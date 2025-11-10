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
        Schema::create('nghi_phep', function (Blueprint $table) {
            $table->id();
            $table->string('ma_don')->unique()->comment('Mã đơn: NP-YYYY-001');
            $table->unsignedBigInteger('admin_user_id')->comment('Người nộp đơn');

            $table->string('loai_nghi')->comment('phep_nam, om, thai_san, khong_luong, khac');
            $table->date('tu_ngay')->comment('Từ ngày');
            $table->date('den_ngay')->comment('Đến ngày');
            $table->decimal('so_ngay_nghi', 10, 2)->default(0)->comment('Số ngày nghỉ (tính tự động)');

            $table->text('ly_do')->nullable()->comment('Lý do nghỉ');
            $table->string('file_dinh_kem')->nullable()->comment('File đính kèm (giấy tờ)');

            // Duyệt đơn
            $table->string('trang_thai')->default('pending')->comment('pending, approved, rejected');
            $table->unsignedBigInteger('nguoi_duyet_id')->nullable();
            $table->timestamp('ngay_duyet')->nullable();
            $table->text('ghi_chu_duyet')->nullable()->comment('Ghi chú khi duyệt/từ chối');

            $table->unsignedBigInteger('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->unsignedBigInteger('create_by')->default(0);
            $table->integer('is_recycle_bin')->default(0);
            $table->timestamps();

            // Indexes
            $table->index('admin_user_id');
            $table->index('trang_thai');
            $table->index(['tu_ngay', 'den_ngay']);
        });

        // Create Table record
        $table_id = Table::insertGetId([
            'name' => 'nghi_phep',
            'display_name' => 'Nghỉ phép',
            'type_show' => 0,
            'count_item_of_page' => 30,
            'route_name' => 'admin.data.nghi_phep',
            'parent_id' => 0,
            'sort_order' => 0,
        ]);

        // Create columns
        MigrateService::createColumn02($table_id, 'ma_don', 'Mã đơn', 'text', 'basic', 1);
        MigrateService::createColumn02($table_id, 'admin_user_id', 'Nhân viên', 'select_api', 'basic', 2, ['table' => 'admin_users']);
        MigrateService::createColumn02($table_id, 'loai_nghi', 'Loại nghỉ', 'select', 'basic', 3, [
            'options' => [
                ['value' => 'phep_nam', 'label' => 'Phép năm'],
                ['value' => 'om', 'label' => 'Ốm đau'],
                ['value' => 'thai_san', 'label' => 'Thai sản'],
                ['value' => 'khong_luong', 'label' => 'Không lương'],
                ['value' => 'khac', 'label' => 'Khác'],
            ]
        ]);
        MigrateService::createColumn02($table_id, 'tu_ngay', 'Từ ngày', 'date', 'basic', 4);
        MigrateService::createColumn02($table_id, 'den_ngay', 'Đến ngày', 'date', 'basic', 5);
        MigrateService::createColumn02($table_id, 'so_ngay_nghi', 'Số ngày', 'number', 'basic', 6);
        MigrateService::createColumn02($table_id, 'ly_do', 'Lý do', 'textarea', 'basic', 7);
        MigrateService::createColumn02($table_id, 'trang_thai', 'Trạng thái', 'select', 'basic', 8, [
            'options' => [
                ['value' => 'pending', 'label' => 'Chờ duyệt'],
                ['value' => 'approved', 'label' => 'Đã duyệt'],
                ['value' => 'rejected', 'label' => 'Từ chối'],
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nghi_phep');
        Table::where('name', 'nghi_phep')->delete();
    }
};

