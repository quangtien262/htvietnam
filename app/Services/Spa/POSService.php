<?php

namespace App\Services\Spa;

use App\Models\Spa\HoaDon;
use App\Models\Spa\HoaDonChiTiet;
use App\Models\Spa\SanPham;
use App\Models\Admin\CongNo;
use App\Models\Admin\SoQuy;
use App\Services\TblService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class POSService
{
    public function getInvoiceList($filters = [], $perPage = 20)
    {
        $query = HoaDon::query()
            ->with(['khachHang', 'chiNhanh', 'chiTiets'])
            ->orderBy('created_at', 'desc');

        // Filter by branch
        if (!empty($filters['chi_nhanh_id'])) {
            $query->where('chi_nhanh_id', $filters['chi_nhanh_id']);
        }

        // Filter by status
        if (!empty($filters['trang_thai'])) {
            $query->where('trang_thai', $filters['trang_thai']);
        }

        // Filter by date range
        if (!empty($filters['tu_ngay'])) {
            $query->whereDate('ngay_ban', '>=', $filters['tu_ngay']);
        }
        if (!empty($filters['den_ngay'])) {
            $query->whereDate('ngay_ban', '<=', $filters['den_ngay']);
        }

        // Search by invoice code or customer name
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('ma_hoa_don', 'like', "%{$search}%")
                  ->orWhereHas('khachHang', function($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%")
                         ->orWhere('ho_ten', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%")
                         ->orWhere('sdt', 'like', "%{$search}%");
                  });
            });
        }

        return $query->paginate($perPage);
    }

    public function createInvoice($data)
    {
        return DB::transaction(function() use ($data) {
            // Generate invoice code
            $lastInvoice = HoaDon::orderBy('id', 'desc')->first();
            $nextNumber = $lastInvoice ? (int)substr($lastInvoice->ma_hoa_don, 2) + 1 : 1;
            $data['ma_hoa_don'] = 'HD' . str_pad($nextNumber, 8, '0', STR_PAD_LEFT);

            $data['ngay_ban'] = now();
            $data['trang_thai'] = 'cho_thanh_toan';

            // Ensure chi_nhanh_id is set
            if (empty($data['chi_nhanh_id'])) {
                $data['chi_nhanh_id'] = 1; // Default branch
            }

            $hoaDon = HoaDon::create($data);

            // Add invoice details
            foreach ($data['chi_tiets'] as $chiTiet) {
                $donGia = 0;

                // Get price from frontend data or fetch from database
                if (!empty($chiTiet['don_gia'])) {
                    // Use price from frontend (for mock data)
                    $donGia = $chiTiet['don_gia'];
                } elseif (!empty($chiTiet['dich_vu_id'])) {
                    // Try to fetch from database
                    $dichVu = \App\Models\Spa\DichVu::find($chiTiet['dich_vu_id']);
                    if ($dichVu) {
                        $khachHang = !empty($data['khach_hang_id']) ? \App\Models\User::find($data['khach_hang_id']) : null;
                        $donGia = $dichVu->gia_ban;
                    } else {
                        // Fallback: use a default price if service not found
                        $donGia = $chiTiet['don_gia'] ?? 0;
                    }
                } elseif (!empty($chiTiet['san_pham_id'])) {
                    // Try to fetch from database
                    $sanPham = SanPham::find($chiTiet['san_pham_id']);
                    if ($sanPham) {
                        $khachHang = !empty($data['khach_hang_id']) ? \App\Models\User::find($data['khach_hang_id']) : null;
                        $donGia = $sanPham->gia_ban;

                        // Update stock
                        $sanPham->updateStock($chiTiet['so_luong'], 'decrease');
                    } else {
                        // Fallback: use a default price if product not found
                        $donGia = $chiTiet['don_gia'] ?? 0;
                    }
                }

                $thanhTien = $donGia * ($chiTiet['so_luong'] ?? 1);

                HoaDonChiTiet::create([
                    'hoa_don_id' => $hoaDon->id,
                    'dich_vu_id' => $chiTiet['dich_vu_id'] ?? null,
                    'san_pham_id' => $chiTiet['san_pham_id'] ?? null,
                    'ktv_id' => $chiTiet['ktv_id'] ?? null,
                    'so_luong' => $chiTiet['so_luong'] ?? 1,
                    'don_gia' => $donGia,
                    'thanh_tien' => $thanhTien,
                    'ghi_chu' => $chiTiet['ghi_chu'] ?? null,
                    'sale_commissions' => $chiTiet['sale_commissions'] ?? null,
                    'service_commissions' => $chiTiet['service_commissions'] ?? null,
                ]);
            }

            // Calculate totals
            $hoaDon->calculateTotals();

            // Set payment method amounts (even if not paid yet, for partial payments)
            $hoaDon->thanh_toan_tien_mat = $data['thanh_toan_tien_mat'] ?? 0;
            $hoaDon->thanh_toan_chuyen_khoan = $data['thanh_toan_chuyen_khoan'] ?? 0;
            $hoaDon->thanh_toan_the = $data['thanh_toan_the'] ?? 0;
            $hoaDon->thanh_toan_vi = $data['thanh_toan_vi'] ?? 0;
            $hoaDon->save();

            // Calculate total paid from payment methods
            $totalPaid = ($data['thanh_toan_vi'] ?? 0)
                + ($data['thanh_toan_tien_mat'] ?? 0)
                + ($data['thanh_toan_chuyen_khoan'] ?? 0)
                + ($data['thanh_toan_the'] ?? 0);

            $remaining = $hoaDon->tong_thanh_toan - $totalPaid;

            Log::info('Invoice payment check', [
                'hoa_don_id' => $hoaDon->id,
                'tong_thanh_toan' => $hoaDon->tong_thanh_toan,
                'total_paid' => $totalPaid,
                'remaining' => $remaining,
                'has_ngay_han' => !empty($data['ngay_han_thanh_toan']),
                'ngay_han' => $data['ngay_han_thanh_toan'] ?? null,
            ]);

            // Process payment if provided
            if (!empty($data['thanh_toan']) && $data['thanh_toan'] === true) {
                $this->processPayment($hoaDon->id, $data);

                // Lưu vào sổ quỹ với số tiền thực tế khách thanh toán
                if ($totalPaid > 0) {
                    SoQuy::saveSoQuy_hoaDonSPA($totalPaid, $hoaDon);
                }
            } elseif ($remaining > 0.01) {
                // Create debt record (công nợ) - ngày hạn có thể null
                $dueDate = $data['ngay_han_thanh_toan'] ?? null;
                $this->createDebtRecord($hoaDon, $remaining, $totalPaid, $dueDate);

                // Lưu vào sổ quỹ với số tiền thực tế khách thanh toán (nếu có thanh toán 1 phần)
                if ($totalPaid > 0) {
                    SoQuy::saveSoQuy_hoaDonSPA($totalPaid, $hoaDon);
                }
            }

            return $hoaDon->load('chiTiets.dichVu', 'chiTiets.sanPham', 'chiTiets.ktv');
        });
    }

    public function processPayment($invoiceId, $paymentData)
    {
        return DB::transaction(function() use ($invoiceId, $paymentData) {
            $hoaDon = HoaDon::findOrFail($invoiceId);

            // Update payment information
            $hoaDon->phuong_thuc_thanh_toan = $paymentData['phuong_thuc_thanh_toan'] ?? [];
            $hoaDon->giam_gia = $paymentData['giam_gia'] ?? 0;
            $hoaDon->diem_su_dung = $paymentData['diem_su_dung'] ?? 0;
            $hoaDon->tien_tip = $paymentData['tien_tip'] ?? 0;

            // Calculate discount from points (1 point = 10,000 VND)
            $vndPerPoint = \App\Models\Spa\CauHinh::getVNDPerPoint();
            $hoaDon->tien_giam_tu_diem = $hoaDon->diem_su_dung * $vndPerPoint;

            // Recalculate totals
            $hoaDon->tong_thanh_toan = $hoaDon->tong_tien - $hoaDon->giam_gia - $hoaDon->tien_giam_tu_diem;

            // Update individual payment method columns
            $hoaDon->thanh_toan_tien_mat = $paymentData['thanh_toan_tien_mat'] ?? 0;
            $hoaDon->thanh_toan_chuyen_khoan = $paymentData['thanh_toan_chuyen_khoan'] ?? 0;
            $hoaDon->thanh_toan_the = $paymentData['thanh_toan_the'] ?? 0;
            $hoaDon->thanh_toan_vi = $paymentData['thanh_toan_vi'] ?? 0;

            // Calculate total paid
            $totalPaid = $hoaDon->thanh_toan_tien_mat + $hoaDon->thanh_toan_chuyen_khoan + $hoaDon->thanh_toan_the + $hoaDon->thanh_toan_vi;

            // Determine status based on payment
            if ($totalPaid >= $hoaDon->tong_thanh_toan) {
                $hoaDon->trang_thai = 'da_thanh_toan';
            } elseif ($totalPaid > 0) {
                $hoaDon->trang_thai = 'con_cong_no';
            } else {
                $hoaDon->trang_thai = 'cho_thanh_toan';
            }

            $hoaDon->save();

            // Deduct loyalty points if used
            if ($hoaDon->diem_su_dung > 0 && $hoaDon->khach_hang_id) {
                $khachHang = \App\Models\User::find($hoaDon->khach_hang_id);
                if ($khachHang) {
                    $currentPoints = $khachHang->diem_tich_luy ?? $khachHang->points ?? 0;
                    $newPoints = max(0, $currentPoints - $hoaDon->diem_su_dung);
                    $khachHang->update([
                        'diem_tich_luy' => $newPoints,
                        'points' => $newPoints,
                    ]);
                }
            }

            // Award loyalty points for purchase
            $hoaDon->processLoyaltyPoints();

            // Update customer statistics
            if ($hoaDon->khach_hang_id) {
                $khachHang = \App\Models\User::find($hoaDon->khach_hang_id);
                if ($khachHang) {
                    // Update user spending statistics (if fields exist)
                    $currentSpending = $khachHang->tong_chi_tieu ?? 0;
                    $khachHang->update([
                        'tong_chi_tieu' => $currentSpending + $hoaDon->tong_thanh_toan,
                        'updated_at' => now(),
                    ]);
                }
            }

            // Calculate commissions for staff
            $hoaDon->calculateCommissions();

            return $hoaDon->fresh(['chiTiets', 'khachHang', 'hoaHongs']);
        });
    }

    public function getTodaySales($chiNhanhId = null)
    {
        $query = HoaDon::paid()->today();

        if ($chiNhanhId) {
            $query->where('chi_nhanh_id', $chiNhanhId);
        }

        $invoices = $query->get();

        return [
            'total_invoices' => $invoices->count(),
            'total_revenue' => $invoices->sum('tong_thanh_toan'),
            'total_service_revenue' => $invoices->sum('tong_tien_dich_vu'),
            'total_product_revenue' => $invoices->sum('tong_tien_san_pham'),
            'total_discount' => $invoices->sum('giam_gia'),
            'total_tips' => $invoices->sum('tien_tip'),
            'average_invoice' => $invoices->avg('tong_thanh_toan'),
        ];
    }

    public function getInvoiceDetail($id)
    {
        return HoaDon::with([
            'khachHang',
            'chiNhanh',
            'chiTiets.dichVu',
            'chiTiets.sanPham',
            'chiTiets.ktv',
            'hoaHongs.ktv',
        ])->findOrFail($id);
    }

    public function cancelInvoice($id, $reason)
    {
        return DB::transaction(function() use ($id, $reason) {
            $hoaDon = HoaDon::findOrFail($id);

            // Restore product stock
            foreach ($hoaDon->chiTiets as $chiTiet) {
                if ($chiTiet->san_pham_id) {
                    $sanPham = SanPham::find($chiTiet->san_pham_id);
                    $sanPham?->updateStock($chiTiet->so_luong, 'increase');
                }
            }

            // Refund loyalty points if customer paid
            if ($hoaDon->trang_thai === 'da_thanh_toan' && $hoaDon->khach_hang_id) {
                $khachHang = \App\Models\User::find($hoaDon->khach_hang_id);

                if ($khachHang) {
                    $currentPoints = $khachHang->diem_tich_luy ?? $khachHang->points ?? 0;

                    // Return used points
                    if ($hoaDon->diem_su_dung > 0) {
                        $currentPoints += $hoaDon->diem_su_dung;
                    }

                    // Deduct earned points from this purchase
                    $earnedPoints = floor($hoaDon->tong_thanh_toan / 10000);
                    if ($earnedPoints > 0) {
                        $currentPoints = max(0, $currentPoints - $earnedPoints);
                    }

                    // Update customer points and statistics
                    $currentSpending = $khachHang->tong_chi_tieu ?? 0;
                    $khachHang->update([
                        'diem_tich_luy' => $currentPoints,
                        'points' => $currentPoints,
                        'tong_chi_tieu' => max(0, $currentSpending - $hoaDon->tong_thanh_toan),
                    ]);
                }
            }

            // Cancel invoice
            $hoaDon->trang_thai = 'da_huy';
            $hoaDon->ghi_chu = ($hoaDon->ghi_chu ?? '') . "\n[HỦY] " . $reason;
            $hoaDon->save();

            return $hoaDon;
        });
    }

    /**
     * Create debt record (công nợ) when payment is insufficient
     */
    private function createDebtRecord($hoaDon, $debtAmount, $paidAmount, $dueDate)
    {
        Log::info('Creating debt record', [
            'hoa_don_id' => $hoaDon->id,
            'ma_hoa_don' => $hoaDon->ma_hoa_don,
            'debt_amount' => $debtAmount,
            'paid_amount' => $paidAmount,
            'due_date' => $dueDate,
            'khach_hang_id' => $hoaDon->khach_hang_id,
        ]);

        // Update invoice status to 'con_cong_no'
        $hoaDon->trang_thai = 'con_cong_no';

        // Note: Payment method columns should already be set in createInvoice()
        // but we ensure they are saved
        $hoaDon->save();

        // Create debt record in cong_no table
        $congNo = CongNo::create([
            'name' => 'Công nợ hóa đơn spa - ' . $hoaDon->ma_hoa_don,
            'users_id' => $hoaDon->khach_hang_id,
            'loai_cong_no' => 1, // receivable - khách hàng nợ ta
            'loai_chung_tu' => 'spa_hoa_don',
            'chung_tu_id' => $hoaDon->id,
            'ma_chung_tu' => $hoaDon->ma_hoa_don,
            'tong_tien_hoa_don' => $hoaDon->tong_thanh_toan,
            'so_tien_da_thanh_toan' => $paidAmount,
            'so_tien_no' => $debtAmount, // Số tiền còn nợ = tổng HĐ - đã thanh toán
            'cong_no_status_id' => $paidAmount > 0 ? 2 : 3, // 2: Còn công nợ, 3: Chưa thanh toán
            'ngay_hen_tat_toan' => $dueDate,
        ]);

        Log::info('CongNo data being saved', [
            'tong_tien_hoa_don' => $hoaDon->tong_thanh_toan,
            'so_tien_da_thanh_toan' => $paidAmount,
            'so_tien_no' => $debtAmount,
            'calculation' => $hoaDon->tong_thanh_toan . ' - ' . $paidAmount . ' = ' . $debtAmount,
        ]);

        // Generate code
        $congNo->code = 'CN' . str_pad($congNo->id, 5, '0', STR_PAD_LEFT);
        $congNo->save();

        Log::info('Debt record created', [
            'cong_no_id' => $congNo->id,
            'code' => $congNo->code,
        ]);

        return $congNo;
    }
}
