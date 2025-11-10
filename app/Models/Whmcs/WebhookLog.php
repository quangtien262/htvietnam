<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookLog extends Model
{
    protected $table = 'whmcs_webhook_logs';

    protected $fillable = [
        'webhook_id',
        'event',
        'payload',
        'http_status',
        'response_body',
        'error_message',
        'attempt_number',
        'success',
        'duration_ms',
        'sent_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'http_status' => 'integer',
        'attempt_number' => 'integer',
        'success' => 'boolean',
        'duration_ms' => 'float',
        'sent_at' => 'datetime',
    ];

    // Relationships
    public function webhook(): BelongsTo
    {
        return $this->belongsTo(Webhook::class);
    }

    // Helper Methods
    public function isSuccessful(): bool
    {
        return $this->success;
    }

    public function isFailed(): bool
    {
        return !$this->success;
    }

    public function hasError(): bool
    {
        return !empty($this->error_message);
    }

    // Scopes
    public function scopeSuccessful($query)
    {
        return $query->where('success', true);
    }

    public function scopeFailed($query)
    {
        return $query->where('success', false);
    }

    public function scopeForEvent($query, string $event)
    {
        return $query->where('event', $event);
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('sent_at', '>=', now()->subDays($days));
    }
}
