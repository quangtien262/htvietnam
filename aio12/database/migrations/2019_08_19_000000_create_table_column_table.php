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
        Schema::create('table_column', function (Blueprint $table) {
            $table->id();
            $table->integer('table_id')->default(0)->nullable();
            $table->string('name')->nullable();
            $table->string('display_name');
            $table->string('placeholder')->nullable();
            $table->string('type')->nullable();
            $table->string('value_default')->nullable();
            $table->integer('is_null')->nullable();
            $table->integer('max_length')->nullable();
            $table->integer('edit')->default(0)->nullable();
            $table->integer('add2search')->nullable();
            $table->integer('search_type')->nullable();
            $table->string('type_edit')->nullable();
            $table->integer('show_in_list')->nullable();
            $table->integer('show_in_detail')->default(0)->nullable();
            $table->integer('require')->default(0)->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('parent_id')->default(0)->nullable();
            $table->integer('select_table_id')->nullable();
            $table->text('conditions')->nullable();
            $table->text('data_select')->nullable();
            $table->integer('fast_edit')->nullable();
            $table->integer('table_link')->nullable();
            $table->text('class')->nullable();
            $table->string('ratio_crop')->default(1);
            $table->integer('sub_list')->nullable();
            $table->string('sub_column_name')->nullable();
            $table->string('config_add_sub_table')->nullable();
            $table->integer('bg_in_list')->default(0)->nullable();
            $table->text('add_column_in_list')->nullable();
            $table->string('column_name_map_to_comment')->nullable();
            $table->integer('is_show_total')->nullable();
            $table->integer('is_show_btn_auto_get_total')->nullable();
            $table->integer('is_view_detail')->nullable();
            $table->integer('is_show_id')->nullable();
            $table->integer('show_length')->nullable();
            $table->text('links')->nullable();
            $table->string('block_type')->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->integer('is_recycle_bin')->default(0)->nullable();
            $table->integer('add_express')->default(0)->nullable();
            $table->integer('col')->default(12)->nullable();
            $table->integer('is_multiple_language')->default(0)->nullable();
            $table->text('auto_generate_code')->nullable();
            $table->integer('hide_add')->default(0)->nullable();
            $table->integer('hide_edit')->default(0)->nullable();
            $table->integer('show_default')->default(0)->nullable();
            $table->text('config')->nullable();
            $table->integer('check_all_selects')->nullable();
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
        Schema::dropIfExists('table_column');
    }
};
