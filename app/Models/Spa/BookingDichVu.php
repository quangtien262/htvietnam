<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class BookingDichVu extends Model
{
    protected $table = 'spa_booking_dich_vu';
    public $timestamps = false;

    protected $fillable = [
        'booking_id',
        'dich_vu_id',
        'ktv_id',
        'phong_id',
        'gio_bat_dau',
        'gio_ket_thuc',
        'ghi_chu',
    ];

    protected $casts = [
        'booking_id' => 'integer',
        'dich_vu_id' => 'integer',
        'ktv_id' => 'integer',
        'phong_id' => 'integer',
    ];

    // Relationships
    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function dichVu()
    {
        return $this->belongsTo(DichVu::class, 'dich_vu_id');
    }

    public function ktv()
    {
        return $this->belongsTo(KTV::class, 'ktv_id');
    }

    public function phong()
    {
        return $this->belongsTo(Phong::class, 'phong_id');
    }
}
