<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhmcsInvoice extends Model
{
    use SoftDeletes;

    protected $table = 'whmcs_invoices';

    protected $fillable = [
        'invoice_number',
        'client_id',
        'invoice_date',
        'due_date',
        'paid_date',
        'status',
        'subtotal',
        'tax',
        'tax2',
        'credit',
        'discount',
        'total',
        'amount_paid',
        'balance',
        'currency_code',
        'tax_rate',
        'tax_rate2',
        'payment_method',
        'notes',
        'admin_notes',
        'last_reminder_sent',
        'reminder_count',
        'created_by',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'paid_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'tax2' => 'decimal:2',
        'credit' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'balance' => 'decimal:2',
        'last_reminder_sent' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(WhmcsClient::class, 'client_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(WhmcsInvoiceItem::class, 'invoice_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(WhmcsInvoicePayment::class, 'invoice_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(WhmcsOrder::class, 'invoice_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'created_by');
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isOverdue(): bool
    {
        return $this->status === 'unpaid' && $this->due_date->isPast();
    }

    public function markAsPaid(): void
    {
        $this->update([
            'status' => 'paid',
            'paid_date' => now(),
            'balance' => 0,
        ]);
    }

    public function addPayment(float $amount, string $method, ?string $transactionId = null): void
    {
        $this->increment('amount_paid', $amount);
        $this->decrement('balance', $amount);

        if ($this->balance <= 0) {
            $this->markAsPaid();
        }
    }
}
