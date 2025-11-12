<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Create tables for Role-Based Access Control (RBAC) in Project Management
     */
    public function up(): void
    {
        // Bảng Permissions - Các quyền cụ thể
        Schema::create('pro___permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique()->comment('e.g., project.create, task.delete');
            $table->string('display_name', 200)->comment('Tên hiển thị');
            $table->string('group', 50)->comment('project, task, member, time');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Bảng Roles - Các vai trò
        Schema::create('pro___roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique()->comment('admin, manager, member, viewer');
            $table->string('display_name', 100);
            $table->text('description')->nullable();
            $table->integer('priority')->default(0)->comment('Higher = more powerful');
            $table->timestamps();
        });

        // Bảng Role-Permission (Many-to-Many)
        Schema::create('pro___role_permission', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('permission_id');
            $table->timestamps();

            $table->foreign('role_id')->references('id')->on('pro___roles')->onDelete('cascade');
            $table->foreign('permission_id')->references('id')->on('pro___permissions')->onDelete('cascade');

            $table->unique(['role_id', 'permission_id']);
        });

        // Update pro___project_members table - Add role
        Schema::table('pro___project_members', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id')->nullable()->after('vai_tro');

            $table->foreign('role_id')->references('id')->on('pro___roles')->onDelete('set null');
            $table->index('role_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pro___project_members', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });

        Schema::dropIfExists('pro___role_permission');
        Schema::dropIfExists('pro___roles');
        Schema::dropIfExists('pro___permissions');
    }
};
