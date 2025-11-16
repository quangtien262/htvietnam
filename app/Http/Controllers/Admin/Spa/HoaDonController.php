<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\HoaDon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HoaDonController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = HoaDon::with(['khachHang', 'chiNhanh'])
                ->orderBy('created_at', 'desc');

            // Filters
            if ($request->filled('search')) {
                $search = $request->search;
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

            if ($request->filled('trang_thai')) {
                $query->where('trang_thai', $request->trang_thai);
            }

            if ($request->filled('chi_nhanh_id')) {
                $query->where('chi_nhanh_id', $request->chi_nhanh_id);
            }

            if ($request->filled('tu_ngay')) {
                $query->whereDate('ngay_ban', '>=', $request->tu_ngay);
            }

            if ($request->filled('den_ngay')) {
                $query->whereDate('ngay_ban', '<=', $request->den_ngay);
            }

            $perPage = $request->input('per_page', 20);
            $invoices = $query->paginate($perPage);

            // Calculate statistics
            $stats = [
                'total' => HoaDon::count(),
                'paid' => HoaDon::where('trang_thai', 'da_thanh_toan')->count(),
                'pending' => HoaDon::where('trang_thai', 'cho_thanh_toan')->count(),
                'cancelled' => HoaDon::where('trang_thai', 'da_huy')->count(),
                'today_revenue' => HoaDon::paid()->today()->sum('tong_thanh_toan'),
                'today_count' => HoaDon::paid()->today()->count(),
            ];

            return $this->sendSuccessResponse([
                'data' => $invoices->items(),
                'total' => $invoices->total(),
                'current_page' => $invoices->currentPage(),
                'per_page' => $invoices->perPage(),
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            return $this->sendErrorResponse($e->getMessage(), 500);
        }
    }

    public function show($id)
    {
        try {
            $invoice = HoaDon::with([
                'khachHang',
                'chiNhanh',
                'chiTiets.dichVu',
                'chiTiets.sanPham',
                'chiTiets.ktv.adminUser',
                'hoaHongs.ktv.adminUser',
            ])->findOrFail($id);

            return $this->sendSuccessResponse($invoice);
        } catch (\Exception $e) {
            return $this->sendErrorResponse('Không tìm thấy hóa đơn', 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $invoice = HoaDon::findOrFail($id);

            // Only allow update for pending invoices
            if ($invoice->trang_thai === 'da_thanh_toan') {
                return $this->sendErrorResponse('Không thể sửa hóa đơn đã thanh toán', 400);
            }

            $validated = $request->validate([
                'ghi_chu' => 'nullable|string',
                'giam_gia' => 'nullable|numeric|min:0',
            ]);

            $invoice->update($validated);
            $invoice->calculateTotals();

            return $this->sendSuccessResponse($invoice, 'Cập nhật hóa đơn thành công');
        } catch (\Exception $e) {
            return $this->sendErrorResponse($e->getMessage(), 500);
        }
    }

    public function destroy($id)
    {
        try {
            $invoice = HoaDon::findOrFail($id);

            // Only allow delete for pending or cancelled invoices
            if ($invoice->trang_thai === 'da_thanh_toan') {
                return $this->sendErrorResponse('Không thể xóa hóa đơn đã thanh toán', 400);
            }

            $invoice->delete();

            return $this->sendSuccessResponse(null, 'Đã xóa hóa đơn');
        } catch (\Exception $e) {
            return $this->sendErrorResponse($e->getMessage(), 500);
        }
    }

    public function print($id)
    {
        try {
            $invoice = HoaDon::with([
                'khachHang',
                'chiNhanh',
                'chiTiets.dichVu',
                'chiTiets.sanPham',
                'chiTiets.ktv.adminUser',
            ])->findOrFail($id);

            return $this->sendSuccessResponse($invoice);
        } catch (\Exception $e) {
            return $this->sendErrorResponse('Không tìm thấy hóa đơn', 404);
        }
    }

    public function export(Request $request)
    {
        try {
            $query = HoaDon::with(['khachHang', 'chiNhanh']);

            if ($request->filled('tu_ngay')) {
                $query->whereDate('ngay_ban', '>=', $request->tu_ngay);
            }

            if ($request->filled('den_ngay')) {
                $query->whereDate('ngay_ban', '<=', $request->den_ngay);
            }

            if ($request->filled('trang_thai')) {
                $query->where('trang_thai', $request->trang_thai);
            }

            $invoices = $query->get();

            return $this->sendSuccessResponse($invoices);
        } catch (\Exception $e) {
            return $this->sendErrorResponse($e->getMessage(), 500);
        }
    }
}
