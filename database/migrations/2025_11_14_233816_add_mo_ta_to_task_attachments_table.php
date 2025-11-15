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
        Schema::table('pro___task_attachments', function (Blueprint $table) {
            $table->text('mo_ta')->nullable()->after('uploaded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pro___task_attachments', function (Blueprint $table) {
            $table->dropColumn('mo_ta');
        });
    }
};
