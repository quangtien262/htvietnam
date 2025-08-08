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
            Schema::create('nhan_vien_tu_van', function (Blueprint $table) {
                $table->id();
                $table->string('lucky_id')->nullable();
                $table->string('name')->nullable();
                $table->integer('nhan_vien_id')->nullable();

                $table->integer('chung_tu_id')->nullable();
                $table->string('loai_chung_tu')->nullable(); // ten bang
                $table->string('ma_chung_tu')->nullable();

                $table->integer('chung_tu_chi_tiet_id')->nullable();
                $table->integer('TienChietKhau')->nullable();
                $table->integer('phan_tram_chiet_khau')->nullable();
                $table->integer('LaPhanTram')->default(1)->nullable();
                $table->text('DienGiai')->nullable();
                
                MigrateService::createBaseColumn($table);
            });
            
            
            
            
            Table::create([
                //require
                'name' => 'nhan_vien_tu_van',
                'display_name' => 'Nhân viên tư vấn',
                'parent_id' => 0,
                'sort_order' => 0,
                'type_show' => config('constant.type_show.basic'),
                'count_item_of_page' => 30,
                'is_edit' => 0, // 1 hiển thị ở menu; 0 không hiển thị
                'form_data_type' => 1,
                'have_delete' => 1,
                'have_add_new' => 1,
                'is_show_btn_edit' => 1,
                'tab_table_id' => 0,
                'tab_table_name' => '',
                'table_data' => '',
                'is_label' => 0,
                'auto_add_draft' => 1
            ]);

            $order_col = 1;
            $tbl = Table::where('name', 'nhan_vien_tu_van')->first();
            $tableId = $tbl->id;
            MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
            MigrateService::createColumn02($tableId, 'name', 'Hóa đơn', 'VARCHAR', 'text', $order_col++, ['edit' => 0]);

            MigrateService::baseColumn($tbl);
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('nhan_vien_tu_van');
        }
    };
