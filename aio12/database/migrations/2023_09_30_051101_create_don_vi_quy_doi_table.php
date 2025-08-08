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
        Schema::create('don_vi_quy_doi', function (Blueprint $table) {
            $table->id();
            $table->integer('name')->nullable();
            $table->integer('product_id')->nullable();
            $table->integer('don_vi_id')->nullable();
            $table->integer('ty_le_quy_doi_theoDVChinh')->nullable(); // gia tri so với đơn vị chính
            $table->integer('ty_le_quy_doi_theoDVQuyDoi')->nullable();
            $table->integer('gia_nhap_quy_doi')->nullable(); // giá bán sau khi quy đổi
            $table->integer('gia_ban_quy_doi')->nullable(); // giá bán sau khi quy đổi
            $table->string('ten_don_vi')->nullable();
            
            MigrateService::createBaseColumn($table);

        });
        $order_col = 1;
        $tbl = MigrateService::createTable02('don_vi_quy_doi', 'Đơn vị chuyển đổi', ['is_edit' => 0]);
        
        MigrateService::createColumn02($tbl->id, 'name', 'Tỷ lệ chuyển đổi', 'INT', 'number', $order_col++,
        ['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 0]);

        MigrateService::baseColumn($tbl);
     
       
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('don_vi_quy_doi');
    }
};
