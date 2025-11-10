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
        Schema::create('cham_cong', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('admin_user_id')->comment('ID nhân viên');
            $table->date('ngay_cham_cong')->comment('Ngày chấm công');
            $table->integer('type')->default(1)->comment('1:Đi làm, 2:Nghỉ có phép, 3:Nghỉ không phép, 4:Nghỉ lễ, 5:Nghỉ cuối tuần');

            // Check in/out
            $table->string('checkin_h', 2)->nullable()->comment('Giờ check in');
            $table->string('checkin_m', 2)->nullable()->comment('Phút check in');
            $table->string('checkout_h', 2)->nullable()->comment('Giờ check out');
            $table->string('checkout_m', 2)->nullable()->comment('Phút check out');

            // KPI và lương
            $table->integer('kpi')->default(0)->comment('KPI: -1 đi muộn/về sớm, 0 bình thường, 1 nghỉ nửa ngày');
            $table->decimal('luong_nghi_nua_ngay', 15, 2)->default(0)->comment('Tiền trừ nghỉ nửa ngày');
            $table->decimal('luong_nghi_ca_ngay', 15, 2)->default(0)->comment('Tiền trừ nghỉ cả ngày');

            // Làm thêm giờ
            $table->decimal('gio_lam_them', 10, 2)->default(0)->comment('Số giờ làm thêm');
            $table->decimal('tien_lam_them', 15, 2)->default(0)->comment('Tiền làm thêm giờ');

            $table->string('note')->nullable()->comment('Ghi chú (đi muộn, về sớm, nghỉ...)');

            // Vân tay
            $table->unsignedBigInteger('van_tay_id')->nullable()->comment('ID máy vân tay');
            $table->string('van_tay_checkin_time')->nullable()->comment('Thời gian vân tay check in');
            $table->string('van_tay_checkout_time')->nullable()->comment('Thời gian vân tay check out');

            // Duyệt chấm công
            $table->integer('is_approved')->default(0)->comment('0: chưa duyệt, 1: đã duyệt');
            $table->unsignedBigInteger('approved_by')->nullable()->comment('Người duyệt');
            $table->timestamp('approved_at')->nullable();

            $table->unsignedBigInteger('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->unsignedBigInteger('create_by')->default(0);
            $table->integer('is_recycle_bin')->default(0);
            $table->timestamps();

            // Indexes
            $table->index('admin_user_id');
            $table->index('ngay_cham_cong');
            $table->unique(['admin_user_id', 'ngay_cham_cong'], 'unique_user_date');
        });

        // Create Table record for admin interface
        $table_id = Table::insertGetId([
            'name' => 'cham_cong',
            'display_name' => 'Chấm công',
            'type_show' => 0,
            'count_item_of_page' => 30,
            'route_name' => 'admin.data.cham_cong',
            'parent_id' => 0,
            'sort_order' => 0,
        ]);

        // Create columns metadata
        MigrateService::createColumn02($table_id, 'admin_user_id', 'Nhân viên', 'select_api', 'basic', 1, ['table' => 'admin_users']);
        MigrateService::createColumn02($table_id, 'ngay_cham_cong', 'Ngày chấm công', 'date', 'basic', 2);
        MigrateService::createColumn02($table_id, 'type', 'Loại chấm công', 'select', 'basic', 3, [
            'options' => [
                ['value' => 1, 'label' => 'Đi làm'],
                ['value' => 2, 'label' => 'Nghỉ có phép'],
                ['value' => 3, 'label' => 'Nghỉ không phép'],
                ['value' => 4, 'label' => 'Nghỉ lễ'],
                ['value' => 5, 'label' => 'Nghỉ cuối tuần'],
            ]
        ]);
        MigrateService::createColumn02($table_id, 'checkin_h', 'Giờ check in', 'text', 'advanced', 4);
        MigrateService::createColumn02($table_id, 'checkin_m', 'Phút check in', 'text', 'advanced', 5);
        MigrateService::createColumn02($table_id, 'checkout_h', 'Giờ check out', 'text', 'advanced', 6);
        MigrateService::createColumn02($table_id, 'checkout_m', 'Phút check out', 'text', 'advanced', 7);
        MigrateService::createColumn02($table_id, 'kpi', 'KPI', 'number', 'advanced', 8);
        MigrateService::createColumn02($table_id, 'note', 'Ghi chú', 'text', 'basic', 9);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cham_cong');
        Table::where('name', 'cham_cong')->delete();
    }
};

