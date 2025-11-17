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
            $table->string('parameter')->nullable(); // parameter truyền vào if exists
            // Phần này dành cho web
            $table->string('icon')->nullable();
            $table->string('route')->nullable(); // tên route
            $table->string('table_name')->nullable();
            $table->string('link')->nullable(); // liên kết nếu có
            $table->string('is_active')->default(1)->nullable(); // trạng thái hoạt động, 1: active, 0: inactive
            $table->integer('sort_order')->default(0)->nullable();

            $table->integer('is_draft')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();

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
