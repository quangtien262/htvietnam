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

    public function createInvoice(Request $request)
    {
        $validated = $request->validate([
            'khach_hang_id' => 'nullable|exists:spa_khach_hang,id',
            'chi_nhanh_id' => 'required|exists:spa_chi_nhanh,id',
            'chi_tiets' => 'required|array|min:1',
            'chi_tiets.*.dich_vu_id' => 'required_without:chi_tiets.*.san_pham_id|exists:spa_dich_vu,id',
            'chi_tiets.*.san_pham_id' => 'required_without:chi_tiets.*.dich_vu_id|exists:spa_san_pham,id',
            'chi_tiets.*.ktv_id' => 'nullable|exists:spa_ktv,id',
            'chi_tiets.*.so_luong' => 'required|integer|min:1',
            'thanh_toan' => 'boolean',
            'phuong_thuc_thanh_toan' => 'array',
            'giam_gia' => 'nullable|numeric|min:0',
            'diem_su_dung' => 'nullable|integer|min:0',
            'tien_tip' => 'nullable|numeric|min:0',
            'nguoi_ban' => 'nullable|string',
            'ghi_chu' => 'nullable|string',
        ]);

        try {
            $invoice = $this->service->createInvoice($validated);
            return response()->json([
                'success' => true,
                'data' => $invoice,
                'message' => 'Tạo hóa đơn thành công',
            ], 201);
        } catch (\Exception $e) {
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
