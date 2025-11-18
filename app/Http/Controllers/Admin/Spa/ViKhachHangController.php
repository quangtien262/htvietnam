<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use App\Models\Spa\GiaoDichVi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class ViKhachHangController extends Controller
{
    protected $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    /**
     * Get wallet info for customer
     */
    public function getWallet($khachHangId)
    {
        $walletInfo = $this->walletService->getWalletInfo($khachHangId);

        return response()->json([
            'success' => true,
            'data' => $walletInfo,
        ]);
    }

    /**
     * Get transaction history
     */
    public function getHistory(Request $request, $khachHangId)
    {
        $query = GiaoDichVi::where('khach_hang_id', $khachHangId)
            ->with(['theGiaTri', 'hoaDon', 'nhanVien']);

        // Filter by transaction type
        if ($request->has('loai_giao_dich')) {
            $query->where('loai_giao_dich', $request->loai_giao_dich);
        }

        // Filter by date range
        if ($request->has('tu_ngay')) {
            $query->whereDate('created_at', '>=', $request->tu_ngay);
        }
        if ($request->has('den_ngay')) {
            $query->whereDate('created_at', '<=', $request->den_ngay);
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($transactions);
    }

    /**
     * Deposit money (buy gift card)
     */
    public function napTien(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'khach_hang_id' => 'required|exists:users,id',
            'the_gia_tri_id' => 'required|exists:spa_the_gia_tri,id',
            'ghi_chu' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Calculate amount with promotion
        $calculation = $this->walletService->calculateGiftCardAmount($request->the_gia_tri_id);

        if (!$calculation['success']) {
            return response()->json($calculation, 422);
        }

        // Perform deposit
        $result = $this->walletService->deposit(
            $request->khach_hang_id,
            $calculation['tong_nap'],
            $request->the_gia_tri_id,
            Auth::id(),
            $request->ghi_chu
        );

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => [
                'wallet' => $result['wallet'],
                'transaction' => $result['transaction'],
                'calculation' => $calculation,
            ],
        ]);
    }

    /**
     * Withdraw money (payment)
     */
    public function truTien(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'khach_hang_id' => 'required|exists:users,id',
            'so_tien' => 'required|numeric|min:0',
            'hoa_don_id' => 'nullable|exists:spa_hoa_don,id',
            'ghi_chu' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->walletService->withdraw(
            $request->khach_hang_id,
            $request->so_tien,
            $request->hoa_don_id,
            Auth::id(),
            $request->ghi_chu
        );

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => [
                'wallet' => $result['wallet'],
                'transaction' => $result['transaction'],
            ],
        ]);
    }

    /**
     * Refund money
     */
    public function hoanTien(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'khach_hang_id' => 'required|exists:users,id',
            'so_tien' => 'required|numeric|min:0',
            'hoa_don_id' => 'nullable|exists:spa_hoa_don,id',
            'ghi_chu' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->walletService->refund(
            $request->khach_hang_id,
            $request->so_tien,
            $request->hoa_don_id,
            Auth::id(),
            $request->ghi_chu
        );

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => [
                'wallet' => $result['wallet'],
                'transaction' => $result['transaction'],
            ],
        ]);
    }

    /**
     * Apply promo code
     */
    public function applyCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'khach_hang_id' => 'required|exists:users,id',
            'ma_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->walletService->applyPromoCode(
            $request->khach_hang_id,
            $request->ma_code,
            Auth::id()
        );

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        return response()->json($result);
    }

    /**
     * Set daily limits
     */
    public function setLimits(Request $request, $khachHangId)
    {
        $validator = Validator::make($request->all(), [
            'han_muc_nap_ngay' => 'nullable|numeric|min:0',
            'han_muc_rut_ngay' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->walletService->setDailyLimits(
            $khachHangId,
            $request->han_muc_nap_ngay,
            $request->han_muc_rut_ngay
        );

        return response()->json($result);
    }

    /**
     * Get report statistics
     */
    public function getReportStats(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $stats = $this->walletService->getReportStats($startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get top customers by wallet usage
     */
    public function getTopCustomers(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $limit = $request->input('limit', 10);

        $topCustomers = $this->walletService->getTopCustomers($startDate, $endDate, $limit);

        return response()->json([
            'success' => true,
            'data' => $topCustomers,
        ]);
    }

    /**
     * Get gift card revenue report
     */
    public function getGiftCardRevenue(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $revenue = $this->walletService->getGiftCardRevenue($startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $revenue,
        ]);
    }

    /**
     * Get all transactions for report
     */
    public function getTransactions(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $transactions = $this->walletService->getTransactionsForReport($startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }
}
