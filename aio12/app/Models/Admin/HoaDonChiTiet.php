<?php
namespace App\Models\Admin;

use App\Casts\CastsUsers;
use App\Casts\CastsCardTL;
use App\Casts\CastsCardGT;
use App\Casts\CastsHoaDonChiTiet;
use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class HoaDonChiTiet extends Model
{
    protected $table = 'hoa_don_chi_tiet';
    protected $casts = [
        'loai_hang_hoa' => Json::class, // leftjoin sp
        'hang_hoa_ap_dung' => Json::class, // leftjoin sp
        'product_apply' => Json::class
    ];

    static function getByHoaDonId($hoaDonId){
        return HoaDonChiTiet::select(
            'hoa_don_chi_tiet.*',
            'product.name as product_name',
            'product.code as product_code',
            'product.id as product_id',
            'product.gia_ban as product_price',
            'product.product_type_id as product_type_id',
            'product.ton_kho as ton_kho',
            'product.don_vi_id as don_vi_tinh',

            'product.lich_trinh_sd as lich_trinh_sd',
            'product.lich_trinh_sd__khoang_cach_moi_buoi as lich_trinh_sd__khoang_cach_moi_buoi',

            'product.han_su_dung as han_su_dung',
            'product.hsd_ngay_cu_the as hsd_ngay_cu_the',
            'product.hsd_khoang_thoi_gian as hsd_khoang_thoi_gian',
            'product.hsd_khoang_thoi_gian_don_vi as hsd_khoang_thoi_gian_don_vi',
            // goi dv
            'product.product_apply as product_apply',
            // the
            'product.loai_hang_hoa as loai_hang_hoa',
            'product.hang_hoa_ap_dung as hang_hoa_ap_dung',
        )
        ->leftJoin('product', 'product.id', 'hoa_don_chi_tiet.product_id')
        ->orderBy('id', 'asc')
        ->where('hoa_don_chi_tiet.data_id', $hoaDonId)
        ->where('hoa_don_chi_tiet.is_recycle_bin', 0)
        ->get();
    }
}
