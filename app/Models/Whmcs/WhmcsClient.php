<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;

class WhmcsClient extends Authenticatable
{
    use SoftDeletes;

    protected $table = 'whmcs_clients';

    protected $fillable = [
        'code',
        'company_name',
        'first_name',
        'last_name',
        'email',
        'phone',
        'mobile',
        'address1',
        'address2',
        'city',
        'state',
        'postcode',
        'country',
        'tax_id',
        'tax_exempt',
        'status',
        'password',
        'email_verified_at',
        'credit',
        'balance',
        'currency_code',
        'billing_cycle_day',
        'notes',
        'custom_fields',
        'created_by',
        'assigned_to',
    ];

    protected $casts = [
        'tax_exempt' => 'boolean',
        'email_verified_at' => 'datetime',
        'credit' => 'decimal:2',
        'balance' => 'decimal:2',
        'custom_fields' => 'array',
    ];

    protected $hidden = [
        'password',
    ];

    // Relationships
    public function orders(): HasMany
    {
        return $this->hasMany(WhmcsOrder::class, 'client_id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(WhmcsService::class, 'client_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(WhmcsInvoice::class, 'client_id');
    }

    public function domains(): HasMany
    {
        return $this->hasMany(WhmcsDomain::class, 'client_id');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(WhmcsTicket::class, 'client_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WhmcsTransaction::class, 'client_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'assigned_to');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'created_by');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(WhmcsNote::class, 'notable_id')->where('notable_type', self::class);
    }

    // Helper Methods
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->company_name ?: $this->full_name;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function addCredit(float $amount): void
    {
        $this->credit += $amount;
        $this->save();
    }

    public function deductCredit(float $amount): void
    {
        $this->credit -= $amount;
        $this->save();
    }

    public function addBalance(float $amount): void
    {
        $this->balance += $amount;
        $this->save();
    }

    public function deductBalance(float $amount): void
    {
        $this->balance -= $amount;
        $this->save();
    }
}
