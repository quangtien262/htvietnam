<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Phong extends Model
{
    use SoftDeletes;

    protected $table = 'spa_phong';

    protected $fillable = [
        'chi_nhanh_id',
        'ma_phong',
        'ten_phong',
        'loai_phong',
        'suc_chua',
        'trang_thai',
        'ghi_chu',
    ];

    protected $casts = [
        'chi_nhanh_id' => 'integer',
        'suc_chua' => 'integer',
    ];

    // Relationships
    public function chiNhanh()
    {
        return $this->belongsTo(ChiNhanh::class, 'chi_nhanh_id');
    }

    public function bookingDichVus()
    {
        return $this->hasMany(BookingDichVu::class, 'phong_id');
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('trang_thai', 'trong');
    }

    public function scopeOccupied($query)
    {
        return $query->where('trang_thai', 'dang_su_dung');
    }

    public function scopeMaintenance($query)
    {
        return $query->where('trang_thai', 'bao_tri');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('loai_phong', $type);
    }

    // Accessors
    public function getIsAvailableAttribute()
    {
        return $this->trang_thai === 'trong';
    }

    // Business Logic
    public function checkAvailability($date, $startTime, $endTime)
    {
        if ($this->trang_thai !== 'trong') {
            return false;
        }

        // Check if room is already booked for this time slot
        $isBooked = $this->bookingDichVus()
            ->whereHas('booking', function($q) use ($date) {
                $q->whereDate('ngay_hen', $date)
                    ->whereIn('trang_thai', ['da_xac_nhan', 'dang_thuc_hien']);
            })
            ->where(function($q) use ($startTime, $endTime) {
                $q->whereBetween('gio_bat_dau', [$startTime, $endTime])
                    ->orWhereBetween('gio_ket_thuc', [$startTime, $endTime])
                    ->orWhere(function($q2) use ($startTime, $endTime) {
                        $q2->where('gio_bat_dau', '<=', $startTime)
                            ->where('gio_ket_thuc', '>=', $endTime);
                    });
            })
            ->exists();

        return !$isBooked;
    }
}
