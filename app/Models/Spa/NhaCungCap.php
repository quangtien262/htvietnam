<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class NhaCungCap extends Model
{
    protected $table = 'spa_nha_cung_cap';

    protected $fillable = [
        'ma_ncc',
        'ten_ncc',
        'dia_chi',
        'thanh_pho',
        'sdt',
        'email',
        'nguoi_lien_he',
        'sdt_lien_he',
        'ma_so_thue',
        'ghi_chu',
        'is_active',
    ];

    protected $appends = ['ma_nha_cung_cap', 'ten_nha_cung_cap', 'so_dien_thoai', 'trang_thai'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function phieuNhaps()
    {
        return $this->hasMany(NhapKho::class, 'nha_cung_cap_id');
    }

    public function traHangNhaps()
    {
        return $this->hasMany(TraHangNhap::class, 'nha_cung_cap_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Accessors for frontend compatibility
    public function getMaNhaCungCapAttribute()
    {
        return $this->ma_ncc;
    }

    public function getTenNhaCungCapAttribute()
    {
        return $this->ten_ncc;
    }

    public function getSoDienThoaiAttribute()
    {
        return $this->sdt;
    }

    public function getTrangThaiAttribute()
    {
        return $this->is_active ? 'active' : 'inactive';
    }

    // Business Logic
    public static function generateMaNhaCungCap()
    {
        $latest = self::latest('id')->first();
        $number = $latest ? $latest->id + 1 : 1;
        return 'NCC' . str_pad($number, 3, '0', STR_PAD_LEFT);
    }
}
