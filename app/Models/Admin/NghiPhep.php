<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class NghiPhep extends Model
{
    protected $table = 'nghi_phep';

    protected $fillable = [
        'ma_don',
        'admin_user_id',
        'loai_nghi',
        'tu_ngay',
        'den_ngay',
        'so_ngay_nghi',
        'ly_do',
        'file_dinh_kem',
        'trang_thai',
        'nguoi_duyet_id',
        'ngay_duyet',
        'ghi_chu_duyet',
    ];

    protected $casts = [
        'tu_ngay' => 'date',
        'den_ngay' => 'date',
        'ngay_duyet' => 'datetime',
        'so_ngay_nghi' => 'decimal:2',
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

    public function scopeByUser($query, $userId)
    {
        return $query->where('admin_user_id', $userId);
    }

    public function scopePending($query)
    {
        return $query->where('trang_thai', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('trang_thai', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('trang_thai', 'rejected');
    }

    // Auto generate ma_don
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->ma_don)) {
                $model->ma_don = self::generateMaDon();
            }

            // Auto calculate so_ngay_nghi
            if ($model->tu_ngay && $model->den_ngay) {
                $model->so_ngay_nghi = $model->tu_ngay->diffInDays($model->den_ngay) + 1;
            }
        });
    }

    public static function generateMaDon()
    {
        $prefix = 'NP-' . date('Y') . '-';
        $lastRecord = self::where('ma_don', 'like', $prefix . '%')
                           ->orderBy('ma_don', 'desc')
                           ->first();

        if ($lastRecord) {
            $lastNumber = intval(substr($lastRecord->ma_don, -3));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }

    public static function getLoaiNghiOptions()
    {
        return [
            'phep_nam' => 'Phép năm',
            'om' => 'Ốm đau',
            'thai_san' => 'Thai sản',
            'khong_luong' => 'Không lương',
            'khac' => 'Khác',
        ];
    }
}
