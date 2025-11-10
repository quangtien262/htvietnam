<?php

namespace App\Models\Business;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChienDichMarketing extends Model
{
    use SoftDeletes;
    protected $table = 'chien_dich_marketing';
    protected $fillable = ['ma_chien_dich', 'ten_chien_dich', 'loai_chien_dich', 'ngan_sach', 'chi_phi_thuc_te', 'ngay_bat_dau', 'ngay_ket_thuc', 'so_leads_tao_ra', 'so_khach_hang_chuyen_doi', 'doanh_thu', 'roi', 'mo_ta', 'trang_thai'];
    protected $casts = ['ngan_sach' => 'decimal:2', 'chi_phi_thuc_te' => 'decimal:2', 'doanh_thu' => 'decimal:2', 'roi' => 'decimal:2', 'ngay_bat_dau' => 'date', 'ngay_ket_thuc' => 'date'];

    protected static function boot() {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_chien_dich)) {
                $latest = self::withTrashed()->orderBy('id', 'desc')->first();
                $number = $latest ? ((int) substr($latest->ma_chien_dich, 2)) + 1 : 1;
                $model->ma_chien_dich = 'CD' . str_pad($number, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function scopeRunning($query) { return $query->where('trang_thai', 'running'); }
    public function scopeCompleted($query) { return $query->where('trang_thai', 'completed'); }
}
