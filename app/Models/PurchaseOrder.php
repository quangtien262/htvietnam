<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    protected $table = 'purchase_orders';

    protected $fillable = [
        'code',
        'supplier_id',
        'order_date',
        'expected_date',
        'total_amount',
        'tax',
        'discount',
        'grand_total',
        'status',
        'payment_status',
        'paid_amount',
        'notes',
        'created_by',
        'approved_by',
        'approved_at',
        'is_recycle_bin',
    ];

    protected $casts = [
        'order_date' => 'date',
        'expected_date' => 'date',
        'approved_at' => 'datetime',
        'total_amount' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'is_recycle_bin' => 'integer',
    ];

    /**
     * Get the supplier for this order
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    /**
     * Get all items for this order
     */
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class, 'purchase_order_id');
    }

    /**
     * Get all stock receipts for this order
     */
    public function stockReceipts(): HasMany
    {
        return $this->hasMany(StockReceipt::class, 'purchase_order_id');
    }

    /**
     * Get all payments for this order
     */
    public function payments(): HasMany
    {
        return $this->hasMany(SupplierPayment::class, 'purchase_order_id');
    }

    /**
     * Get remaining debt
     */
    public function getRemainingDebtAttribute()
    {
        return $this->grand_total - $this->paid_amount;
    }

    /**
     * Get total items count
     */
    public function getTotalItemsAttribute()
    {
        return $this->items()->sum('quantity');
    }

    /**
     * Get received items count
     */
    public function getReceivedItemsAttribute()
    {
        return $this->items()->sum('received_quantity');
    }
}
