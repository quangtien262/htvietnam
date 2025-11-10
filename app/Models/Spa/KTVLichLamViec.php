<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class KTVLichLamViec extends Model
{
    protected $table = 'spa_ktv_lich_lam_viec';
    public $timestamps = false;

    protected $fillable = [
        'ktv_id',
        'thu',
        'gio_bat_dau',
        'gio_ket_thuc',
        'ghi_chu',
    ];

    protected $casts = [
        'ktv_id' => 'integer',
        'thu' => 'integer',
    ];

    // Relationships
    public function ktv()
    {
        return $this->belongsTo(KTV::class, 'ktv_id');
    }

    // Accessors
    public function getDayNameAttribute()
    {
        $days = [
            0 => 'Chủ nhật',
            1 => 'Thứ 2',
            2 => 'Thứ 3',
            3 => 'Thứ 4',
            4 => 'Thứ 5',
            5 => 'Thứ 6',
            6 => 'Thứ 7',
        ];
        return $days[$this->thu] ?? '';
    }

    public function getWorkingHoursAttribute()
    {
        $start = \Carbon\Carbon::parse($this->gio_bat_dau);
        $end = \Carbon\Carbon::parse($this->gio_ket_thuc);
        return $start->diffInHours($end);
    }
}
