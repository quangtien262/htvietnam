<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class KhachHangThe extends Model
{
    protected $table = 'spa_khach_hang_the';

    protected $fillable = [
        'ma_the',
        'khach_hang_id',
        'tier_id',
        'ngay_cap',
        'ngay_het_han',
        'trang_thai',
    ];

    protected $casts = [
        'khach_hang_id' => 'integer',
        'tier_id' => 'integer',
        'ngay_cap' => 'date',
        'ngay_het_han' => 'date',
    ];

    // Relationships
    public function khachHang()
    {
        return $this->belongsTo(\App\Models\User::class, 'khach_hang_id');
    }

    public function tier()
    {
        return $this->belongsTo(MembershipTier::class, 'tier_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'active')
            ->where('ngay_het_han', '>=', now());
    }

    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->where('trang_thai', 'active')
            ->whereBetween('ngay_het_han', [now(), now()->addDays($days)]);
    }

    public function scopeExpired($query)
    {
        return $query->where('ngay_het_han', '<', now());
    }

    // Accessors
    public function getIsActiveAttribute()
    {
        return $this->trang_thai === 'active' && $this->ngay_het_han >= now();
    }

    public function getIsExpiringSoonAttribute()
    {
        if ($this->trang_thai === 'active' && $this->ngay_het_han) {
            $daysUntilExpiry = now()->diffInDays($this->ngay_het_han, false);
            return $daysUntilExpiry >= 0 && $daysUntilExpiry <= 30;
        }
        return false;
    }

    // Business Logic
    public function renew($months = 12)
    {
        $this->ngay_het_han = now()->addMonths($months);
        $this->trang_thai = 'active';
        $this->save();
        return $this;
    }

    public function upgrade($newTierId)
    {
        $this->tier_id = $newTierId;
        $this->save();
        return $this;
    }
}
