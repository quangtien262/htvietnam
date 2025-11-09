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
        // Bước 1: Thêm cột status_id tạm thời
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->unsignedBigInteger('status_id')->nullable()->after('status');
        });

        // Bước 2: Migrate data từ status (string) sang status_id (int)
        $statusMap = DB::table('purchase_order_statuses')
            ->select('id', 'name')
            ->get()
            ->keyBy('name')
            ->map(fn($item) => $item->id)
            ->toArray();

        // Map old string values to new IDs
        $oldToNewMap = [
            'draft' => $statusMap['Nháp'] ?? null,
            'sent' => $statusMap['Đã gửi'] ?? null,
            'receiving' => $statusMap['Đang nhận hàng'] ?? null,
            'completed' => $statusMap['Hoàn thành'] ?? null,
            'cancelled' => $statusMap['Đã hủy'] ?? null,
        ];

        foreach ($oldToNewMap as $oldValue => $newId) {
            if ($newId) {
                DB::table('purchase_orders')
                    ->where('status', $oldValue)
                    ->update(['status_id' => $newId]);
            }
        }

        // Bước 3: Xóa cột status cũ
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropIndex(['status']); // Drop index trước
            $table->dropColumn('status');
        });

        // Bước 4: Rename status_id thành status
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->renameColumn('status_id', 'status');
        });

        // Bước 5: Thêm foreign key và index
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->foreign('status')->references('id')->on('purchase_order_statuses')->onDelete('restrict');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse process
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropForeign(['status']);
            $table->dropIndex(['status']);
        });

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->renameColumn('status', 'status_id');
        });

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->string('status', 20)->default('draft')->after('status_id');
        });

        // Migrate back data
        $statusMap = DB::table('purchase_order_statuses')
            ->select('id', 'name')
            ->get()
            ->keyBy('id')
            ->map(fn($item) => $item->name)
            ->toArray();

        $newToOldMap = [
            $statusMap[1] ?? 'Nháp' => 'draft',
            $statusMap[2] ?? 'Đã gửi' => 'sent',
            $statusMap[3] ?? 'Đang nhận hàng' => 'receiving',
            $statusMap[4] ?? 'Hoàn thành' => 'completed',
            $statusMap[5] ?? 'Đã hủy' => 'cancelled',
        ];

        foreach ($newToOldMap as $statusName => $oldValue) {
            $statusId = DB::table('purchase_order_statuses')->where('name', $statusName)->value('id');
            if ($statusId) {
                DB::table('purchase_orders')
                    ->where('status_id', $statusId)
                    ->update(['status' => $oldValue]);
            }
        }

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropColumn('status_id');
            $table->index('status');
        });
    }
};
