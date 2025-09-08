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
        Schema::create('languages', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->text('icon')->nullable();
            $table->integer('is_key')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('create_by')->default(1)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->timestamps();
        });

        $order_col = 1;
        $languages = MigrateService::createTable02('languages','Ngôn ngữ', ['parent_id' => 0 ]);
        MigrateService::createColumn02( $languages->id, 'name', 'Tên ngôn ngữ', 'TEXT', 'text', $order_col++, ['show_in_list'=>1, 'is_view_detail'=>1]);
        MigrateService::createColumn02( $languages->id, 'code', 'Mã ngôn ngữ', 'TEXT', 'text', $order_col++, ['show_in_list'=>1]);
        MigrateService::createColumn02( $languages->id, 'icon', 'Icon', 'TEXT', 'image', $order_col++, ['show_in_list'=>1]);
        
        $confirm = DB::table('tables')->where('name', 'confirm')->first();
        MigrateService::createColumn02( $languages->id, 'is_key', 'Icon', 'TEXT', 'image', $order_col++, 
        ['show_in_list'=>1, 'edit' => 0, 'select_table_id' => $confirm->id]);
        
        MigrateService::baseColumn($languages);

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('languages');
    }
};
