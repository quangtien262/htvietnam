<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CastsPhieuThuChiTiet implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return array
     */
    public function get($model, $key, $value, $attributes)
    {
        // $value = 7164;
        $phieuThuChiTiet = DB::table('phieu_thu_chi_tiet')
            ->select(
                'phieu_thu_chi_tiet.id as phieu_thu_chi_tiet_id', 
                'phieu_thu_chi_tiet.data_id as phieu_thu_id', 
                'phieu_thu_chi_tiet.TienMat as TienMat', 
                'phieu_thu_chi_tiet.TienGui as TienGui', 
                'phieu_thu_chi_tiet.TienThu as TienThu', 
                'phieu_thu_chi_tiet.GhiChu as GhiChu', 
                'phieu_thu_chi_tiet.chung_tu_id as chung_tu_id', 
                'phieu_thu_chi_tiet.LoaiCT as LoaiCT', 
                'phieu_thu_chi_tiet.ChiPhiNganHang as ChiPhiNganHang', 
                'phieu_thu_chi_tiet.LaPTChiPhiNganHang as LaPTChiPhiNganHang', 
                'phieu_thu_chi_tiet.ThuPhiTienGui as ThuPhiTienGui', 
                'phieu_thu_chi_tiet.nhan_vien_id as nhan_vien_id', 

                'users.name as ten_khach_hang', 
                'users.code as ma_khach_hang', 
            )
            ->leftJoin('users', 'users.id', 'phieu_thu_chi_tiet.ID_KhachHang')
            ->where('data_id', $value)
            ->get();

        $data = [];

        return [
            'id' => $value,
            'phieu_thu' => $phieuThuChiTiet
        ];
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @param  array  $value
     * @param  array  $attributes
     * @return string
     */
    public function set($model, $key, $value, $attributes)
    {
        return $value;
    }
}
