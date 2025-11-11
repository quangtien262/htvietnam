<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhmcsDomain extends Model
{
    use SoftDeletes;

    protected $table = 'whmcs_domains';

    protected $fillable = [
        'client_id',
        'order_id',
        'domain',
        'tld_id',
        'type',
        'registration_date',
        'expiry_date',
        'next_due_date',
        'next_invoice_date',
        'billing_cycle',
        'recurring_amount',
        'status',
        'registrant_contact',
        'admin_contact',
        'technical_contact',
        'billing_contact',
        'nameserver1',
        'nameserver2',
        'nameserver3',
        'nameserver4',
        'nameserver5',
        'transfer_secret',
        'id_protection',
        'id_protection_price',
        'auto_renew',
        'registrar',
        'registrar_lock',
        'admin_notes',
    ];

    protected $casts = [
        'registration_date' => 'date',
        'expiry_date' => 'date',
        'next_due_date' => 'date',
        'next_invoice_date' => 'date',
        'recurring_amount' => 'decimal:2',
        'registrant_contact' => 'array',
        'admin_contact' => 'array',
        'technical_contact' => 'array',
        'billing_contact' => 'array',
        'id_protection' => 'boolean',
        'id_protection_price' => 'decimal:2',
        'auto_renew' => 'boolean',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(WhmcsClient::class, 'client_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(WhmcsOrder::class, 'order_id');
    }

    public function tld(): BelongsTo
    {
        return $this->belongsTo(WhmcsDomainTld::class, 'tld_id');
    }

    public function addons(): HasMany
    {
        return $this->hasMany(WhmcsDomainAddon::class, 'domain_id');
    }

    public function invoiceItems(): HasMany
    {
        return $this->hasMany(WhmcsInvoiceItem::class, 'domain_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isExpired(): bool
    {
        return $this->expiry_date->isPast();
    }
}
