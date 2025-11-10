<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class CapPhatTaiSan extends Model
{
    protected $table = 'cap_phat_tai_san';

    protected $fillable = [
        'tai_san_id',
        'admin_user_id',
        'ngay_cap_phat',
        'ngay_thu_hoi',
        'trang_thai',
        'ghi_chu_cap_phat',
        'ghi_chu_thu_hoi',
        'nguoi_cap_phat',
        'nguoi_thu_hoi',
    ];

    protected $casts = [
        'ngay_cap_phat' => 'date',
        'ngay_thu_hoi' => 'date',
    ];

    // Relationships
    public function taiSan()
    {
        return $this->belongsTo(TaiSanCongTy::class, 'tai_san_id');
    }

    public function nhanVien()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'admin_user_id');
    }

    public function nguoiCapPhat()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'nguoi_cap_phat');
    }

    public function nguoiThuHoi()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'nguoi_thu_hoi');
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

    public function scopeInUse($query)
    {
        return $query->where('trang_thai', 'dang_su_dung');
    }

    public function scopeReturned($query)
    {
        return $query->where('trang_thai', 'da_thu_hoi');
    }
}
