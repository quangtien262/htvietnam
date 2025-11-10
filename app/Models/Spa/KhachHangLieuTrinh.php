<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Casts\Json;

class KhachHangLieuTrinh extends Model
{
    use SoftDeletes;

    protected $table = 'spa_khach_hang_lieu_trinh';

    protected $fillable = [
        'khach_hang_id',
        'lieu_trinh_id',
        'ngay_bat_dau',
        'ngay_ket_thuc_du_kien',
        'tong_buoi',
        'buoi_da_thuc_hien',
        'buoi_con_lai',
        'lich_su_thuc_hien',
        'danh_gia_hieu_qua',
        'ghi_chu',
        'trang_thai',
    ];

    protected $casts = [
        'khach_hang_id' => 'integer',
        'lieu_trinh_id' => 'integer',
        'ngay_bat_dau' => 'date',
        'ngay_ket_thuc_du_kien' => 'date',
        'tong_buoi' => 'integer',
        'buoi_da_thuc_hien' => 'integer',
        'buoi_con_lai' => 'integer',
        'lich_su_thuc_hien' => Json::class,
        'danh_gia_hieu_qua' => Json::class,
    ];

    // Relationships
    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id');
    }

    public function lieuTrinh()
    {
        return $this->belongsTo(LieuTrinh::class, 'lieu_trinh_id');
    }

    public function progressPhotos()
    {
        return $this->hasMany(ProgressPhoto::class, 'lieu_trinh_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'dang_thuc_hien');
    }

    public function scopeCompleted($query)
    {
        return $query->where('trang_thai', 'hoan_thanh');
    }

    public function scopePaused($query)
    {
        return $query->where('trang_thai', 'tam_dung');
    }

    // Accessors
    public function getCompletionPercentAttribute()
    {
        if ($this->tong_buoi > 0) {
            return round(($this->buoi_da_thuc_hien / $this->tong_buoi) * 100, 2);
        }
        return 0;
    }

    // Business Logic
    public function recordSession($sessionData)
    {
        $history = $this->lich_su_thuc_hien ?? [];
        $history[] = array_merge($sessionData, [
            'ngay_thuc_hien' => now()->toDateString(),
            'buoi_so' => $this->buoi_da_thuc_hien + 1,
        ]);

        $this->lich_su_thuc_hien = $history;
        $this->buoi_da_thuc_hien += 1;
        $this->buoi_con_lai = $this->tong_buoi - $this->buoi_da_thuc_hien;

        if ($this->buoi_con_lai <= 0) {
            $this->trang_thai = 'hoan_thanh';
        }

        $this->save();
    }
}
