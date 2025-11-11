<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'whmcs_services';

    protected $fillable = [
        'user_id', 'product_id', 'currency_id', 'server_id', 'domain', 'username', 'password',
        'status', 'payment_cycle', 'recurring_amount', 'registration_date',
        'next_due_date', 'termination_date', 'config_options',
        'disk_usage', 'bandwidth_usage', 'notes'
    ];

    protected $casts = [
        'config_options' => 'array',
        'disk_usage' => 'array',
        'bandwidth_usage' => 'array',
        'recurring_amount' => 'decimal:2',
        'registration_date' => 'date',
        'next_due_date' => 'date',
        'termination_date' => 'date',
    ];

    protected $hidden = ['password'];

    protected $appends = ['billing_cycle'];

    // Accessor cho billing_cycle (alias của payment_cycle)
    public function getBillingCycleAttribute(): ?string
    {
        return $this->payment_cycle;
    }

    // Mutator cho billing_cycle (alias của payment_cycle)
    public function setBillingCycleAttribute($value): void
    {
        $this->attributes['payment_cycle'] = $value;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    public function isDue(): bool
    {
        return $this->next_due_date && now()->greaterThanOrEqualTo($this->next_due_date);
    }

    public function activate(): void
    {
        $this->update([
            'status' => 'active',
            'registration_date' => now(),
        ]);
    }

    public function suspend(): void
    {
        $this->update(['status' => 'suspended']);
    }

    public function terminate(): void
    {
        $this->update([
            'status' => 'terminated',
            'termination_date' => now(),
        ]);
    }
}
