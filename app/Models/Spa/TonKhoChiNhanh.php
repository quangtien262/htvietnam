<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class TonKhoChiNhanh extends Model
{
    protected $table = 'spa_ton_kho_chi_nhanh';

    protected $fillable = [
        'chi_nhanh_id',
        'san_pham_id',
        'so_luong_ton',
        'so_luong_dat_truoc',
        'gia_von_binh_quan',
        'ngay_cap_nhat_cuoi',
        'nguoi_cap_nhat_cuoi',
    ];

    protected $casts = [
        'chi_nhanh_id' => 'integer',
        'san_pham_id' => 'integer',
        'so_luong_ton' => 'integer',
        'so_luong_dat_truoc' => 'integer',
        'gia_von_binh_quan' => 'decimal:2',
        'ngay_cap_nhat_cuoi' => 'datetime',
    ];

    protected $appends = [
        'so_luong_kha_dung',
        'gia_tri_ton_kho',
    ];

    // Relationships
    public function chiNhanh()
    {
        return $this->belongsTo(ChiNhanh::class, 'chi_nhanh_id');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }

    // Accessors (for computed columns)
    public function getSoLuongKhaDungAttribute()
    {
        return $this->so_luong_ton - $this->so_luong_dat_truoc;
    }

    public function getGiaTriTonKhoAttribute()
    {
        return $this->so_luong_ton * $this->gia_von_binh_quan;
    }

    public function getIsLowStockAttribute()
    {
        if ($this->sanPham) {
            return $this->so_luong_ton <= $this->sanPham->ton_kho_canh_bao;
        }
        return false;
    }

    // Scopes
    public function scopeByBranch($query, $chiNhanhId)
    {
        return $query->where('chi_nhanh_id', $chiNhanhId);
    }

    public function scopeByProduct($query, $sanPhamId)
    {
        return $query->where('san_pham_id', $sanPhamId);
    }

    public function scopeLowStock($query)
    {
        return $query->whereHas('sanPham', function ($q) {
            $q->whereColumn('spa_ton_kho_chi_nhanh.so_luong_ton', '<=', 'spa_san_pham.ton_kho_canh_bao');
        });
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('so_luong_ton', '<=', 0);
    }

    // Business Logic
    public static function updateStock($chiNhanhId, $sanPhamId, $quantity, $type = 'increase', $giaVon = null)
    {
        $record = self::firstOrCreate(
            [
                'chi_nhanh_id' => $chiNhanhId,
                'san_pham_id' => $sanPhamId,
            ],
            [
                'so_luong_ton' => 0,
                'so_luong_dat_truoc' => 0,
                'gia_von_binh_quan' => 0,
            ]
        );

        $oldQuantity = $record->so_luong_ton;
        $oldGiaVon = $record->gia_von_binh_quan;

        if ($type === 'increase') {
            $newQuantity = $oldQuantity + $quantity;

            // Calculate AVCO (Average Cost)
            if ($giaVon !== null && $quantity > 0) {
                $record->gia_von_binh_quan = (($oldQuantity * $oldGiaVon) + ($quantity * $giaVon)) / $newQuantity;
            }

            $record->so_luong_ton = $newQuantity;
        } else {
            $record->so_luong_ton = max(0, $oldQuantity - $quantity);
        }

        $record->ngay_cap_nhat_cuoi = now();
        $record->nguoi_cap_nhat_cuoi = auth()->user()->name ?? 'System';
        $record->save();

        return $record;
    }

    public static function updateReservedStock($chiNhanhId, $sanPhamId, $quantity, $type = 'increase')
    {
        $record = self::where('chi_nhanh_id', $chiNhanhId)
            ->where('san_pham_id', $sanPhamId)
            ->first();

        if (!$record) {
            return null;
        }

        if ($type === 'increase') {
            $record->so_luong_dat_truoc += $quantity;
        } else {
            $record->so_luong_dat_truoc = max(0, $record->so_luong_dat_truoc - $quantity);
        }

        $record->save();
        return $record;
    }

    public static function getTotalStockByProduct($sanPhamId)
    {
        return self::where('san_pham_id', $sanPhamId)->sum('so_luong_ton');
    }

    public static function syncWithProductTable($sanPhamId)
    {
        $totalStock = self::getTotalStockByProduct($sanPhamId);

        $sanPham = SanPham::find($sanPhamId);
        if ($sanPham) {
            $sanPham->ton_kho = $totalStock;
            $sanPham->save();
        }

        return $totalStock;
    }
}
