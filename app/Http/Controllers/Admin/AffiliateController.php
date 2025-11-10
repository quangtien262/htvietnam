<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\Affiliate;
use App\Models\Whmcs\AffiliatePayout;
use App\Services\Whmcs\AffiliateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AffiliateController extends Controller
{
    protected AffiliateService $affiliateService;

    public function __construct(AffiliateService $affiliateService)
    {
        $this->affiliateService = $affiliateService;
    }

    /**
     * Get all affiliates
     */
    public function index(Request $request): JsonResponse
    {
        $query = Affiliate::with('user')->orderBy('created_at', 'desc');

        if ($request->has('active_only')) {
            $query->active();
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('code', 'like', "%{$search}%");
        }

        $affiliates = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $affiliates,
        ]);
    }

    /**
     * Create new affiliate
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'commission_rate' => 'required|numeric|min:0',
            'commission_type' => 'required|in:percentage,fixed',
            'code' => 'nullable|string|max:50|unique:whmcs_affiliates,code',
            'is_active' => 'boolean',
        ]);

        try {
            $affiliate = $this->affiliateService->createAffiliate(
                $validated['user_id'],
                $validated
            );

            return response()->json([
                'success' => true,
                'data' => $affiliate->load('user'),
                'message' => 'Affiliate created successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get affiliate details
     */
    public function show(int $id): JsonResponse
    {
        $affiliate = Affiliate::with(['user', 'referrals', 'payouts'])->find($id);

        if (!$affiliate) {
            return response()->json([
                'success' => false,
                'message' => 'Affiliate not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $affiliate,
        ]);
    }

    /**
     * Update affiliate
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'commission_rate' => 'numeric|min:0',
            'commission_type' => 'in:percentage,fixed',
            'code' => 'string|max:50|unique:whmcs_affiliates,code,' . $id,
            'is_active' => 'boolean',
        ]);

        try {
            $affiliate = $this->affiliateService->updateAffiliate($id, $validated);

            if (!$affiliate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Affiliate not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $affiliate->load('user'),
                'message' => 'Affiliate updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Delete affiliate
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $result = $this->affiliateService->deleteAffiliate($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Affiliate not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Affiliate deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get affiliate statistics
     */
    public function statistics(int $id): JsonResponse
    {
        try {
            $stats = $this->affiliateService->getAffiliateStatistics($id);

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Get overview statistics
     */
    public function overview(): JsonResponse
    {
        $stats = $this->affiliateService->getOverviewStatistics();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get top affiliates
     */
    public function topAffiliates(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 10);
        $topAffiliates = $this->affiliateService->getTopAffiliates($limit);

        return response()->json([
            'success' => true,
            'data' => $topAffiliates,
        ]);
    }

    /**
     * Get affiliate referrals
     */
    public function referrals(int $id): JsonResponse
    {
        $affiliate = Affiliate::find($id);

        if (!$affiliate) {
            return response()->json([
                'success' => false,
                'message' => 'Affiliate not found',
            ], 404);
        }

        $referrals = $affiliate->referrals()
            ->with(['referredUser', 'invoice'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $referrals,
        ]);
    }

    /**
     * Get all payouts
     */
    public function payouts(Request $request): JsonResponse
    {
        $query = AffiliatePayout::with(['affiliate.user', 'processor'])
            ->orderBy('requested_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('affiliate_id')) {
            $query->where('affiliate_id', $request->input('affiliate_id'));
        }

        $payouts = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $payouts,
        ]);
    }

    /**
     * Request payout
     */
    public function requestPayout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'affiliate_id' => 'required|exists:whmcs_affiliates,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'payment_details' => 'nullable|array',
        ]);

        try {
            $payout = $this->affiliateService->requestPayout(
                $validated['affiliate_id'],
                $validated['amount'],
                $validated['payment_method'],
                $validated['payment_details'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => $payout->load('affiliate'),
                'message' => 'Payout request created successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Approve payout
     */
    public function approvePayout(Request $request, int $id): JsonResponse
    {
        try {
            $payout = $this->affiliateService->approvePayout($id, $request->user()->id);

            return response()->json([
                'success' => true,
                'data' => $payout->load(['affiliate', 'processor']),
                'message' => 'Payout approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Reject payout
     */
    public function rejectPayout(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        try {
            $payout = $this->affiliateService->rejectPayout(
                $id,
                $request->user()->id,
                $validated['reason'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => $payout->load(['affiliate', 'processor']),
                'message' => 'Payout rejected successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
