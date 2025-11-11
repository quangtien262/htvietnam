<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhmcsOrder extends Model
{
    use SoftDeletes;

    protected $table = 'whmcs_orders';

    protected $fillable = [
        'order_number',
        'client_id',
        'status',
        'invoice_id',
        'amount',
        'discount',
        'tax',
        'total',
        'currency_code',
        'promo_code',
        'promo_discount',
        'payment_method',
        'payment_status',
        'ip_address',
        'fraud_data',
        'admin_notes',
        'client_notes',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'promo_discount' => 'decimal:2',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(WhmcsClient::class, 'client_id');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(WhmcsInvoice::class, 'invoice_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(WhmcsOrderItem::class, 'order_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'created_by');
    }
}
