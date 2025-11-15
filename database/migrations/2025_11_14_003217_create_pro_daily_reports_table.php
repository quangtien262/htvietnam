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
        Schema::create('pro___daily_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('admin_user_id');
            $table->date('report_date');
            $table->text('notes')->nullable();
            $table->text('blockers')->nullable();
            $table->text('plan_tomorrow')->nullable();
            $table->enum('status', ['draft', 'submitted', 'approved'])->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->unique(['admin_user_id', 'report_date']);
            $table->index('report_date');
            $table->index('status');

            // Foreign key
            $table->foreign('admin_user_id')
                ->references('id')
                ->on('admin_users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pro___daily_reports');
    }
};
