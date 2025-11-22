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
        Schema::create('task_checklist', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->text('content')->nullable();
            $table->integer('nguoi_thuc_hien')->nullable(); // nv thực hiện
            $table->text('nguoi_theo_doi')->nullable(); // // json người theo dõi hoặc làm cùng
            $table->integer('task_id')->nullable();
            $table->integer('is_checked')->default(0)->nullable();
            $table->string('parent_name')->nullable();

            MigrateService::createBaseColumn($table);


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_checklist');
    }
};
