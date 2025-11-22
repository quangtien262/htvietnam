<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Services\Spa\POSService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class POSController extends Controller
{
    protected $service;

    public function __construct(POSService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 20);
            $chiNhanhId = $request->input('chi_nhanh_id');
            $trangThai = $request->input('trang_thai');
            $tuNgay = $request->input('tu_ngay');
            $denNgay = $request->input('den_ngay');
            $search = $request->input('search');

            $invoices = $this->service->getInvoiceList([
                'chi_nhanh_id' => $chiNhanhId,
                'trang_thai' => $trangThai,
                'tu_ngay' => $tuNgay,
                'den_ngay' => $denNgay,
                'search' => $search,
            ], $perPage);

            return response()->json([
                'success' => true,
                'data' => $invoices,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function createInvoice(Request $request)
    {
        // Log request data for debugging
        Log::info('POS Invoice Request:', $request->all());

        $validated = $request->validate([
            'khach_hang_id' => 'nullable|integer',
            'chi_nhanh_id' => 'required|integer',
            'nguoi_thu_id' => 'nullable|integer',
            'ngay_ban' => 'nullable|date_format:Y-m-d H:i:s',
            // chi_tiets is nullable to support gift-card-only purchases
            'chi_tiets' => 'nullable|array',
            'chi_tiets.*.dich_vu_id' => 'nullable|integer',
            'chi_tiets.*.san_pham_id' => 'nullable|integer',
            'chi_tiets.*.ktv_id' => 'nullable|integer',
            'chi_tiets.*.so_luong' => 'required|integer|min:1',
            'chi_tiets.*.don_gia' => 'required|numeric|min:0',
            'chi_tiets.*.su_dung_goi' => 'nullable|integer',
            'chi_tiets.*.sale_commissions' => 'nullable|array',
            'chi_tiets.*.sale_commissions.*.staff_id' => 'required|integer',
            'chi_tiets.*.sale_commissions.*.staff_name' => 'required|string',
            'chi_tiets.*.sale_commissions.*.commission_value' => 'required|numeric|min:0',
            'chi_tiets.*.sale_commissions.*.commission_unit' => 'required|in:percent,cash',
            'chi_tiets.*.sale_commissions.*.commission_type' => 'required|in:sale,service',
            'chi_tiets.*.service_commissions' => 'nullable|array',
            'chi_tiets.*.service_commissions.*.staff_id' => 'required|integer',
            'chi_tiets.*.service_commissions.*.staff_name' => 'required|string',
            'chi_tiets.*.service_commissions.*.commission_value' => 'required|numeric|min:0',
            'chi_tiets.*.service_commissions.*.commission_unit' => 'required|in:percent,cash',
            'chi_tiets.*.service_commissions.*.commission_type' => 'required|in:sale,service',
            'chi_tiets.*.chiet_khau_don_hang' => 'nullable|numeric|min:0',
            'chi_tiets.*.chiet_khau_don_hang_type' => 'nullable|in:percent,cash',
            'thanh_toan' => 'nullable|boolean',
            'phuong_thuc_thanh_toan' => 'nullable|array',
            // Payment methods
            'thanh_toan_vi' => 'nullable|numeric|min:0',
            'thanh_toan_tien_mat' => 'nullable|numeric|min:0',
            'thanh_toan_chuyen_khoan' => 'nullable|numeric|min:0',
            'thanh_toan_the' => 'nullable|numeric|min:0',
            'phi_ca_the' => 'nullable|numeric|min:0',
            // Discounts and tips
            'giam_gia' => 'nullable|numeric|min:0',
            'diem_su_dung' => 'nullable|integer|min:0',
            'tien_tip' => 'nullable|numeric|min:0',
            // Debt (Công nợ)
            'cong_no' => 'nullable|numeric|min:0',
            'ngay_han_thanh_toan' => 'nullable|date',
            // Other
            'nguoi_ban' => 'nullable|string',
            'ghi_chu' => 'nullable|string',
        ], [
            'chi_tiets.*.so_luong.required' => 'Số lượng không được để trống',
            'chi_tiets.*.don_gia.required' => 'Đơn giá không được để trống',
            'chi_nhanh_id.required' => 'Vui lòng chọn chi nhánh',
        ]);

        // Ensure chi_tiets is an array even if not provided
        if (!isset($validated['chi_tiets'])) {
            $validated['chi_tiets'] = [];
        }

        // Validate: If chi_tiets is empty, must have customer (for gift card purchase)
        if (empty($validated['chi_tiets']) && empty($validated['khach_hang_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng chọn khách hàng để mua thẻ giá trị',
            ], 422);
        }

        try {
            // Auto-assign nguoi_thu_id and ca_lam_viec_id from current open shift
            $currentShift = \App\Models\Spa\CaLamViec::where('chi_nhanh_id', $validated['chi_nhanh_id'])
                ->where('trang_thai', 'dang_mo')
                ->first();

            if ($currentShift) {
                $validated['ca_lam_viec_id'] = $currentShift->id;
                // Use nguoi_thu from shift if not provided in request
                if (empty($validated['nguoi_thu_id'])) {
                    $validated['nguoi_thu_id'] = $currentShift->nguoi_thu_id;
                }
            } else {
                // If no open shift, must have nguoi_thu_id in request
                if (empty($validated['nguoi_thu_id'])) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Chưa mở ca làm việc hoặc không tìm thấy người thu',
                    ], 400);
                }
            }

            $invoice = $this->service->createInvoice($validated);
            return response()->json([
                'success' => true,
                'data' => $invoice,
                'message' => 'Tạo hóa đơn thành công',
            ], 201);
        } catch (\Exception $e) {
            Log::error('POS Invoice Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function processPayment(Request $request, $id)
    {
        $validated = $request->validate([
            'phuong_thuc_thanh_toan' => 'required|array',
            'giam_gia' => 'nullable|numeric|min:0',
            'diem_su_dung' => 'nullable|integer|min:0',
            'tien_tip' => 'nullable|numeric|min:0',
        ]);

        try {
            $invoice = $this->service->processPayment($id, $validated);
            return response()->json([
                'success' => true,
                'data' => $invoice,
                'message' => 'Thanh toán thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getInvoice($id)
    {
        try {
            $invoice = $this->service->getInvoiceDetail($id);
            return response()->json([
                'success' => true,
                'data' => $invoice,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function cancelInvoice(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        try {
            $invoice = $this->service->cancelInvoice($id, $validated['reason']);
            return response()->json([
                'success' => true,
                'data' => $invoice,
                'message' => 'Đã hủy hóa đơn',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function todaySales(Request $request)
    {
        try {
            $stats = $this->service->getTodaySales($request->input('chi_nhanh_id'));
            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
