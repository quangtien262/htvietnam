<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class ChamCong extends Model
{
    protected $table = 'cham_cong';

    protected $fillable = [
        'admin_user_id',
        'ngay_cham_cong',
        'type',
        'checkin_h',
        'checkin_m',
        'checkout_h',
        'checkout_m',
        'kpi',
        'luong_nghi_nua_ngay',
        'luong_nghi_ca_ngay',
        'gio_lam_them',
        'tien_lam_them',
        'note',
        'van_tay_id',
        'van_tay_checkin_time',
        'van_tay_checkout_time',
        'is_approved',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'ngay_cham_cong' => 'date',
        'approved_at' => 'datetime',
        'luong_nghi_nua_ngay' => 'decimal:2',
        'luong_nghi_ca_ngay' => 'decimal:2',
        'gio_lam_them' => 'decimal:2',
        'tien_lam_them' => 'decimal:2',
    ];

    // Relationships
    public function nhanVien()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'admin_user_id');
    }

    public function nguoiDuyet()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'approved_by');
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

    public function scopeByMonth($query, $month, $year)
    {
        return $query->whereYear('ngay_cham_cong', $year)
                     ->whereMonth('ngay_cham_cong', $month);
    }

    public function scopeByDateRange($query, $from, $to)
    {
        return $query->whereBetween('ngay_cham_cong', [$from, $to]);
    }

    public function scopeDiLam($query)
    {
        return $query->where('type', 1);
    }

    public function scopePending($query)
    {
        return $query->where('is_approved', 0);
    }

    // Helpers
    public function getCheckinTime()
    {
        if (!$this->checkin_h || !$this->checkin_m) return null;
        return str_pad($this->checkin_h, 2, '0', STR_PAD_LEFT) . ':' .
               str_pad($this->checkin_m, 2, '0', STR_PAD_LEFT);
    }

    public function getCheckoutTime()
    {
        if (!$this->checkout_h || !$this->checkout_m) return null;
        return str_pad($this->checkout_h, 2, '0', STR_PAD_LEFT) . ':' .
               str_pad($this->checkout_m, 2, '0', STR_PAD_LEFT);
    }

    public static function getTypeName($type)
    {
        $types = [
            1 => 'Đi làm',
            2 => 'Nghỉ có phép',
            3 => 'Nghỉ không phép',
            4 => 'Nghỉ lễ',
            5 => 'Nghỉ cuối tuần',
        ];
        return $types[$type] ?? 'Không xác định';
    }
}
