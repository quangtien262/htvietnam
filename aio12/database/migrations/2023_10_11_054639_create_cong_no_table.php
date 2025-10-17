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
            Schema::create('cong_no', function (Blueprint $table) {
                $table->id();

                $table->string('name')->nullable();
                $table->string('code')->nullable();

                $table->integer('users_id')->nullable(); 
                $table->integer('nha_cung_cap_id')->default(0)->nullable(); 
                
                // product_tra_hang_ncc, product_nhap_hang, 
                // hoa_don, product_khach_tra_hang
                $table->string('loai_chung_tu')->nullable(); 
                $table->integer('chung_tu_id')->default(0)->nullable(); 
                $table->string('ma_chung_tu')->nullable(); 

                $table->integer('product_id')->default(0)->nullable(); 
                $table->string('product_code')->nullable(); 

                $table->integer('tong_tien_hoa_don')->default(0)->nullable(); 
                $table->integer('so_tien_da_thanh_toan')->default(0)->nullable(); 
                $table->integer('so_tien_no')->default(0)->nullable(); 
                $table->integer('cong_no_status_id')->default(0)->nullable(); 
                $table->date('ngay_hen_tat_toan')->nullable(); 
                $table->date('ngay_tat_toan')->nullable(); // ngay tất toán thực tế

                $table->date('info')->nullable(); 
                
                MigrateService::createBaseColumn($table);

            });

            
            Table::create([
                //require
                'name' => 'cong_no',
                'display_name' => 'Công nợ',
                'parent_id' => 0,
                'sort_order' => 0,
                'type_show' => config('constant.type_show.basic'),
                'count_item_of_page' => 30,
                'is_edit' => 1, // 1 hiển thị ở menu; 0 không hiển thị
                'form_data_type' => 1,
                'have_delete' => 0,
                'have_add_new' => 0,
                'is_show_btn_edit' => 0,
                'tab_table_id' => 0,
                'tab_table_name' => '',
                'table_data' => '',
                'is_label' => 0,
                'auto_add_draft' => 1
            ]);
            $tbl = Table::where('name', 'cong_no')->first();
            $tableId = $tbl->id;
            $order_col = 1;
            // card
            
            MigrateService::createColumn02($tableId, 'name', 'Tiêu đề', 'VARCHA', 'text', $order_col++, 
             ['require' => 0, 'col' => 12 , 'add_express' => 1]);
            MigrateService::createColumn02($tableId, 'code', 'Mã công nợ', 'VARCHAR', 'text', $order_col++,
            ['is_view_detail' => 1, 'show_in_list' => 1, 'edit' => 0,'auto_generate_code' => '{"edit":0, "prefix":"CN", "length":5}']);


            $ncc = Table::where('name', 'nha_cung_cap')->first();
            MigrateService::createColumn02($tableId, 'nha_cung_cap_id', 'Nhà cung cấp', 'INT', 'select', $order_col++, 
             ['select_table_id' => $ncc->id, 'edit' => 0, 'require' => 0, 'col' => 12 , 'add_express' => 1, 'show_in_list' => 1]);

            $user = Table::where('name', 'users')->first();
            MigrateService::createColumn02($tableId, 'users_id', 'Khách Hàng', 'INT', 'select', $order_col++, 
             ['select_table_id' => $user->id, 'edit' => 0, 'require' => 0, 'col' => 12 , 'add_express' => 1, 'show_in_list' => 1]);

            MigrateService::createColumn02($tableId, 'so_tien_no', 'Số tiền', 'INT', 'number', $order_col++, 
             ['require' => 1, 'col' => 12 , 'add_express' => 1, 'show_in_list' => 1]);

            $status = Table::where('name', 'cong_no_status')->first();
            MigrateService::createColumn02($tableId, 'cong_no_status_id', 'Trạng thái', 'INT', 'select', $order_col++, 
             ['select_table_id' => $status->id, 'edit' => 1, 'require' => 1, 'col' => 12 , 'add_express' => 1, 'show_in_list' => 1]);

            MigrateService::createColumn02($tableId, 'ngay_hen_tat_toan', 'Ngày hẹn tất toán', 'DATE', 'date', $order_col++, 
             ['require' => 0, 'col' => 12 , 'add_express' => 1, 'show_in_list' => 1]);

            MigrateService::createColumn02($tableId, 'ngay_tat_toan', 'Ngày tất toán', 'DATE', 'date', $order_col++, 
             ['require' => 0, 'col' => 12 , 'add_express' => 1, 'edit' => 0, 'show_in_list' => 0]);

            MigrateService::baseColumn($tbl);
            
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('cong_no');
        }
    };
