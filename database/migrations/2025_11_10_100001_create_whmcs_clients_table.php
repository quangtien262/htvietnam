<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('company_name')->nullable();
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country', 2)->default('VN');
            $table->string('zip')->nullable();
            $table->string('status')->default('active'); // active, inactive, suspended
            $table->decimal('credit_balance', 15, 2)->default(0);
            $table->string('currency', 3)->default('VND');
            $table->json('tax_info')->nullable(); // VAT number, tax exempt
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_clients');
    }
};
