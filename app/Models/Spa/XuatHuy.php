<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class XuatHuy extends Model
{
    protected $table = 'spa_xuat_huy';

    protected $fillable = [
        'ma_phieu',
        'chi_nhanh_id',
        'nguoi_xuat_id',
        'nguoi_duyet_id',
        'ngay_xuat',
        'ngay_duyet',
        'trang_thai',
        'ly_do_huy',
        'mo_ta_ly_do',
        'ghi_chu',
        'hinh_anh_ids',
        'tong_gia_tri_huy',
    ];

    protected $casts = [
        'ngay_xuat' => 'date',
        'ngay_duyet' => 'datetime',
        'hinh_anh_ids' => 'array',
        'tong_gia_tri_huy' => 'decimal:2',
    ];

    protected $appends = ['ngay_xuat_huy', 'ly_do'];

    // Accessors for frontend compatibility
    public function getNgayXuatHuyAttribute()
    {
        return $this->ngay_xuat;
    }

    public function getLyDoAttribute()
    {
        return $this->ly_do_huy;
    }

    // Relationships
    public function chiNhanh()
    {
        return $this->belongsTo(ChiNhanh::class, 'chi_nhanh_id');
    }

    public function nguoiXuat()
    {
        return $this->belongsTo(\App\Models\User::class, 'nguoi_xuat_id');
    }

    public function nguoiDuyet()
    {
        return $this->belongsTo(\App\Models\User::class, 'nguoi_duyet_id');
    }

    public function chiTiets()
    {
        return $this->hasMany(XuatHuyChiTiet::class, 'phieu_huy_id');
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('trang_thai', $status);
    }

    public function scopeByBranch($query, $chiNhanhId)
    {
        return $query->where('chi_nhanh_id', $chiNhanhId);
    }

    // Business Logic
    public static function generateMaPhieu()
    {
        $latest = self::latest('id')->first();
        $number = $latest ? (int)substr($latest->ma_phieu, 2) + 1 : 1;
        return 'XH' . str_pad($number, 5, '0', STR_PAD_LEFT);
    }

    public function approve()
    {
        if ($this->trang_thai !== 'cho_duyet') {
            throw new \Exception('Chỉ có thể duyệt phiếu ở trạng thái chờ duyệt');
        }

        DB::transaction(function () {
            // Trừ tồn kho
            foreach ($this->chiTiets as $chiTiet) {
                TonKhoChiNhanh::updateStock(
                    $this->chi_nhanh_id,
                    $chiTiet->san_pham_id,
                    $chiTiet->so_luong_huy,
                    'decrease'
                );
            }

            $this->trang_thai = 'da_duyet';
            $this->ngay_duyet = now();
            $this->nguoi_duyet_id = auth()->id();
            $this->save();

            // Sync product total stock
            foreach ($this->chiTiets as $chiTiet) {
                TonKhoChiNhanh::syncWithProductTable($chiTiet->san_pham_id);
            }
        });

        return $this;
    }

    public function calculateTotals()
    {
        $this->tong_gia_tri_huy = $this->chiTiets->sum('thanh_tien');
        $this->save();
    }
}
