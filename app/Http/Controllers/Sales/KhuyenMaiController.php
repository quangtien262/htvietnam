<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\ChuongTrinhKhuyenMai;
use App\Models\Sales\MaGiamGia;
use Illuminate\Http\Request;

class KhuyenMaiController extends Controller
{
    public function chuongTrinhIndex()
    {
        $data = ChuongTrinhKhuyenMai::orderBy('created_at', 'desc')->get();
        return response()->json(['message' => 'success', 'data' => $data]);
    }

    public function chuongTrinhStore(Request $request)
    {
        $ct = ChuongTrinhKhuyenMai::create($request->all());
        return response()->json(['message' => 'success', 'data' => $ct]);
    }

    public function maGiamGiaIndex()
    {
        $data = MaGiamGia::orderBy('created_at', 'desc')->get();
        return response()->json(['message' => 'success', 'data' => $data]);
    }

    public function maGiamGiaStore(Request $request)
    {
        $ma = MaGiamGia::create($request->all());
        return response()->json(['message' => 'success', 'data' => $ma]);
    }

    public function kiemTraMaGiamGia(Request $request)
    {
        $ma = MaGiamGia::where('ma_code', $request->ma_code)
            ->active()
            ->conSuDung()
            ->first();

        if (!$ma) {
            return response()->json(['message' => 'error', 'error' => 'Mã không hợp lệ'], 400);
        }

        return response()->json(['message' => 'success', 'data' => $ma]);
    }
}
