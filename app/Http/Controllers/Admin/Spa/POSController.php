<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Services\Spa\POSService;
use Illuminate\Http\Request;

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
        \Log::info('POS Invoice Request:', $request->all());

        $validated = $request->validate([
            'khach_hang_id' => 'nullable|integer',
            'chi_nhanh_id' => 'nullable|integer', // Changed from required to nullable for testing
            'nguoi_thu_id' => 'nullable|integer',
            'chi_tiets' => 'required|array|min:1',
            'chi_tiets.*.dich_vu_id' => 'nullable|integer',
            'chi_tiets.*.san_pham_id' => 'nullable|integer',
            'chi_tiets.*.ktv_id' => 'nullable|integer',
            'chi_tiets.*.so_luong' => 'required|integer|min:1',
            'chi_tiets.*.don_gia' => 'nullable|numeric|min:0',
            'thanh_toan' => 'nullable|boolean',
            'phuong_thuc_thanh_toan' => 'nullable|array',
            'giam_gia' => 'nullable|numeric|min:0',
            'diem_su_dung' => 'nullable|integer|min:0',
            'tien_tip' => 'nullable|numeric|min:0',
            'nguoi_ban' => 'nullable|string',
            'ghi_chu' => 'nullable|string',
        ]);

        try {
            // Set default chi_nhanh_id if not provided
            if (empty($validated['chi_nhanh_id'])) {
                $validated['chi_nhanh_id'] = 1; // Default branch
            }

            // Auto-assign to current open shift
            $currentShift = \App\Models\Spa\CaLamViec::where('chi_nhanh_id', $validated['chi_nhanh_id'])
                ->where('trang_thai', 'dang_mo')
                ->first();

            if ($currentShift) {
                $validated['ca_lam_viec_id'] = $currentShift->id;
            }

            $invoice = $this->service->createInvoice($validated);
            return response()->json([
                'success' => true,
                'data' => $invoice,
                'message' => 'Tạo hóa đơn thành công',
            ], 201);
        } catch (\Exception $e) {
            \Log::error('POS Invoice Error:', [
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
