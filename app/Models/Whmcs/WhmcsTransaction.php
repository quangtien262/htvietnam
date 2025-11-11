<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhmcsTransaction extends Model
{
    protected $table = 'whmcs_transactions';

    protected $fillable = [
        'client_id',
        'invoice_id',
        'transaction_id',
        'gateway_name',
        'amount',
        'currency_code',
        'type',
        'status',
        'gateway_response',
        'gateway_transaction_id',
        'fees',
        'transaction_date',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fees' => 'decimal:2',
        'transaction_date' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(WhmcsClient::class, 'client_id');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(WhmcsInvoice::class, 'invoice_id');
    }
}
