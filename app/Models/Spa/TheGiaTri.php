<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TheGiaTri extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'spa_the_gia_tri';

    protected $fillable = [
        'ma_the',
        'ten_the',
        'menh_gia',
        'gia_ban',
        'ti_le_thuong',
        'ngay_het_han',
        'trang_thai',
        'mo_ta',
        'ma_code',
        'so_luong_code',
        'so_luong_da_dung',
        'code_het_han',
    ];

    protected $casts = [
        'menh_gia' => 'decimal:2',
        'gia_ban' => 'decimal:2',
        'ti_le_thuong' => 'decimal:2',
        'ngay_het_han' => 'date',
        'code_het_han' => 'date',
        'so_luong_code' => 'integer',
        'so_luong_da_dung' => 'integer',
    ];

    /**
     * Auto-generate ma_the when creating
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->ma_the) {
                $lastCard = self::withTrashed()->orderBy('id', 'desc')->first();
                $nextNumber = $lastCard ? $lastCard->id + 1 : 1;
                $model->ma_the = 'GT' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Scope: Active cards only
     */
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'active');
    }

    /**
     * Scope: Not expired
     */
    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('ngay_het_han')
              ->orWhere('ngay_het_han', '>=', now());
        });
    }

    /**
     * Scope: Available for purchase
     */
    public function scopeAvailable($query)
    {
        return $query->active()->notExpired();
    }

    /**
     * Calculate actual deposit amount with promotion
     */
    public function getSoTienNapAttribute(): float
    {
        $baseAmount = $this->menh_gia;
        $bonusAmount = $baseAmount * ($this->ti_le_thuong / 100);
        return $baseAmount + $bonusAmount;
    }

    /**
     * Check if card is expired
     */
    public function getIsExpiredAttribute(): bool
    {
        if (!$this->ngay_het_han) {
            return false;
        }
        return $this->ngay_het_han->isPast();
    }

    /**
     * Check if promo code is valid
     */
    public function isCodeValid(): bool
    {
        if (!$this->ma_code) {
            return false;
        }

        // Check if code is expired
        if ($this->code_het_han && $this->code_het_han->isPast()) {
            return false;
        }

        // Check if code usage limit reached
        if ($this->so_luong_code > 0 && $this->so_luong_da_dung >= $this->so_luong_code) {
            return false;
        }

        return true;
    }

    /**
     * Increment code usage
     */
    public function incrementCodeUsage(): void
    {
        $this->increment('so_luong_da_dung');
    }

    /**
     * Relationships
     */
    public function giaoDich()
    {
        return $this->hasMany(GiaoDichVi::class, 'the_gia_tri_id');
    }
}
