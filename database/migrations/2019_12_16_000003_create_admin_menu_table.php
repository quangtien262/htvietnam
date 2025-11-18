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
            $table->string('name')->nullable();
            $table->integer('color')->nullable(); // is_active
            $table->string('icon')->nullable(); // icon
            $table->string('note')->nullable(); // tên hiển thị
            $table->integer('sort_order')->nullable();

            $table->timestamps();
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
