<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;

class DonHangChiTiet extends Model
{
    protected $table = 'don_hang_chi_tiet';
    protected $fillable = ['don_hang_id', 'hang_hoa_id', 'ten_hang_hoa', 'dvt', 'so_luong', 'don_gia', 'tien_giam_gia', 'thanh_tien', 'so_luong_da_xuat', 'ghi_chu'];
    protected $casts = ['don_gia' => 'decimal:2', 'tien_giam_gia' => 'decimal:2', 'thanh_tien' => 'decimal:2'];

    public function donHang() { return $this->belongsTo(DonHang::class, 'don_hang_id'); }
    public function hangHoa() { return $this->belongsTo(\App\Models\Auto\HangHoa::class, 'hang_hoa_id'); }
}
