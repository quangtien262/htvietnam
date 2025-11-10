<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;

class PhieuXuatKhoChiTiet extends Model
{
    protected $table = 'phieu_xuat_kho_chi_tiet';
    protected $fillable = ['phieu_xuat_kho_id', 'hang_hoa_id', 'so_luong', 'don_gia', 'thanh_tien', 'ghi_chu'];
    protected $casts = ['don_gia' => 'decimal:2', 'thanh_tien' => 'decimal:2'];

    public function phieuXuatKho() { return $this->belongsTo(PhieuXuatKho::class, 'phieu_xuat_kho_id'); }
    public function hangHoa() { return $this->belongsTo(\App\Models\Auto\HangHoa::class, 'hang_hoa_id'); }
}
