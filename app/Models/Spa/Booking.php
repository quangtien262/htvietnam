<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Casts\Json;

class Booking extends Model
{
    use SoftDeletes;

    protected $table = 'spa_bookings';

    protected $fillable = [
        'ma_booking',
        'khach_hang_id',
        'chi_nhanh_id',
        'ngay_hen',
        'gio_hen',
        'thoi_gian_du_kien',
        'nguon_booking',
        'ghi_chu',
        'tien_coc',
        'trang_thai',
        'ly_do_huy',
        'sms_nhac_nho',
        'sms_xac_nhan',
    ];

    protected $casts = [
        'khach_hang_id' => 'integer',
        'chi_nhanh_id' => 'integer',
        'ngay_hen' => 'date',
        'thoi_gian_du_kien' => 'integer',
        'tien_coc' => 'decimal:0',
        'sms_nhac_nho' => 'boolean',
        'sms_xac_nhan' => 'boolean',
    ];

    // Relationships
    public function khachHang()
    {
        return $this->belongsTo(\App\Models\User::class, 'khach_hang_id');
    }

    public function chiNhanh()
    {
        return $this->belongsTo(ChiNhanh::class, 'chi_nhanh_id');
    }

    public function dichVus()
    {
        return $this->hasMany(BookingDichVu::class, 'booking_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('trang_thai', 'cho_xac_nhan');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('trang_thai', 'da_xac_nhan');
    }

    public function scopeInProgress($query)
    {
        return $query->where('trang_thai', 'dang_thuc_hien');
    }

    public function scopeCompleted($query)
    {
        return $query->where('trang_thai', 'hoan_thanh');
    }

    public function scopeCancelled($query)
    {
        return $query->where('trang_thai', 'da_huy');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('ngay_hen', today());
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('ngay_hen', $date);
    }

    public function scopeBySource($query, $source)
    {
        return $query->where('nguon_booking', $source);
    }

    // Accessors
    public function getTienCocFormattedAttribute()
    {
        return number_format($this->tien_coc, 0, ',', '.');
    }

    public function getFullDateTimeAttribute()
    {
        return $this->ngay_hen->format('d/m/Y') . ' ' . $this->gio_hen;
    }

    public function getIsOverdueAttribute()
    {
        if ($this->trang_thai === 'cho_xac_nhan' || $this->trang_thai === 'da_xac_nhan') {
            $appointmentTime = \Carbon\Carbon::parse($this->ngay_hen->format('Y-m-d') . ' ' . $this->gio_hen);
            return $appointmentTime->lt(now());
        }
        return false;
    }

    // Business Logic
    public function confirm()
    {
        $this->trang_thai = 'da_xac_nhan';
        $this->sms_xac_nhan = true;
        $this->save();

        // TODO: Send SMS confirmation
        return $this;
    }

    public function start()
    {
        $this->trang_thai = 'dang_thuc_hien';
        $this->save();
        return $this;
    }

    public function complete()
    {
        $this->trang_thai = 'hoan_thanh';
        $this->save();
        return $this;
    }

    public function cancel($reason)
    {
        $this->trang_thai = 'da_huy';
        $this->ly_do_huy = $reason;
        $this->save();
        return $this;
    }

    public function sendReminder()
    {
        $this->sms_nhac_nho = true;
        $this->save();

        // TODO: Send SMS reminder
        return $this;
    }
}
