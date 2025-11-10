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
            $table->string('user_type')->default('Aitilen')->nullable(); // Aitilen, HTVietNam, spa
            $table->string('name')->nullable();
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->string('code')->nullable();
            $table->date('ngay_sinh')->nullable();


            $table->text('cccd_front')->nullable();
            $table->text('cccd_back')->nullable();

            $table->integer('user_status_id')->nullable();

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

            $table->integer('require_changepw')->default(0)->nullable();

            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('phone_verified')->nullable();
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
