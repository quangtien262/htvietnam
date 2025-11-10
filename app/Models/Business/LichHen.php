<?php

namespace App\Models\Business;

use Illuminate\Database\Eloquent\Model;

class LichHen extends Model
{
    protected $table = 'lich_hen';
    protected $fillable = ['tieu_de', 'mo_ta', 'user_id', 'co_hoi_kinh_doanh_id', 'nhan_vien_phu_trach_id', 'thoi_gian_bat_dau', 'thoi_gian_ket_thuc', 'dia_diem', 'loai_cuoc_hen', 'trang_thai', 'ket_qua_cuoc_hen', 'next_action'];
    protected $casts = ['thoi_gian_bat_dau' => 'datetime', 'thoi_gian_ket_thuc' => 'datetime'];

    public function user() { return $this->belongsTo(\App\Models\User::class, 'user_id'); }
    public function coHoi() { return $this->belongsTo(CoHoiKinhDoanh::class, 'co_hoi_kinh_doanh_id'); }
    public function nhanVien() { return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_phu_trach_id'); }

    public function scopeUpcoming($query) { 
        return $query->where('thoi_gian_bat_dau', '>', now())->where('trang_thai', 'confirmed'); 
    }
}
