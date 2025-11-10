<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class CaLamViec extends Model
{
    protected $table = 'ca_lam_viec';

    protected $fillable = [
        'ma_ca',
        'ten_ca',
        'gio_bat_dau',
        'gio_ket_thuc',
        'thoi_gian_nghi_giua_ca',
        'ap_dung_cho',
        'danh_sach_ap_dung',
        'is_active',
        'ghi_chu',
    ];

    protected $casts = [
        'danh_sach_ap_dung' => 'array',
    ];

    // Relationships
    public function phanCa()
    {
        return $this->hasMany(PhanCa::class, 'ca_lam_viec_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_recycle_bin', '!=', 1)->where('is_active', 1);
    }

    // Auto generate ma_ca
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->ma_ca)) {
                $model->ma_ca = self::generateMaCa();
            }
        });
    }

    public static function generateMaCa()
    {
        $prefix = 'CA-';
        $lastRecord = self::where('ma_ca', 'like', $prefix . '%')
                           ->orderBy('ma_ca', 'desc')
                           ->first();

        if ($lastRecord) {
            $lastNumber = intval(substr($lastRecord->ma_ca, -3));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }
}
