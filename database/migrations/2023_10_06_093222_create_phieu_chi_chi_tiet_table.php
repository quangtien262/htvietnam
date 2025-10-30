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
                Schema::create('phieu_chi_chi_tiet', function (Blueprint $table) {
                        $table->id();
                        $table->string('name')->nullable();
                        $table->integer('phieu_chi_id')->nullable(); 
                        $table->dateTime('thoi_gian')->nullable(); 
                        $table->integer('gia_tri_phieu')->nullable(); 
                        $table->integer('note')->nullable(); 

                        // product_info
                        $table->integer('product_id')->nullable(); 
                        $table->integer('product_code')->nullable();  

                        $table->integer('parent_id')->default(0)->nullable();
                        $table->integer('sort_order')->default(0)->nullable();
                        $table->integer('create_by')->default(0)->nullable();
                        $table->integer('is_recycle_bin')->default(0)->nullable();
                        $table->timestamps();
                });

                Table::create([
                        //require
                        'name' => 'phieu_chi_chi_tiet',
                        'display_name' => 'Phiếu chi chi tiết',
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
                ]);
                $tbl = Table::where('name', 'phieu_chi_chi_tiet')->first();
                $tableId = $tbl->id;
                $order_col = 1;
                MigrateService::createColumn02(
                        $tableId,
                        'code',
                        'Mã phiếu chi',
                        'VARCHAR',
                        'text',
                        $order_col++,
                        ['show_in_list' => 1, 'is_view_detail' => 1, 'auto_generate_code' => '{"edit":0, "prefix":"PCHI", "length":5}']
                );
                
                MigrateService::baseColumn($tbl);
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
                Schema::dropIfExists('phieu_chi_chi_tiet');
        }
};
