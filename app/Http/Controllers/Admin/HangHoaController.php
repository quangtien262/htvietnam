<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HangHoa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HangHoaController extends Controller
{
    /**
     * Danh sách hàng hóa
     */
    public function apiList(Request $request)
    {
        $search = $request->input('searchData.search', '');
        $page = $request->input('searchData.page', 1);
        $pageSize = $request->input('searchData.pageSize', 20);
        $status = $request->input('searchData.status');

        $query = HangHoa::with(['loaiHangHoa', 'donViHangHoa']);

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('code', 'like', "%$search%");
            });
        }

        // Filter by status
        if ($status !== null && $status !== '') {
            $query->where('status', $status);
        }

        $query->orderBy('id', 'desc');

        $total = $query->count();
        $data = $query->skip(($page - 1) * $pageSize)
                     ->take($pageSize)
                     ->get();

        return response()->json([
            'status_code' => 200,
            'data' => [
                'list' => $data,
                'total' => $total
            ]
        ]);
    }

    /**
     * Chi tiết hàng hóa
     */
    public function apiDetail(Request $request)
    {
        $id = $request->input('id');
        
        $hangHoa = HangHoa::with(['loaiHangHoa', 'donViHangHoa'])->find($id);
        
        if (!$hangHoa) {
            return response()->json([
                'status_code' => 404,
                'message' => 'Không tìm thấy hàng hóa'
            ], 404);
        }

        return response()->json([
            'status_code' => 200,
            'data' => [
                'hang_hoa' => $hangHoa
            ]
        ]);
    }

    /**
     * Thêm hàng hóa
     */
    public function apiAdd(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price_default' => 'required|numeric|min:0',
            'so_luong_default' => 'required|integer|min:1',
            'vat' => 'nullable|numeric|min:0|max:100',
            'unit' => 'nullable|string|max:50',
        ], [
            'name.required' => 'Tên hàng hóa là bắt buộc',
            'price_default.required' => 'Giá mặc định là bắt buộc',
            'price_default.min' => 'Giá phải lớn hơn hoặc bằng 0',
            'so_luong_default.required' => 'Số lượng mặc định là bắt buộc',
            'so_luong_default.min' => 'Số lượng phải lớn hơn 0',
            'vat.max' => 'VAT không được vượt quá 100%',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code' => 422,
                'message' => $validator->errors()->first()
            ], 422);
        }

        // Generate code
        $code = HangHoa::generateCode();

        $hangHoa = HangHoa::create([
            'name' => $request->name,
            'code' => $code,
            'price_default' => $request->price_default,
            'so_luong_default' => $request->so_luong_default ?? 1,
            'vat' => $request->vat ?? 0,
            'unit' => $request->unit,
            'description' => $request->description,
            'status' => $request->status ?? 1
        ]);

        return response()->json([
            'status_code' => 200,
            'message' => 'Thêm hàng hóa thành công',
            'data' => $hangHoa
        ]);
    }

    /**
     * Cập nhật hàng hóa
     */
    public function apiUpdate(Request $request)
    {
        $id = $request->input('id');
        
        $hangHoa = HangHoa::find($id);
        
        if (!$hangHoa) {
            return response()->json([
                'status_code' => 404,
                'message' => 'Không tìm thấy hàng hóa'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price_default' => 'required|numeric|min:0',
            'so_luong_default' => 'required|integer|min:1',
            'vat' => 'nullable|numeric|min:0|max:100',
            'unit' => 'nullable|string|max:50',
        ], [
            'name.required' => 'Tên hàng hóa là bắt buộc',
            'price_default.required' => 'Giá mặc định là bắt buộc',
            'so_luong_default.required' => 'Số lượng mặc định là bắt buộc',
            'vat.max' => 'VAT không được vượt quá 100%',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code' => 422,
                'message' => $validator->errors()->first()
            ], 422);
        }

        $hangHoa->update([
            'name' => $request->name,
            'price_default' => $request->price_default,
            'so_luong_default' => $request->so_luong_default,
            'vat' => $request->vat ?? 0,
            'unit' => $request->unit,
            'description' => $request->description,
            'status' => $request->status ?? 1
        ]);

        return response()->json([
            'status_code' => 200,
            'message' => 'Cập nhật hàng hóa thành công',
            'data' => $hangHoa
        ]);
    }

    /**
     * Xóa hàng hóa
     */
    public function apiDelete(Request $request)
    {
        $ids = $request->input('ids', []);
        
        if (empty($ids)) {
            return response()->json([
                'status_code' => 422,
                'message' => 'Vui lòng chọn hàng hóa cần xóa'
            ], 422);
        }

        HangHoa::whereIn('id', $ids)->delete();

        return response()->json([
            'status_code' => 200,
            'message' => 'Xóa hàng hóa thành công'
        ]);
    }

    /**
     * Lấy danh sách hàng hóa active (cho dropdown)
     */
    public function apiGetActive(Request $request)
    {
        $hangHoas = HangHoa::where('status', 1)
                          ->orderBy('name', 'asc')
                          ->get();

        return response()->json([
            'status_code' => 200,
            'data' => $hangHoas
        ]);
    }
}
