<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhmcsOrderItem extends Model
{
    protected $table = 'whmcs_order_items';

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_type',
        'billing_cycle',
        'domain',
        'registration_period',
        'setup_fee',
        'recurring_amount',
        'discount',
        'tax',
        'total',
        'next_due_date',
        'next_invoice_date',
        'custom_field_values',
        'status',
        'service_id',
    ];

    protected $casts = [
        'setup_fee' => 'decimal:2',
        'recurring_amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'custom_field_values' => 'array',
        'next_due_date' => 'date',
        'next_invoice_date' => 'date',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(WhmcsOrder::class, 'order_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(WhmcsProduct::class, 'product_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(WhmcsService::class, 'service_id');
    }
}
