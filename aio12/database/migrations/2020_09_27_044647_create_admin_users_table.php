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
        Schema::create('admin_users', function (Blueprint $table) {
            $table->id();

            $table->string('password')->nullable();
            $table->string('name')->nullable();
            $table->string('code')->nullable();
            $table->string('lucky_id')->nullable();

            $table->string('username')->nullable();
            $table->string('year')->nullable();
            $table->date('birthday')->nullable();
            $table->integer('gioi_tinh_id')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->date('ngay_vao_lam')->nullable();
            $table->integer('tinh_trang_hon_nhan_id')->nullable();
            $table->text('ngan_hang')->nullable();
            $table->integer('admin_user_status_id')->default(1)->nullable();
            $table->integer('chi_nhanh_id')->nullable();
            $table->integer('chuc_vu_id')->nullable();
            $table->integer('nguoi_phu_thuoc')->nullable();
            $table->text('so_tai_khoan')->nullable();
            $table->text('address')->nullable();
            $table->text('description')->nullable();
            $table->text('image')->nullable();
            $table->string('chi_nhanh_ngan_hang')->nullable();
            $table->string('cmnd')->nullable();
            $table->string('noi_cap')->nullable();
            $table->date('ngay_cap')->nullable();
            $table->integer('permission_group_id')->nullable();
            $table->timestamp('email_verified_at')->nullable();

            // luong chinh
            $table->string('salary')->nullable(); 

            // 1 => 'Theo ca',
            // 2 => 'Theo giờ',
            // 3 => 'Theo ngày công chuẩn',
            // 4 => 'Theo lương cố định',
            $table->integer('loai_luong')->nullable(); 

            // cai dat luong nang cao
            $table->integer('is_setting_salary_nang_cao')->default(0)->nullable();
            $table->integer('luong_chinh_thu7')->default(0)->nullable();
            $table->integer('luong_chinh_cn')->default(0)->nullable();
            $table->integer('luong_chinh_ngay_nghi')->default(0)->nullable();
            $table->integer('luong_chinh_nghi_le')->default(0)->nullable();

            $table->integer('is_luong_chinh_thu7_persen')->default(0)->nullable();
            $table->integer('is_luong_chinh_cn_persen')->default(0)->nullable();
            $table->integer('is_luong_chinh_ngay_nghi_persen')->default(0)->nullable();
            $table->integer('is_luong_chinh_nghi_le_persen')->default(1)->nullable();
            
            // làm thêm giờ: is_luong_nang_cao == 1 thì mới check kích hoạt làm thêm giờ
            $table->integer('is_setting_salary_lam_them_gio')->default(0)->nullable();
            
            $table->integer('them_gio_ngay_thuong')->default(150)->nullable();
            $table->integer('is_them_gio_ngay_thuong_persen')->default(1)->nullable();

            $table->integer('them_gio_thu7')->default(200)->nullable();
            $table->integer('is_them_gio_thu7_persen')->default(1)->nullable();

            $table->integer('them_gio_chu_nhat')->default(200)->nullable();
            $table->integer('is_them_gio_chu_nhat_persen')->default(200)->nullable();

            $table->integer('them_gio_ngay_nghi')->default(200)->nullable();
            $table->integer('is_them_gio_ngay_nghi_persen')->default(200)->nullable();

            $table->integer('them_gio_nghi_le_tet')->default(200)->nullable();
            $table->integer('is_them_gio_nghi_le_tet_persen')->default(1)->nullable();

            // thưởng
            $table->integer('is_setting_thuong')->default(0)->nullable();
            $table->integer('loai_thuong')->default(0)->nullable();
            $table->integer('hinh_thuc_thuong')->default(0)->nullable();
            $table->longText('thuong_setting')->nullable();

            // hoa hồng
            $table->integer('is_setting_hoa_hong')->default(0)->nullable();
            $table->longText('hoa_hong_setting')->nullable();

            // phụ cấp
            $table->integer('is_setting_phu_cap')->default(0)->nullable();
            $table->longText('phu_cap_setting')->nullable();

            // giảm trừ
            $table->integer('is_setting_giam_tru')->default(0)->nullable();
            $table->longText('giam_tru_setting')->nullable();

            $table->integer('da_nghi_lam')->default(0)->nullable();

            //require
            MigrateService::createBaseColumn($table);

            $table->rememberToken();
        });


        Schema::create('admin_password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('admin_sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // 0 => 'Table basic',
        // 1 => 'Kiểu kéo thả ',
        // 5 => 'Chỉ có 1 data master',
        Table::create([
            //require
            'name' => 'admin_users',
            'display_name' => 'Nhân viên',
            'parent_id' => 0,
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 1, // 1 hiển thị ở menu; 0 không hiển thị
            'form_data_type' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,

            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
            'search_position'=>2
        ]);

        $tbl = Table::where('name', 'admin_users')->first();
        $tableId = $tbl->id;
        $order_col = 1;

        $tt_ca_nhan = MigrateService::createColumn02(
            $tableId,
            'tt_ca_nhan',
            'Thông tin cá nhân',
            'INT',
            'number',
            4,

            [
                'block_type' => 'block_basic',
            ]
        );

        $tt_khac = MigrateService::createColumn02(
            $tableId,
            'tt_khac',
            'Thông tin khác',
            'INT',
            'number',
            5,

            [
                'block_type' => 'block_basic',
            ]
        );

        $tt_dang_nhap = MigrateService::createColumn02(
            $tableId,
            'tt_dang_nhap',
            'Thông tin đăng nhập ',
            'INT',
            'number',
            5,

            [
                'block_type' => 'block_basic',
            ]
        );
        MigrateService::createColumn02($tableId, 'code', 'Mã nhân viên', 'VARCHAR', 'text', $order_col++,
        ['parent_id' => $tt_ca_nhan->id, 'show_in_list' => 1, 'auto_generate_code' => '{"edit":0, "prefix":"NV", "length":5}']);

        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);
        MigrateService::createColumn02($tableId, 'name', 'Họ và tên', 'VARCHAR', 'text', $order_col++, ['require' => 1, 'parent_id' => $tt_ca_nhan->id, 'show_in_list' => 1,'is_view_detail' => 1]);
        MigrateService::createColumn02($tableId, 'birthday', 'Ngày sinh', 'DATE', 'date', $order_col++, ['parent_id' => $tt_ca_nhan->id]);

        MigrateService::createColumn02($tableId, 'username', 'Tên đăng nhập', 'VARCHAR', 'text', $order_col++, [ 'parent_id' => $tt_dang_nhap->id]);


        $gioiTinh = Table::where('name', 'gioi_tinh')->first();
        MigrateService::createColumn02($tableId, 'gioi_tinh_id', 'Giới Tính', 'INT', 'select', $order_col++, [
            'select_table_id' =>  $gioiTinh->id, 'parent_id' => $tt_ca_nhan->id, 'add_express' => 1
        ]);

        // MigrateService::createColumn02($tableId, 'code', 'Mã số thuế', 'INT', 'number', $order_col++);
        MigrateService::createColumn02($tableId, 'phone', 'Số điện thoại', 'TEXT', 'text', $order_col++, ['require' => 1, 'parent_id' => $tt_ca_nhan->id, 'show_in_list' => 1]);
        MigrateService::createColumn02($tableId, 'email', 'Email', 'VARCHAR', 'text', $order_col++, ['parent_id' => $tt_ca_nhan->id]);
        MigrateService::createColumn02($tableId, 'cmnd', 'Số CCCD', 'VARCHAR', 'text', $order_col++, ['parent_id' => $tt_ca_nhan->id,'require' => 1]);
        MigrateService::createColumn02($tableId, 'ngay_cap', 'Ngày cấp', 'DATE', 'date', $order_col++, ['require' => 1,'parent_id' => $tt_ca_nhan->id]);
        MigrateService::createColumn02($tableId, 'noi_cap', 'Nơi cấp', 'VARCHAR', 'text', $order_col++, [ 'parent_id' => $tt_ca_nhan->id]);
        $honNhan = Table::where('name', 'tinh_trang_hon_nhan')->first();
        MigrateService::createColumn02($tableId, 'tinh_trang_hon_nhan_id', 'Tình trạng hôn nhân', 'INT', 'select', $order_col++, 
        ['select_table_id' => $honNhan->id, 'parent_id' => $tt_ca_nhan->id,'add_express' => 1]);
        MigrateService::createColumn02($tableId, 'nguoi_phu_thuoc', 'Số người phụ thuộc', 'INT', 'number', $order_col++, ['parent_id' => $tt_ca_nhan->id]);
        MigrateService::createColumn02($tableId, 'address', 'Địa chỉ', 'TEXT', 'textarea', $order_col++, ['parent_id' => $tt_ca_nhan->id, 'col'=> 12]);

        $per = Table::where('name', 'permission_group')->first();
        MigrateService::createColumn02($tableId, 'permission_group_id', 'Nhóm quyền', 'INT', 'select', $order_col++, [
            'select_table_id' => $per->id,
        ]);

        $nganHang = Table::where('name', 'ngan_hang')->first();
        MigrateService::createColumn02($tableId, 'ngan_hang_id', 'Ngân hàng', 'TEXT', 'selects', $order_col++, [
            'select_table_id' => $nganHang->id,
            'parent_id' => $tt_khac->id,
           
        ]);
        $chiNhanh = Table::where('name', 'chi_nhanh')->first();
        MigrateService::createColumn02($tableId, 'chi_nhanh_id', 'Chi nhánh/ phòng ban', 'INT', 'select', $order_col++, ['select_table_id' => $chiNhanh->id, 'require' => 1, 'parent_id' => $tt_khac->id,'add2search' => 1 ]);
        $trangThai = Table::where('name', 'admin_user_status')->first();
        MigrateService::createColumn02($tableId, 'admin_user_status_id', 'Trạng thái', 'INT', 'select', $order_col++, ['select_table_id' => $trangThai->id, 'require' => 1, 'parent_id' => $tt_khac->id, 'add_express' => 1,'show_in_list' => 1,'add2search' => 1 ]);
        MigrateService::createColumn02($tableId, 'chi_nhanh_ngan_hang', 'Chi nhánh ngân hàng', 'VARCHAR', 'text', $order_col++, ['parent_id' => $tt_khac->id]);
        MigrateService::createColumn02($tableId, 'ngay_vao_lam', 'Ngày vào làm', 'DATE', 'date', $order_col++, ['require' => 1,'parent_id' => $tt_khac->id,'add2search' => 1, 'search_type' => 6]);

        $chucVu = Table::where('name', 'chuc_vu')->first();
        MigrateService::createColumn02($tableId, 'chuc_vu_id', 'Chức vụ', 'INT', 'select', $order_col++, ['select_table_id' => $chucVu->id, 'require' => 1, 'parent_id' => $tt_khac->id, 'add2search' => 1]);
        MigrateService::createColumn02($tableId, 'description', 'Mô tả', 'TEXT', 'textarea',  $order_col++, ['parent_id' => $tt_khac->id, 'col'=> 24]);
        MigrateService::createColumn02($tableId, 'image', 'Ảnh đại diện', 'text', 'image', $order_col++, ['parent_id' => $tt_ca_nhan->id]);

        MigrateService::createColumn02($tableId, 'password', 'Mật khẩu', 'VARCHAR', 'encryption', $order_col++, ['parent_id' => $tt_dang_nhap->id]);
        MigrateService::createColumn02($tableId, 'email_verified_at', 'email_verified_at', 'TEXT', 'text', $order_col++, ['edit' => 0]);
    
        MigrateService::createColumn02($tableId, 'parent_id', 'parent_id', 'INT', 'number', $order_col++,['edit' => 0]);
        MigrateService::createColumn02($tableId, 'sort_order', 'sort_order', 'INT', 'number', $order_col++,['edit' => 0]);
        // MigrateService::createColumn02($tableId, 'create_by', 'Người tạo', 'INT', 'select', $order_col++, ['edit' => 0,'select_table_id' => $tbl->id]);
        MigrateService::createColumn02($tableId, 'created_at', 'Ngày tạo', 'DATETIME', 'datetime', $order_col++,['edit' => 0]);
        MigrateService::createColumn02($tableId, 'updated_at', 'Ngày cập nhật', 'DATETIME', 'datetime', $order_col++,['edit' => 0]);

    }

    /**
     * Reverse the migrations. 
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('admin_users');
        Schema::dropIfExists('admin_password_reset_tokens');
        Schema::dropIfExists('admin_sessions');
    }
};
