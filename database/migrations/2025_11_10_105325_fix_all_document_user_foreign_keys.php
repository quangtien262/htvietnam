<?php

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
        // Fix all document tables to use admin_users instead of users
        
        // tai_lieu_file - nguoi_tai_len_id
        Schema::table('tai_lieu_file', function (Blueprint $table) {
            $table->dropForeign(['nguoi_tai_len_id']);
            $table->foreign('nguoi_tai_len_id')->references('id')->on('admin_users')->onDelete('cascade');
        });

        // tai_lieu_phien_ban - nguoi_tai_len_id
        Schema::table('tai_lieu_phien_ban', function (Blueprint $table) {
            $table->dropForeign(['nguoi_tai_len_id']);
            $table->foreign('nguoi_tai_len_id')->references('id')->on('admin_users')->onDelete('cascade');
        });

        // tai_lieu_phan_quyen - user_id and nguoi_chia_se_id
        Schema::table('tai_lieu_phan_quyen', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['nguoi_chia_se_id']);
            $table->foreign('user_id')->references('id')->on('admin_users')->onDelete('cascade');
            $table->foreign('nguoi_chia_se_id')->references('id')->on('admin_users')->onDelete('cascade');
        });

        // tai_lieu_chia_se_link - nguoi_tao_id
        Schema::table('tai_lieu_chia_se_link', function (Blueprint $table) {
            $table->dropForeign(['nguoi_tao_id']);
            $table->foreign('nguoi_tao_id')->references('id')->on('admin_users')->onDelete('cascade');
        });

        // tai_lieu_binh_luan - user_id
        Schema::table('tai_lieu_binh_luan', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('admin_users')->onDelete('cascade');
        });

        // tai_lieu_hoat_dong - user_id
        Schema::table('tai_lieu_hoat_dong', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('admin_users')->onDelete('set null');
        });

        // tai_lieu_quota - user_id
        Schema::table('tai_lieu_quota', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('admin_users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore all foreign keys to users table
        
        Schema::table('tai_lieu_file', function (Blueprint $table) {
            $table->dropForeign(['nguoi_tai_len_id']);
            $table->foreign('nguoi_tai_len_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('tai_lieu_phien_ban', function (Blueprint $table) {
            $table->dropForeign(['nguoi_tai_len_id']);
            $table->foreign('nguoi_tai_len_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('tai_lieu_phan_quyen', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['nguoi_chia_se_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('nguoi_chia_se_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('tai_lieu_chia_se_link', function (Blueprint $table) {
            $table->dropForeign(['nguoi_tao_id']);
            $table->foreign('nguoi_tao_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('tai_lieu_binh_luan', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('tai_lieu_hoat_dong', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('tai_lieu_quota', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
