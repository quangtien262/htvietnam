<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Domain extends Model
{
    use SoftDeletes;

    protected $table = 'whmcs_domains';

    protected $fillable = [
        'user_id', 'domain', 'registrar', 'status', 'registration_date',
        'expiry_date', 'auto_renew', 'nameserver1', 'nameserver2',
        'nameserver3', 'nameserver4', 'whois_privacy', 'domain_lock',
        'epp_code', 'whois_data'
    ];

    protected $casts = [
        'registration_date' => 'date',
        'expiry_date' => 'date',
        'auto_renew' => 'boolean',
        'whois_privacy' => 'boolean',
        'domain_lock' => 'boolean',
        'whois_data' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired' || ($this->expiry_date && now()->greaterThan($this->expiry_date));
    }

    public function daysUntilExpiry(): ?int
    {
        if (!$this->expiry_date) {
            return null;
        }

        return max(0, now()->diffInDays($this->expiry_date, false));
    }
}
