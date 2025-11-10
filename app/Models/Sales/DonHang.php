<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DonHang extends Model
{
    use SoftDeletes;

    protected $table = 'don_hang';

    protected $fillable = [
        'ma_don_hang', 'user_id', 'nhan_vien_ban_hang_id',
        'ngay_dat_hang', 'ngay_giao_du_kien', 'ngay_giao_thuc_te', 'trang_thai',
        'tong_tien_hang', 'tien_giam_gia', 'tien_vat', 'phi_van_chuyen', 'tong_cong',
        'da_thanh_toan', 'con_no', 'dia_chi_giao_hang', 'nguoi_nhan', 'sdt_nguoi_nhan',
        'chuong_trinh_khuyen_mai_id', 'ma_giam_gia', 'ghi_chu', 'ly_do_huy', 'ngay_huy'
    ];

    protected $casts = [
        'ngay_dat_hang' => 'date',
        'ngay_giao_du_kien' => 'date',
        'ngay_giao_thuc_te' => 'date',
        'ngay_huy' => 'datetime',
        'tong_tien_hang' => 'decimal:2',
        'tien_giam_gia' => 'decimal:2',
        'tien_vat' => 'decimal:2',
        'phi_van_chuyen' => 'decimal:2',
        'tong_cong' => 'decimal:2',
        'da_thanh_toan' => 'decimal:2',
        'con_no' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_don_hang)) {
                $model->ma_don_hang = self::generateMaDonHang();
            }
        });
    }

    public static function generateMaDonHang()
    {
        $latest = self::withTrashed()->orderBy('id', 'desc')->first();
        $number = $latest ? ((int) substr($latest->ma_don_hang, 2)) + 1 : 1;
        return 'DH' . str_pad($number, 5, '0', STR_PAD_LEFT);
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    // Alias for backward compatibility
    public function khachHang(): BelongsTo
    {
        return $this->user();
    }

    public function nhanVienBanHang(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_ban_hang_id');
    }

    public function chiTiets(): HasMany
    {
        return $this->hasMany(DonHangChiTiet::class, 'don_hang_id');
    }

    public function phieuXuatKhos(): HasMany
    {
        return $this->hasMany(PhieuXuatKho::class, 'don_hang_id');
    }

    public function chuongTrinhKhuyenMai(): BelongsTo
    {
        return $this->belongsTo(ChuongTrinhKhuyenMai::class, 'chuong_trinh_khuyen_mai_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('trang_thai', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('trang_thai', 'confirmed');
    }

    public function scopeCoNo($query)
    {
        return $query->where('con_no', '>', 0);
    }

    public function scopeTheoThang($query, $thang, $nam)
    {
        return $query->whereMonth('ngay_dat_hang', $thang)
                     ->whereYear('ngay_dat_hang', $nam);
    }
}
