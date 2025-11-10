<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\CaLamViec;
use App\Models\Admin\PhanCa;
use Illuminate\Http\Request;

class CaLamViecController extends Controller
{
    public function index()
    {
        $caLamViecs = CaLamViec::active()->orderBy('sort_order')->get();
        return response()->json(['message' => 'success', 'data' => $caLamViecs]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten_ca' => 'required|string',
            'gio_bat_dau' => 'required',
            'gio_ket_thuc' => 'required',
            'thoi_gian_nghi_giua_ca' => 'nullable|integer',
            'ap_dung_cho' => 'nullable|string',
            'is_active' => 'nullable|integer',
        ]);

        $ca = CaLamViec::create($validated);
        return response()->json(['message' => 'success', 'data' => $ca]);
    }

    public function update(Request $request, $id)
    {
        $ca = CaLamViec::find($id);
        if (!$ca) return response()->json(['message' => 'error'], 404);

        $ca->update($request->only([
            'ten_ca', 'gio_bat_dau', 'gio_ket_thuc',
            'thoi_gian_nghi_giua_ca', 'ap_dung_cho', 'is_active'
        ]));

        return response()->json(['message' => 'success', 'data' => $ca->fresh()]);
    }

    public function destroy($id)
    {
        $ca = CaLamViec::find($id);
        if (!$ca) return response()->json(['message' => 'error'], 404);

        $ca->is_recycle_bin = 1;
        $ca->save();

        return response()->json(['message' => 'success']);
    }

    // Phân ca
    public function phanCaIndex(Request $request)
    {
        $query = PhanCa::active()->with(['nhanVien', 'caLamViec']);

        if ($request->admin_user_id) {
            $query->where('admin_user_id', $request->admin_user_id);
        }

        $phanCas = $query->orderBy('tu_ngay', 'desc')->get();
        return response()->json(['message' => 'success', 'data' => $phanCas]);
    }

    public function phanCaStore(Request $request)
    {
        $validated = $request->validate([
            'admin_user_id' => 'required|exists:admin_users,id',
            'ca_lam_viec_id' => 'required|exists:ca_lam_viec,id',
            'tu_ngay' => 'required|date',
            'den_ngay' => 'required|date',
            'cac_ngay_trong_tuan' => 'nullable|array',
        ]);

        $phanCa = PhanCa::create($validated);
        return response()->json(['message' => 'success', 'data' => $phanCa->load(['nhanVien', 'caLamViec'])]);
    }

    public function phanCaDestroy($id)
    {
        $phanCa = PhanCa::find($id);
        if (!$phanCa) return response()->json(['message' => 'error'], 404);

        $phanCa->is_recycle_bin = 1;
        $phanCa->save();

        return response()->json(['message' => 'success']);
    }
}
