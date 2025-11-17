<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KhachHangVi extends Model
{
    use HasFactory;

    protected $table = 'spa_khach_hang_vi';

    protected $fillable = [
        'khach_hang_id',
        'so_du',
        'tong_nap',
        'tong_tieu',
        'tong_hoan',
        'han_muc_nap_ngay',
        'han_muc_rut_ngay',
        'da_nap_hom_nay',
        'da_rut_hom_nay',
        'ngay_reset_han_muc',
    ];

    protected $casts = [
        'so_du' => 'decimal:2',
        'tong_nap' => 'decimal:2',
        'tong_tieu' => 'decimal:2',
        'tong_hoan' => 'decimal:2',
        'han_muc_nap_ngay' => 'decimal:2',
        'han_muc_rut_ngay' => 'decimal:2',
        'da_nap_hom_nay' => 'decimal:2',
        'da_rut_hom_nay' => 'decimal:2',
        'ngay_reset_han_muc' => 'date',
    ];

    /**
     * Check and reset daily limits if needed
     */
    public function checkAndResetDailyLimits(): void
    {
        $today = now()->toDateString();

        if (!$this->ngay_reset_han_muc || $this->ngay_reset_han_muc->toDateString() !== $today) {
            $this->da_nap_hom_nay = 0;
            $this->da_rut_hom_nay = 0;
            $this->ngay_reset_han_muc = now();
            $this->save();
        }
    }

    /**
     * Check if can deposit amount
     */
    public function canDeposit(float $amount): array
    {
        $this->checkAndResetDailyLimits();

        if ($this->han_muc_nap_ngay) {
            $remaining = $this->han_muc_nap_ngay - $this->da_nap_hom_nay;
            if ($amount > $remaining) {
                return [
                    'can_deposit' => false,
                    'message' => "Vượt quá hạn mức nạp trong ngày. Còn lại: " . number_format($remaining, 0, ',', '.') . "đ",
                    'remaining' => $remaining,
                ];
            }
        }

        return [
            'can_deposit' => true,
            'remaining' => $this->han_muc_nap_ngay ? ($this->han_muc_nap_ngay - $this->da_nap_hom_nay) : null,
        ];
    }

    /**
     * Check if can withdraw amount
     */
    public function canWithdraw(float $amount): array
    {
        $this->checkAndResetDailyLimits();

        // Check balance
        if ($amount > $this->so_du) {
            return [
                'can_withdraw' => false,
                'message' => "Số dư không đủ. Hiện có: " . number_format($this->so_du, 0, ',', '.') . "đ",
            ];
        }

        // Check daily limit
        if ($this->han_muc_rut_ngay) {
            $remaining = $this->han_muc_rut_ngay - $this->da_rut_hom_nay;
            if ($amount > $remaining) {
                return [
                    'can_withdraw' => false,
                    'message' => "Vượt quá hạn mức rút trong ngày. Còn lại: " . number_format($remaining, 0, ',', '.') . "đ",
                    'remaining' => $remaining,
                ];
            }
        }

        return [
            'can_withdraw' => true,
            'remaining' => $this->han_muc_rut_ngay ? ($this->han_muc_rut_ngay - $this->da_rut_hom_nay) : null,
        ];
    }

    /**
     * Relationships
     */
    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id');
    }

    public function giaoDich()
    {
        return $this->hasMany(GiaoDichVi::class, 'khach_hang_id', 'khach_hang_id')
            ->orderBy('created_at', 'desc');
    }
}
