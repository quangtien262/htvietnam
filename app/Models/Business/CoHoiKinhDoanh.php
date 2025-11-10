<?php

namespace App\Models\Business;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CoHoiKinhDoanh extends Model
{
    use SoftDeletes;
    protected $table = 'co_hoi_kinh_doanh';
    protected $fillable = ['ma_co_hoi', 'ten_co_hoi', 'user_id', 'nguon_khach_hang', 'giai_doan', 'gia_tri_du_kien', 'xac_suat_thanh_cong', 'nhan_vien_phu_trach_id', 'ngay_du_kien_chot', 'ngay_chot_thuc_te', 'ly_do_that_bai', 'ghi_chu', 'trang_thai'];
    protected $casts = ['gia_tri_du_kien' => 'decimal:2', 'ngay_du_kien_chot' => 'date', 'ngay_chot_thuc_te' => 'date'];

    protected static function boot() {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_co_hoi)) {
                $latest = self::withTrashed()->orderBy('id', 'desc')->first();
                $number = $latest ? ((int) substr($latest->ma_co_hoi, 2)) + 1 : 1;
                $model->ma_co_hoi = 'CH' . str_pad($number, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function user() { return $this->belongsTo(\App\Models\User::class, 'user_id'); }
    public function nhanVienPhuTrach() { return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_phu_trach_id'); }
    public function baoGias() { return $this->hasMany(BaoGia::class, 'co_hoi_kinh_doanh_id'); }
    public function lichHens() { return $this->hasMany(LichHen::class, 'co_hoi_kinh_doanh_id'); }
    public function hoatDongs() { return $this->hasMany(HoatDongKinhDoanh::class, 'co_hoi_kinh_doanh_id'); }

    public function scopeActive($query) { return $query->where('trang_thai', 'active'); }
    public function scopeWon($query) { return $query->where('giai_doan', 'won'); }
    public function scopeLost($query) { return $query->where('giai_doan', 'lost'); }
    public function scopeTheoThang($query, $thang, $nam) {
        return $query->whereMonth('created_at', $thang)->whereYear('created_at', $nam);
    }
}
