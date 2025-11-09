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
        Schema::table('purchase_order_statuses', function (Blueprint $table) {
            $table->dropColumn('label');
        });

        // Update data: name sẽ chứa giá trị tiếng Việt
        DB::table('purchase_order_statuses')->where('name', 'draft')->update(['name' => 'Nháp']);
        DB::table('purchase_order_statuses')->where('name', 'sent')->update(['name' => 'Đã gửi']);
        DB::table('purchase_order_statuses')->where('name', 'receiving')->update(['name' => 'Đang nhận hàng']);
        DB::table('purchase_order_statuses')->where('name', 'completed')->update(['name' => 'Hoàn thành']);
        DB::table('purchase_order_statuses')->where('name', 'cancelled')->update(['name' => 'Đã hủy']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_order_statuses', function (Blueprint $table) {
            $table->string('label')->after('name');
        });

        // Restore old data structure
        DB::table('purchase_order_statuses')->where('name', 'Nháp')->update(['name' => 'draft', 'label' => 'Nháp']);
        DB::table('purchase_order_statuses')->where('name', 'Đã gửi')->update(['name' => 'sent', 'label' => 'Đã gửi']);
        DB::table('purchase_order_statuses')->where('name', 'Đang nhận hàng')->update(['name' => 'receiving', 'label' => 'Đang nhận hàng']);
        DB::table('purchase_order_statuses')->where('name', 'Hoàn thành')->update(['name' => 'completed', 'label' => 'Hoàn thành']);
        DB::table('purchase_order_statuses')->where('name', 'Đã hủy')->update(['name' => 'cancelled', 'label' => 'Đã hủy']);
    }
};
