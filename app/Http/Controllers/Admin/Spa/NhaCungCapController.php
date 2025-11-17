<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\NhaCungCap;
use Illuminate\Http\Request;

class NhaCungCapController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = NhaCungCap::query();

        // Search by name, code, or contact
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('ten_ncc', 'like', "%{$request->search}%")
                  ->orWhere('ma_ncc', 'like', "%{$request->search}%")
                  ->orWhere('nguoi_lien_he', 'like', "%{$request->search}%")
                  ->orWhere('sdt', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        // Filter by status - convert 'active'/'inactive' to 1/0
        if ($request->has('trang_thai')) {
            $isActive = $request->trang_thai === 'active' ? 1 : 0;
            $query->where('is_active', $isActive);
        }

        $perPage = $request->per_page ?? 20;
        $suppliers = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($suppliers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'ten_nha_cung_cap' => 'required|string|max:255',
            'ma_nha_cung_cap' => 'nullable|string|max:50|unique:spa_nha_cung_cap,ma_ncc',
            'nguoi_lien_he' => 'nullable|string|max:255',
            'so_dien_thoai' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'dia_chi' => 'nullable|string|max:500',
            'ma_so_thue' => 'nullable|string|max:50',
            'ghi_chu' => 'nullable|string',
            'trang_thai' => 'nullable|in:active,inactive',
        ]);

        $supplier = NhaCungCap::create([
            'ma_ncc' => $request->ma_nha_cung_cap ?? NhaCungCap::generateMaNhaCungCap(),
            'ten_ncc' => $request->ten_nha_cung_cap,
            'nguoi_lien_he' => $request->nguoi_lien_he,
            'sdt' => $request->so_dien_thoai,
            'email' => $request->email,
            'dia_chi' => $request->dia_chi,
            'ma_so_thue' => $request->ma_so_thue,
            'ghi_chu' => $request->ghi_chu,
            'is_active' => $request->trang_thai === 'active' ? 1 : 0,
        ]);

        return response()->json($supplier, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $supplier = NhaCungCap::findOrFail($id);
        return response()->json($supplier);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $supplier = NhaCungCap::findOrFail($id);

        $request->validate([
            'ten_nha_cung_cap' => 'required|string|max:255',
            'ma_nha_cung_cap' => 'nullable|string|max:50|unique:spa_nha_cung_cap,ma_ncc,' . $id,
            'nguoi_lien_he' => 'nullable|string|max:255',
            'so_dien_thoai' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'dia_chi' => 'nullable|string|max:500',
            'ma_so_thue' => 'nullable|string|max:50',
            'ghi_chu' => 'nullable|string',
            'trang_thai' => 'nullable|in:active,inactive',
        ]);

        $supplier->update([
            'ma_ncc' => $request->ma_nha_cung_cap,
            'ten_ncc' => $request->ten_nha_cung_cap,
            'nguoi_lien_he' => $request->nguoi_lien_he,
            'sdt' => $request->so_dien_thoai,
            'email' => $request->email,
            'dia_chi' => $request->dia_chi,
            'ma_so_thue' => $request->ma_so_thue,
            'ghi_chu' => $request->ghi_chu,
            'is_active' => $request->trang_thai === 'active' ? 1 : 0,
        ]);

        return response()->json($supplier);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $supplier = NhaCungCap::findOrFail($id);
        $supplier->delete();

        return response()->json(['message' => 'Xóa nhà cung cấp thành công']);
    }

    /**
     * Toggle supplier status
     */
    public function toggleStatus($id)
    {
        $supplier = NhaCungCap::findOrFail($id);
        $supplier->is_active = !$supplier->is_active;
        $supplier->save();

        return response()->json($supplier);
    }

    /**
     * Get statistics
     */
    public function statistics()
    {
        $total = NhaCungCap::count();
        $active = NhaCungCap::where('is_active', 1)->count();
        $inactive = NhaCungCap::where('is_active', 0)->count();

        return response()->json([
            'tong_nha_cung_cap' => $total,
            'dang_hoat_dong' => $active,
            'ngung_hoat_dong' => $inactive,
        ]);
    }
}
