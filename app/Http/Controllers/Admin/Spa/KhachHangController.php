<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Services\Spa\KhachHangService;
use Illuminate\Http\Request;

class KhachHangController extends Controller
{
    protected $service;

    public function __construct(KhachHangService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        try {
            $customers = $this->service->getList($request->all());
            return response()->json([
                'success' => true,
                'data' => $customers,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ho_ten' => 'required|string|max:255',
            'so_dien_thoai' => 'required|string|max:20|unique:users,phone',
            'email' => 'nullable|email|unique:users',
            'ngay_sinh' => 'nullable|date',
            'gioi_tinh' => 'nullable|in:Nam,Nữ,Khác',
            'dia_chi' => 'nullable|string',
            'nguon_khach' => 'nullable|string',
            'ghi_chu' => 'nullable|string',
        ]);

        try {
            $customer = $this->service->create($validated);
            return response()->json([
                'success' => true,
                'data' => $customer,
                'message' => 'Tạo khách hàng thành công',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $customer = $this->service->getDetail($id);
            return response()->json([
                'success' => true,
                'data' => $customer,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'ho_ten' => 'sometimes|required|string|max:255',
            'so_dien_thoai' => 'sometimes|required|string|max:20|unique:users,phone,' . $id,
            'email' => 'nullable|email|unique:users,email,' . $id,
            'ngay_sinh' => 'nullable|date',
            'gioi_tinh' => 'nullable|in:Nam,Nữ,Khác',
            'dia_chi' => 'nullable|string',
            'ghi_chu' => 'nullable|string',
        ]);

        try {
            $customer = $this->service->update($id, $validated);
            return response()->json([
                'success' => true,
                'data' => $customer,
                'message' => 'Cập nhật khách hàng thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $this->service->delete($id);
            return response()->json([
                'success' => true,
                'message' => 'Xóa khách hàng thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function statistics($id)
    {
        try {
            $stats = $this->service->getStatistics($id);
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

    public function segment(Request $request)
    {
        try {
            $segment = $request->input('segment', 'vip');
            $customers = $this->service->getCustomersBySegment($segment);
            return response()->json([
                'success' => true,
                'data' => $customers,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
