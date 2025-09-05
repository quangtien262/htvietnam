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
        Schema::create('emails', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->text('country_id')->nullable();
            $table->text('description')->nullable();

            $table->longText('permission')->nullable();
            
            MigrateService::createBaseColumn($table);
        });

        $order_col = 1;

        $tbl = MigrateService::createTable02('emails', 'Emails', [
            'is_edit' => 1,
            'form_data_type' => 2
        ]);
        
        MigrateService::createColumn02($tbl->id, 'id', 'id', 'INT', 'number', $order_col++,['edit' =>0]);
        MigrateService::createColumn02($tbl->id, 'name', 'Email', 'VARCHAR', 'text', $order_col++,
        ['require' => 1,'is_view_detail' => 1,'add2search' => 1,'show_in_list' => 1]);

        $country = Table::where('name', 'countries')->first();
        MigrateService::createColumn02($tbl->id, 'country_id', 'Quốc Gia', 'TEXT', 
        'selects', $order_col++, 
        ['show_in_list' => 1,'select_table_id' => $country->id]);

        MigrateService::createColumn02($tbl->id, 'description', 'Mô tả', 'TEXT', 'textarea', $order_col++, 
        ['show_in_list' => 1, 'fast_edit' => 1]);

        MigrateService::baseColumn($tbl);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emails');
    }
};
