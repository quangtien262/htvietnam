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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('user_type')->default('Aitilen')->nullable(); // aitilen, HTVietNam
            $table->string('name')->nullable();
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->string('code')->nullable();
            $table->integer('year')->nullable();
            $table->date('ngay_sinh')->nullable();

            // thẻ vip
            $table->integer('tong_tien_da_nap')->default(0)->nullable();
            $table->integer('tien_con_lai')->default(0)->nullable();
            $table->integer('tien_da_su_dung')->default(0)->nullable();

            //công nợ
            $table->integer('tong_cong_no')->default(0)->nullable();
            $table->integer('cong_no_da_thanh_toan')->default(0)->nullable();
            $table->integer('cong_no_hien_tai')->default(0)->nullable();

            $table->string('tax_code')->nullable();
            $table->integer('gioi_tinh_id')->nullable();
            $table->string('phone')->nullable();
            $table->string('phone02')->nullable();

            $table->string('email')->nullable();
            $table->string('facebook')->nullable();
            $table->text('address')->nullable();
            $table->integer('customer_group_id')->nullable();
            $table->string('link_website')->nullable();
            $table->integer('customer_status_id')->default(1)->default(1)->nullable();
            $table->integer('user_source_id')->nullable();
            $table->integer('chi_nhanh_id')->nullable();
            $table->text('note')->nullable();
            $table->text('merge_description')->nullable();
            $table->text('image')->nullable();


            $table->text('cccd')->nullable();
            $table->date('ngay_cap')->nullable();
            $table->text('noi_cap')->nullable();
            $table->text('hktt')->nullable();


            // cty
            $table->text('cong_ty')->nullable();
            $table->text('mst')->nullable();

            $table->text('data_related')->nullable();

            $table->integer('merge_id')->default(0)->nullable();

            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();

            MigrateService::createBaseColumn($table);
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });



        Table::create([
            'name' => 'users',
            'display_name' => 'QL Khách hàng',
            'sort_order' => 0,
            'type_show' => config('constant.type_show.basic'),
            'count_item_of_page' => 30,
            'is_edit' => 1,
            'form_data_type' => 1,
            'have_delete' => 1,
            'have_add_new' => 1,
            'parent_id' => 0,
            'is_show_btn_edit' => 1,
            'tab_table_id' => 0,
            'tab_table_name' => '',
            'table_data' => '',
            'is_label' => 0,
            'search_position' => 1,
            'add_btn_from_route' => '{
                "0":{
                    "name":"hima.merge_customer",
                    "display_name":"Gộp khách hàng",
                    "class":"success"
                }
            }',
            'data_related' => [
                [
                    "title" => "Lịch sử mua hàng",
                    "table" => "phieu_thu",
                    "column" => "users_id"
                ],
                [
                    "title" => "Thẻ khách hàng",
                    "table" => "card",
                    "column" => "users_id"
                ],
                [
                    "title" => "Lịch sử sử dụng dịch vụ",
                    "table" => "hoa_don",
                    "column" => "users_id"
                ],
                [
                    "title" => "Lịch sử CSKH",
                    "table" => "data_cham_soc_khach_hang",
                    "column" => "users_id"
                ],

            ]
        ]);
        $tbl = Table::where('name', 'users')->first();
        $tableId = $tbl->id;
        $order_col = 1;

        MigrateService::createColumn02($tableId, 'id', 'id', 'INT', 'number', $order_col++, ['edit' => 0]);

        MigrateService::createColumn02($tableId, 'cong_ty', 'Công ty', 'VARCHAR', 'text', $order_col++, []);
        MigrateService::createColumn02($tableId, 'mst', 'Mã số thuế', 'VARCHAR', 'text', $order_col++, []);

        MigrateService::createColumn02(
            $tableId,
            'name',
            'Họ và tên',
            'VARCHAR',
            'text',
            $order_col++,
            ['require' => 1, 'show_in_list' => 1, 'is_view_detail' => 1]
        );

         MigrateService::createColumn02(
            $tableId,
            'email',
            'Email',
            'VARCHAR',
            'text',
            $order_col++,
            ['require' => 1, 'show_in_list' => 1, 'is_view_detail' => 1]
        );

        MigrateService::createColumn02(
            $tableId,
            'username',
            'Tên đăng nhập',
            'VARCHAR',
            'text',
            $order_col++,
            ['require' => 1, 'show_in_list' => 1]
        );
        MigrateService::createColumn02(
            $tableId,
            'password',
            'Mật khẩu',
            'VARCHAR',
            'password',
            $order_col++,
            ['require' => 1, 'edit' => 0, 'show_in_list' => 0]
        );

        MigrateService::createColumn02(
            $tableId,
            'images',
            'Hình ảnh',
            'VARCHAR',
            'image',
            $order_col++,
            ['require' => 1, 'edit' => 1, 'show_in_list' => 0]
        );

        MigrateService::createColumn02(
            $tableId,
            'ngay_cap',
            'Ngày cấp',
            'DATE',
            'date',
            $order_col++,
            ['require' => 1, 'edit' => 1, 'show_in_list' => 0]
        );

        MigrateService::createColumn02(
            $tableId,
            'noi_cap',
            'Nơi cấp',
            'VARCHAR',
            'text',
            $order_col++,
            ['require' => 1, 'edit' => 1, 'show_in_list' => 0]
        );

        MigrateService::createColumn02(
            $tableId,
            'hktt',
            'Hộ khẩu thường trú',
            'VARCHAR',
            'text',
            $order_col++,
            ['require' => 1, 'edit' => 1, 'show_in_list' => 0]
        );

         MigrateService::createColumn02(
            $tableId,
            'note',
            'Ghi chú',
            'TEXT',
            'textarea',
            $order_col++,
            ['require' => 1, 'edit' => 1, 'show_in_list' => 0]
        );

         MigrateService::createColumn02(
            $tableId,
            'address',
            'Địa chỉ',
            'VARCHAR',
            'text',
            $order_col++,
            ['require' => 1, 'show_in_list' => 0, 'is_view_detail' => 1]
        );
        MigrateService::createColumn02(
            $tableId,
            'facebook',
            'Facebook',
            'VARCHAR',
            'text',
            $order_col++,
            ['require' => 1, 'show_in_list' => 0, 'is_view_detail' => 1]
        );

        MigrateService::baseColumn($tbl);
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
