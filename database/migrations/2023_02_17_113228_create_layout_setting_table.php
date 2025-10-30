<?php

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
        Schema::create('layout_setting', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable(); // layout01, layout02....
            $table->string('description')->nullable(); // ex: Đồ gỗ 01, Mỹ phẩm ,,,,
            $table->string('type')->nullable(); // ban_hang, du_lich, my_pham, noi_that, bds, news,
            $table->longText('setting')->nullable(); // json: cài đặt các chức năng trong quản trị
            $table->integer('create_by')->default(0)->nullable();
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
        Schema::dropIfExists('layout_setting');
    }
};
