<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;

class PhieuThuChiTiet extends Model
{
    protected $table = 'phieu_thu_chi_tiet';
    protected $fillable = ['phieu_thu_id', 'don_hang_id', 'so_tien', 'ghi_chu'];
    protected $casts = ['so_tien' => 'decimal:2'];

    public function phieuThu() { return $this->belongsTo(PhieuThu::class, 'phieu_thu_id'); }
    public function donHang() { return $this->belongsTo(DonHang::class, 'don_hang_id'); }
}
