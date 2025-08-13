<?php

use App\Models\Admin\Column;
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
        Schema::create('file_manager', function (Blueprint $table) {
            $table->id();
            $table->text('name')->nullable();
            $table->text('alt')->nullable();
            $table->text('path')->nullable();
            $table->text('url')->nullable();
            $table->text('url_thumb')->nullable();
            $table->string('type')->nullable();
            $table->integer('size')->nullable();
            $table->longText('share')->nullable();
            $table->string('is_share_all')->nullable();
            MigrateService::createBaseColumn($table);
        });
        
        Table::create([
            //require
            'name' => 'file_manager',
            'display_name' => 'Tài liệu',
            'parent_id' => 0,
            'sort_order' => 100,
            'type_show' => 7, // file
            'count_item_of_page' => 30,
            'is_edit' => 1, 
            'form_data_type' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,
            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
        ]);
        $tbl = Table::where('name', 'file_manager')->first();
        $tableId = $tbl->id;
        $order_col = 1;
        
        $thoi_gian = Column::where('table_id', $tableId)->where('name', 'ttap')->first();

        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($tableId, 'name', 'Tên file', 'VARCHAR', 'text', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tableId, 'size', 'Dung lượng', 'INT', 'text', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tableId, 'type', 'Loại', 'VARCHAR', 'text', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tableId, 'path', 'Path', 'text', 'text', $order_col++, ['show_in_list' => 1]);
        MigrateService::createColumn02($tableId, 'url', 'URL', 'text', 'text', $order_col++, ['show_in_list' => 0]);

        MigrateService::createColumn02($tableId, 'create_by', 'Người tạo', 'INT', 'select', $order_col++);
        MigrateService::createColumn02($tableId, 'created_at', 'Ngày sửa', 'DATETIME', 'datetime', $order_col++);
        MigrateService::createColumn02($tableId, 'updated_at', 'Ngày tạo', 'DATETIME', 'datetime', $order_col++);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('file_manager');
    }
};
