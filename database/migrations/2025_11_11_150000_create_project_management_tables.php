<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Bảng trạng thái dự án
        Schema::create('pro___project_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('ten_trang_thai', 100);
            $table->string('ma_mau', 20)->default('#1890ff')->comment('Màu hiển thị');
            $table->integer('thu_tu')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Bảng loại dự án
        Schema::create('pro___project_types', function (Blueprint $table) {
            $table->id();
            $table->string('ten_loai', 100);
            $table->string('mo_ta')->nullable();
            $table->string('icon', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Bảng ưu tiên
        Schema::create('pro___priorities', function (Blueprint $table) {
            $table->id();
            $table->string('ten_uu_tien', 50);
            $table->integer('cap_do')->comment('1=Thấp, 2=Trung bình, 3=Cao, 4=Khẩn cấp');
            $table->string('ma_mau', 20)->default('#1890ff');
            $table->timestamps();
        });

        // Bảng dự án
        Schema::create('pro___projects', function (Blueprint $table) {
            $table->id();
            $table->string('ma_du_an', 50)->unique();
            $table->string('ten_du_an', 255);
            $table->text('mo_ta')->nullable();
            $table->unsignedBigInteger('loai_du_an_id')->nullable();
            $table->unsignedBigInteger('trang_thai_id')->default(1);
            $table->unsignedBigInteger('uu_tien_id')->default(2);
            
            // Thông tin khách hàng
            $table->unsignedBigInteger('khach_hang_id')->nullable()->comment('ID từ bảng users');
            $table->string('ten_khach_hang', 255)->nullable();
            
            // Thời gian
            $table->date('ngay_bat_dau')->nullable();
            $table->date('ngay_ket_thuc_du_kien')->nullable();
            $table->date('ngay_ket_thuc_thuc_te')->nullable();
            
            // Ngân sách
            $table->decimal('ngan_sach_du_kien', 15, 2)->default(0);
            $table->decimal('chi_phi_thuc_te', 15, 2)->default(0);
            
            // Tiến độ
            $table->integer('tien_do')->default(0)->comment('% hoàn thành 0-100');
            
            // Người quản lý
            $table->unsignedBigInteger('quan_ly_du_an_id')->nullable()->comment('ID từ bảng admin_users');
            
            // Metadata
            $table->json('tags')->nullable();
            $table->string('mau_sac', 20)->default('#1890ff');
            $table->text('ghi_chu')->nullable();
            
            // Người tạo
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('loai_du_an_id')->references('id')->on('pro___project_types')->onDelete('set null');
            $table->foreign('trang_thai_id')->references('id')->on('pro___project_statuses')->onDelete('restrict');
            $table->foreign('uu_tien_id')->references('id')->on('pro___priorities')->onDelete('restrict');
        });

        // Bảng thành viên dự án
        Schema::create('pro___project_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->unsignedBigInteger('admin_user_id')->comment('ID nhân viên từ bảng admin_users');
            $table->enum('vai_tro', ['quan_ly', 'thanh_vien', 'xem'])->default('thanh_vien');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->foreign('project_id')->references('id')->on('pro___projects')->onDelete('cascade');
            $table->unique(['project_id', 'admin_user_id']);
        });

        // Bảng trạng thái nhiệm vụ
        Schema::create('pro___task_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('ten_trang_thai', 100);
            $table->string('ma_mau', 20)->default('#1890ff');
            $table->integer('thu_tu')->default(0);
            $table->boolean('is_done')->default(false)->comment('Đánh dấu hoàn thành');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Bảng nhiệm vụ
        Schema::create('pro___tasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->string('ma_nhiem_vu', 50)->unique();
            $table->string('tieu_de', 255);
            $table->text('mo_ta')->nullable();
            
            // Phân cấp nhiệm vụ
            $table->unsignedBigInteger('parent_id')->nullable()->comment('Nhiệm vụ cha');
            
            // Trạng thái & Ưu tiên
            $table->unsignedBigInteger('trang_thai_id')->default(1);
            $table->unsignedBigInteger('uu_tien_id')->default(2);
            
            // Phân công
            $table->unsignedBigInteger('nguoi_thuc_hien_id')->nullable()->comment('ID từ admin_users');
            $table->unsignedBigInteger('nguoi_giao_viec_id')->nullable()->comment('ID từ admin_users');
            
            // Thời gian
            $table->dateTime('ngay_bat_dau')->nullable();
            $table->dateTime('ngay_ket_thuc_du_kien')->nullable();
            $table->dateTime('ngay_ket_thuc_thuc_te')->nullable();
            $table->integer('thoi_gian_uoc_tinh')->nullable()->comment('Số giờ ước tính');
            $table->integer('thoi_gian_thuc_te')->nullable()->comment('Số giờ thực tế');
            
            // Tiến độ
            $table->integer('tien_do')->default(0)->comment('% hoàn thành 0-100');
            
            // Metadata
            $table->json('tags')->nullable();
            $table->text('ghi_chu')->nullable();
            
            // Vị trí trong Kanban
            $table->integer('kanban_order')->default(0);
            
            // Người tạo
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('project_id')->references('id')->on('pro___projects')->onDelete('cascade');
            $table->foreign('parent_id')->references('id')->on('pro___tasks')->onDelete('set null');
            $table->foreign('trang_thai_id')->references('id')->on('pro___task_statuses')->onDelete('restrict');
            $table->foreign('uu_tien_id')->references('id')->on('pro___priorities')->onDelete('restrict');
        });

        // Bảng phụ thuộc nhiệm vụ (Dependencies)
        Schema::create('pro___task_dependencies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id')->comment('Nhiệm vụ hiện tại');
            $table->unsignedBigInteger('depends_on_task_id')->comment('Phụ thuộc vào nhiệm vụ này');
            $table->enum('loai_phu_thuoc', ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'])
                ->default('finish_to_start');
            $table->timestamps();
            
            $table->foreign('task_id')->references('id')->on('pro___tasks')->onDelete('cascade');
            $table->foreign('depends_on_task_id')->references('id')->on('pro___tasks')->onDelete('cascade');
            $table->unique(['task_id', 'depends_on_task_id']);
        });

        // Bảng checklist
        Schema::create('pro___task_checklists', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->string('noi_dung', 255);
            $table->boolean('is_completed')->default(false);
            $table->integer('thu_tu')->default(0);
            $table->timestamps();
            
            $table->foreign('task_id')->references('id')->on('pro___tasks')->onDelete('cascade');
        });

        // Bảng comment
        Schema::create('pro___task_comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->unsignedBigInteger('admin_user_id');
            $table->text('noi_dung');
            $table->unsignedBigInteger('parent_id')->nullable()->comment('Reply to comment');
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('task_id')->references('id')->on('pro___tasks')->onDelete('cascade');
            $table->foreign('parent_id')->references('id')->on('pro___task_comments')->onDelete('cascade');
        });

        // Bảng tệp đính kèm
        Schema::create('pro___task_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->string('ten_file', 255);
            $table->string('duong_dan', 500);
            $table->string('loai_file', 50)->nullable();
            $table->bigInteger('kich_thuoc')->nullable()->comment('Bytes');
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->timestamps();
            
            $table->foreign('task_id')->references('id')->on('pro___tasks')->onDelete('cascade');
        });

        // Bảng lịch sử hoạt động
        Schema::create('pro___activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('loai_doi_tuong', 50)->comment('project, task');
            $table->unsignedBigInteger('doi_tuong_id');
            $table->string('hanh_dong', 100)->comment('created, updated, deleted, status_changed...');
            $table->text('mo_ta')->nullable();
            $table->json('du_lieu_cu')->nullable();
            $table->json('du_lieu_moi')->nullable();
            $table->unsignedBigInteger('admin_user_id')->nullable();
            $table->timestamps();
            
            $table->index(['loai_doi_tuong', 'doi_tuong_id']);
        });

        // Bảng time tracking
        Schema::create('pro___time_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->unsignedBigInteger('admin_user_id');
            $table->dateTime('thoi_gian_bat_dau');
            $table->dateTime('thoi_gian_ket_thuc')->nullable();
            $table->integer('so_phut')->nullable()->comment('Tổng số phút làm việc');
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
            
            $table->foreign('task_id')->references('id')->on('pro___tasks')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pro___time_logs');
        Schema::dropIfExists('pro___activity_logs');
        Schema::dropIfExists('pro___task_attachments');
        Schema::dropIfExists('pro___task_comments');
        Schema::dropIfExists('pro___task_checklists');
        Schema::dropIfExists('pro___task_dependencies');
        Schema::dropIfExists('pro___tasks');
        Schema::dropIfExists('pro___task_statuses');
        Schema::dropIfExists('pro___project_members');
        Schema::dropIfExists('pro___projects');
        Schema::dropIfExists('pro___priorities');
        Schema::dropIfExists('pro___project_types');
        Schema::dropIfExists('pro___project_statuses');
    }
};
