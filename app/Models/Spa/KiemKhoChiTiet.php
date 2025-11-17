<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class KiemKhoChiTiet extends Model
{
    protected $table = 'spa_kiem_kho_chi_tiet';

    protected $fillable = [
        'phieu_kiem_id',
        'san_pham_id',
        'so_luong_he_thong',
        'so_luong_thuc_te',
        'gia_von',
        'ghi_chu',
        'nguyen_nhan_chenh_lech',
    ];

    protected $casts = [
        'so_luong_he_thong' => 'integer',
        'so_luong_thuc_te' => 'integer',
        'gia_von' => 'decimal:2',
    ];

    protected $appends = [
        'chenh_lech',
        'thanh_tien_chenh_lech',
    ];

    // Relationships
    public function phieuKiem()
    {
        return $this->belongsTo(KiemKho::class, 'phieu_kiem_id');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }

    // Accessors
    public function getChenhLechAttribute()
    {
        return $this->so_luong_thuc_te - $this->so_luong_he_thong;
    }

    public function getThanhTienChenhLechAttribute()
    {
        return $this->chenh_lech * $this->gia_von;
    }

    public function getChenhLechTypeAttribute()
    {
        if ($this->chenh_lech > 0) {
            return 'thua';
        } elseif ($this->chenh_lech < 0) {
            return 'thieu';
        }
        return 'khop';
    }
}
