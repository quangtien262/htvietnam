<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhmcsService extends Model
{
    use SoftDeletes;

    protected $table = 'whmcs_services';

    protected $fillable = [
        'client_id',
        'product_id',
        'order_id',
        'service_name',
        'product_type',
        'domain',
        'username',
        'password',
        'dedicated_ip',
        'billing_cycle',
        'recurring_amount',
        'override_auto_suspend_date',
        'override_suspension_reason',
        'registration_date',
        'next_due_date',
        'next_invoice_date',
        'termination_date',
        'status',
        'server_id',
        'module_params',
        'auto_renew',
        'override_auto_suspend',
        'override_auto_terminate',
        'suspension_reason',
        'suspended_at',
        'admin_notes',
        'disk_usage',
        'disk_limit',
        'bandwidth_usage',
        'bandwidth_limit',
        'last_update_usage',
    ];

    protected $casts = [
        'recurring_amount' => 'decimal:2',
        'override_auto_suspend_date' => 'decimal:2',
        'override_suspension_reason' => 'decimal:2',
        'registration_date' => 'date',
        'next_due_date' => 'date',
        'next_invoice_date' => 'date',
        'termination_date' => 'date',
        'module_params' => 'array',
        'auto_renew' => 'boolean',
        'override_auto_suspend' => 'boolean',
        'override_auto_terminate' => 'boolean',
        'suspended_at' => 'datetime',
        'last_update_usage' => 'datetime',
    ];

    protected $hidden = [
        'password',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(WhmcsClient::class, 'client_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(WhmcsProduct::class, 'product_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(WhmcsOrder::class, 'order_id');
    }

    public function addons(): HasMany
    {
        return $this->hasMany(WhmcsServiceAddon::class, 'service_id');
    }

    public function fieldValues(): HasMany
    {
        return $this->hasMany(WhmcsServiceFieldValue::class, 'service_id');
    }

    public function invoiceItems(): HasMany
    {
        return $this->hasMany(WhmcsInvoiceItem::class, 'service_id');
    }
}
