<?php

namespace App\Services\Spa;

use App\Models\Spa\HoaDon;
use App\Models\Spa\HoaDonChiTiet;
use App\Models\Spa\SanPham;
use Illuminate\Support\Facades\DB;

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
                      $q2->where('ho_ten', 'like', "%{$search}%")
                         ->orWhere('so_dien_thoai', 'like', "%{$search}%");
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
                        $khachHang = !empty($data['khach_hang_id']) ? \App\Models\Spa\KhachHang::find($data['khach_hang_id']) : null;
                        $membershipCard = $khachHang?->membershipCards()->active()->first();
                        $donGia = $membershipCard ? $dichVu->gia_thanh_vien : $dichVu->gia_ban;
                    } else {
                        // Fallback: use a default price if service not found
                        $donGia = $chiTiet['don_gia'] ?? 0;
                    }
                } elseif (!empty($chiTiet['san_pham_id'])) {
                    // Try to fetch from database
                    $sanPham = SanPham::find($chiTiet['san_pham_id']);
                    if ($sanPham) {
                        $khachHang = !empty($data['khach_hang_id']) ? \App\Models\Spa\KhachHang::find($data['khach_hang_id']) : null;
                        $membershipCard = $khachHang?->membershipCards()->active()->first();
                        $donGia = $membershipCard ? $sanPham->gia_thanh_vien : $sanPham->gia_ban;

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
                ]);
            }

            // Calculate totals
            $hoaDon->calculateTotals();

            // Process payment if provided
            if (!empty($data['thanh_toan']) && $data['thanh_toan'] === true) {
                $this->processPayment($hoaDon->id, $data);
            }

            return $hoaDon->load('chiTiets.dichVu', 'chiTiets.sanPham', 'chiTiets.ktv');
        });
    }

    public function processPayment($invoiceId, $paymentData)
    {
        return DB::transaction(function() use ($invoiceId, $paymentData) {
            $hoaDon = HoaDon::findOrFail($invoiceId);

            // Update payment information
            $hoaDon->trang_thai = 'da_thanh_toan';
            $hoaDon->phuong_thuc_thanh_toan = $paymentData['phuong_thuc_thanh_toan'] ?? [];
            $hoaDon->giam_gia = $paymentData['giam_gia'] ?? 0;
            $hoaDon->diem_su_dung = $paymentData['diem_su_dung'] ?? 0;
            $hoaDon->tien_tip = $paymentData['tien_tip'] ?? 0;

            // Calculate discount from points (1 point = 10,000 VND)
            $vndPerPoint = \App\Models\Spa\CauHinh::getVNDPerPoint();
            $hoaDon->tien_giam_tu_diem = $hoaDon->diem_su_dung * $vndPerPoint;

            // Recalculate totals
            $hoaDon->tong_thanh_toan = $hoaDon->tong_tien - $hoaDon->giam_gia - $hoaDon->tien_giam_tu_diem;
            $hoaDon->save();

            // Deduct loyalty points if used
            if ($hoaDon->diem_su_dung > 0 && $hoaDon->khach_hang_id) {
                $khachHang = \App\Models\Spa\KhachHang::find($hoaDon->khach_hang_id);
                $khachHang->usePoints(
                    $hoaDon->diem_su_dung,
                    $hoaDon->id,
                    "Sử dụng điểm thanh toán hóa đơn {$hoaDon->ma_hoa_don}"
                );
            }

            // Award loyalty points for purchase
            $hoaDon->processLoyaltyPoints();

            // Update customer statistics
            if ($hoaDon->khach_hang_id) {
                $khachHang = \App\Models\Spa\KhachHang::find($hoaDon->khach_hang_id);
                if ($khachHang) {
                    $khachHang->tong_chi_tieu += $hoaDon->tong_thanh_toan;
                    $khachHang->lan_mua_cuoi = now();
                    $khachHang->so_lan_su_dung_dich_vu += 1;
                    $khachHang->save();

                    // Update RFM classification
                    $khachHang->updateRFMScore();
                    $khachHang->save();
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
                $khachHang = \App\Models\Spa\KhachHang::find($hoaDon->khach_hang_id);

                // Return used points
                if ($hoaDon->diem_su_dung > 0) {
                    $khachHang->addPoints(
                        $hoaDon->diem_su_dung,
                        'huy',
                        $hoaDon->id,
                        "Hoàn điểm do hủy hóa đơn {$hoaDon->ma_hoa_don}"
                    );
                }

                // Deduct earned points from this purchase
                $earnedPoints = floor($hoaDon->tong_thanh_toan / 10000);
                if ($earnedPoints > 0) {
                    $khachHang->usePoints(
                        $earnedPoints,
                        $hoaDon->id,
                        "Trừ điểm do hủy hóa đơn {$hoaDon->ma_hoa_don}"
                    );
                }

                // Update customer statistics
                $khachHang->tong_chi_tieu -= $hoaDon->tong_thanh_toan;
                $khachHang->so_lan_su_dung_dich_vu -= 1;
                $khachHang->save();
            }

            // Cancel invoice
            $hoaDon->trang_thai = 'da_huy';
            $hoaDon->ghi_chu = ($hoaDon->ghi_chu ?? '') . "\n[HỦY] " . $reason;
            $hoaDon->save();

            return $hoaDon;
        });
    }
}
