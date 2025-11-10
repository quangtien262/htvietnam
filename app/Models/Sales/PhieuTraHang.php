<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PhieuTraHang extends Model
{
    use SoftDeletes;
    protected $table = 'phieu_tra_hang';
    protected $fillable = ['ma_phieu_tra', 'don_hang_id', 'user_id', 'ngay_tra', 'ly_do_tra', 'mo_ta_ly_do', 'tong_tien_hoan', 'hinh_thuc_xu_ly', 'trang_thai', 'nguoi_duyet_id', 'ngay_duyet', 'ghi_chu'];
    protected $casts = ['ngay_tra' => 'date', 'ngay_duyet' => 'datetime', 'tong_tien_hoan' => 'decimal:2'];

    protected static function boot() {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_phieu_tra)) {
                $latest = self::withTrashed()->orderBy('id', 'desc')->first();
                $number = $latest ? ((int) substr($latest->ma_phieu_tra, 3)) + 1 : 1;
                $model->ma_phieu_tra = 'PTH' . str_pad($number, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function donHang() { return $this->belongsTo(DonHang::class, 'don_hang_id'); }
    public function user() { return $this->belongsTo(\App\Models\User::class, 'user_id'); }
    public function khachHang() { return $this->user(); } // Alias
    public function nguoiDuyet() { return $this->belongsTo(\App\Models\AdminUser::class, 'nguoi_duyet_id'); }
    public function chiTiets() { return $this->hasMany(PhieuTraHangChiTiet::class, 'phieu_tra_hang_id'); }
}
