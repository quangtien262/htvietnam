<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhmcsInvoiceItem extends Model
{
    protected $table = 'whmcs_invoice_items';

    protected $fillable = [
        'invoice_id',
        'type',
        'service_id',
        'domain_id',
        'description',
        'amount',
        'taxed',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'taxed' => 'boolean',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(WhmcsInvoice::class, 'invoice_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(WhmcsService::class, 'service_id');
    }

    public function domain(): BelongsTo
    {
        return $this->belongsTo(WhmcsDomain::class, 'domain_id');
    }
}
