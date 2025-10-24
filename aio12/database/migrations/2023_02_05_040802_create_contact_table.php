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
        Schema::create('contact', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('title')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('product_name')->nullable();
            $table->string('product_id')->nullable();
            $table->string('content')->nullable();
            $table->string('country_id')->nullable();
            $table->string('is_view')->nullable();

            $table->text('services')->nullable();
            
            MigrateService::createBaseColumn($table);
        });

        $order = 1;
        $user = Table::where('name', 'admin_users')->first();
        $contact =  MigrateService::createTable02('contact', 'Liên hệ', ['parent_id' => 0, 'is_edit' => 1]);
        // $this->createTable($id, 'contact', 'Liên hệ', 2, 0, 1, 309);
        MigrateService::createColumn02($contact->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($contact->id, 'name', 'Họ tên', 'TEXT', 'text', $order++, ['show_in_list' => 1, 'is_view_detail' => 1]);
        MigrateService::createColumn02($contact->id, 'title', 'Tiêu đề', 'TEXT', 'text', $order++, ['show_in_list' => 1, 'is_view_detail' => 1]);
        MigrateService::createColumn02($contact->id, 'email', 'Email', 'TEXT', 'text', $order++, ['show_in_list' => 1]);
        MigrateService::createColumn02($contact->id, 'phone', 'Điện thoại', 'TEXT', 'text', $order++, ['show_in_list' => 1]);
        MigrateService::createColumn02($contact->id, 'content', 'Nội dung', 'longtext', 'text', $order++);
        MigrateService::createColumn02($contact->id, 'create_by', 'Tạo bởi', 'INT', config('constant.config_table.type_edit.select'), $order++, ['select_table_id' => $user->id, 'edit' => 0]);
        MigrateService::createColumn02($contact->id, 'created_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
        MigrateService::createColumn02($contact->id, 'updated_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('contact');
    }
};
