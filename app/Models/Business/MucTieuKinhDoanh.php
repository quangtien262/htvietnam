<?php

namespace App\Models\Business;

use Illuminate\Database\Eloquent\Model;

class MucTieuKinhDoanh extends Model
{
    protected $table = 'muc_tieu_kinh_doanh';
    protected $fillable = ['loai_muc_tieu', 'ten_muc_tieu', 'gia_tri_muc_tieu', 'gia_tri_hien_tai', 'ty_le_hoan_thanh', 'thoi_gian', 'thang', 'quy', 'nam', 'nhan_vien_id', 'phong_ban_id', 'ghi_chu'];
    protected $casts = ['gia_tri_muc_tieu' => 'decimal:2', 'gia_tri_hien_tai' => 'decimal:2', 'ty_le_hoan_thanh' => 'decimal:2'];

    public function nhanVien() { return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_id'); }

    public function scopeTheoThang($query, $thang, $nam) {
        return $query->where('thang', $thang)->where('nam', $nam)->where('thoi_gian', 'thang');
    }
}
