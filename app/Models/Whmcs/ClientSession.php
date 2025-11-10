<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientSession extends Model
{
    protected $table = 'whmcs_client_sessions';

    protected $fillable = [
        'client_id',
        'token',
        'ip_address',
        'user_agent',
        'last_activity',
        'expires_at',
    ];

    protected $casts = [
        'last_activity' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // Relationships
    public function client(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'client_id');
    }

    // Helper Methods
    public function isExpired(): bool
    {
        return $this->expires_at < now();
    }

    public function isActive(): bool
    {
        return !$this->isExpired();
    }

    public function extend(int $minutes = 120): void
    {
        $this->update([
            'expires_at' => now()->addMinutes($minutes),
            'last_activity' => now(),
        ]);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }
}
