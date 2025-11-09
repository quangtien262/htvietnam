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
        Schema::create('loai_thu', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('color')->nullable();
            $table->string('icon')->nullable();
            $table->text('note')->nullable();

            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable(); 
            $table->timestamps();
        });
        Table::create([
            //require
            'name' => 'loai_thu',
            'display_name' => 'Loại thu',
            'parent_id' => 0,

            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 1, // 1 hiển thị ở menu; 0 không hiển thị
            'form_data_type' => 2,
            'have_delete' => 1,
            'have_add_new' => 1,

            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);

        $tbl = Table::where('name', 'loai_thu')->first();
        $order_col = 1;
        
         MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++);
         MigrateService::createColumn02($tbl->id, 'name', 'Loại Thu', 'VARCHAR', 'text', $order_col++, 
         ['require' => 1,'is_view_detail' => 1]);
         MigrateService::createColumn02($tbl->id, 'color', 'Màu đánh dấu', 'VARCHAR', 'color', $order_col++, 
         ['require' => 1,'is_view_detail' => 1]);
        MigrateService::createColumn02($tbl->id, 'note', 'Ghi chú', 'TEXT', 'textarea', $order_col++);

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loai_thu');
    }
};
