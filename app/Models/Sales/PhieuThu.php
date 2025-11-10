<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PhieuThu extends Model
{
    use SoftDeletes;
    protected $table = 'phieu_thu';
    protected $fillable = ['ma_phieu_thu', 'user_id', 'ngay_thu', 'tong_tien', 'hinh_thuc_thanh_toan', 'so_tai_khoan', 'ngan_hang', 'nguoi_thu_id', 'ghi_chu', 'trang_thai'];
    protected $casts = ['ngay_thu' => 'date', 'tong_tien' => 'decimal:2'];

    protected static function boot() {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_phieu_thu)) {
                $latest = self::withTrashed()->orderBy('id', 'desc')->first();
                $number = $latest ? ((int) substr($latest->ma_phieu_thu, 2)) + 1 : 1;
                $model->ma_phieu_thu = 'PT' . str_pad($number, 5, '0', STR_PAD_LEFT);
            }
        });
    }

    public function user() { return $this->belongsTo(\App\Models\User::class, 'user_id'); }
    public function khachHang() { return $this->user(); } // Alias
    public function nguoiThu() { return $this->belongsTo(\App\Models\AdminUser::class, 'nguoi_thu_id'); }
    public function chiTiets() { return $this->hasMany(PhieuThuChiTiet::class, 'phieu_thu_id'); }
}
