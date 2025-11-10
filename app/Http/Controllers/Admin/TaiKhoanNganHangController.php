<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TaiKhoanNganHang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaiKhoanNganHangController extends Controller
{
    public function index(Request $request)
    {
        return view('admin.bank.account_list');
    }

    public function apiList(Request $request)
    {
        $searchData = $request->input('searchData', []);
        $keyword = $searchData['keyword'] ?? '';
        $page = $searchData['page'] ?? 1;
        $perPage = $searchData['per_page'] ?? 20;

        $query = TaiKhoanNganHang::query()->ordered();

        if ($keyword) {
            $query->where(function ($q) use ($keyword) {
                $q->where('ten_ngan_hang', 'like', "%{$keyword}%")
                    ->orWhere('so_tai_khoan', 'like', "%{$keyword}%")
                    ->orWhere('chu_tai_khoan', 'like', "%{$keyword}%");
            });
        }

        $total = $query->count();
        $datas = $query->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return response()->json([
            'status_code' => 200,
            'data' => [
                'datas' => $datas,
                'total' => $total,
            ]
        ]);
    }

    public function apiAdd(Request $request)
    {
        $request->validate([
            'ten_ngan_hang' => 'required|string|max:255',
            'so_tai_khoan' => 'required|string|max:255',
            'chu_tai_khoan' => 'required|string|max:255',
        ]);

        $data = $request->only([
            'ten_ngan_hang',
            'chi_nhanh',
            'so_tai_khoan',
            'chu_tai_khoan',
            'so_du_hien_tai',
            'loai_tien',
            'ghi_chu',
            'is_active',
            'sort_order',
        ]);

        $taiKhoan = TaiKhoanNganHang::create($data);

        return response()->json([
            'status_code' => 200,
            'message' => 'Thêm tài khoản ngân hàng thành công',
            'data' => $taiKhoan
        ]);
    }

    public function apiUpdate(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:tai_khoan_ngan_hang,id',
            'ten_ngan_hang' => 'required|string|max:255',
            'so_tai_khoan' => 'required|string|max:255',
            'chu_tai_khoan' => 'required|string|max:255',
        ]);

        $taiKhoan = TaiKhoanNganHang::findOrFail($request->id);

        $data = $request->only([
            'ten_ngan_hang',
            'chi_nhanh',
            'so_tai_khoan',
            'chu_tai_khoan',
            'so_du_hien_tai',
            'loai_tien',
            'ghi_chu',
            'is_active',
            'sort_order',
        ]);

        $taiKhoan->update($data);

        return response()->json([
            'status_code' => 200,
            'message' => 'Cập nhật tài khoản ngân hàng thành công',
            'data' => $taiKhoan
        ]);
    }

    public function apiDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        TaiKhoanNganHang::whereIn('id', $ids)->delete();

        return response()->json([
            'status_code' => 200,
            'message' => 'Xóa tài khoản ngân hàng thành công'
        ]);
    }

    public function apiUpdateSortOrder(Request $request)
    {
        $items = $request->input('items', []);

        foreach ($items as $item) {
            TaiKhoanNganHang::where('id', $item['id'])
                ->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'status_code' => 200,
            'message' => 'Cập nhật thứ tự thành công'
        ]);
    }
}
