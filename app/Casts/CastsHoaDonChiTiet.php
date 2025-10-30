<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CastsHoaDonChiTiet implements CastsAttributes
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
        $hoaDonChiTiet = DB::table('hoa_don_chi_tiet')
            ->select(
                'hoa_don_chi_tiet.UserNhap as UserNhap', 
                'hoa_don_chi_tiet.so_luong as so_luong', 
                'hoa_don_chi_tiet.vat as vat', 
                'hoa_don_chi_tiet.vat_money as vat_money', 
                'hoa_don_chi_tiet.thanh_tien as thanh_tien', 
                'hoa_don_chi_tiet.thanh_toan as thanh_toan', 
                'hoa_don_chi_tiet.ghi_chu as ghi_chu', 
                'hoa_don_chi_tiet.is_recycle_bin as is_recycle_bin', 
                'hoa_don_chi_tiet.chiet_khau_persen as chiet_khau_persen', 
                'hoa_don_chi_tiet.chiet_khau_money as chiet_khau_money', 

                'hoa_don_chi_tiet.product_id as product_id', 
                'hoa_don_chi_tiet.don_vi_id as don_vi_id', 
                'products.name as ten_san_pham', 
            )
            ->leftJoin('products', 'products.id', 'hoa_don_chi_tiet.product_id')
            ->where('data_id', $value)
            ->get();

        $data = [];

        foreach($hoaDonChiTiet as $hd) {
            $nvThucHien = DB::table('nhan_vien_thuc_hien')
                ->select(
                    // 'nhan_vien_thuc_hien.UserNhap as UserNhap', 
                    'nhan_vien_thuc_hien.TienChietKhau as TienChietKhau', 
                    'nhan_vien_thuc_hien.LaPhanTram as LaPhanTram', 
                    'nhan_vien_thuc_hien.DienGiai as DienGiai', 
                    'nhan_vien_thuc_hien.DuocYeuCau as DuocYeuCau', 
                    'nhan_vien_thuc_hien.ChiPhiThucHien as ChiPhiThucHien', 
                    'nhan_vien_thuc_hien.LaPTChiPhiThucHien as LaPTChiPhiThucHien', 

                    'nhan_vien_thuc_hien.nhan_vien_id as nhan_vien_id', 
                    'admin_users.name as ho_ten', 
                )
                ->leftJoin('admin_users', 'admin_users.id', 'nhan_vien_thuc_hien.nhan_vien_id')
                ->where('nhan_vien_thuc_hien.chung_tu_chi_tiet_id', $value)
                ->get();

            $nvTuVan = DB::table('nhan_vien_tu_van')
                ->select(
                    'nhan_vien_tu_van.name as name', 
                    'nhan_vien_tu_van.TienChietKhau as TienChietKhau', 
                    'nhan_vien_tu_van.LaPhanTram as LaPhanTram', 
                    'nhan_vien_tu_van.DienGiai as DienGiai', 
                    'nhan_vien_tu_van.created_at as created_at', 

                    'nhan_vien_tu_van.nhan_vien_id as nhan_vien_id', 
                    'admin_users.name as ho_ten', 
                )
                ->leftJoin('admin_users', 'admin_users.id', 'nhan_vien_tu_van.nhan_vien_id')
                ->where('nhan_vien_tu_van.chung_tu_chi_tiet_id', $value)
                ->get();

            $data[] = [
                'hoa_don' => $hd,
                'nvThucHien' => $nvThucHien,
                'nvTuVan' => $nvTuVan,
            ];
        }

        return [
            'id' => $value,
            'data' => $data
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
