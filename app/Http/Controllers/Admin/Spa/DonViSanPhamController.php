<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\DonViSanPham;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DonViSanPhamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DonViSanPham::query();

        // Search
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Order by sort_order
        $query->ordered();

        // Pagination or all
        if ($request->has('all') && $request->all == 'true') {
            $units = $query->get();
            return response()->json([
                'status_code' => 200,
                'message' => 'Lấy danh sách đơn vị thành công',
                'data' => $units
            ]);
        }

        $units = $query->paginate($request->per_page ?? 10);
        return response()->json([
            'status_code' => 200,
            'message' => 'Lấy danh sách đơn vị thành công',
            'data' => $units
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:spa_don_vi_san_pham,name',
            'color' => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer',
            'note' => 'nullable|string',
        ]);

        $unit = DonViSanPham::create([
            'name' => $request->name,
            'color' => $request->color ?? '#1890ff',
            'sort_order' => $request->sort_order ?? 0,
            'note' => $request->note,
            'created_by' => Auth::guard('admin_users')->id(),
        ]);

        return response()->json([
            'status_code' => 200,
            'message' => 'Thêm đơn vị thành công',
            'data' => $unit
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $unit = DonViSanPham::find($id);
        if (!$unit) {
            return response()->json([
                'status_code' => 404,
                'message' => 'Không tìm thấy đơn vị',
                'data' => null
            ], 404);
        }

        $request->validate([
            'name' => 'required|string|max:100|unique:spa_don_vi_san_pham,name,' . $id,
            'color' => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer',
            'note' => 'nullable|string',
        ]);

        $unit->update([
            'name' => $request->name,
            'color' => $request->color ?? $unit->color,
            'sort_order' => $request->sort_order ?? $unit->sort_order,
            'note' => $request->note,
        ]);

        return response()->json([
            'status_code' => 200,
            'message' => 'Cập nhật đơn vị thành công',
            'data' => $unit
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $unit = DonViSanPham::find($id);
        if (!$unit) {
            return response()->json([
                'status_code' => 404,
                'message' => 'Không tìm thấy đơn vị',
                'data' => null
            ], 404);
        }

        $unit->delete();
        return response()->json([
            'status_code' => 200,
            'message' => 'Xóa đơn vị thành công',
            'data' => null
        ]);
    }
}
