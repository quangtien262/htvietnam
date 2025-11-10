<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Casts\Json;

class KTV extends Model
{
    use SoftDeletes;

    protected $table = 'spa_ktv';

    protected $fillable = [
        'ma_ktv',
        'ho_ten',
        'ngay_sinh',
        'gioi_tinh',
        'so_dien_thoai',
        'email',
        'dia_chi',
        'avatar',
        'ngay_vao_lam',
        'trinh_do',
        'chuyen_mon',
        'bang_cap',
        'kinh_nghiem',
        'phan_tram_hoa_hong',
        'trang_thai',
    ];

    protected $casts = [
        'ngay_sinh' => 'date',
        'ngay_vao_lam' => 'date',
        'chuyen_mon' => Json::class,
        'bang_cap' => Json::class,
        'phan_tram_hoa_hong' => 'decimal:2',
    ];

    // Relationships
    public function lichLamViecs()
    {
        return $this->hasMany(KTVLichLamViec::class, 'ktv_id');
    }

    public function nghiPheps()
    {
        return $this->hasMany(KTVNghiPhep::class, 'ktv_id');
    }

    public function hoaHongs()
    {
        return $this->hasMany(KTVHoaHong::class, 'ktv_id');
    }

    public function bookingDichVus()
    {
        return $this->hasMany(BookingDichVu::class, 'ktv_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'dang_lam');
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('trinh_do', $level);
    }

    public function scopeAvailableAt($query, $date, $time)
    {
        return $query->where('trang_thai', 'dang_lam')
            ->whereHas('lichLamViecs', function($q) use ($date, $time) {
                $dayOfWeek = \Carbon\Carbon::parse($date)->dayOfWeek;
                $q->where('thu', $dayOfWeek)
                    ->where('gio_bat_dau', '<=', $time)
                    ->where('gio_ket_thuc', '>=', $time);
            })
            ->whereDoesntHave('nghiPheps', function($q) use ($date) {
                $q->where('ngay_bat_dau', '<=', $date)
                    ->where('ngay_ket_thuc', '>=', $date)
                    ->where('trang_thai', 'duyet');
            });
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->ho_ten;
    }

    public function getYearsOfExperienceAttribute()
    {
        if ($this->ngay_vao_lam) {
            return $this->ngay_vao_lam->diffInYears(now());
        }
        return 0;
    }

    public function getLevelNameAttribute()
    {
        $levels = [
            'junior' => 'KTV Junior',
            'senior' => 'KTV Senior',
            'expert' => 'Chuyên gia',
            'master' => 'Thạc sĩ',
        ];
        return $levels[$this->trinh_do] ?? $this->trinh_do;
    }

    // Business Logic
    public function calculateMonthlyCommission($month, $year)
    {
        return $this->hoaHongs()
            ->whereYear('ngay_thuc_hien', $year)
            ->whereMonth('ngay_thuc_hien', $month)
            ->sum('tien_hoa_hong');
    }

    public function getMonthlyRevenue($month, $year)
    {
        return $this->hoaHongs()
            ->whereYear('ngay_thuc_hien', $year)
            ->whereMonth('ngay_thuc_hien', $month)
            ->sum('doanh_thu');
    }

    public function isAvailable($date, $startTime, $endTime)
    {
        // Check if on leave
        $onLeave = $this->nghiPheps()
            ->where('ngay_bat_dau', '<=', $date)
            ->where('ngay_ket_thuc', '>=', $date)
            ->where('trang_thai', 'duyet')
            ->exists();

        if ($onLeave) return false;

        // Check working schedule
        $dayOfWeek = \Carbon\Carbon::parse($date)->dayOfWeek;
        $hasSchedule = $this->lichLamViecs()
            ->where('thu', $dayOfWeek)
            ->where('gio_bat_dau', '<=', $startTime)
            ->where('gio_ket_thuc', '>=', $endTime)
            ->exists();

        if (!$hasSchedule) return false;

        // Check if already booked
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
