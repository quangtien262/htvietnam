<?php

namespace App\Models\Telesale;

use Illuminate\Database\Eloquent\Model;

class DonHangTelesaleChiTiet extends Model
{
    protected $table = 'don_hang_telesale_chi_tiet';
    protected $fillable = ['don_hang_telesale_id', 'san_pham_id', 'ten_san_pham', 'so_luong', 'don_gia', 'thanh_tien'];
    protected $casts = ['don_gia' => 'decimal:2', 'thanh_tien' => 'decimal:2'];

    public function donHang() { return $this->belongsTo(DonHangTelesale::class, 'don_hang_telesale_id'); }
    public function sanPham() { return $this->belongsTo(\App\Models\Purchase\HangHoa::class, 'san_pham_id'); }
}
