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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->text('description')->nullable();
            $table->integer('project_status_id')->default(1)->nullable();
            $table->text('nguoi_theo_doi')->nullable(); // json người theo dõi hoặc làm cùng
            $table->integer('nguoi_thuc_hien')->nullable(); // json người thực hiện
            $table->integer('project_manager')->nullable(); //admin_users_id

            $table->string('parent_name')->nullable(); // tên tính năng: sale, task, project, tms....

             // nv thực hiện
            $table->text('project_type_id')->nullable();
            $table->date('start')->nullable();
            $table->date('end')->nullable();
            $table->date('actual')->nullable();
            $table->text('tags')->nullable();
            $table->integer('is_daily')->default(0)->nullable();
            $table->integer('is_weekly')->default(0)->nullable();
            $table->integer('is_monthly')->default(0)->nullable();

            MigrateService::createBaseColumn($table);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
