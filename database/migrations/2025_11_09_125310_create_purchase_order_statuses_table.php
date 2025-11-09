<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('purchase_order_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('value')->unique();
            $table->string('label');
            $table->string('color')->default('#1890ff');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Insert default statuses
        DB::table('purchase_order_statuses')->insert([
            ['value' => 'draft', 'label' => 'Nháp', 'color' => '#d9d9d9', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['value' => 'sent', 'label' => 'Đã gửi', 'color' => '#1890ff', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['value' => 'receiving', 'label' => 'Đang nhận hàng', 'color' => '#faad14', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['value' => 'completed', 'label' => 'Hoàn thành', 'color' => '#52c41a', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['value' => 'cancelled', 'label' => 'Đã hủy', 'color' => '#ff4d4f', 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_statuses');
    }
};
