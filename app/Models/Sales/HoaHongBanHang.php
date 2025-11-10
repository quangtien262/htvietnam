<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;

class HoaHongBanHang extends Model
{
    protected $table = 'hoa_hong_ban_hang';
    protected $fillable = ['nhan_vien_id', 'don_hang_id', 'thang', 'nam', 'doanh_so', 'ty_le_hoa_hong', 'tien_hoa_hong', 'trang_thai', 'ngay_duyet', 'ngay_thanh_toan', 'ghi_chu'];
    protected $casts = ['ngay_duyet' => 'date', 'ngay_thanh_toan' => 'date', 'doanh_so' => 'decimal:2', 'ty_le_hoa_hong' => 'decimal:2', 'tien_hoa_hong' => 'decimal:2'];

    public function nhanVien() { return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_id'); }
    public function donHang() { return $this->belongsTo(DonHang::class, 'don_hang_id'); }
    public function scopeTheoThang($query, $thang, $nam) { return $query->where('thang', $thang)->where('nam', $nam); }
}
