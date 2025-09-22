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
     *
     * @return void
     */
    public function up()
    {
        Schema::create('admin_menu', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable(); // tên bảng, dùng để tạo database
            $table->string('display_name')->nullable(); // tên hiển thị, dùng để hiển thị ở table list, form add/edit

            // Phần này dành cho web
            $table->string('icon')->nullable();
            $table->string('route')->nullable(); // tên route
            $table->string('table_name')->nullable();
            $table->string('link')->nullable(); // liên kết nếu có
            $table->string('is_active')->default(1)->nullable(); // trạng thái hoạt động

            MigrateService::createBaseColumn($table);



            $order_col = 1;
            Table::create([
                'name' => 'admin_menu',
                'display_name' => 'Admin menu',
                'sort_order' => 0,
                'type_show' => config('constant.type_show.basic'),
                'count_item_of_page' => 30,
                'is_edit' => 0,
                'form_data_type' => 2, //1: new page, 2: popup
                'expandable' => 1,
                'have_delete' => 1,
                'have_add_new' => 1,
                'parent_id' => 0,
                'is_show_btn_edit' => 1,
                'tab_table_id' => 0,
                'tab_table_name' => '',
                'table_data' => '',
                'is_label' => 0,
            ]);
            $tbl = Table::where('name', 'admin_menu')->first();
            
            MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++);
            MigrateService::createColumn02($tbl->id, 'name', 'Tên bảng', 'VARCHAR', 'text', $order_col++,['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);
            MigrateService::createColumn02($tbl->id, 'display_name', 'Tên hiển thị', 'VARCHAR', 'text', $order_col++,['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);
        
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('admin_menu');
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