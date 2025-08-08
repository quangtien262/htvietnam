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
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->text('image')->nullable();
            $table->string('display_type')->nullable();
            $table->integer('position')->default(0)->nullable(); // 1 is MenuTop 0 is MenuLeft
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->string('type_sub_menu')->default(0)->nullable();
            $table->integer('is_front')->nullable();
            $table->integer('is_front_right')->nullable();
            $table->text('current_link')->nullable();
            $table->string('icon')->nullable();
            $table->text('link_crawl')->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->integer('is_active')->default(1)->nullable();
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
        Schema::dropIfExists('menus');
    }
};
