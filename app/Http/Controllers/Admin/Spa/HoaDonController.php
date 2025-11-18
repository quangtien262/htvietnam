<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\HoaDon;
use App\Models\Admin\CongNo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

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
                'congNo',
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

    public function payDebt(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'so_tien_thanh_toan' => 'required|numeric|min:0.01',
            ]);

            DB::beginTransaction();

            // Find invoice with debt record
            $invoice = HoaDon::with('congNo')->findOrFail($id);

            // Check if invoice has debt
            if ($invoice->trang_thai !== 'con_cong_no') {
                DB::rollBack();
                return $this->sendErrorResponse('Hóa đơn này không có công nợ', 400);
            }

            $congNo = $invoice->congNo;
            if (!$congNo) {
                DB::rollBack();
                return $this->sendErrorResponse('Không tìm thấy bản ghi công nợ', 404);
            }

            $soTienThanhToan = $validated['so_tien_thanh_toan'];

            // Validate payment amount
            if ($soTienThanhToan > $congNo->so_tien_no) {
                DB::rollBack();
                return $this->sendErrorResponse('Số tiền thanh toán không được lớn hơn số tiền nợ', 400);
            }

            // Update debt record
            $congNo->so_tien_da_thanh_toan += $soTienThanhToan;
            $congNo->so_tien_no -= $soTienThanhToan;

            // Check if debt is fully paid
            if ($congNo->so_tien_no <= 0) {
                $congNo->so_tien_no = 0;
                $congNo->cong_no_status_id = 1; // Status: Paid
                $congNo->setAttribute('ngay_tat_toan', Carbon::now());

                // Update invoice status
                $invoice->trang_thai = 'da_thanh_toan';
                $invoice->save();

                Log::info('Debt fully paid', [
                    'invoice_id' => $invoice->id,
                    'ma_hoa_don' => $invoice->ma_hoa_don,
                    'payment_amount' => $soTienThanhToan,
                ]);
            } else {
                Log::info('Partial debt payment', [
                    'invoice_id' => $invoice->id,
                    'ma_hoa_don' => $invoice->ma_hoa_don,
                    'payment_amount' => $soTienThanhToan,
                    'remaining_debt' => $congNo->so_tien_no,
                ]);
            }

            $congNo->save();

            DB::commit();

            return $this->sendSuccessResponse([
                'invoice' => $invoice->fresh(['congNo']),
                'congNo' => $congNo,
                'message' => $congNo->so_tien_no <= 0 ? 'Đã thanh toán đủ công nợ' : 'Đã thanh toán một phần công nợ',
            ], 'Thanh toán công nợ thành công');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return $this->sendErrorResponse($e->errors(), 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Pay debt error', [
                'invoice_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->sendErrorResponse($e->getMessage(), 500);
        }
    }
}
