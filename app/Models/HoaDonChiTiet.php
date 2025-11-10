<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HoaDonChiTiet extends Model
{
    protected $table = 'hoa_don_chi_tiet';

    protected $fillable = [
        'hoa_don_id',
        'hang_hoa_id',
        'ten_hang_hoa',
        'don_vi',
        'so_luong',
        'don_gia',
        'thanh_tien',
        'tien_giam_gia',
        'tien_thue',
        'tong_tien',
        'ghi_chu',
        'sort_order',
    ];

    protected $casts = [
        'so_luong' => 'decimal:2',
        'don_gia' => 'decimal:2',
        'thanh_tien' => 'decimal:2',
        'tien_giam_gia' => 'decimal:2',
        'tien_thue' => 'decimal:2',
        'tong_tien' => 'decimal:2',
    ];

    // Relationships
    public function hoaDon()
    {
        return $this->belongsTo(HoaDon::class, 'hoa_don_id');
    }

    public function hangHoa()
    {
        return $this->belongsTo(HangHoa::class, 'hang_hoa_id');
    }

    // Helper methods
    public function tinhThanhTien()
    {
        $this->thanh_tien = $this->so_luong * $this->don_gia;
        $this->tong_tien = ($this->thanh_tien - $this->tien_giam_gia) + $this->tien_thue;
        $this->save();
    }
}
