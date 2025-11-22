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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->string('code')->nullable();
            $table->text('description')->nullable();

            $table->integer('task_category_id')->nullable();
            $table->string('parent_name')->nullable();
            $table->integer('project_id')->default(0)->nullable();
            $table->integer('user_id')->nullable(); // id khách hàng
            $table->integer('task_status_id')->default(1)->nullable(); // todo, doing, done
            $table->integer('nguoi_thuc_hien')->nullable(); // nv thực hiện
            $table->text('nguoi_theo_doi')->nullable(); // json người theo dõi hoặc làm cùng
            $table->integer('task_priority_id')->nullable();
            $table->text('task_type_ids')->nullable();
            $table->date('start')->nullable();
            $table->date('end')->nullable();
            $table->date('actual')->nullable();
            $table->text('tags')->nullable();
            $table->integer('status_order')->nullable();

            $table->integer('milestones_id')->nullable();

            $table->integer('is_daily')->default(0)->nullable();
            $table->integer('is_weekly')->default(0)->nullable();
            $table->integer('is_monthly')->default(0)->nullable();

            $table->integer('apartment_id')->default(null)->nullable();
            $table->integer('room_id')->default(null)->nullable();

            MigrateService::createBaseColumn($table);



        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
