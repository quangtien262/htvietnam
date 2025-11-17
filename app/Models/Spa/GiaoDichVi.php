<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiaoDichVi extends Model
{
    use HasFactory;

    protected $table = 'spa_giao_dich_vi';

    public $timestamps = false;

    protected $fillable = [
        'ma_giao_dich',
        'khach_hang_id',
        'loai_giao_dich',
        'so_tien',
        'so_du_truoc',
        'so_du_sau',
        'the_gia_tri_id',
        'hoa_don_id',
        'nhan_vien_id',
        'ma_code',
        'ghi_chu',
    ];

    protected $casts = [
        'so_tien' => 'decimal:2',
        'so_du_truoc' => 'decimal:2',
        'so_du_sau' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    /**
     * Auto-generate ma_giao_dich when creating
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->ma_giao_dich) {
                $today = now()->format('Ymd');
                $lastTxn = self::where('ma_giao_dich', 'like', "VD_{$today}%")
                    ->orderBy('id', 'desc')
                    ->first();

                $nextNumber = $lastTxn ? ((int) substr($lastTxn->ma_giao_dich, -3)) + 1 : 1;
                $model->ma_giao_dich = 'VD_' . $today . '_' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
            }

            // Auto set created_at
            if (!$model->created_at) {
                $model->created_at = now();
            }
        });
    }

    /**
     * Scope: Filter by transaction type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('loai_giao_dich', $type);
    }

    /**
     * Scope: Today's transactions
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', now()->toDateString());
    }

    /**
     * Scope: This month's transactions
     */
    public function scopeThisMonth($query)
    {
        return $query->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month);
    }

    /**
     * Get formatted transaction type
     */
    public function getLoaiGiaoDichTextAttribute(): string
    {
        $types = [
            'nap' => 'Nạp tiền',
            'tieu' => 'Tiêu tiền',
            'hoan' => 'Hoàn tiền',
            'code' => 'Nạp code',
        ];

        return $types[$this->loai_giao_dich] ?? $this->loai_giao_dich;
    }

    /**
     * Relationships
     */
    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id');
    }

    public function theGiaTri()
    {
        return $this->belongsTo(TheGiaTri::class, 'the_gia_tri_id');
    }

    public function hoaDon()
    {
        return $this->belongsTo(HoaDon::class, 'hoa_don_id');
    }

    public function nhanVien()
    {
        return $this->belongsTo(\App\Models\User::class, 'nhan_vien_id');
    }
}
