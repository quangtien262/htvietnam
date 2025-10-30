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
        Schema::create('bds', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->integer('menu_id')->nullable();
            $table->integer('price')->nullable();
            $table->integer('promo_price')->nullable();
            $table->text('images')->nullable();
            $table->string('dien_tich')->nullable();
            $table->integer('bds_type_id')->nullable(); // cho thue, ban
            $table->integer('province_id')->default(0)->nullable();
            $table->integer('district_id')->default(0)->nullable();
            $table->integer('ward_id')->default(0)->nullable();
            $table->text('address')->nullable();
            $table->text('hop_dong_toi_thieu')->nullable();
            $table->text('tien_ich')->nullable();
            $table->longtext('description')->nullable();
            $table->longtext('content')->nullable();
            $table->text('meta_keyword')->nullable();
            $table->text('meta_description')->nullable();
            $table->integer('is_front')->nullable();
            $table->integer('con_hang')->default(1)->nullable();
            $table->text('khong_gian')->nullable();
            $table->text('vi_tri')->nullable();
            $table->text('cho_de_xe')->nullable();
            $table->text('vat_nuoi')->nullable();
            $table->integer('sort_order')->default(0)->nullable();
            $table->integer('create_by')->default(0)->nullable();
            $table->timestamps();
        });
        $order = 1;
        $menus = Table::where('name', 'menus')->first();
        $bds = MigrateService::createTable02('bds', 'QL bất động sản', ['is_edit' => 0]);
        MigrateService::createColumn02($bds->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0]);
        MigrateService::createColumn02($bds->id, 'name', 'Tiêu đề', 'VARCHAR', 'text', $order++,);
        MigrateService::createColumn02($bds->id, 'menu_id', 'Menu', 'INT', 'select', $order++, ['select_table_id' => $menus->id]);
        MigrateService::createColumn02($bds->id, 'price', 'Giá bán', 'INT', 'number', $order++);
        MigrateService::createColumn02($bds->id, 'promo_price', 'Giá khuyến mại', 'INT', 'number', $order++);

        // MigrateService::createColumn02($bds->id, 'khong_gian', 'Không gian', 'VARCHAR', 'text', $order++);
        // MigrateService::createColumn02($bds->id, 'vi_tri', 'Mô tả về vị trí', 'VARCHAR', 'text', $order++);
        // MigrateService::createColumn02($bds->id, 'dien_tich', 'Diện tích', 'TEXT', 'text', $order++);
        // MigrateService::createColumn02($bds->id, 'tien_ich', 'Tiện ích', 'TEXT', 'text', $order++);
        // MigrateService::createColumn02($bds->id, 'cho_de_xe', 'Mô tả về chỗ để xe', 'VARCHAR', 'text', $order++);
        // MigrateService::createColumn02($bds->id, 'vat_nuoi', 'Mô tả về vật nuôi', 'VARCHAR', 'text', $order++);

        // MigrateService::createColumn02($bds->id, 'images', 'Hình ảnh', 'TEXT', 'images', $order++);

        // $menus = Table::where('name', 'menus')->first;
        // MigrateService::createColumn02($bds->id, 'bds_type_id', 'Loại BĐS', 'TEXT', 'select', $order++, ['select_table_id' => $menus->id]);

        // $province = Table::where('name', 'provinces')->first;
        // MigrateService::createColumn02($bds->id, 'province_id', 'Tỉnh/Thành', 'TEXT', 'select2', $order++, ['select_table_id' => $province->id]);

        // $district = Table::where('name', 'districts')->first;
        // MigrateService::createColumn02($bds->id, 'district_id', 'Quận/Huyện', 'TEXT', 'select', $order++, ['select_table_id' => $district->id]);

        // $wards = Table::where('name', 'wards')->first;
        // MigrateService::createColumn02($bds->id, 'ward_id', 'Phường/Xã', 'TEXT', 'select', $order++, ['select_table_id' => $wards->id]);

        // MigrateService::createColumn02($bds->id, 'address', 'Địa chỉ', 'TEXT', 'textarea', $order++);
        // MigrateService::createColumn02($bds->id, 'hop_dong_toi_thieu', 'Mô tả về hợp đồng', 'TEXT', 'text', $order++);

        // MigrateService::createColumn02($bds->id, 'description', 'Mô tả ngắn', 'longtext', 'textarea', $order++);
        // MigrateService::createColumn02($bds->id, 'content', 'Nội dung', 'longtext', 'tiny', $order++);
        // MigrateService::createColumn02($bds->id, 'meta_keyword', '[SEO] Từ khóa', 'TEXT', 'textarea', $order++);
        // MigrateService::createColumn02($bds->id, 'meta_description', '[SEO] Mô tả', 'TEXT', 'textarea', $order++);
        // MigrateService::createColumn02($bds->id, 'is_front', 'Hiển thị trang chủ', 'INT', 'checkbox', $order++);

        // $user = Table::where('name', 'admin_users')->first;
        // MigrateService::createColumn02($bds->id, 'create_by', 'Tạo bởi', 'INT', config('constant.config_table.type_edit.select'), $order++, 
        // ['select_table_id' => $user->id, 'edit' => 0]);
        
        // MigrateService::createColumn02($bds->id, 'created_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
        // MigrateService::createColumn02($bds->id, 'updated_at', 'Ngày tạo', 'DATETIME', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('bds');
    }
};
