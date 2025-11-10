<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whmcs_ticket_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('whmcs_tickets')->cascadeOnDelete();
            $table->morphs('author'); // Can be client or admin
            $table->text('message');
            $table->boolean('is_internal')->default(false); // Internal notes only visible to staff
            $table->json('attachments')->nullable();
            $table->timestamps();

            $table->index('ticket_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whmcs_ticket_replies');
    }
};
