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
        Schema::create('loai_nha_cung_cap', function (Blueprint $table) {  //Nhà cung cấp
            $table->id();
            $table->string('code')->nullable(); //mã nhà cung cấp
            $table->string('name')->nullable(); //tên nhà cung cấp
            $table->string('color')->nullable();

            MigrateService::createBaseColumn($table);
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loai_nha_cung_cap');
    }
};
