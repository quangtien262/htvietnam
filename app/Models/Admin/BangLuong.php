<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class BangLuong extends Model
{
    protected $table = 'bang_luong';

    protected $fillable = [
        'ma_bang_luong',
        'admin_user_id',
        'thang',
        'nam',
        'luong_co_ban',
        'loai_luong',
        'so_ngay_cong_chuan',
        'so_ngay_cong_thuc_te',
        'luong_theo_ngay_cong',
        'gio_lam_them_ngay_thuong',
        'gio_lam_them_thu7',
        'gio_lam_them_chu_nhat',
        'gio_lam_them_ngay_le',
        'tien_lam_them',
        'tong_thuong',
        'tong_hoa_hong',
        'tong_phu_cap',
        'chi_tiet_thuong',
        'chi_tiet_hoa_hong',
        'chi_tiet_phu_cap',
        'tong_giam_tru',
        'chi_tiet_giam_tru',
        'tru_bhxh',
        'tru_bhyt',
        'tru_bhtn',
        'tru_thue_tncn',
        'tong_thu_nhap',
        'tong_khau_tru',
        'thuc_nhan',
        'trang_thai',
        'nguoi_duyet_id',
        'ngay_duyet',
        'ngay_phat_luong',
        'ghi_chu',
    ];

    protected $casts = [
        'ngay_duyet' => 'datetime',
        'ngay_phat_luong' => 'date',
        'chi_tiet_thuong' => 'array',
        'chi_tiet_hoa_hong' => 'array',
        'chi_tiet_phu_cap' => 'array',
        'chi_tiet_giam_tru' => 'array',
    ];

    // Relationships
    public function nhanVien()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'admin_user_id');
    }

    public function nguoiDuyet()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'nguoi_duyet_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_recycle_bin', '!=', 1);
    }

    public function scopeByMonth($query, $month, $year)
    {
        return $query->where('thang', $month)->where('nam', $year);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('trang_thai', $status);
    }

    public function scopeDraft($query)
    {
        return $query->where('trang_thai', 'draft');
    }

    public function scopeApproved($query)
    {
        return $query->where('trang_thai', 'approved');
    }

    public function scopePaid($query)
    {
        return $query->where('trang_thai', 'paid');
    }

    // Auto generate ma_bang_luong
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->ma_bang_luong)) {
                $model->ma_bang_luong = self::generateMaBangLuong($model->thang, $model->nam);
            }
        });
    }

    public static function generateMaBangLuong($thang, $nam)
    {
        $prefix = 'BL-' . $nam . '-' . str_pad($thang, 2, '0', STR_PAD_LEFT) . '-';
        $lastRecord = self::where('ma_bang_luong', 'like', $prefix . '%')
                           ->orderBy('ma_bang_luong', 'desc')
                           ->first();

        if ($lastRecord) {
            $lastNumber = intval(substr($lastRecord->ma_bang_luong, -3));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }
}
