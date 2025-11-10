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
        Schema::create('tai_san_cong_ty', function (Blueprint $table) {
            $table->id();
            $table->string('ma_tai_san')->unique()->comment('Mã tài sản: TS-001');
            $table->string('ten_tai_san')->comment('Tên tài sản');

            $table->string('loai_tai_san')->comment('laptop, dien_thoai, xe, thiet_bi, khac');
            $table->date('ngay_mua')->nullable()->comment('Ngày mua');
            $table->decimal('gia_tri', 15, 2)->default(0)->comment('Giá trị tài sản');

            $table->string('tinh_trang')->default('tot')->comment('tot, cu, hong');
            $table->string('trang_thai')->default('kho')->comment('kho, dang_su_dung, hong');

            $table->text('thong_tin_chi_tiet')->nullable()->comment('JSON: thông số kỹ thuật');
            $table->string('hinh_anh')->nullable()->comment('Hình ảnh tài sản');
            $table->text('ghi_chu')->nullable();

            $table->unsignedBigInteger('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->unsignedBigInteger('create_by')->default(0);
            $table->integer('is_recycle_bin')->default(0);
            $table->timestamps();

            // Indexes
            $table->index('loai_tai_san');
            $table->index('trang_thai');
        });

        // Create Table record
        $table_id = Table::insertGetId([
            'name' => 'tai_san_cong_ty',
            'display_name' => 'Tài sản công ty',
            'type_show' => 0,
            'count_item_of_page' => 30,
            'route_name' => 'admin.data.tai_san_cong_ty',
            'parent_id' => 0,
            'sort_order' => 0,
        ]);

        // Create columns
        MigrateService::createColumn02($table_id, 'ma_tai_san', 'Mã tài sản', 'text', 'basic', 1);
        MigrateService::createColumn02($table_id, 'ten_tai_san', 'Tên tài sản', 'text', 'basic', 2);
        MigrateService::createColumn02($table_id, 'loai_tai_san', 'Loại', 'select', 'basic', 3, [
            'options' => [
                ['value' => 'laptop', 'label' => 'Laptop'],
                ['value' => 'dien_thoai', 'label' => 'Điện thoại'],
                ['value' => 'xe', 'label' => 'Xe'],
                ['value' => 'thiet_bi', 'label' => 'Thiết bị'],
                ['value' => 'khac', 'label' => 'Khác'],
            ]
        ]);
        MigrateService::createColumn02($table_id, 'gia_tri', 'Giá trị', 'number', 'basic', 4);
        MigrateService::createColumn02($table_id, 'trang_thai', 'Trạng thái', 'select', 'basic', 5, [
            'options' => [
                ['value' => 'kho', 'label' => 'Trong kho'],
                ['value' => 'dang_su_dung', 'label' => 'Đang sử dụng'],
                ['value' => 'hong', 'label' => 'Hỏng'],
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tai_san_cong_ty');
        Table::where('name', 'tai_san_cong_ty')->delete();
    }
};

