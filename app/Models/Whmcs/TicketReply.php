<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TicketReply extends Model
{
    protected $table = 'whmcs_ticket_replies';

    protected $fillable = [
        'ticket_id',
        'author_type',
        'author_id',
        'message',
        'is_internal',
        'attachments',
    ];

    protected $casts = [
        'is_internal' => 'boolean',
        'attachments' => 'array',
    ];

    // Relationships
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function author(): MorphTo
    {
        return $this->morphTo();
    }

    // Helper Methods
    public function isFromClient(): bool
    {
        return $this->author_type === \App\Models\User::class;
    }

    public function isFromStaff(): bool
    {
        return !$this->isFromClient();
    }

    public function hasAttachments(): bool
    {
        return !empty($this->attachments);
    }

    // Scopes
    public function scopePublic($query)
    {
        return $query->where('is_internal', false);
    }

    public function scopeInternal($query)
    {
        return $query->where('is_internal', true);
    }

    public function scopeFromClients($query)
    {
        return $query->where('author_type', \App\Models\User::class);
    }

    public function scopeFromStaff($query)
    {
        return $query->where('author_type', '!=', \App\Models\User::class);
    }
}
