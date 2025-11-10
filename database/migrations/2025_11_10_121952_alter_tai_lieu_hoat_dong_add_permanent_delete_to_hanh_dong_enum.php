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
        // Modify enum to add 'permanent_delete'
        DB::statement("ALTER TABLE `tai_lieu_hoat_dong` MODIFY COLUMN `hanh_dong` ENUM(
            'view', 'download', 'upload', 'edit', 'delete', 
            'share', 'revoke', 'comment', 'move', 'copy', 
            'rename', 'restore', 'star', 'unstar', 'permanent_delete'
        ) NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'permanent_delete' from enum
        DB::statement("ALTER TABLE `tai_lieu_hoat_dong` MODIFY COLUMN `hanh_dong` ENUM(
            'view', 'download', 'upload', 'edit', 'delete', 
            'share', 'revoke', 'comment', 'move', 'copy', 
            'rename', 'restore', 'star', 'unstar'
        ) NOT NULL");
    }
};
