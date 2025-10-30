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
        Schema::create('about', function (Blueprint $table) {
            $table->id();
            $table->string('menu_id')->nullable();
            $table->string('name')->nullable();
            $table->text('image')->nullable();
            $table->integer('parent_id')->default(0);
            $table->integer('sort_order')->default(0);
            $table->integer('create_by')->default(0)->nullable();
            $table->timestamps();
        });

        $order_col = 1;
        $about=  MigrateService::createTable02('about','Giới thiệu',
        ['is_multiple_language' => 1, 'table_data' => 'about_data','parent_id' => 0,'is_edit'=>0]);

        MigrateService::createColumn02($about->id, 'name', 'Tên', 'TEXT', 'text', $order_col++, 
        ['edit'=>0, 'show_in_list'=>1]);
        MigrateService::createColumn02($about->id, 'image', 'Hình ảnh', 'TEXT', 'image', $order_col++);

        MigrateService::baseColumn($about);
        

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('about');
    }
};
