<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class PhanCa extends Model
{
    protected $table = 'phan_ca';

    protected $fillable = [
        'admin_user_id',
        'ca_lam_viec_id',
        'tu_ngay',
        'den_ngay',
        'cac_ngay_trong_tuan',
        'ghi_chu',
    ];

    protected $casts = [
        'tu_ngay' => 'date',
        'den_ngay' => 'date',
        'cac_ngay_trong_tuan' => 'array',
    ];

    // Relationships
    public function nhanVien()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'admin_user_id');
    }

    public function caLamViec()
    {
        return $this->belongsTo(CaLamViec::class, 'ca_lam_viec_id');
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

    public function scopeByDateRange($query, $from, $to)
    {
        return $query->where(function($q) use ($from, $to) {
            $q->whereBetween('tu_ngay', [$from, $to])
              ->orWhereBetween('den_ngay', [$from, $to])
              ->orWhere(function($q2) use ($from, $to) {
                  $q2->where('tu_ngay', '<=', $from)
                     ->where('den_ngay', '>=', $to);
              });
        });
    }
}
