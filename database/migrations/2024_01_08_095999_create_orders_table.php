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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->integer('user_id')->nullable();
            $table->string('product_id')->nullable();
            $table->integer('bds_id')->nullable();
            $table->integer('price')->nullable();
            $table->integer('promo_price')->nullable();
            $table->text('note')->nullable();
            $table->integer('quantity')->nullable();
            $table->integer('is_payment')->default(0)->nullable();
            $table->integer('invoice')->default(0)->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->integer('is_view')->nullable();
            
            MigrateService::createBaseColumn($table);
        });

        
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('orders');
    }
};
