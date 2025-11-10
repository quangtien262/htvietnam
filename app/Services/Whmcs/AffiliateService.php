<?php

namespace App\Services\Whmcs;

use App\Models\Whmcs\Affiliate;
use App\Models\Whmcs\AffiliateReferral;
use App\Models\Whmcs\AffiliatePayout;
use App\Models\Whmcs\Invoice;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AffiliateService
{
    /**
     * Create new affiliate
     */
    public function createAffiliate(int $userId, array $data = []): Affiliate
    {
        $data['user_id'] = $userId;
        $data['code'] = $data['code'] ?? Affiliate::generateUniqueCode();

        return Affiliate::create($data);
    }

    /**
     * Track referral (when user clicks affiliate link)
     */
    public function trackReferral(string $affiliateCode, int $referredUserId, ?string $ipAddress = null, ?string $userAgent = null): ?AffiliateReferral
    {
        $affiliate = Affiliate::where('code', $affiliateCode)->active()->first();

        if (!$affiliate) {
            return null;
        }

        // Check if this user was already referred
        $existing = AffiliateReferral::where('referred_user_id', $referredUserId)->first();
        if ($existing) {
            return $existing;
        }

        $referral = AffiliateReferral::create([
            'affiliate_id' => $affiliate->id,
            'referred_user_id' => $referredUserId,
            'status' => 'pending',
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);

        $affiliate->incrementReferrals();

        return $referral;
    }

    /**
     * Process conversion (when referred user makes first purchase)
     */
    public function processConversion(Invoice $invoice): ?AffiliateReferral
    {
        // Check if invoice has affiliate tracking
        if (!$invoice->affiliate_id) {
            return null;
        }

        $affiliate = Affiliate::find($invoice->affiliate_id);
        if (!$affiliate || !$affiliate->isActive()) {
            return null;
        }

        // Find pending referral
        $referral = AffiliateReferral::where('affiliate_id', $affiliate->id)
            ->where('referred_user_id', $invoice->client_id)
            ->pending()
            ->first();

        if (!$referral) {
            // Create new referral for this conversion
            $referral = AffiliateReferral::create([
                'affiliate_id' => $affiliate->id,
                'referred_user_id' => $invoice->client_id,
                'invoice_id' => $invoice->id,
                'status' => 'pending',
            ]);
        }

        // Calculate commission
        $commissionAmount = $affiliate->calculateCommission($invoice->total);

        // Mark as converted
        $referral->markAsConverted($invoice->total, $commissionAmount);
        $referral->update(['invoice_id' => $invoice->id]);

        // Add earnings to affiliate
        $affiliate->addEarnings($commissionAmount, true);
        $affiliate->incrementReferrals(true);

        return $referral;
    }

    /**
     * Request payout
     */
    public function requestPayout(int $affiliateId, float $amount, string $paymentMethod, ?array $paymentDetails = null): AffiliatePayout
    {
        $affiliate = Affiliate::findOrFail($affiliateId);

        if ($amount > $affiliate->pending_earnings) {
            throw new \Exception('Insufficient pending earnings');
        }

        $payout = AffiliatePayout::create([
            'affiliate_id' => $affiliateId,
            'amount' => $amount,
            'status' => 'pending',
            'payment_method' => $paymentMethod,
            'payment_details' => $paymentDetails,
            'requested_at' => now(),
        ]);

        return $payout;
    }

    /**
     * Approve payout
     */
    public function approvePayout(int $payoutId, int $processedBy): AffiliatePayout
    {
        $payout = AffiliatePayout::findOrFail($payoutId);

        if (!$payout->isPending()) {
            throw new \Exception('Payout is not pending');
        }

        $payout->markAsPaid($processedBy);

        return $payout;
    }

    /**
     * Reject payout
     */
    public function rejectPayout(int $payoutId, int $processedBy, ?string $reason = null): AffiliatePayout
    {
        $payout = AffiliatePayout::findOrFail($payoutId);

        if (!$payout->isPending()) {
            throw new \Exception('Payout is not pending');
        }

        $payout->markAsRejected($processedBy, $reason);

        return $payout;
    }

    /**
     * Get affiliate statistics
     */
    public function getAffiliateStatistics(int $affiliateId): array
    {
        $affiliate = Affiliate::with(['referrals', 'payouts'])->findOrFail($affiliateId);

        $totalReferrals = $affiliate->referrals()->count();
        $convertedReferrals = $affiliate->referrals()->converted()->count();
        $pendingReferrals = $affiliate->referrals()->pending()->count();
        
        $thisMonthReferrals = $affiliate->referrals()->recent(30)->count();
        $thisMonthEarnings = $affiliate->referrals()->recent(30)->converted()->sum('commission_amount');

        $pendingPayouts = $affiliate->payouts()->pending()->sum('amount');
        $paidPayouts = $affiliate->payouts()->paid()->sum('amount');

        return [
            'affiliate' => $affiliate,
            'total_referrals' => $totalReferrals,
            'converted_referrals' => $convertedReferrals,
            'pending_referrals' => $pendingReferrals,
            'conversion_rate' => $affiliate->getConversionRate(),
            'this_month_referrals' => $thisMonthReferrals,
            'this_month_earnings' => $thisMonthEarnings,
            'total_earnings' => $affiliate->total_earnings,
            'pending_earnings' => $affiliate->pending_earnings,
            'paid_earnings' => $affiliate->paid_earnings,
            'pending_payouts' => $pendingPayouts,
            'paid_payouts' => $paidPayouts,
            'referral_link' => $affiliate->getReferralLink(),
        ];
    }

    /**
     * Get top affiliates
     */
    public function getTopAffiliates(int $limit = 10): array
    {
        return Affiliate::with('user')
            ->active()
            ->topPerformers($limit)
            ->get()
            ->map(function ($affiliate) {
                return [
                    'id' => $affiliate->id,
                    'user_name' => $affiliate->user->name,
                    'user_email' => $affiliate->user->email,
                    'code' => $affiliate->code,
                    'total_earnings' => $affiliate->total_earnings,
                    'total_referrals' => $affiliate->total_referrals,
                    'successful_referrals' => $affiliate->successful_referrals,
                    'conversion_rate' => $affiliate->getConversionRate(),
                ];
            })
            ->toArray();
    }

    /**
     * Get affiliate overview stats
     */
    public function getOverviewStatistics(): array
    {
        $totalAffiliates = Affiliate::count();
        $activeAffiliates = Affiliate::active()->count();
        
        $totalEarnings = Affiliate::sum('total_earnings');
        $pendingEarnings = Affiliate::sum('pending_earnings');
        $paidEarnings = Affiliate::sum('paid_earnings');

        $totalReferrals = AffiliateReferral::count();
        $convertedReferrals = AffiliateReferral::converted()->count();
        $conversionRate = $totalReferrals > 0 ? ($convertedReferrals / $totalReferrals) * 100 : 0;

        $pendingPayouts = AffiliatePayout::pending()->sum('amount');
        $pendingPayoutsCount = AffiliatePayout::pending()->count();

        return [
            'total_affiliates' => $totalAffiliates,
            'active_affiliates' => $activeAffiliates,
            'total_earnings' => $totalEarnings,
            'pending_earnings' => $pendingEarnings,
            'paid_earnings' => $paidEarnings,
            'total_referrals' => $totalReferrals,
            'converted_referrals' => $convertedReferrals,
            'conversion_rate' => round($conversionRate, 2),
            'pending_payouts' => $pendingPayouts,
            'pending_payouts_count' => $pendingPayoutsCount,
        ];
    }

    /**
     * Update affiliate
     */
    public function updateAffiliate(int $id, array $data): ?Affiliate
    {
        $affiliate = Affiliate::find($id);

        if (!$affiliate) {
            return null;
        }

        $affiliate->update($data);

        return $affiliate->fresh();
    }

    /**
     * Delete affiliate
     */
    public function deleteAffiliate(int $id): bool
    {
        $affiliate = Affiliate::find($id);

        if (!$affiliate) {
            return false;
        }

        // Cannot delete if has pending payouts
        if ($affiliate->payouts()->pending()->exists()) {
            throw new \Exception('Cannot delete affiliate with pending payouts');
        }

        $affiliate->delete();

        return true;
    }
}
