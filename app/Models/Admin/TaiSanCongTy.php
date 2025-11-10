<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class TaiSanCongTy extends Model
{
    protected $table = 'tai_san_cong_ty';

    protected $fillable = [
        'ma_tai_san',
        'ten_tai_san',
        'loai_tai_san',
        'ngay_mua',
        'gia_tri',
        'tinh_trang',
        'trang_thai',
        'thong_tin_chi_tiet',
        'hinh_anh',
        'ghi_chu',
    ];

    protected $casts = [
        'ngay_mua' => 'date',
        'gia_tri' => 'decimal:2',
        'thong_tin_chi_tiet' => 'array',
    ];

    // Relationships
    public function capPhat()
    {
        return $this->hasMany(CapPhatTaiSan::class, 'tai_san_id');
    }

    public function capPhatHienTai()
    {
        return $this->hasOne(CapPhatTaiSan::class, 'tai_san_id')
                    ->where('trang_thai', 'dang_su_dung')
                    ->latest();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_recycle_bin', '!=', 1);
    }

    public function scopeInStock($query)
    {
        return $query->where('trang_thai', 'kho');
    }

    public function scopeInUse($query)
    {
        return $query->where('trang_thai', 'dang_su_dung');
    }

    // Auto generate ma_tai_san
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->ma_tai_san)) {
                $model->ma_tai_san = self::generateMaTaiSan();
            }
        });
    }

    public static function generateMaTaiSan()
    {
        $prefix = 'TS-';
        $lastRecord = self::where('ma_tai_san', 'like', $prefix . '%')
                           ->orderBy('ma_tai_san', 'desc')
                           ->first();

        if ($lastRecord) {
            $lastNumber = intval(substr($lastRecord->ma_tai_san, -3));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }

    public static function getLoaiTaiSanOptions()
    {
        return [
            'laptop' => 'Laptop',
            'dien_thoai' => 'Điện thoại',
            'xe' => 'Xe',
            'thiet_bi' => 'Thiết bị',
            'khac' => 'Khác',
        ];
    }
}
