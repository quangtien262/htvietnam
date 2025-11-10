<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class DoiQua extends Model
{
    protected $table = 'spa_doi_qua';

    protected $fillable = [
        'khach_hang_id',
        'qua_id',
        'so_diem_su_dung',
        'so_luong',
        'trang_thai',
        'ngay_giao',
    ];

    protected $casts = [
        'khach_hang_id' => 'integer',
        'qua_id' => 'integer',
        'so_diem_su_dung' => 'integer',
        'so_luong' => 'integer',
        'ngay_giao' => 'datetime',
    ];

    // Relationships
    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id');
    }

    public function qua()
    {
        return $this->belongsTo(QuaTang::class, 'qua_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('trang_thai', 'cho_giao');
    }

    public function scopeDelivered($query)
    {
        return $query->where('trang_thai', 'da_giao');
    }
}
