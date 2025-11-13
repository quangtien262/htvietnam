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
        'admin_user_id',
        'chuyen_mon_ids',
        'trinh_do',
        'chung_chi_ids',
        'so_nam_kinh_nghiem',
        'rating_tb',
        'so_luot_danh_gia',
        'luong_co_ban',
        'phan_tram_hoa_hong',
        'target_doanh_thu_thang',
        'avatar_url',
        'mo_ta_ngan',
        'is_active',
        'ngay_vao_lam',
    ];

    protected $casts = [
        'admin_user_id' => 'integer',
        'chuyen_mon_ids' => Json::class,
        'chung_chi_ids' => Json::class,
        'so_nam_kinh_nghiem' => 'integer',
        'rating_tb' => 'decimal:2',
        'so_luot_danh_gia' => 'integer',
        'luong_co_ban' => 'decimal:2',
        'phan_tram_hoa_hong' => 'decimal:2',
        'target_doanh_thu_thang' => 'decimal:2',
        'is_active' => 'boolean',
        'ngay_vao_lam' => 'date',
    ];

    // Relationships
    public function adminUser()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'admin_user_id');
    }

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
        return $query->where('is_active', true);
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('trinh_do', $level);
    }

    public function scopeAvailableAt($query, $date, $time)
    {
        return $query->where('is_active', true)
            ->whereHas('lichLamViecs', function($q) use ($date, $time) {
                $dayOfWeek = \Carbon\Carbon::parse($date)->dayOfWeek;
                $q->where('thu', $dayOfWeek)
                    ->where(function($q2) use ($time) {
                        $q2->where(function($q3) use ($time) {
                            $q3->where('ca_sang_bat_dau', '<=', $time)
                                ->where('ca_sang_ket_thuc', '>=', $time);
                        })
                        ->orWhere(function($q3) use ($time) {
                            $q3->where('ca_chieu_bat_dau', '<=', $time)
                                ->where('ca_chieu_ket_thuc', '>=', $time);
                        });
                    });
            })
            ->whereDoesntHave('nghiPheps', function($q) use ($date) {
                $q->where('ngay_bat_dau', '<=', $date)
                    ->where('ngay_ket_thuc', '>=', $date)
                    ->where('trang_thai', 'da_duyet');
            });
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->adminUser?->name ?? '';
    }

    public function getHoTenAttribute()
    {
        return $this->adminUser?->name ?? '';
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
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = date('Y-m-t', strtotime($startDate));
        
        return $this->hoaHongs()
            ->whereBetween('thang', [$startDate, $endDate])
            ->sum('tien_hoa_hong');
    }

    public function getMonthlyRevenue($month, $year)
    {
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = date('Y-m-t', strtotime($startDate));
        
        return $this->hoaHongs()
            ->whereBetween('thang', [$startDate, $endDate])
            ->sum('gia_tri_goc');
    }

    public function isAvailable($date, $startTime, $endTime)
    {
        // Check if active
        if (!$this->is_active) return false;

        // Check if on leave
        $onLeave = $this->nghiPheps()
            ->where('ngay_bat_dau', '<=', $date)
            ->where('ngay_ket_thuc', '>=', $date)
            ->where('trang_thai', 'da_duyet')
            ->exists();

        if ($onLeave) return false;

        // Check working schedule
        $dayOfWeek = \Carbon\Carbon::parse($date)->dayOfWeek;
        $hasSchedule = $this->lichLamViecs()
            ->where('thu', $dayOfWeek)
            ->where('is_nghi_phep', false)
            ->where(function($q) use ($startTime, $endTime) {
                $q->where(function($q2) use ($startTime, $endTime) {
                    $q2->where('ca_sang_bat_dau', '<=', $startTime)
                        ->where('ca_sang_ket_thuc', '>=', $endTime);
                })
                ->orWhere(function($q2) use ($startTime, $endTime) {
                    $q2->where('ca_chieu_bat_dau', '<=', $startTime)
                        ->where('ca_chieu_ket_thuc', '>=', $endTime);
                });
            })
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
