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
        Schema::create('landingpage', function (Blueprint $table) {
            $table->id();
            $table->text('type')->nullable();
            $table->text('name')->nullable(); //title
            $table->integer('active')->default(1)->nullable();
            $table->text('sub_title')->nullable();
            $table->text('sub_title01')->nullable();
            $table->text('sub_title02')->nullable();
            $table->text('sub_title03')->nullable();
            $table->text('sub_title04')->nullable();
            $table->text('sub_title05')->nullable();
            $table->text('description01')->nullable();
            $table->text('description02')->nullable();
            $table->text('description03')->nullable();
            $table->text('description04')->nullable();
            $table->text('description05')->nullable();
            $table->text('description_json01')->nullable();
            $table->text('description_json02')->nullable();
            $table->text('description_json03')->nullable();
            $table->text('description_json04')->nullable();
            $table->text('description_json05')->nullable();
            $table->text('link_1')->nullable();
            $table->text('link_2')->nullable();
            $table->text('link_3')->nullable();
            $table->text('link_4')->nullable();
            $table->text('link_5')->nullable();
            $table->longtext('images')->nullable();
            $table->text('image01')->nullable();
            $table->text('image02')->nullable();
            $table->text('image03')->nullable();
            $table->text('image04')->nullable();
            $table->text('image05')->nullable();
            $table->text('icon01')->nullable();
            $table->text('icon02')->nullable();
            $table->text('icon03')->nullable();
            $table->text('icon04')->nullable();
            $table->text('icon05')->nullable();
            $table->integer('is_show_btn_register')->nullable();
            $table->integer('is_show_hotline')->nullable();
            $table->integer('menu_id')->default(0)->nullable();
            $table->integer('language_id')->default(0)->nullable(); // ĐỊnh dạng ngôn ngữ cho trang web

            MigrateService::createBaseColumn($table);

        });

        $order = 0;
        $user = Table::where('name', 'admin_users')->first();
        $landingpage = MigrateService::createTable02('landingpage', 'Cài đặt page', ['is_edit' => 0]);
        MigrateService::createColumn02($landingpage->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($landingpage->id, 'name', 'Tiêu đề', 'TEXT', 'text', $order++);
        MigrateService::createColumn02($landingpage->id, 'sub_title', 'Nội dung', 'TEXT', 'text', $order++);
        MigrateService::createColumn02($landingpage->id, 'description01', 'Nội dung', 'LONGTEXT', 'text', $order++);
        MigrateService::createColumn02($landingpage->id, 'description02', 'Nội dung', 'LONGTEXT', 'text', $order++);
        MigrateService::createColumn02($landingpage->id, 'description03', 'Nội dung', 'LONGTEXT', 'text', $order++);
        MigrateService::createColumn02($landingpage->id, 'description04', 'Nội dung', 'LONGTEXT', 'text', $order++);
        MigrateService::createColumn02($landingpage->id, 'description_json01', 'Nội dung', 'LONGTEXT', 'json', $order++);
        MigrateService::createColumn02($landingpage->id, 'description_json02', 'Nội dung', 'LONGTEXT', 'json', $order++);
        MigrateService::createColumn02($landingpage->id, 'description_json03', 'Nội dung', 'LONGTEXT', 'json', $order++);
        MigrateService::createColumn02($landingpage->id, 'description_json04', 'Nội dung', 'LONGTEXT', 'json', $order++);
        MigrateService::createColumn02($landingpage->id, 'images', 'Nội dung', 'TEXT', 'images_crop', $order++);
        MigrateService::createColumn02($landingpage->id, 'image01', 'Nội dung', 'LONGTEXT', 'image_crop', $order++);
        MigrateService::createColumn02($landingpage->id, 'image02', 'Nội dung', 'LONGTEXT', 'image_crop', $order++);
        MigrateService::createColumn02($landingpage->id, 'image03', 'Nội dung', 'LONGTEXT', 'image_crop', $order++);
        MigrateService::createColumn02($landingpage->id, 'image04', 'Nội dung', 'LONGTEXT', 'image_crop', $order++);
        MigrateService::createColumn02($landingpage->id, 'is_show_btn_register', 'Hiển thị nút đăng ký', 'INT', 'number', $order++);
        MigrateService::createColumn02($landingpage->id, 'is_show_hotline', 'Hiển thị hotline', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($landingpage->id, 'create_by', 'Tạo bởi', 'INT', config('constant.config_table.type_edit.select'), $order++, ['select_table_id' => $user->id, 'edit' => 0]);
        MigrateService::createColumn02($landingpage->id, 'created_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
        MigrateService::createColumn02($landingpage->id, 'updated_at', 'Ngày sửa', 'DATETIME', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landingpage');
    }
};
