<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;

class PhieuTraHangChiTiet extends Model
{
    protected $table = 'phieu_tra_hang_chi_tiet';
    protected $fillable = ['phieu_tra_hang_id', 'don_hang_chi_tiet_id', 'hang_hoa_id', 'so_luong_tra', 'don_gia', 'thanh_tien', 'ghi_chu'];
    protected $casts = ['don_gia' => 'decimal:2', 'thanh_tien' => 'decimal:2'];

    public function phieuTraHang() { return $this->belongsTo(PhieuTraHang::class, 'phieu_tra_hang_id'); }
    public function donHangChiTiet() { return $this->belongsTo(DonHangChiTiet::class, 'don_hang_chi_tiet_id'); }
    public function hangHoa() { return $this->belongsTo(\App\Models\Auto\HangHoa::class, 'hang_hoa_id'); }
}
