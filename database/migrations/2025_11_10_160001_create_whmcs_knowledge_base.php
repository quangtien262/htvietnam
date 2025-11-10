<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Knowledge Base Categories
        Schema::create('whmcs_kb_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('whmcs_kb_categories')->onDelete('cascade');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_public')->default(true);
            $table->timestamps();

            $table->index('parent_id');
            $table->index('is_public');
        });

        // Knowledge Base Articles
        Schema::create('whmcs_kb_articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('whmcs_kb_categories')->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content');
            $table->text('excerpt')->nullable();
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->integer('view_count')->default(0);
            $table->integer('helpful_count')->default(0);
            $table->integer('unhelpful_count')->default(0);
            $table->json('tags')->nullable();
            $table->json('related_articles')->nullable(); // Array of article IDs
            $table->timestamps();

            $table->index('category_id');
            $table->index('author_id');
            $table->index('is_published');
            $table->fullText(['title', 'content', 'excerpt']);
        });

        // Article Votes (track who voted)
        Schema::create('whmcs_kb_article_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('whmcs_kb_articles')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('ip_address', 45)->nullable();
            $table->boolean('is_helpful'); // true = helpful, false = unhelpful
            $table->timestamps();

            $table->unique(['article_id', 'user_id']);
            $table->index('article_id');
        });

        // Article Attachments
        Schema::create('whmcs_kb_article_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('whmcs_kb_articles')->onDelete('cascade');
            $table->string('filename');
            $table->string('original_filename');
            $table->string('file_path');
            $table->string('mime_type');
            $table->bigInteger('file_size'); // bytes
            $table->integer('download_count')->default(0);
            $table->timestamps();

            $table->index('article_id');
        });

        // Seed default categories
        DB::table('whmcs_kb_categories')->insert([
            [
                'name' => 'Getting Started',
                'slug' => 'getting-started',
                'description' => 'Basic guides to help you get started',
                'parent_id' => null,
                'sort_order' => 1,
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Billing',
                'slug' => 'billing',
                'description' => 'Information about invoices, payments, and billing',
                'parent_id' => null,
                'sort_order' => 2,
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Products & Services',
                'slug' => 'products-services',
                'description' => 'Learn about our products and services',
                'parent_id' => null,
                'sort_order' => 3,
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Technical Support',
                'slug' => 'technical-support',
                'description' => 'Technical documentation and troubleshooting',
                'parent_id' => null,
                'sort_order' => 4,
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Account Management',
                'slug' => 'account-management',
                'description' => 'Managing your account settings and preferences',
                'parent_id' => null,
                'sort_order' => 5,
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whmcs_kb_article_attachments');
        Schema::dropIfExists('whmcs_kb_article_votes');
        Schema::dropIfExists('whmcs_kb_articles');
        Schema::dropIfExists('whmcs_kb_categories');
    }
};
