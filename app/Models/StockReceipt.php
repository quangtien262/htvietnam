<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockReceipt extends Model
{
    protected $table = 'stock_receipts';

    protected $fillable = [
        'code',
        'purchase_order_id',
        'receipt_date',
        'warehouse',
        'status',
        'notes',
        'received_by',
        'created_by',
        'is_recycle_bin',
    ];

    protected $casts = [
        'receipt_date' => 'date',
        'is_recycle_bin' => 'integer',
    ];

    /**
     * Get the purchase order for this receipt
     */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id');
    }
}
