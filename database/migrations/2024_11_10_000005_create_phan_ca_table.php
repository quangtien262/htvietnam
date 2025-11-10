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
        Schema::create('phan_ca', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('admin_user_id')->comment('Nhân viên');
            $table->unsignedBigInteger('ca_lam_viec_id')->comment('Ca làm việc');

            $table->date('tu_ngay')->comment('Từ ngày');
            $table->date('den_ngay')->comment('Đến ngày');

            $table->text('cac_ngay_trong_tuan')->nullable()->comment('JSON: [1,2,3,4,5] = T2-T6');
            $table->text('ghi_chu')->nullable();

            $table->unsignedBigInteger('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->unsignedBigInteger('create_by')->default(0);
            $table->integer('is_recycle_bin')->default(0);
            $table->timestamps();

            // Indexes
            $table->index('admin_user_id');
            $table->index('ca_lam_viec_id');
            $table->index(['tu_ngay', 'den_ngay']);
        });

        // Create Table record
        $table_id = Table::insertGetId([
            'name' => 'phan_ca',
            'display_name' => 'Phân ca làm việc',
            'type_show' => 0,
            'count_item_of_page' => 30,
            'route_name' => 'admin.data.phan_ca',
            'parent_id' => 0,
            'sort_order' => 0,
        ]);

        // Create columns
        MigrateService::createColumn02($table_id, 'admin_user_id', 'Nhân viên', 'select_api', 'basic', 1, ['table' => 'admin_users']);
        MigrateService::createColumn02($table_id, 'ca_lam_viec_id', 'Ca làm việc', 'select_api', 'basic', 2, ['table' => 'ca_lam_viec']);
        MigrateService::createColumn02($table_id, 'tu_ngay', 'Từ ngày', 'date', 'basic', 3);
        MigrateService::createColumn02($table_id, 'den_ngay', 'Đến ngày', 'date', 'basic', 4);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phan_ca');
        Table::where('name', 'phan_ca')->delete();
    }
};

