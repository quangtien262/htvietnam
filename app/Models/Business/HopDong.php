<?php

namespace App\Models\Business;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HopDong extends Model
{
    use SoftDeletes;
    protected $table = 'hop_dong';
    protected $fillable = ['ma_hop_dong', 'user_id', 'bao_gia_id', 'loai_hop_dong', 'gia_tri_hop_dong', 'ngay_bat_dau', 'ngay_ket_thuc', 'dieu_khoan', 'phuong_thuc_thanh_toan', 'trang_thai', 'file_hop_dong', 'ghi_chu', 'nhan_vien_phu_trach_id'];
    protected $casts = ['gia_tri_hop_dong' => 'decimal:2', 'ngay_bat_dau' => 'date', 'ngay_ket_thuc' => 'date'];

    protected static function boot() {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_hop_dong)) {
                $latest = self::withTrashed()->orderBy('id', 'desc')->first();
                $number = $latest ? ((int) substr($latest->ma_hop_dong, 2)) + 1 : 1;
                $model->ma_hop_dong = 'HD' . str_pad($number, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function user() { return $this->belongsTo(\App\Models\User::class, 'user_id'); }
    public function baoGia() { return $this->belongsTo(BaoGia::class, 'bao_gia_id'); }
    public function nhanVienPhuTrach() { return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_phu_trach_id'); }
    public function lichThanhToans() { return $this->hasMany(LichThanhToanHopDong::class, 'hop_dong_id'); }

    public function scopeActive($query) { return $query->where('trang_thai', 'active'); }
    public function scopeExpiringSoon($query) { 
        return $query->where('ngay_ket_thuc', '<=', now()->addDays(30))->where('trang_thai', 'active'); 
    }
}
