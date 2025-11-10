<?php

namespace App\Models\Business;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BaoGia extends Model
{
    use SoftDeletes;
    protected $table = 'bao_gia';
    protected $fillable = ['ma_bao_gia', 'user_id', 'co_hoi_kinh_doanh_id', 'ngay_bao_gia', 'hieu_luc_den', 'tong_tien', 'tien_giam_gia', 'tong_cong', 'trang_thai', 'nhan_vien_tao_id', 'ghi_chu', 'dieu_khoan'];
    protected $casts = ['ngay_bao_gia' => 'date', 'hieu_luc_den' => 'date', 'tong_tien' => 'decimal:2', 'tien_giam_gia' => 'decimal:2', 'tong_cong' => 'decimal:2'];

    protected static function boot() {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_bao_gia)) {
                $latest = self::withTrashed()->orderBy('id', 'desc')->first();
                $number = $latest ? ((int) substr($latest->ma_bao_gia, 2)) + 1 : 1;
                $model->ma_bao_gia = 'BG' . str_pad($number, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function user() { return $this->belongsTo(\App\Models\User::class, 'user_id'); }
    public function coHoi() { return $this->belongsTo(CoHoiKinhDoanh::class, 'co_hoi_kinh_doanh_id'); }
    public function nhanVienTao() { return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_tao_id'); }
    public function chiTiets() { return $this->hasMany(BaoGiaChiTiet::class, 'bao_gia_id'); }
    public function hopDongs() { return $this->hasMany(HopDong::class, 'bao_gia_id'); }

    public function scopeApproved($query) { return $query->where('trang_thai', 'approved'); }
    public function scopeExpired($query) { return $query->where('hieu_luc_den', '<', now()); }
}
