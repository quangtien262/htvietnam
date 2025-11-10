<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Casts\Json;

class Voucher extends Model
{
    use SoftDeletes;

    protected $table = 'spa_voucher';

    protected $fillable = [
        'ma_voucher',
        'ten_voucher',
        'loai',
        'gia_tri',
        'gia_tri_toi_da',
        'don_hang_toi_thieu',
        'so_luong',
        'da_su_dung',
        'ngay_bat_dau',
        'ngay_het_han',
        'khach_hang_id',
        'ap_dung_cho',
        'trang_thai',
    ];

    protected $casts = [
        'gia_tri' => 'decimal:0',
        'gia_tri_toi_da' => 'decimal:0',
        'don_hang_toi_thieu' => 'decimal:0',
        'so_luong' => 'integer',
        'da_su_dung' => 'integer',
        'ngay_bat_dau' => 'date',
        'ngay_het_han' => 'date',
        'khach_hang_id' => 'integer',
        'ap_dung_cho' => Json::class,
    ];

    // Relationships
    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'active')
            ->where('ngay_bat_dau', '<=', now())
            ->where('ngay_het_han', '>=', now())
            ->whereColumn('da_su_dung', '<', 'so_luong');
    }

    public function scopePublic($query)
    {
        return $query->whereNull('khach_hang_id');
    }

    public function scopePersonal($query, $customerId)
    {
        return $query->where('khach_hang_id', $customerId);
    }

    // Accessors
    public function getIsValidAttribute()
    {
        return $this->trang_thai === 'active'
            && $this->ngay_bat_dau <= now()
            && $this->ngay_het_han >= now()
            && $this->da_su_dung < $this->so_luong;
    }

    public function getConLaiAttribute()
    {
        return $this->so_luong - $this->da_su_dung;
    }

    // Business Logic
    public function calculateDiscount($orderAmount)
    {
        if (!$this->is_valid) {
            throw new \Exception('Voucher không hợp lệ');
        }

        if ($orderAmount < $this->don_hang_toi_thieu) {
            throw new \Exception("Đơn hàng tối thiểu " . number_format($this->don_hang_toi_thieu, 0, ',', '.') . " VND");
        }

        if ($this->loai === 'phan_tram') {
            $discount = ($orderAmount * $this->gia_tri) / 100;
            if ($this->gia_tri_toi_da > 0 && $discount > $this->gia_tri_toi_da) {
                $discount = $this->gia_tri_toi_da;
            }
            return $discount;
        }

        return $this->gia_tri;
    }

    public function use()
    {
        $this->da_su_dung += 1;
        $this->save();
        return $this;
    }
}
