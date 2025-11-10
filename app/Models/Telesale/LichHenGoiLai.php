<?php

namespace App\Models\Telesale;

use Illuminate\Database\Eloquent\Model;

class LichHenGoiLai extends Model
{
    protected $table = 'lich_hen_goi_lai';
    protected $fillable = ['data_khach_hang_id', 'cuoc_goi_id', 'nhan_vien_telesale_id', 'thoi_gian_hen', 'da_goi', 'noi_dung_can_hoi', 'uu_tien', 'trang_thai'];
    protected $casts = ['thoi_gian_hen' => 'datetime', 'da_goi' => 'boolean'];

    public function dataKhachHang() { return $this->belongsTo(DataKhachHangTelesale::class, 'data_khach_hang_id'); }
    public function cuocGoi() { return $this->belongsTo(CuocGoiTelesale::class, 'cuoc_goi_id'); }
    public function nhanVienTelesale() { return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_telesale_id'); }

    public function scopePending($query) { return $query->where('trang_thai', 'pending')->where('da_goi', false); }
    public function scopeHomNay($query) { return $query->whereDate('thoi_gian_hen', today()); }
    public function scopeUuTienCao($query) { return $query->where('uu_tien', 'cao'); }
}
