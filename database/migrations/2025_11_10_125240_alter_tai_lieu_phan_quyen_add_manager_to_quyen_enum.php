<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Thêm 'manager' vào enum quyen
        DB::statement("ALTER TABLE `tai_lieu_phan_quyen` MODIFY COLUMN `quyen` ENUM(
            'owner', 'manager', 'editor', 'commenter', 'viewer'
        ) NOT NULL DEFAULT 'viewer'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Xóa 'manager' khỏi enum quyen
        DB::statement("ALTER TABLE `tai_lieu_phan_quyen` MODIFY COLUMN `quyen` ENUM(
            'owner', 'editor', 'viewer', 'commenter'
        ) NOT NULL DEFAULT 'viewer'");
    }
};
