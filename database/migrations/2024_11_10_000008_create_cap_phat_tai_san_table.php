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
        Schema::create('cap_phat_tai_san', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tai_san_id')->comment('Tài sản');
            $table->unsignedBigInteger('admin_user_id')->comment('Nhân viên được cấp');

            $table->date('ngay_cap_phat')->comment('Ngày cấp phát');
            $table->date('ngay_thu_hoi')->nullable()->comment('Ngày thu hồi');

            $table->string('trang_thai')->default('dang_su_dung')->comment('dang_su_dung, da_thu_hoi');
            $table->text('ghi_chu_cap_phat')->nullable();
            $table->text('ghi_chu_thu_hoi')->nullable();

            $table->unsignedBigInteger('nguoi_cap_phat')->comment('Người cấp phát');
            $table->unsignedBigInteger('nguoi_thu_hoi')->nullable()->comment('Người thu hồi');

            $table->unsignedBigInteger('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->unsignedBigInteger('create_by')->default(0);
            $table->integer('is_recycle_bin')->default(0);
            $table->timestamps();

            // Indexes
            $table->index('tai_san_id');
            $table->index('admin_user_id');
            $table->index('trang_thai');
        });

        // Create Table record
        $table_id = Table::insertGetId([
            'name' => 'cap_phat_tai_san',
            'display_name' => 'Cấp phát tài sản',
            'type_show' => 0,
            'count_item_of_page' => 30,
            'route_name' => 'admin.data.cap_phat_tai_san',
            'parent_id' => 0,
            'sort_order' => 0,
        ]);

        // Create columns
        MigrateService::createColumn02($table_id, 'tai_san_id', 'Tài sản', 'select_api', 'basic', 1, ['table' => 'tai_san_cong_ty']);
        MigrateService::createColumn02($table_id, 'admin_user_id', 'Nhân viên', 'select_api', 'basic', 2, ['table' => 'admin_users']);
        MigrateService::createColumn02($table_id, 'ngay_cap_phat', 'Ngày cấp phát', 'date', 'basic', 3);
        MigrateService::createColumn02($table_id, 'ngay_thu_hoi', 'Ngày thu hồi', 'date', 'basic', 4);
        MigrateService::createColumn02($table_id, 'trang_thai', 'Trạng thái', 'select', 'basic', 5, [
            'options' => [
                ['value' => 'dang_su_dung', 'label' => 'Đang sử dụng'],
                ['value' => 'da_thu_hoi', 'label' => 'Đã thu hồi'],
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cap_phat_tai_san');
        Table::where('name', 'cap_phat_tai_san')->delete();
    }
};

