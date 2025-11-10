<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class AffiliateReferral extends Model
{
    protected $table = 'whmcs_affiliate_referrals';

    protected $fillable = [
        'affiliate_id',
        'referred_user_id',
        'invoice_id',
        'status',
        'commission_amount',
        'order_amount',
        'ip_address',
        'user_agent',
        'converted_at',
    ];

    protected $casts = [
        'commission_amount' => 'decimal:2',
        'order_amount' => 'decimal:2',
        'converted_at' => 'datetime',
    ];

    /**
     * Get the affiliate
     */
    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    /**
     * Get the referred user
     */
    public function referredUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_user_id');
    }

    /**
     * Get the invoice
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Check if referral is converted
     */
    public function isConverted(): bool
    {
        return $this->status === 'converted';
    }

    /**
     * Check if referral is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Mark as converted
     */
    public function markAsConverted(float $orderAmount, float $commissionAmount): void
    {
        $this->update([
            'status' => 'converted',
            'order_amount' => $orderAmount,
            'commission_amount' => $commissionAmount,
            'converted_at' => now(),
        ]);
    }

    /**
     * Scope: Converted referrals
     */
    public function scopeConverted($query)
    {
        return $query->where('status', 'converted');
    }

    /**
     * Scope: Pending referrals
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Recent referrals
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
