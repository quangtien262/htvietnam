<?php

use App\Models\Admin\Table;
use App\Services\MigrateService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tables', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable(); // tên bảng, dùng để tạo database
            $table->string('display_name')->nullable(); // tên hiển thị, dùng để hiển thị ở table list, form add/edit

            // Phần này dành cho web
            $table->text('title')->nullable();
            $table->text('title_desc')->nullable();
            $table->text('description')->nullable();
            $table->text('content')->nullable();

            // config table
            $table->integer('sort_order')->default(0)->nullable();
            
            // 'type_show' => [
            //     'basic' => 0,
            //     'drag_drop' => 1,
            //     'drag_drop_multiple' => 8,
            //     '1data' => 5,
            //     'landingpage' => 3,
            //     'block' => 4,
            //     'calendar' => 6,
            //     'file_manager' => 7
            // ],
            $table->integer('type_show')->default(0)->nullable();
            
            $table->string('model_name')->nullable();
            $table->integer('count_item_of_page')->default(30)->nullable();
            $table->integer('is_edit')->default(1)->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('form_data_type')->default(2)->nullable(); //1: new page, 2: popup
            $table->integer('import')->default(0)->nullable();
            $table->integer('export')->default(0)->nullable();
            $table->integer('have_delete')->default(1)->nullable();
            $table->integer('have_add_new')->default(1)->nullable();
            $table->integer('table_tab')->nullable();
            $table->integer('is_show_btn_edit')->default(1)->nullable();
            $table->integer('is_show_btn_detail')->default(0)->nullable();
            $table->integer('is_edit_express')->default(0)->nullable();
            $table->integer('is_add_express')->default(0)->nullable();
            $table->integer('have_insert_all')->default(0)->nullable();
            $table->integer('is_show_clone_btn')->default(0)->nullable();
            $table->integer('is_multiple_language')->default(0)->nullable();
            $table->text('table_data')->nullable();
            $table->text('table_tab_map_column')->nullable();
            $table->text('current_button')->nullable();
            $table->text('search_params_default')->nullable();
            $table->text('order_by')->nullable();
            $table->text('custom_link')->nullable();
            $table->text('config')->nullable();
            $table->text('check_seo')->nullable();
            $table->text('html')->nullable();
            $table->text('show_table_lien_quan')->nullable();
            $table->text('link')->nullable(); // link
            $table->text('script_form_edit')->nullable();
            $table->text('note')->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('tab_table_id')->default(0)->nullable();
            $table->string('tab_table_name')->nullable();
            $table->integer('is_label')->default(0)->nullable(); // chỉ là label, hiển thị ở menu. ko tạo database
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->string('route_name')->nullable();
            $table->integer('add_express')->default(0)->nullable(); // add/edit: hiển thị nút thêm nhanh ở form thêm/sửa
            $table->text('add_btn_from_route')->nullable(); // truyền json các tên router mà cần điều hướng đến
            $table->integer('show_in_menu')->default(1)->nullable(); // hiển thị ở menu left
            $table->integer('smart_search')->default(1)->nullable(); // hiển thị ô text search, tìm kiếm all, nhưng ngoài kiểu select và image
            $table->text('config_show_data')->nullable(); // add/edit: cài đặt show data theo select khi thêm/sửa, 
            $table->integer('setting_shotcut')->default(0)->nullable(); // show nút điều hướng sang màn hình cài đặt của bảng tương ứng
            $table->text('data_related')->nullable(); // detail: config data liên quan, hiển thị ở trang chi tiết
            $table->text('statistical_select')->nullable(); // thống kê theo select
            $table->integer('auto_add_draft')->default(0)->nullable(); // thống kê theo select
            $table->integer('search_position')->default(1)->nullable(); // 1:top; 2:left
            $table->integer('expandable')->default(1)->nullable(); // xem nhanh ở trang list
            $table->timestamps();



            // $order_col = 1;
            // Table::create([
            //     'name' => 'tables',
            //     'display_name' => 'tables',
            //     'sort_order' => 0,
            //     'type_show' => config('constant.type_show.basic'),
            //     'count_item_of_page' => 30,
            //     'is_edit' => 0,
            //     'form_data_type' => 2, //1: new page, 2: popup
            //     'expandable' => 1,
            //     'have_delete' => 1,
            //     'have_add_new' => 1,
            //     'parent_id' => 0,
            //     'is_show_btn_edit' => 1,
            //     'tab_table_id' => 0,
            //     'tab_table_name' => '',
            //     'table_data' => '',
            //     'is_label' => 0,
            // ]);
            // $tbl = Table::where('name', 'tables')->first();

            // MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++);
            // MigrateService::createColumn02($tbl->id, 'name', 'Tên bảng', 'VARCHAR', 'text', $order_col++,['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);
            // MigrateService::createColumn02($tbl->id, 'display_name', 'Tên hiển thị', 'VARCHAR', 'text', $order_col++,['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);



        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tables');
    }
};


// config_show_data: cài đặt show data theo select khi thêm/sửa, 
// $configShowData = [
//     'column' => 'type_hoa_don_id', // col selects
//     'data' => [ // show data master
//         1 => 'Hóa đơn bán lẻ',
//         2 => 'Hóa đơn thẻ lần',
//     ],
//     'config' => [ // config col cần show ra
//         1=>[
//             'col_name',....
//         ],
//         1=>[
//             'name',....
//         ],
//     ],
// ];


//data_related
// $data_related = [
//     [
//         'table'=>'table name', // bảng cần lấy ra
//         'column'=>'column name' // column name mà maping với bảng hiện tại
//     ]
// ];

//add_btn_from_route
// 'add_btn_from_route' => '{
//     "0": {
//         "name":"hima.merge_customer",
//         "display_name":"Gộp khách hàng",
//         "class":"success"
//     }
// }'