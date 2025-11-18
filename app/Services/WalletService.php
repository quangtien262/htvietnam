<?php

namespace App\Services;

use App\Models\Spa\KhachHangVi;
use App\Models\Spa\GiaoDichVi;
use App\Models\Spa\TheGiaTri;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WalletService
{
    /**
     * Get or create wallet for customer
     */
    public function getOrCreateWallet(int $khachHangId): KhachHangVi
    {
        return KhachHangVi::firstOrCreate(
            ['khach_hang_id' => $khachHangId],
            [
                'so_du' => 0,
                'tong_nap' => 0,
                'tong_tieu' => 0,
                'tong_hoan' => 0,
                'da_nap_hom_nay' => 0,
                'da_rut_hom_nay' => 0,
                'ngay_reset_han_muc' => now(),
            ]
        );
    }

    /**
     * Deposit money to wallet (from gift card purchase)
     */
    public function deposit(
        int $khachHangId,
        float $amount,
        ?int $theGiaTriId = null,
        ?int $nhanVienId = null,
        ?string $ghiChu = null
    ): array {
        try {
            return DB::transaction(function () use ($khachHangId, $amount, $theGiaTriId, $nhanVienId, $ghiChu) {
                $wallet = $this->getOrCreateWallet($khachHangId);
                $wallet->lockForUpdate();

                // Check daily limit
                $canDeposit = $wallet->canDeposit($amount);
                if (!$canDeposit['can_deposit']) {
                    throw new \Exception($canDeposit['message']);
                }

                $soDuTruoc = $wallet->so_du;

                // Update wallet
                $wallet->so_du += $amount;
                $wallet->tong_nap += $amount;
                $wallet->da_nap_hom_nay += $amount;
                $wallet->save();

                // Create transaction log
                $giaoDich = GiaoDichVi::create([
                    'khach_hang_id' => $khachHangId,
                    'loai_giao_dich' => 'nap',
                    'so_tien' => $amount,
                    'so_du_truoc' => $soDuTruoc,
                    'so_du_sau' => $wallet->so_du,
                    'the_gia_tri_id' => $theGiaTriId,
                    'nhan_vien_id' => $nhanVienId,
                    'ghi_chu' => $ghiChu ?? 'Nạp tiền vào ví',
                ]);

                Log::info('Wallet deposit successful', [
                    'khach_hang_id' => $khachHangId,
                    'amount' => $amount,
                    'new_balance' => $wallet->so_du,
                    'transaction_id' => $giaoDich->id,
                ]);

                return [
                    'success' => true,
                    'message' => 'Nạp tiền thành công',
                    'wallet' => $wallet->fresh(),
                    'transaction' => $giaoDich,
                ];
            });
        } catch (\Exception $e) {
            Log::error('Wallet deposit failed', [
                'khach_hang_id' => $khachHangId,
                'amount' => $amount,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Withdraw money from wallet (for payment)
     */
    public function withdraw(
        int $khachHangId,
        float $amount,
        ?int $hoaDonId = null,
        ?int $nhanVienId = null,
        ?string $ghiChu = null
    ): array {
        try {
            return DB::transaction(function () use ($khachHangId, $amount, $hoaDonId, $nhanVienId, $ghiChu) {
                $wallet = $this->getOrCreateWallet($khachHangId);
                $wallet->lockForUpdate();

                // Check if can withdraw
                $canWithdraw = $wallet->canWithdraw($amount);
                if (!$canWithdraw['can_withdraw']) {
                    throw new \Exception($canWithdraw['message']);
                }

                $soDuTruoc = $wallet->so_du;

                // Update wallet
                $wallet->so_du -= $amount;
                $wallet->tong_tieu += $amount;
                $wallet->da_rut_hom_nay += $amount;
                $wallet->save();

                // Create transaction log
                $giaoDich = GiaoDichVi::create([
                    'khach_hang_id' => $khachHangId,
                    'loai_giao_dich' => 'tieu',
                    'so_tien' => $amount,
                    'so_du_truoc' => $soDuTruoc,
                    'so_du_sau' => $wallet->so_du,
                    'hoa_don_id' => $hoaDonId,
                    'nhan_vien_id' => $nhanVienId,
                    'ghi_chu' => $ghiChu ?? 'Thanh toán hóa đơn',
                ]);

                Log::info('Wallet withdraw successful', [
                    'khach_hang_id' => $khachHangId,
                    'amount' => $amount,
                    'new_balance' => $wallet->so_du,
                    'transaction_id' => $giaoDich->id,
                ]);

                return [
                    'success' => true,
                    'message' => 'Thanh toán thành công',
                    'wallet' => $wallet->fresh(),
                    'transaction' => $giaoDich,
                ];
            });
        } catch (\Exception $e) {
            Log::error('Wallet withdraw failed', [
                'khach_hang_id' => $khachHangId,
                'amount' => $amount,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Refund money to wallet (cancel invoice)
     */
    public function refund(
        int $khachHangId,
        float $amount,
        ?int $hoaDonId = null,
        ?int $nhanVienId = null,
        ?string $ghiChu = null
    ): array {
        try {
            return DB::transaction(function () use ($khachHangId, $amount, $hoaDonId, $nhanVienId, $ghiChu) {
                $wallet = $this->getOrCreateWallet($khachHangId);
                $wallet->lockForUpdate();

                $soDuTruoc = $wallet->so_du;

                // Update wallet
                $wallet->so_du += $amount;
                $wallet->tong_hoan += $amount;
                // Also reduce tong_tieu since it's a refund
                $wallet->tong_tieu -= $amount;
                $wallet->save();

                // Create transaction log
                $giaoDich = GiaoDichVi::create([
                    'khach_hang_id' => $khachHangId,
                    'loai_giao_dich' => 'hoan',
                    'so_tien' => $amount,
                    'so_du_truoc' => $soDuTruoc,
                    'so_du_sau' => $wallet->so_du,
                    'hoa_don_id' => $hoaDonId,
                    'nhan_vien_id' => $nhanVienId,
                    'ghi_chu' => $ghiChu ?? 'Hoàn tiền hủy hóa đơn',
                ]);

                Log::info('Wallet refund successful', [
                    'khach_hang_id' => $khachHangId,
                    'amount' => $amount,
                    'new_balance' => $wallet->so_du,
                    'transaction_id' => $giaoDich->id,
                ]);

                return [
                    'success' => true,
                    'message' => 'Hoàn tiền thành công',
                    'wallet' => $wallet->fresh(),
                    'transaction' => $giaoDich,
                ];
            });
        } catch (\Exception $e) {
            Log::error('Wallet refund failed', [
                'khach_hang_id' => $khachHangId,
                'amount' => $amount,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Apply promo code to wallet
     */
    public function applyPromoCode(
        int $khachHangId,
        string $code,
        ?int $nhanVienId = null
    ): array {
        try {
            return DB::transaction(function () use ($khachHangId, $code, $nhanVienId) {
                // Find gift card by code
                $giftCard = TheGiaTri::where('ma_code', $code)
                    ->where('trang_thai', 'active')
                    ->first();

                if (!$giftCard) {
                    throw new \Exception('Mã code không tồn tại hoặc đã bị vô hiệu hóa');
                }

                // Check if code is valid
                if (!$giftCard->isCodeValid()) {
                    throw new \Exception('Mã code đã hết hạn hoặc đã hết lượt sử dụng');
                }

                // Calculate deposit amount with bonus
                $depositAmount = $giftCard->so_tien_nap;

                $wallet = $this->getOrCreateWallet($khachHangId);
                $wallet->lockForUpdate();

                $soDuTruoc = $wallet->so_du;

                // Update wallet
                $wallet->so_du += $depositAmount;
                $wallet->tong_nap += $depositAmount;
                $wallet->save();

                // Increment code usage
                $giftCard->incrementCodeUsage();

                // Create transaction log
                $giaoDich = GiaoDichVi::create([
                    'khach_hang_id' => $khachHangId,
                    'loai_giao_dich' => 'code',
                    'so_tien' => $depositAmount,
                    'so_du_truoc' => $soDuTruoc,
                    'so_du_sau' => $wallet->so_du,
                    'the_gia_tri_id' => $giftCard->id,
                    'nhan_vien_id' => $nhanVienId,
                    'ma_code' => $code,
                    'ghi_chu' => "Nạp code: {$code} - {$giftCard->ten_the}",
                ]);

                Log::info('Promo code applied successfully', [
                    'khach_hang_id' => $khachHangId,
                    'code' => $code,
                    'amount' => $depositAmount,
                    'new_balance' => $wallet->so_du,
                ]);

                return [
                    'success' => true,
                    'message' => "Nạp code thành công! Bạn nhận được " . number_format($depositAmount, 0, ',', '.') . "đ",
                    'wallet' => $wallet->fresh(),
                    'transaction' => $giaoDich,
                    'gift_card' => $giftCard,
                ];
            });
        } catch (\Exception $e) {
            Log::error('Apply promo code failed', [
                'khach_hang_id' => $khachHangId,
                'code' => $code,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Calculate total amount with gift card promotion
     */
    public function calculateGiftCardAmount(int $theGiaTriId): array
    {
        $giftCard = TheGiaTri::find($theGiaTriId);

        if (!$giftCard) {
            return [
                'success' => false,
                'message' => 'Thẻ giá trị không tồn tại',
            ];
        }

        $baseAmount = $giftCard->menh_gia;
        $bonusPercent = $giftCard->ti_le_thuong;
        $bonusAmount = $baseAmount * ($bonusPercent / 100);
        $totalDeposit = $baseAmount + $bonusAmount;

        return [
            'success' => true,
            'gia_ban' => $giftCard->gia_ban,
            'menh_gia' => $baseAmount,
            'ti_le_thuong' => $bonusPercent,
            'tien_thuong' => $bonusAmount,
            'tong_nap' => $totalDeposit,
            'gift_card' => $giftCard,
        ];
    }

    /**
     * Get wallet balance
     */
    public function getBalance(int $khachHangId): float
    {
        $wallet = $this->getOrCreateWallet($khachHangId);
        return $wallet->so_du;
    }

    /**
     * Get wallet info with limits
     */
    public function getWalletInfo(int $khachHangId): array
    {
        $wallet = $this->getOrCreateWallet($khachHangId);
        $wallet->checkAndResetDailyLimits();

        return [
            'so_du' => $wallet->so_du,
            'tong_nap' => $wallet->tong_nap,
            'tong_tieu' => $wallet->tong_tieu,
            'tong_hoan' => $wallet->tong_hoan,
            'han_muc_nap_ngay' => $wallet->han_muc_nap_ngay,
            'han_muc_rut_ngay' => $wallet->han_muc_rut_ngay,
            'da_nap_hom_nay' => $wallet->da_nap_hom_nay,
            'da_rut_hom_nay' => $wallet->da_rut_hom_nay,
            'con_lai_nap_hom_nay' => $wallet->han_muc_nap_ngay ? $wallet->han_muc_nap_ngay - $wallet->da_nap_hom_nay : null,
            'con_lai_rut_hom_nay' => $wallet->han_muc_rut_ngay ? $wallet->han_muc_rut_ngay - $wallet->da_rut_hom_nay : null,
        ];
    }

    /**
     * Set daily limits
     */
    public function setDailyLimits(
        int $khachHangId,
        ?float $hanMucNap = null,
        ?float $hanMucRut = null
    ): array {
        $wallet = $this->getOrCreateWallet($khachHangId);

        if ($hanMucNap !== null) {
            $wallet->han_muc_nap_ngay = $hanMucNap;
        }

        if ($hanMucRut !== null) {
            $wallet->han_muc_rut_ngay = $hanMucRut;
        }

        $wallet->save();

        return [
            'success' => true,
            'message' => 'Cập nhật hạn mức thành công',
            'wallet' => $wallet,
        ];
    }

    /**
     * Get report statistics
     */
    public function getReportStats(?string $startDate = null, ?string $endDate = null): array
    {
        $query = GiaoDichVi::query();

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        // Total gift card revenue (from deposits with gift cards)
        $totalGiftCardRevenue = GiaoDichVi::where('loai_giao_dich', 'NAP')
            ->whereNotNull('the_gia_tri_id')
            ->when($startDate, fn($q) => $q->whereDate('created_at', '>=', $startDate))
            ->when($endDate, fn($q) => $q->whereDate('created_at', '<=', $endDate))
            ->sum('so_tien');

        // Total deposits
        $totalDeposits = (clone $query)->where('loai_giao_dich', 'NAP')->sum('so_tien');

        // Total withdrawals
        $totalWithdrawals = (clone $query)->where('loai_giao_dich', 'RUT')->sum('so_tien');

        // Total refunds
        $totalRefunds = (clone $query)->where('loai_giao_dich', 'HOAN')->sum('so_tien');

        // Net wallet balance (sum of all wallets)
        $netWalletBalance = KhachHangVi::sum('so_du');

        // Gift card count (from deposits)
        $giftCardCount = GiaoDichVi::where('loai_giao_dich', 'NAP')
            ->whereNotNull('the_gia_tri_id')
            ->when($startDate, fn($q) => $q->whereDate('created_at', '>=', $startDate))
            ->when($endDate, fn($q) => $q->whereDate('created_at', '<=', $endDate))
            ->count();

        // Active wallet count (wallets with balance > 0)
        $activeWalletCount = KhachHangVi::where('so_du', '>', 0)->count();

        return [
            'total_gift_card_revenue' => $totalGiftCardRevenue,
            'total_deposits' => $totalDeposits,
            'total_withdrawals' => $totalWithdrawals,
            'total_refunds' => $totalRefunds,
            'net_wallet_balance' => $netWalletBalance,
            'gift_card_count' => $giftCardCount,
            'active_wallet_count' => $activeWalletCount,
        ];
    }

    /**
     * Get top customers by wallet usage
     */
    public function getTopCustomers(?string $startDate = null, ?string $endDate = null, int $limit = 10): array
    {
        $wallets = KhachHangVi::with('khachHang')
            ->orderByDesc('tong_nap')
            ->limit($limit)
            ->get();

        return $wallets->map(function ($wallet) {
            return [
                'id' => $wallet->khach_hang_id,
                'ho_ten' => $wallet->khachHang->ho_ten ?? 'N/A',
                'sdt' => $wallet->khachHang->sdt ?? 'N/A',
                'so_du' => $wallet->so_du,
                'tong_nap' => $wallet->tong_nap,
                'tong_rut' => $wallet->tong_tieu,
            ];
        })->toArray();
    }

    /**
     * Get gift card revenue by card type
     */
    public function getGiftCardRevenue(?string $startDate = null, ?string $endDate = null): array
    {
        $query = GiaoDichVi::where('loai_giao_dich', 'NAP')
            ->whereNotNull('the_gia_tri_id')
            ->with('theGiaTri');

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $transactions = $query->get();

        // Group by gift card
        $revenue = $transactions->groupBy('the_gia_tri_id')->map(function ($group) {
            $giftCard = $group->first()->theGiaTri;
            return [
                'id' => $giftCard->id,
                'ten_the' => $giftCard->ten_the,
                'gia_ban' => $giftCard->gia_ban,
                'menh_gia' => $giftCard->menh_gia,
                'ti_le_thuong' => $giftCard->ti_le_thuong,
                'so_luong_ban' => $group->count(),
                'doanh_thu' => $group->sum(fn($t) => $giftCard->gia_ban),
            ];
        })->values()->toArray();

        return $revenue;
    }

    /**
     * Get transactions for report
     */
    public function getTransactionsForReport(?string $startDate = null, ?string $endDate = null): array
    {
        $query = GiaoDichVi::with(['khachHang', 'theGiaTri', 'hoaDon', 'nhanVien']);

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        return $query->orderByDesc('created_at')->get()->toArray();
    }
}
