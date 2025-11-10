<?php

namespace App\Models\Whmcs;

use App\Models\Admin\AdminUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    protected $table = 'whmcs_api_keys';

    protected $fillable = [
        'client_id',
        'admin_user_id',
        'name',
        'key',
        'secret',
        'permissions',
        'allowed_ips',
        'status',
        'last_used_at',
        'expires_at',
    ];

    protected $casts = [
        'permissions' => 'array',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected $hidden = [
        'secret',
    ];

    // Relationships
    public function client(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'client_id');
    }

    public function adminUser(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(ApiLog::class);
    }

    // Helper Methods
    public static function generateKey(): string
    {
        return 'whmcs_' . Str::random(40);
    }

    public static function generateSecret(): string
    {
        return Str::random(64);
    }

    public function isActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->expires_at && $this->expires_at < now()) {
            return false;
        }

        return true;
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at < now();
    }

    public function hasPermission(string $permission): bool
    {
        if (!$this->permissions) {
            return false;
        }

        return in_array($permission, $this->permissions) || in_array('*', $this->permissions);
    }

    public function isIpAllowed(string $ip): bool
    {
        if (!$this->allowed_ips) {
            return true; // No IP restriction
        }

        $allowedIps = explode(',', $this->allowed_ips);
        return in_array($ip, array_map('trim', $allowedIps));
    }

    public function verifySecret(string $secret): bool
    {
        return hash_equals($this->secret, hash('sha256', $secret));
    }

    public function revoke(): void
    {
        $this->update(['status' => 'revoked']);
    }

    public function updateLastUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    public function scopeRevoked($query)
    {
        return $query->where('status', 'revoked');
    }
}
