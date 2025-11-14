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
        Schema::create('pro___meeting_status', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('color', 20)->nullable()->comment('Màu hiển thị');
            $table->text('note')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Insert default statuses
        DB::table('pro___meeting_status')->insert([
            [
                'name' => 'Sắp diễn ra',
                'color' => '#1890ff',
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Đang diễn ra',
                'color' => '#52c41a',
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Đã hoàn thành',
                'color' => '#8c8c8c',
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Đã hủy',
                'color' => '#ff4d4f',
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pro___meeting_status');
    }
};
