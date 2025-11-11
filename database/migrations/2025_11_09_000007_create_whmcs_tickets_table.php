<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ticket Departments
        Schema::create('whmcs_ticket_departments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('email')->nullable()->comment('Email nhận ticket');

            // Auto assignment
            $table->json('assigned_staff_ids')->nullable()->comment('Admin user IDs');

            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });

        // Ticket Priorities
        Schema::create('whmcs_ticket_priorities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('color')->default('#999999');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tickets
        Schema::create('whmcs_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();

            $table->foreignId('client_id')->constrained('whmcs_clients');
            $table->foreignId('department_id')->constrained('whmcs_ticket_departments');
            $table->foreignId('priority_id')->constrained('whmcs_ticket_priorities');

            // Related Service/Domain
            $table->foreignId('service_id')->nullable()->constrained('whmcs_services');
            $table->foreignId('domain_id')->nullable()->constrained('whmcs_domains');

            $table->string('subject');
            $table->text('message');

            // Status
            $table->enum('status', [
                'open',             // Mới mở
                'answered',         // Đã trả lời
                'customer_reply',   // Khách phản hồi
                'on_hold',          // Đang chờ
                'in_progress',      // Đang xử lý
                'closed'            // Đã đóng
            ])->default('open');

            // Assignment
            $table->foreignId('assigned_to')->nullable()->constrained('admin_users');

            // Flags
            $table->boolean('flagged')->default(false);

            // Email
            $table->string('email')->nullable()->comment('Email khách nếu gửi qua email');
            $table->string('name')->nullable()->comment('Tên khách nếu gửi qua email');

            // Last Reply
            $table->datetime('last_reply_at')->nullable();
            $table->enum('last_reply_by', ['client', 'staff'])->nullable();

            // Dates
            $table->datetime('opened_at');
            $table->datetime('closed_at')->nullable();

            // Rating
            $table->integer('rating')->nullable()->comment('1-5 stars');
            $table->text('rating_comment')->nullable();

            // Admin notes
            $table->text('admin_notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('ticket_number');
            $table->index('client_id');
            $table->index('status');
            $table->index('department_id');
            $table->index('assigned_to');
        });

        // Ticket Replies
        Schema::create('whmcs_ticket_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('whmcs_tickets')->cascadeOnDelete();

            // Who replied
            $table->enum('replied_by_type', ['client', 'staff']);
            $table->foreignId('client_id')->nullable()->constrained('whmcs_clients');
            $table->foreignId('admin_user_id')->nullable()->constrained('admin_users');

            $table->text('message');

            // Attachments
            $table->json('attachments')->nullable();

            // Email
            $table->string('email')->nullable();
            $table->string('name')->nullable();

            // IP
            $table->string('ip_address')->nullable();

            $table->timestamps();

            $table->index('ticket_id');
        });

        // Ticket Attachments
        Schema::create('whmcs_ticket_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->nullable()->constrained('whmcs_tickets')->cascadeOnDelete();
            $table->foreignId('reply_id')->nullable()->constrained('whmcs_ticket_replies')->cascadeOnDelete();

            $table->string('filename');
            $table->string('original_filename');
            $table->string('mime_type');
            $table->integer('file_size')->comment('bytes');
            $table->string('file_path');

            $table->timestamps();
        });

        // Canned Responses (Pre-defined responses)
        Schema::create('whmcs_ticket_canned_responses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('content');
            $table->json('department_ids')->nullable()->comment('Available for which departments');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_ticket_canned_responses');
        Schema::dropIfExists('whmcs_ticket_attachments');
        Schema::dropIfExists('whmcs_ticket_replies');
        Schema::dropIfExists('whmcs_tickets');
        Schema::dropIfExists('whmcs_ticket_priorities');
        Schema::dropIfExists('whmcs_ticket_departments');
    }
};
