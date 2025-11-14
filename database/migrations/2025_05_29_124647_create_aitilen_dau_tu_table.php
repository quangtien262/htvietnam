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
        Schema::create('aitilen_dau_tu', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable()->comment('Tên chi phí');
            $table->text('content')->nullable()->comment('Nội dung chi phí');
            $table->integer('price')->nullable()->comment('Giá tiền');
            $table->integer('supplier_id')->nullable()->comment('Nhà cung cấp');
            $table->integer('loai_chi_id')->nullable()->comment('Loại chi phí, được map với id trong bảng loai_chi');
            $table->integer('apartment_id')->nullable()->comment('Tòa nhà, được map với id trong bảng apartment');
            $table->integer('room_id')->nullable()->comment('Phòng, được map với id trong bảng room');

            // Các cột lưu liên kết
            $table->integer('is_save2soquy')->nullable()->comment('Lưu sang sổ quỹ, show dạng checkbox');
            $table->integer('is_save_purchase_orders')->nullable()->comment('Lưu sang đơn mua hàng, show dạng checkbox');

            MigrateService::createBaseColumn($table);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aitilen_dau_tu');
    }
};
