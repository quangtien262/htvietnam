<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HoaDon extends Model
{
    protected $table = 'hoa_don';

    protected $fillable = [
        'ma_hoa_don',
        'ngay_hoa_don',
        'ngay_het_han',
        'khach_hang_id',
        'ten_khach_hang',
        'dia_chi',
        'so_dien_thoai',
        'ma_so_thue',
        'tong_tien_hang',
        'tien_giam_gia',
        'tien_thue',
        'tong_tien',
        'da_thanh_toan',
        'con_lai',
        'trang_thai',
        'ghi_chu',
        'created_by',
    ];

    protected $casts = [
        'ngay_hoa_don' => 'date',
        'ngay_het_han' => 'date',
        'tong_tien_hang' => 'decimal:2',
        'tien_giam_gia' => 'decimal:2',
        'tien_thue' => 'decimal:2',
        'tong_tien' => 'decimal:2',
        'da_thanh_toan' => 'decimal:2',
        'con_lai' => 'decimal:2',
    ];

    // Relationships
    public function chiTiet()
    {
        return $this->hasMany(HoaDonChiTiet::class, 'hoa_don_id');
    }

    public function nguoiTao()
    {
        return $this->belongsTo(AdminUser::class, 'created_by');
    }

    // Scopes
    public function scopeChuaThanhToan($query)
    {
        return $query->where('trang_thai', 'chua_thanh_toan');
    }

    public function scopeDaThanhToan($query)
    {
        return $query->where('trang_thai', 'da_thanh_toan');
    }

    public function scopeQuaHan($query)
    {
        return $query->where('trang_thai', 'qua_han');
    }

    // Helper methods
    public function tinhTongTien()
    {
        $this->tong_tien = ($this->tong_tien_hang - $this->tien_giam_gia) + $this->tien_thue;
        $this->con_lai = $this->tong_tien - $this->da_thanh_toan;
        $this->save();
    }

    public function capNhatTrangThai()
    {
        if ($this->con_lai <= 0) {
            $this->trang_thai = 'da_thanh_toan';
        } elseif ($this->ngay_het_han && $this->ngay_het_han < now()) {
            $this->trang_thai = 'qua_han';
        } else {
            $this->trang_thai = 'chua_thanh_toan';
        }
        $this->save();
    }
}
