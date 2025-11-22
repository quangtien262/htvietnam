<?php

use App\Models\Admin\Table;
use App\Services\MigrateService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contract', function (Blueprint $table) {
            $table->id();
            // loại hợp đồng: bds, it, spa...
            $table->string('contract_type')->default(1)->nullable();

            // thông tin chung
            $table->text('name')->nullable();
            $table->text('images')->nullable(); // ảnh hđồng
            $table->string('code')->nullable();
            $table->integer('aitilen_invoice_id')->nullable();

            $table->integer('room_id')->nullable(); // bds: số phòng
            $table->integer('apartment_id')->nullable(); // bds: số căn hộ

            $table->integer('contract_status_id')->nullable();

            $table->integer('aitilen_service_id')->nullable();

            // info
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->integer('gia_thue')->default(0)->nullable();
            $table->integer('tien_coc')->default(0)->nullable();
            $table->integer('ky_thanh_toan')->default(1)->nullable();
            $table->integer('so_nguoi')->default(1)->nullable();
            $table->integer('ngay_hen_dong_tien')->default(5)->nullable();

            $table->text('services')->nullable();
            // tông tiền: phòng, cọc, dịch vụ
            $table->integer('total')->default(0)->nullable();
            // tổng tiền dịch vụ
            $table->integer('total_service')->default(0)->nullable();
            // tổng phí cố định hàng tháng (tiền phòng & dịch vụ)
            $table->integer('total_phi_co_dinh')->default(0)->nullable();

            // khach hang
            $table->integer('user_id')->default(0)->nullable();
            $table->string('ho_ten')->nullable();
            $table->date('dob')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('cccd')->nullable();
            $table->date('ngay_cap')->nullable();
            $table->text('noi_cap')->nullable();
            $table->string('hktt')->nullable();

            $table->string('is_active')->default(1)->nullable();


            //
            $table->string('phi_moi_gioi')->nullable();

            $table->text('note')->nullable();

            MigrateService::createBaseColumn($table);


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contract');
    }
};
