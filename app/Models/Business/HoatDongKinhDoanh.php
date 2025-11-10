<?php

namespace App\Models\Business;

use Illuminate\Database\Eloquent\Model;

class HoatDongKinhDoanh extends Model
{
    protected $table = 'hoat_dong_kinh_doanh';
    protected $fillable = ['loai_hoat_dong', 'user_id', 'co_hoi_kinh_doanh_id', 'nhan_vien_id', 'noi_dung', 'ket_qua', 'next_action', 'thoi_gian_thuc_hien'];
    protected $casts = ['thoi_gian_thuc_hien' => 'datetime'];

    public function user() { return $this->belongsTo(\App\Models\User::class, 'user_id'); }
    public function coHoi() { return $this->belongsTo(CoHoiKinhDoanh::class, 'co_hoi_kinh_doanh_id'); }
    public function nhanVien() { return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_id'); }
}
