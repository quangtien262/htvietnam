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
        Schema::create('ca_lam_viec', function (Blueprint $table) {
            $table->id();
            $table->string('ma_ca')->unique()->comment('Mã ca: CA-001');
            $table->string('ten_ca')->comment('Tên ca làm việc');

            $table->time('gio_bat_dau')->comment('Giờ bắt đầu ca');
            $table->time('gio_ket_thuc')->comment('Giờ kết thúc ca');
            $table->integer('thoi_gian_nghi_giua_ca')->default(60)->comment('Thời gian nghỉ giữa ca (phút)');

            $table->string('ap_dung_cho')->default('all')->comment('all, specific_departments, specific_employees');
            $table->text('danh_sach_ap_dung')->nullable()->comment('JSON: IDs chi nhánh hoặc nhân viên');

            $table->integer('is_active')->default(1)->comment('0: không hoạt động, 1: hoạt động');
            $table->text('ghi_chu')->nullable();

            $table->unsignedBigInteger('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->unsignedBigInteger('create_by')->default(0);
            $table->integer('is_recycle_bin')->default(0);
            $table->timestamps();
        });

        // Create Table record
        $table_id = Table::insertGetId([
            'name' => 'ca_lam_viec',
            'display_name' => 'Ca làm việc',
            'type_show' => 0,
            'count_item_of_page' => 30,
            'route_name' => 'admin.data.ca_lam_viec',
            'parent_id' => 0,
            'sort_order' => 0,
        ]);

        // Create columns
        MigrateService::createColumn02($table_id, 'ma_ca', 'Mã ca', 'text', 'basic', 1);
        MigrateService::createColumn02($table_id, 'ten_ca', 'Tên ca', 'text', 'basic', 2);
        MigrateService::createColumn02($table_id, 'gio_bat_dau', 'Giờ bắt đầu', 'time', 'basic', 3);
        MigrateService::createColumn02($table_id, 'gio_ket_thuc', 'Giờ kết thúc', 'time', 'basic', 4);
        MigrateService::createColumn02($table_id, 'thoi_gian_nghi_giua_ca', 'Nghỉ giữa ca (phút)', 'number', 'basic', 5);
        MigrateService::createColumn02($table_id, 'is_active', 'Hoạt động', 'select', 'basic', 6, [
            'options' => [
                ['value' => 0, 'label' => 'Không'],
                ['value' => 1, 'label' => 'Có'],
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ca_lam_viec');
        Table::where('name', 'ca_lam_viec')->delete();
    }
};

