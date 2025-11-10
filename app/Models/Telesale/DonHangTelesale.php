<?php

namespace App\Models\Telesale;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DonHangTelesale extends Model
{
    use SoftDeletes;
    protected $table = 'don_hang_telesale';
    protected $fillable = ['ma_don_hang', 'cuoc_goi_id', 'data_khach_hang_id', 'nhan_vien_telesale_id', 'ngay_dat_hang', 'ngay_giao_du_kien', 'dia_chi_giao_hang', 'sdt_nguoi_nhan', 'ten_nguoi_nhan', 'tong_tien', 'phi_ship', 'tong_thanh_toan', 'hinh_thuc_thanh_toan', 'trang_thai', 'ly_do_hoan_huy', 'ghi_chu'];
    protected $casts = ['ngay_dat_hang' => 'date', 'ngay_giao_du_kien' => 'date', 'tong_tien' => 'decimal:2', 'phi_ship' => 'decimal:2', 'tong_thanh_toan' => 'decimal:2'];

    protected static function boot() {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_don_hang)) {
                $latest = self::withTrashed()->orderBy('id', 'desc')->first();
                $number = $latest ? ((int) substr($latest->ma_don_hang, 3)) + 1 : 1;
                $model->ma_don_hang = 'DHT' . str_pad($number, 5, '0', STR_PAD_LEFT);
            }
        });
    }

    public function cuocGoi() { return $this->belongsTo(CuocGoiTelesale::class, 'cuoc_goi_id'); }
    public function dataKhachHang() { return $this->belongsTo(DataKhachHangTelesale::class, 'data_khach_hang_id'); }
    public function nhanVienTelesale() { return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_telesale_id'); }
    public function chiTiets() { return $this->hasMany(DonHangTelesaleChiTiet::class, 'don_hang_telesale_id'); }

    public function scopeThanhCong($query) { return $query->where('trang_thai', 'thanh_cong'); }
    public function scopeHomNay($query) { return $query->whereDate('ngay_dat_hang', today()); }
    public function scopeTheoThang($query, $thang, $nam) {
        return $query->whereMonth('ngay_dat_hang', $thang)->whereYear('ngay_dat_hang', $nam);
    }
}
