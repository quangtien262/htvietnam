<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use App\Casts\Json;

class HoSoDa extends Model
{
    protected $table = 'spa_ho_so_da';

    protected $fillable = [
        'khach_hang_id',
        'loai_da',
        'van_de_da',
        'muc_do_nghiem_trong',
        'dieu_tri_truoc_do',
        'san_pham_dang_dung',
        'muc_tieu_dieu_tri',
        'ghi_chu',
        'ngay_danh_gia',
    ];

    protected $casts = [
        'van_de_da' => Json::class,
        'dieu_tri_truoc_do' => Json::class,
        'san_pham_dang_dung' => Json::class,
        'muc_tieu_dieu_tri' => Json::class,
        'muc_do_nghiem_trong' => 'integer',
        'ngay_danh_gia' => 'datetime',
    ];

    // Relationships
    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id');
    }

    // Scopes
    public function scopeBySkinType($query, $type)
    {
        return $query->where('loai_da', $type);
    }

    public function scopeSeverityAbove($query, $level)
    {
        return $query->where('muc_do_nghiem_trong', '>=', $level);
    }

    // Accessors
    public function getSeverityLevelAttribute()
    {
        $level = $this->muc_do_nghiem_trong;
        if ($level <= 3) return 'Nhẹ';
        if ($level <= 6) return 'Trung bình';
        return 'Nghiêm trọng';
    }
}
