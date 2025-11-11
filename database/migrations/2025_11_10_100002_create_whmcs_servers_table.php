<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_servers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('hostname');
            $table->string('ip_address');
            $table->string('type'); // shared, vps, dedicated
            $table->string('panel')->nullable(); // cpanel, plesk, directadmin, virtualizor, custom
            $table->integer('port')->default(2087);
            $table->text('api_token')->nullable();
            $table->string('username')->nullable();
            $table->text('password')->nullable(); // encrypted
            $table->string('datacenter')->nullable();
            $table->integer('max_accounts')->default(100);
            $table->integer('current_accounts')->default(0);
            $table->string('status')->default('active'); // active, maintenance, disabled
            $table->json('monitoring')->nullable(); // load, disk, bandwidth
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('whmcs_server_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // shared, vps, dedicated
            $table->timestamps();
        });

        Schema::create('whmcs_server_group_members', function (Blueprint $table) {
            $table->foreignId('server_group_id')->constrained('whmcs_server_groups')->cascadeOnDelete();
            $table->foreignId('server_id')->constrained('whmcs_servers')->cascadeOnDelete();
            $table->integer('priority')->default(0);
            $table->primary(['server_group_id', 'server_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_server_group_members');
        Schema::dropIfExists('whmcs_server_groups');
        Schema::dropIfExists('whmcs_servers');
    }
};
