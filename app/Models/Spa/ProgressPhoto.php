<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class ProgressPhoto extends Model
{
    protected $table = 'spa_progress_photos';

    protected $fillable = [
        'khach_hang_id',
        'lieu_trinh_id',
        'buoi_so',
        'loai_anh',
        'duong_dan',
        'ghi_chu',
        'ngay_chup',
    ];

    protected $casts = [
        'buoi_so' => 'integer',
        'ngay_chup' => 'datetime',
    ];

    // Relationships
    public function khachHang()
    {
        return $this->belongsTo(\App\Models\User::class, 'khach_hang_id');
    }

    public function lieuTrinh()
    {
        return $this->belongsTo(KhachHangLieuTrinh::class, 'lieu_trinh_id');
    }

    // Scopes
    public function scopeBeforePhotos($query)
    {
        return $query->where('loai_anh', 'truoc');
    }

    public function scopeAfterPhotos($query)
    {
        return $query->where('loai_anh', 'sau');
    }

    public function scopeBySession($query, $sessionNumber)
    {
        return $query->where('buoi_so', $sessionNumber);
    }
}
