<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class KTVNghiPhep extends Model
{
    use SoftDeletes;

    protected $table = 'spa_ktv_nghi_phep';

    protected $fillable = [
        'ktv_id',
        'ngay_bat_dau',
        'ngay_ket_thuc',
        'loai_nghi',
        'ly_do',
        'trang_thai',
        'nguoi_duyet',
        'ngay_duyet',
    ];

    protected $casts = [
        'ktv_id' => 'integer',
        'ngay_bat_dau' => 'date',
        'ngay_ket_thuc' => 'date',
        'ngay_duyet' => 'datetime',
    ];

    // Relationships
    public function ktv()
    {
        return $this->belongsTo(KTV::class, 'ktv_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('trang_thai', 'cho_duyet');
    }

    public function scopeApproved($query)
    {
        return $query->where('trang_thai', 'duyet');
    }

    public function scopeRejected($query)
    {
        return $query->where('trang_thai', 'tu_choi');
    }

    // Accessors
    public function getTotalDaysAttribute()
    {
        return $this->ngay_bat_dau->diffInDays($this->ngay_ket_thuc) + 1;
    }
}
