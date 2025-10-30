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
            Schema::create('product_unit', function (Blueprint $table) {
                $table->id();
                $table->string('name')->nullable();
                $table->string('unit')->nullable();
                $table->text('description')->nullable();

                MigrateService::createBaseColumn($table);
            });
            Table::create([
                'name' => 'product_unit',
                'display_name' => 'Đơn vị hàng hóa',
                'sort_order' => 0,
                'type_show' => config('constant.type_show.drag_drop'),
                'count_item_of_page' => 30,
                'is_edit' => 1,
                'form_data_type' => 1,
                'have_delete' => 1,
                'have_add_new' => 1,
                'parent_id' => 0,
                'is_show_btn_edit' => 1,
                'tab_table_id' => 0,
                'tab_table_name' => '',
                'table_data' => '',
                'is_label' => 0,
            ]);
            $tbl = Table::where('name', 'product_unit')->first();
            $tableId = $tbl->id;
            $order_col = 1;
            MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
            MigrateService::createColumn02($tableId, 'name', 'Đơn vị hàng hóa', 'VARCHAR', 'text', $order_col++, ['require' => 1, 'is_view_detail' => 1, 'add2search' => 1, 'show_in_list' => 1]);
            MigrateService::createColumn02($tableId, 'description', 'Mô tả ngắn', 'TEXT', 'textarea', $order_col++);
            $user = Table::where('name', 'admin_users')->first();
            MigrateService::createColumn02($tableId, 'create_by', 'Người tạo', 'VARCHAR', 'text', $order_col++, ['edit' => 0, 'select_table_id' => $user->id, 'add_express' => 1]);
            MigrateService::createColumn02($tableId, 'created_at', 'Ngày tạo', 'DATETIME', 'datetime', $order_col++, ['edit' => 0]);

            MigrateService::baseColumn($tbl);
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('product_unit');
        }
    };
