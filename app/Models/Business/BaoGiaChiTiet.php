<?php

namespace App\Models\Business;

use Illuminate\Database\Eloquent\Model;

class BaoGiaChiTiet extends Model
{
    protected $table = 'bao_gia_chi_tiet';
    protected $fillable = ['bao_gia_id', 'san_pham_id', 'ten_san_pham', 'mo_ta', 'so_luong', 'don_gia', 'thanh_tien'];
    protected $casts = ['don_gia' => 'decimal:2', 'thanh_tien' => 'decimal:2'];

    public function baoGia() { return $this->belongsTo(BaoGia::class, 'bao_gia_id'); }
    public function sanPham() { return $this->belongsTo(\App\Models\Purchase\HangHoa::class, 'san_pham_id'); }
}
