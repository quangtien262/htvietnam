<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use App\Casts\Json;

class HoSoSucKhoe extends Model
{
    protected $table = 'spa_ho_so_suc_khoe';

    protected $fillable = [
        'khach_hang_id',
        'nhom_mau',
        'chieu_cao',
        'can_nang',
        'huyet_ap',
        'benh_ly',
        'dich_ung',
        'thuoc_dang_dung',
        'tien_su_phau_thuat',
        'chu_ky_kinh_nguyet',
        'thai_ky',
        'ghi_chu',
        'ngay_cap_nhat',
    ];

    protected $casts = [
        'chieu_cao' => 'decimal:1',
        'can_nang' => 'decimal:1',
        'benh_ly' => Json::class,
        'dich_ung' => Json::class,
        'thuoc_dang_dung' => Json::class,
        'tien_su_phau_thuat' => Json::class,
        'ngay_cap_nhat' => 'datetime',
    ];

    // Relationships
    public function khachHang()
    {
        return $this->belongsTo(\App\Models\User::class, 'khach_hang_id');
    }

    // Accessors
    public function getBmiAttribute()
    {
        if ($this->chieu_cao && $this->can_nang) {
            $heightInMeters = $this->chieu_cao / 100;
            return round($this->can_nang / ($heightInMeters * $heightInMeters), 2);
        }
        return null;
    }

    public function getBmiClassificationAttribute()
    {
        $bmi = $this->bmi;
        if (!$bmi) return null;

        if ($bmi < 18.5) return 'Gầy';
        if ($bmi < 23) return 'Bình thường';
        if ($bmi < 25) return 'Thừa cân';
        if ($bmi < 30) return 'Béo phì độ I';
        return 'Béo phì độ II';
    }
}
