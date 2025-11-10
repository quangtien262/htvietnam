<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Webhook extends Model
{
    use SoftDeletes;

    protected $table = 'whmcs_webhooks';

    protected $fillable = [
        'name',
        'url',
        'secret',
        'events',
        'is_active',
        'content_type',
        'custom_headers',
        'retry_attempts',
        'timeout',
        'verify_ssl',
        'last_triggered_at',
        'total_triggers',
        'failed_triggers',
    ];

    protected $casts = [
        'events' => 'array',
        'custom_headers' => 'array',
        'is_active' => 'boolean',
        'verify_ssl' => 'boolean',
        'retry_attempts' => 'integer',
        'timeout' => 'integer',
        'total_triggers' => 'integer',
        'failed_triggers' => 'integer',
        'last_triggered_at' => 'datetime',
    ];

    // Relationships
    public function logs(): HasMany
    {
        return $this->hasMany(WebhookLog::class);
    }

    public function recentLogs(): HasMany
    {
        return $this->hasMany(WebhookLog::class)->latest()->limit(10);
    }

    // Helper Methods
    public function isActive(): bool
    {
        return $this->is_active;
    }

    public function supportsEvent(string $event): bool
    {
        return in_array($event, $this->events);
    }

    public function incrementTriggers(): void
    {
        $this->increment('total_triggers');
        $this->update(['last_triggered_at' => now()]);
    }

    public function incrementFailures(): void
    {
        $this->increment('failed_triggers');
    }

    public function getSuccessRate(): float
    {
        if ($this->total_triggers === 0) {
            return 0;
        }

        $successful = $this->total_triggers - $this->failed_triggers;
        return round(($successful / $this->total_triggers) * 100, 2);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForEvent($query, string $event)
    {
        return $query->whereJsonContains('events', $event);
    }

    // Available webhook events
    public static function availableEvents(): array
    {
        return [
            'invoice.created' => 'Invoice Created',
            'invoice.paid' => 'Invoice Paid',
            'invoice.cancelled' => 'Invoice Cancelled',
            'invoice.refunded' => 'Invoice Refunded',
            'payment.received' => 'Payment Received',
            'payment.failed' => 'Payment Failed',
            'service.created' => 'Service Created',
            'service.activated' => 'Service Activated',
            'service.suspended' => 'Service Suspended',
            'service.terminated' => 'Service Terminated',
            'service.cancelled' => 'Service Cancelled',
            'ticket.created' => 'Ticket Created',
            'ticket.updated' => 'Ticket Updated',
            'ticket.replied' => 'Ticket Reply Added',
            'ticket.closed' => 'Ticket Closed',
            'client.created' => 'Client Created',
            'client.updated' => 'Client Updated',
        ];
    }
}
