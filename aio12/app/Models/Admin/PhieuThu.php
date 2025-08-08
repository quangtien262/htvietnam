<?php
namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class PhieuThu extends Model
{
    protected $table = 'phieu_thu';
    protected $casts = [
        'info' =>  Json::class,
        'sub_data_ids' =>  Json::class,
    ];

    // protected $fillable = [
    //     'id',
    //     'name',
    //     'code',
    //     'chi_nhanh_id',
    //     'hinh_thuc_thu_id',
    //     'loai_thu_id',
    //     'so_tien',
    //     'menh_gia_id',
    //     'thoi_gian',
    //     'user_thu_id',
    //     'explain',
    //     'ngan_hang_id',
    //     'phi_the',
    //     'file',
    //     'description',
    //     'users_id',
    //     'tien_mat',
    //     'tien_gui',
    //     'tien_thu',
    //     'NguoiNopTien',
    //     'UserLap',
    //     'NgaySuaCuoi',
    //     'UserSuaCuoi',
    //     'ngoai_te_id',
    //     'ty_gia_id',
    //     'lucky_id',
    //     'display_name',
    //     'is_recycle_bin',
    //     'create_by',
    //     'created_at',
    //     'updated_at',
    // ];
}
