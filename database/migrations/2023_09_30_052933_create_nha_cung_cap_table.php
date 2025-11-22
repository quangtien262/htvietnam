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
        Schema::create('nha_cung_cap', function (Blueprint $table) {  //Nhà cung cấp
            $table->id();
            $table->string('code')->nullable(); //mã nhà cung cấp
            $table->string('name')->nullable(); //tên nhà cung cấp
            $table->string('tax_code')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('nha_cung_cap_status_id')->nullable(); //trạng thái nhà cung cấp
            $table->string('loai_nha_cung_cap_id')->nullable(); //trạng thái nhà cung cấp
            $table->string('email')->nullable();
            $table->string('link_web')->nullable();
            $table->string('note')->nullable(); //Ghi chú
            $table->string('user_contact')->nullable(); //người liên hệ

           MigrateService::createBaseColumn($table);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nha_cung_cap');
    }
};
