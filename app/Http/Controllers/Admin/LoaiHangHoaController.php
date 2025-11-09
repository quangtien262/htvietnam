<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoaiHangHoa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LoaiHangHoaController extends Controller
{
    /**
     * Danh sách loại hàng hóa
     */
    public function apiList(Request $request)
    {
        $loaiHangHoa = LoaiHangHoa::orderBy('sort_order', 'asc')
                                  ->orderBy('name', 'asc')
                                  ->get();

        return response()->json([
            'status_code' => 200,
            'data' => $loaiHangHoa
        ]);
    }

    /**
     * Thêm loại hàng hóa
     */
    public function apiAdd(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer'
        ], [
            'name.required' => 'Tên loại hàng hóa là bắt buộc'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code' => 422,
                'errors' => $validator->errors()
            ], 422);
        }

        $loaiHangHoa = LoaiHangHoa::create([
            'name' => $request->name,
            'color' => $request->color ?? '#1890ff',
            'sort_order' => $request->sort_order ?? 0
        ]);

        return response()->json([
            'status_code' => 200,
            'message' => 'Thêm loại hàng hóa thành công',
            'data' => $loaiHangHoa
        ]);
    }

    /**
     * Cập nhật loại hàng hóa
     */
    public function apiUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:loai_hang_hoa,id',
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer'
        ], [
            'id.required' => 'ID loại hàng hóa là bắt buộc',
            'id.exists' => 'Không tìm thấy loại hàng hóa',
            'name.required' => 'Tên loại hàng hóa là bắt buộc'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code' => 422,
                'errors' => $validator->errors()
            ], 422);
        }

        $loaiHangHoa = LoaiHangHoa::find($request->id);
        $loaiHangHoa->update([
            'name' => $request->name,
            'color' => $request->color ?? '#1890ff',
            'sort_order' => $request->sort_order ?? 0
        ]);

        return response()->json([
            'status_code' => 200,
            'message' => 'Cập nhật loại hàng hóa thành công',
            'data' => $loaiHangHoa
        ]);
    }

    /**
     * Xóa loại hàng hóa
     */
    public function apiDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return response()->json([
                'status_code' => 422,
                'message' => 'Vui lòng chọn loại hàng hóa cần xóa'
            ], 422);
        }

        LoaiHangHoa::whereIn('id', $ids)->delete();

        return response()->json([
            'status_code' => 200,
            'message' => 'Xóa loại hàng hóa thành công'
        ]);
    }
}
