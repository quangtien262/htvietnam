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
            Schema::create('so_quy_type', function (Blueprint $table) {
                $table->id();
                $table->string('name')->nullable();
                $table->string('color')->nullable();
                $table->string('icon')->nullable();
                $table->text('note')->nullable();
                
                $table->string('display_name')->nullable();
                $table->integer('parent_id')->default(0)->nullable();
                $table->integer('sort_order')->default(0)->nullable();
                $table->integer('create_by')->default(0)->nullable();
                $table->integer('is_recycle_bin')->default(0)->nullable();
                $table->timestamps();
            });

            Table::create([
                //require
                'name' => 'so_quy_type',
                'display_name' => 'Loại Sổ quỹ',
                'parent_id' => 0,
                'sort_order' => 0,
                'type_show' => config('constant.type_show.basic'),
                'count_item_of_page' => 30,
                'is_edit' => 0, // 1 hiển thị ở menu; 0 không hiển thị
                'form_data_type' => 1,
                'have_delete' => 1,
                'have_add_new' => 1,
                'is_show_btn_detail' => 1,
                'is_show_btn_edit' => 1,
                'tab_table_id' => 0,
                'tab_table_name' => '',
                'table_data' => '',
                'is_label' => 0,
            ]);
            $tbl = Table::where('name', 'so_quy_type')->first();
            $tableId = $tbl->id;
            $order_col = 1;
            MigrateService::createColumn($tableId, 'id', 'id', 'INT', 'number', $order_col++, 0, 0, 0, 1, 0);
            MigrateService::createColumn02($tableId, 'name', 'Tên loại', 'VARCHAR', 'text', $order_col++, 
            ['is_view_detail' => 1, 'show_in_list' => 1, 'edit' => 0]);
            MigrateService::createColumn02($tableId, 'color', 'Màu đánh dấu', 'VARCHAR', 'color', $order_col++, 
            ['is_view_detail' => 1, 'show_in_list' => 1, 'edit' => 1]);
            
            MigrateService::baseColumn($tbl);
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('so_quy_type');
        }
    };
