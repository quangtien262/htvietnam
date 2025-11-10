<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class AffiliatePayout extends Model
{
    protected $table = 'whmcs_affiliate_payouts';

    protected $fillable = [
        'affiliate_id',
        'amount',
        'status',
        'payment_method',
        'payment_details',
        'notes',
        'requested_at',
        'processed_at',
        'processed_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_details' => 'array',
        'requested_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    /**
     * Get the affiliate
     */
    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    /**
     * Get the processor (admin user)
     */
    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Check if payout is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if payout is paid
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    /**
     * Check if payout is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Mark as paid
     */
    public function markAsPaid(int $processedBy): void
    {
        $this->update([
            'status' => 'paid',
            'processed_at' => now(),
            'processed_by' => $processedBy,
        ]);

        // Update affiliate paid earnings
        $this->affiliate->confirmEarnings($this->amount);
        $this->affiliate->update(['last_payout_at' => now()]);
    }

    /**
     * Mark as rejected
     */
    public function markAsRejected(int $processedBy, ?string $reason = null): void
    {
        $this->update([
            'status' => 'rejected',
            'processed_at' => now(),
            'processed_by' => $processedBy,
            'notes' => $reason,
        ]);
    }

    /**
     * Scope: Pending payouts
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Paid payouts
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope: Recent payouts
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
