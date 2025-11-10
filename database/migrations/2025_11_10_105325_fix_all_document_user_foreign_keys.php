<?php

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
        // Bỏ toàn bộ ràng buộc foreign key để dễ maintain hơn
        // Nếu cần, chỉ giữ lại các cột dữ liệu, không tạo/drop foreign key
        // (Không thực hiện thao tác gì ở đây)
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Không restore lại foreign key, giữ nguyên trạng thái không ràng buộc
        // (Không thực hiện thao tác gì ở đây)
    }
};
