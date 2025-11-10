<?php

namespace App\Models\Telesale;

use Illuminate\Database\Eloquent\Model;

class DataKhachHangTelesale extends Model
{
    protected $table = 'data_khach_hang_telesale';
    protected $fillable = ['ma_data', 'ten_khach_hang', 'sdt', 'email', 'dia_chi', 'nguon_data', 'phan_loai', 'nhan_vien_telesale_id', 'trang_thai', 'tags', 'ghi_chu'];
    protected $casts = ['tags' => 'array'];

    protected static function boot() {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_data)) {
                $latest = self::orderBy('id', 'desc')->first();
                $number = $latest ? ((int) substr($latest->ma_data, 2)) + 1 : 1;
                $model->ma_data = 'DT' . str_pad($number, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function nhanVienTelesale() { return $this->belongsTo(\App\Models\AdminUser::class, 'nhan_vien_telesale_id'); }
    public function cuocGois() { return $this->hasMany(CuocGoiTelesale::class, 'data_khach_hang_id'); }
    public function donHangs() { return $this->hasMany(DonHangTelesale::class, 'data_khach_hang_id'); }
    public function lichHenGoiLais() { return $this->hasMany(LichHenGoiLai::class, 'data_khach_hang_id'); }

    public function scopeMoi($query) { return $query->where('trang_thai', 'moi'); }
    public function scopeNong($query) { return $query->where('phan_loai', 'nong'); }
    public function scopeThanhCong($query) { return $query->where('trang_thai', 'thanh_cong'); }
}
