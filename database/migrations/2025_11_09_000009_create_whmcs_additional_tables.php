<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Activity Logs
        Schema::create('whmcs_activity_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->nullable()->constrained('admin_users');
            $table->foreignId('client_id')->nullable()->constrained('whmcs_clients');

            $table->string('action'); // login, logout, create_invoice, delete_service, etc
            $table->string('entity_type')->nullable(); // invoice, service, domain, ticket
            $table->bigInteger('entity_id')->nullable();

            $table->text('description');
            $table->json('data')->nullable()->comment('Old/new values');

            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();

            $table->timestamps();

            $table->index('user_id');
            $table->index('client_id');
            $table->index('action');
            $table->index('created_at');
        });

        // Notes (for clients, services, etc)
        Schema::create('whmcs_notes', function (Blueprint $table) {
            $table->id();

            $table->string('notable_type'); // Client, Service, Domain, etc
            $table->bigInteger('notable_id');

            $table->text('note');
            $table->boolean('is_sticky')->default(false);

            $table->foreignId('created_by')->constrained('admin_users');

            $table->timestamps();

            $table->index(['notable_type', 'notable_id']);
        });

        // Announcements
        Schema::create('whmcs_announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');

            $table->date('publish_date');
            $table->boolean('published')->default(false);

            $table->foreignId('created_by')->constrained('admin_users');

            $table->timestamps();

            $table->index('published');
            $table->index('publish_date');
        });

        // Knowledgebase Categories
        Schema::create('whmcs_kb_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            $table->foreignId('parent_id')->nullable()->constrained('whmcs_kb_categories')->nullOnDelete();

            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });

        // Knowledgebase Articles
        Schema::create('whmcs_kb_articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('whmcs_kb_categories');

            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content');

            $table->integer('views')->default(0);
            $table->integer('helpful_yes')->default(0);
            $table->integer('helpful_no')->default(0);

            $table->boolean('published')->default(false);

            $table->foreignId('created_by')->constrained('admin_users');

            $table->timestamps();

            $table->index('category_id');
            $table->index('published');
        });

        // Network Issues / Status
        Schema::create('whmcs_network_issues', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');

            $table->enum('type', ['server', 'network', 'planned', 'resolved'])->default('server');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');

            $table->enum('status', ['investigating', 'identified', 'monitoring', 'resolved'])->default('investigating');

            $table->datetime('start_date');
            $table->datetime('end_date')->nullable();

            // Affected Services
            $table->json('affected_server_ids')->nullable();

            $table->foreignId('created_by')->constrained('admin_users');

            $table->timestamps();

            $table->index('status');
            $table->index('type');
        });

        // Affiliate System
        Schema::create('whmcs_affiliates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('whmcs_clients');

            $table->string('affiliate_code')->unique();

            $table->decimal('commission_percentage', 5, 2)->default(10);
            $table->decimal('commission_fixed', 15, 2)->default(0);

            $table->decimal('balance', 15, 2)->default(0);
            $table->decimal('withdrawn', 15, 2)->default(0);

            // Payment Info
            $table->string('payment_method')->nullable();
            $table->json('payment_details')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index('affiliate_code');
        });

        // Affiliate Commissions
        Schema::create('whmcs_affiliate_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_id')->constrained('whmcs_affiliates');
            $table->foreignId('client_id')->constrained('whmcs_clients')->comment('Referred client');
            $table->foreignId('invoice_id')->nullable()->constrained('whmcs_invoices');

            $table->decimal('amount', 15, 2);
            $table->text('description');

            $table->enum('status', ['pending', 'approved', 'paid'])->default('pending');
            $table->date('paid_date')->nullable();

            $table->timestamps();

            $table->index('affiliate_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_affiliate_commissions');
        Schema::dropIfExists('whmcs_affiliates');
        Schema::dropIfExists('whmcs_network_issues');
        Schema::dropIfExists('whmcs_kb_articles');
        Schema::dropIfExists('whmcs_kb_categories');
        Schema::dropIfExists('whmcs_announcements');
        Schema::dropIfExists('whmcs_notes');
        Schema::dropIfExists('whmcs_activity_logs');
    }
};
