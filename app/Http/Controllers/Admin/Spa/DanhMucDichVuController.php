<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DanhMucDichVuController extends Controller
{
    public function index()
    {
        $categories = DB::table('spa_danh_muc_dich_vu')->get();
        return $this->sendSuccessResponse($categories);
    }

    public function store(Request $request)
    {
        $id = DB::table('spa_danh_muc_dich_vu')->insertGetId([
            'ten_danh_muc' => $request->ten_danh_muc,
            'mo_ta' => $request->mo_ta,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id]);
    }

    public function update(Request $request, $id)
    {
        DB::table('spa_danh_muc_dich_vu')->where('id', $id)->update([
            'ten_danh_muc' => $request->ten_danh_muc,
            'mo_ta' => $request->mo_ta,
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(null);
    }

    public function destroy($id)
    {
        DB::table('spa_danh_muc_dich_vu')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null);
    }

    public function show($id)
    {
        $category = DB::table('spa_danh_muc_dich_vu')->where('id', $id)->first();
        return $this->sendSuccessResponse($category);
    }
}
