<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Casts\Json;

class HoaDon extends Model
{
    use SoftDeletes;

    protected $table = 'spa_hoa_don';

    protected $fillable = [
        'ma_hoa_don',
        'khach_hang_id',
        'chi_nhanh_id',
        'nguoi_thu_id',
        'ngay_ban',
        'tong_tien_dich_vu',
        'tong_tien_san_pham',
        'tong_tien',
        'giam_gia',
        'diem_su_dung',
        'tien_giam_tu_diem',
        'tien_tip',
        'tong_thanh_toan',
        'phuong_thuc_thanh_toan',
        'trang_thai',
        'nguoi_ban',
        'ghi_chu',
        'ca_lam_viec_id',
    ];

    protected $casts = [
        'khach_hang_id' => 'integer',
        'chi_nhanh_id' => 'integer',
        'ngay_ban' => 'datetime',
        'tong_tien_dich_vu' => 'decimal:0',
        'tong_tien_san_pham' => 'decimal:0',
        'tong_tien' => 'decimal:0',
        'giam_gia' => 'decimal:0',
        'diem_su_dung' => 'integer',
        'tien_giam_tu_diem' => 'decimal:0',
        'tien_tip' => 'decimal:0',
        'tong_thanh_toan' => 'decimal:0',
        'phuong_thuc_thanh_toan' => Json::class,
    ];

    // Relationships
    public function khachHang()
    {
        return $this->belongsTo(\App\Models\User::class, 'khach_hang_id');
    }

    public function nguoiThu()
    {
        return $this->belongsTo(\App\Models\User::class, 'nguoi_thu_id');
    }

    public function chiNhanh()
    {
        return $this->belongsTo(ChiNhanh::class, 'chi_nhanh_id');
    }

    public function caLamViec()
    {
        return $this->belongsTo(CaLamViec::class, 'ca_lam_viec_id');
    }

    public function chiTiets()
    {
        return $this->hasMany(HoaDonChiTiet::class, 'hoa_don_id');
    }

    public function hoaHongs()
    {
        return $this->hasMany(KTVHoaHong::class, 'hoa_don_id');
    }

    // Scopes
    public function scopePaid($query)
    {
        return $query->where('trang_thai', 'da_thanh_toan');
    }

    public function scopePending($query)
    {
        return $query->where('trang_thai', 'cho_thanh_toan');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('ngay_ban', today());
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('ngay_ban', $date);
    }

    public function scopeDateRange($query, $from, $to)
    {
        return $query->whereBetween('ngay_ban', [$from, $to]);
    }

    // Accessors
    public function getTongThanhToanFormattedAttribute()
    {
        return number_format($this->tong_thanh_toan, 0, ',', '.');
    }

    // Business Logic
    public function calculateTotals()
    {
        $tongDichVu = $this->chiTiets()->whereNotNull('dich_vu_id')->sum('thanh_tien');
        $tongSanPham = $this->chiTiets()->whereNotNull('san_pham_id')->sum('thanh_tien');

        $this->tong_tien_dich_vu = $tongDichVu;
        $this->tong_tien_san_pham = $tongSanPham;
        $this->tong_tien = $tongDichVu + $tongSanPham;
        $this->tong_thanh_toan = $this->tong_tien - $this->giam_gia - $this->tien_giam_tu_diem;

        $this->save();
        return $this;
    }

    public function calculateCommissions()
    {
        // Delete existing commissions
        $this->hoaHongs()->delete();

        // Get month from invoice date (first day of month)
        $thang = $this->ngay_ban ? $this->ngay_ban->startOfMonth()->format('Y-m-d') : now()->startOfMonth()->format('Y-m-d');

        foreach ($this->chiTiets as $chiTiet) {
            if ($chiTiet->ktv_id) {
                $ktv = KTV::find($chiTiet->ktv_id);
                if (!$ktv) continue;

                // Calculate commission based on type
                if ($chiTiet->dich_vu_id) {
                    // Service commission: use KTV's commission rate or default 20%
                    $phanTram = $ktv->phan_tram_hoa_hong ?? 20;
                    $commission = $chiTiet->thanh_tien * ($phanTram / 100);
                    KTVHoaHong::create([
                        'ktv_id' => $ktv->id,
                        'hoa_don_id' => $this->id,
                        'loai' => 'dich_vu',
                        'gia_tri_goc' => $chiTiet->thanh_tien,
                        'phan_tram' => $phanTram,
                        'tien_hoa_hong' => $commission,
                        'thang' => $thang,
                    ]);
                } elseif ($chiTiet->san_pham_id) {
                    // Product commission: 10% default
                    $phanTram = 10;
                    $commission = $chiTiet->thanh_tien * ($phanTram / 100);
                    KTVHoaHong::create([
                        'ktv_id' => $ktv->id,
                        'hoa_don_id' => $this->id,
                        'loai' => 'san_pham',
                        'gia_tri_goc' => $chiTiet->thanh_tien,
                        'phan_tram' => $phanTram,
                        'tien_hoa_hong' => $commission,
                        'thang' => $thang,
                    ]);
                }
            }
        }

        // Tip commission: 100% to KTV
        if ($this->tien_tip > 0) {
            $firstDetailWithKTV = $this->chiTiets()->whereNotNull('ktv_id')->first();
            if ($firstDetailWithKTV) {
                KTVHoaHong::create([
                    'ktv_id' => $firstDetailWithKTV->ktv_id,
                    'hoa_don_id' => $this->id,
                    'loai' => 'tip',
                    'gia_tri_goc' => $this->tien_tip,
                    'phan_tram' => 100,
                    'tien_hoa_hong' => $this->tien_tip,
                    'thang' => $thang,
                ]);
            }
        }

        return $this;
    }

    public function processLoyaltyPoints()
    {
        if (!$this->khach_hang_id) return;

        $khachHang = $this->khachHang ?? \App\Models\User::find($this->khach_hang_id);

        if (!$khachHang) return; // Customer not found, skip loyalty processing

        // Calculate points (1 point per 10,000 VND)
        $basePoints = floor($this->tong_thanh_toan / 10000);
        $finalPoints = $basePoints;

        // Award points to user
        $currentPoints = $khachHang->diem_tich_luy ?? $khachHang->points ?? 0;
        $khachHang->update([
            'diem_tich_luy' => $currentPoints + $finalPoints,
            'points' => $currentPoints + $finalPoints,
        ]);

        return $finalPoints;
    }

    public function checkTierUpgrade()
    {
        if (!$this->khach_hang_id) return;

        $khachHang = $this->khachHang;
        $currentCard = $khachHang->membershipCards()->active()->first();

        // Get applicable tier based on total spending
        $newTier = MembershipTier::getApplicableTier($khachHang->tong_chi_tieu);

        if ($newTier) {
            if (!$currentCard) {
                // Create new card
                KhachHangThe::create([
                    'ma_the' => 'THE-' . strtoupper(substr(md5(uniqid()), 0, 10)),
                    'khach_hang_id' => $khachHang->id,
                    'tier_id' => $newTier->id,
                    'ngay_cap' => now(),
                    'ngay_het_han' => now()->addYear(),
                    'trang_thai' => 'active',
                ]);
            } elseif ($currentCard->tier_id != $newTier->id) {
                // Upgrade existing card
                $currentCard->upgrade($newTier->id);
            }
        }
    }
}
