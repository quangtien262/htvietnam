<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Casts\Json;

class MembershipTier extends Model
{
    use SoftDeletes;

    protected $table = 'spa_membership_tier';

    protected $fillable = [
        'ma_tier',
        'ten_tier',
        'cap_bac',
        'chi_tieu_toi_thieu',
        'phan_tram_giam_dich_vu',
        'phan_tram_giam_san_pham',
        'he_so_tich_diem',
        'uu_dai_khac',
        'mau_the',
        'thu_tu',
        'trang_thai',
    ];

    protected $casts = [
        'chi_tieu_toi_thieu' => 'decimal:0',
        'phan_tram_giam_dich_vu' => 'decimal:2',
        'phan_tram_giam_san_pham' => 'decimal:2',
        'he_so_tich_diem' => 'decimal:2',
        'uu_dai_khac' => Json::class,
        'thu_tu' => 'integer',
    ];

    // Relationships
    public function khachHangThes()
    {
        return $this->hasMany(KhachHangThe::class, 'tier_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'active');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('thu_tu', 'asc');
    }

    // Business Logic
    public static function getApplicableTier($totalSpending)
    {
        return self::active()
            ->where('chi_tieu_toi_thieu', '<=', $totalSpending)
            ->orderBy('chi_tieu_toi_thieu', 'desc')
            ->first();
    }
}
