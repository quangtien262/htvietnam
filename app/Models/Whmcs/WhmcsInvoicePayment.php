<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhmcsInvoicePayment extends Model
{
    protected $table = 'whmcs_invoice_payments';

    protected $fillable = [
        'invoice_id',
        'client_id',
        'amount',
        'currency_code',
        'payment_method',
        'transaction_id',
        'payment_date',
        'gateway_response',
        'fees',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fees' => 'decimal:2',
        'payment_date' => 'datetime',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(WhmcsInvoice::class, 'invoice_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(WhmcsClient::class, 'client_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'created_by');
    }
}
