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

    static function baseQuery()
    {
        return self::select(
            'hoa_don_chi_tiet.*',
            'products.name as product_name',
            'products.code as product_code',
            'products.id as product_id',
            'products.gia_ban as product_price',
            'products.product_type_id as product_type_id',
            'products.ton_kho as ton_kho',
            'products.don_vi_id as don_vi_tinh',

            'products.lich_trinh_sd as lich_trinh_sd',
            'products.lich_trinh_sd__khoang_cach_moi_buoi as lich_trinh_sd__khoang_cach_moi_buoi',

            'products.han_su_dung as han_su_dung',
            'products.hsd_ngay_cu_the as hsd_ngay_cu_the',
            'products.hsd_khoang_thoi_gian as hsd_khoang_thoi_gian',
            'products.hsd_khoang_thoi_gian_don_vi as hsd_khoang_thoi_gian_don_vi',
            // goi dv
            'products.product_apply as product_apply',
            // the
            'products.loai_hang_hoa as loai_hang_hoa',
            'products.hang_hoa_ap_dung as hang_hoa_ap_dung',
        )
        ->leftJoin('products', 'products.id', 'hoa_don_chi_tiet.product_id');
    }

    static function getByHoaDonId($hoaDonId){
        return self::baseQuery()
        ->orderBy('id', 'asc')
        ->where('hoa_don_chi_tiet.data_id', $hoaDonId)
        ->where('hoa_don_chi_tiet.is_recycle_bin', 0)
        ->get();
    }
}
