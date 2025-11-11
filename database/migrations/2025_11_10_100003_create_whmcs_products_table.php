<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_product_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('whmcs_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->nullable()->constrained('whmcs_product_groups')->nullOnDelete();
            $table->foreignId('server_group_id')->nullable()->constrained('whmcs_server_groups')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type'); // hosting, vps, dedicated, domain, ssl, website
            $table->string('module')->nullable(); // cpanel, plesk, directadmin, virtualizor
            $table->string('package_name')->nullable(); // Package name trong panel
            $table->json('config')->nullable(); // Custom config
            $table->boolean('auto_setup')->default(false);
            $table->string('status')->default('active'); // active, inactive
            $table->timestamps();
        });

        Schema::create('whmcs_product_pricing', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('whmcs_products')->cascadeOnDelete();
            $table->string('cycle'); // monthly, quarterly, semiannually, annually, biennially, triennially, onetime
            $table->string('currency', 3)->default('VND');
            $table->decimal('setup_fee', 15, 2)->default(0);
            $table->decimal('price', 15, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('whmcs_configurable_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('whmcs_products')->cascadeOnDelete();
            $table->string('name'); // RAM, Disk, Bandwidth
            $table->string('type'); // dropdown, radio, text
            $table->json('options')->nullable(); // [{label: '2GB', value: '2048', price: 50000}]
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_configurable_options');
        Schema::dropIfExists('whmcs_product_pricing');
        Schema::dropIfExists('whmcs_products');
        Schema::dropIfExists('whmcs_product_groups');
    }
};
