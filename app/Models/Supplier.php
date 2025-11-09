<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $table = 'suppliers';

    protected $fillable = [
        'code',
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'tax_code',
        'payment_terms',
        'status',
        'rating',
        'notes',
        'created_by',
        'updated_by',
        'is_recycle_bin',
    ];

    protected $casts = [
        'status' => 'integer',
        'payment_terms' => 'integer',
        'rating' => 'decimal:2',
        'is_recycle_bin' => 'integer',
    ];

    /**
     * Get all purchase orders for this supplier
     */
    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class, 'supplier_id');
    }

    /**
     * Get all payments for this supplier
     */
    public function payments(): HasMany
    {
        return $this->hasMany(SupplierPayment::class, 'supplier_id');
    }

    /**
     * Get total debt amount
     */
    public function getTotalDebtAttribute()
    {
        $totalOrders = $this->purchaseOrders()
            ->whereIn('status', ['sent', 'receiving', 'completed'])
            ->sum('grand_total');

        $totalPaid = $this->payments()->sum('amount');

        return $totalOrders - $totalPaid;
    }

    /**
     * Get total orders count
     */
    public function getTotalOrdersAttribute()
    {
        return $this->purchaseOrders()->count();
    }
}
