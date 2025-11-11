<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use App\Casts\Json;

class DiemThuongLichSu extends Model
{
    protected $table = 'spa_diem_thuong_lich_su';

    protected $fillable = [
        'khach_hang_id',
        'loai_giao_dich',
        'so_diem',
        'reference_id',
        'ghi_chu',
    ];

    protected $casts = [
        'khach_hang_id' => 'integer',
        'so_diem' => 'integer',
        'reference_id' => 'integer',
    ];

    // Relationships
    public function khachHang()
    {
        return $this->belongsTo(\App\Models\User::class, 'khach_hang_id');
    }

    // Scopes
    public function scopeEarned($query)
    {
        return $query->where('so_diem', '>', 0);
    }

    public function scopeSpent($query)
    {
        return $query->where('so_diem', '<', 0);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('loai_giao_dich', $type);
    }

    // Accessors
    public function getTransactionTypeNameAttribute()
    {
        $types = [
            'mua_hang' => 'Mua hàng',
            'su_dung' => 'Sử dụng điểm',
            'doi_qua' => 'Đổi quà',
            'huy' => 'Hoàn điểm (hủy đơn)',
            'thuong' => 'Điểm thưởng',
        ];
        return $types[$this->loai_giao_dich] ?? $this->loai_giao_dich;
    }
}
