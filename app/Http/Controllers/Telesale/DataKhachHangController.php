<?php

namespace App\Http\Controllers\Telesale;

use App\Http\Controllers\Controller;
use App\Models\Telesale\DataKhachHangTelesale;
use App\Services\Telesale\TelesaleService;
use Illuminate\Http\Request;

class DataKhachHangController extends Controller
{
    protected $telesaleService;

    public function __construct(TelesaleService $telesaleService)
    {
        $this->telesaleService = $telesaleService;
    }

    public function index(Request $request)
    {
        $query = DataKhachHangTelesale::with('nhanVienTelesale');

        if ($request->trang_thai) {
            $query->where('trang_thai', $request->trang_thai);
        }

        if ($request->phan_loai) {
            $query->where('phan_loai', $request->phan_loai);
        }

        if ($request->nhan_vien_id) {
            $query->where('nhan_vien_telesale_id', $request->nhan_vien_id);
        }

        $data = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['message' => 'success', 'data' => $data]);
    }

    public function store(Request $request)
    {
        $data = DataKhachHangTelesale::create($request->all());
        return response()->json(['message' => 'success', 'data' => $data]);
    }

    public function update(Request $request, $id)
    {
        $data = DataKhachHangTelesale::findOrFail($id);
        $data->update($request->all());
        return response()->json(['message' => 'success', 'data' => $data]);
    }

    public function destroy($id)
    {
        DataKhachHangTelesale::findOrFail($id)->delete();
        return response()->json(['message' => 'success']);
    }

    public function phanBo(Request $request)
    {
        $this->telesaleService->phanBoData($request->data_ids, $request->nhan_vien_id);
        return response()->json(['message' => 'Phân bổ data thành công']);
    }

    public function import(Request $request)
    {
        // Import Excel/CSV logic here
        return response()->json(['message' => 'Import thành công']);
    }
}
