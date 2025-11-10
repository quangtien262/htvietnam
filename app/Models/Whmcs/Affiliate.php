<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;
use Illuminate\Support\Str;

class Affiliate extends Model
{
    protected $table = 'whmcs_affiliates';

    protected $fillable = [
        'user_id',
        'code',
        'commission_rate',
        'commission_type',
        'total_earnings',
        'pending_earnings',
        'paid_earnings',
        'total_referrals',
        'successful_referrals',
        'is_active',
        'last_payout_at',
        'notes',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:2',
        'total_earnings' => 'decimal:2',
        'pending_earnings' => 'decimal:2',
        'paid_earnings' => 'decimal:2',
        'total_referrals' => 'integer',
        'successful_referrals' => 'integer',
        'is_active' => 'boolean',
        'last_payout_at' => 'datetime',
    ];

    /**
     * Get the user (affiliate)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get referrals
     */
    public function referrals(): HasMany
    {
        return $this->hasMany(AffiliateReferral::class);
    }

    /**
     * Get payouts
     */
    public function payouts(): HasMany
    {
        return $this->hasMany(AffiliatePayout::class);
    }

    /**
     * Get invoices generated through this affiliate
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'affiliate_id');
    }

    /**
     * Check if affiliate is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Get conversion rate
     */
    public function getConversionRate(): float
    {
        if ($this->total_referrals == 0) {
            return 0;
        }

        return ($this->successful_referrals / $this->total_referrals) * 100;
    }

    /**
     * Get referral link
     */
    public function getReferralLink(): string
    {
        return url("/register?ref={$this->code}");
    }

    /**
     * Calculate commission for amount
     */
    public function calculateCommission(float $amount): float
    {
        if ($this->commission_type === 'fixed') {
            return $this->commission_rate;
        }

        return ($amount * $this->commission_rate) / 100;
    }

    /**
     * Add earnings
     */
    public function addEarnings(float $amount, bool $isPending = true): void
    {
        if ($isPending) {
            $this->increment('pending_earnings', $amount);
        } else {
            $this->increment('paid_earnings', $amount);
        }

        $this->increment('total_earnings', $amount);
    }

    /**
     * Move pending to paid
     */
    public function confirmEarnings(float $amount): void
    {
        $this->decrement('pending_earnings', $amount);
        $this->increment('paid_earnings', $amount);
    }

    /**
     * Increment referral count
     */
    public function incrementReferrals(bool $isSuccessful = false): void
    {
        $this->increment('total_referrals');
        
        if ($isSuccessful) {
            $this->increment('successful_referrals');
        }
    }

    /**
     * Scope: Active affiliates
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Top performers
     */
    public function scopeTopPerformers($query, int $limit = 10)
    {
        return $query->orderByDesc('total_earnings')->limit($limit);
    }

    /**
     * Generate unique affiliate code
     */
    public static function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (static::where('code', $code)->exists());

        return $code;
    }
}
