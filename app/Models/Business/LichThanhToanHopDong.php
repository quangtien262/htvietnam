<?php

namespace App\Models\Business;

use Illuminate\Database\Eloquent\Model;

class LichThanhToanHopDong extends Model
{
    protected $table = 'lich_thanh_toan_hop_dong';
    protected $fillable = ['hop_dong_id', 'dot_thanh_toan', 'ngay_thanh_toan_du_kien', 'so_tien', 'trang_thai', 'ngay_thanh_toan_thuc_te', 'ghi_chu'];
    protected $casts = ['ngay_thanh_toan_du_kien' => 'date', 'ngay_thanh_toan_thuc_te' => 'date', 'so_tien' => 'decimal:2'];

    public function hopDong() { return $this->belongsTo(HopDong::class, 'hop_dong_id'); }

    public function scopeOverdue($query) { 
        return $query->where('ngay_thanh_toan_du_kien', '<', now())->where('trang_thai', 'pending'); 
    }
    public function scopePaid($query) { return $query->where('trang_thai', 'paid'); }
}
