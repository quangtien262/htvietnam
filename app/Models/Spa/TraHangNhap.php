<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class TraHangNhap extends Model
{
    protected $table = 'spa_tra_hang_nhap';

    protected $fillable = [
        'ma_phieu',
        'chi_nhanh_id',
        'phieu_nhap_id',
        'nha_cung_cap_id',
        'nguoi_tra_id',
        'nguoi_duyet_id',
        'ngay_tra',
        'ngay_duyet',
        'trang_thai',
        'ly_do_tra',
        'mo_ta_ly_do',
        'ghi_chu',
        'hinh_anh_ids',
        'tong_tien_tra',
        'tong_tien_hoan',
    ];

    protected $casts = [
        'ngay_tra' => 'date',
        'ngay_duyet' => 'datetime',
        'hinh_anh_ids' => 'array',
        'tong_tien_tra' => 'decimal:2',
        'tong_tien_hoan' => 'decimal:2',
    ];

    // Relationships
    public function chiNhanh()
    {
        return $this->belongsTo(ChiNhanh::class, 'chi_nhanh_id');
    }

    public function phieuNhap()
    {
        return $this->belongsTo(NhapKho::class, 'phieu_nhap_id');
    }

    public function nhaCungCap()
    {
        return $this->belongsTo(NhaCungCap::class, 'nha_cung_cap_id');
    }

    public function nguoiTra()
    {
        return $this->belongsTo(\App\Models\User::class, 'nguoi_tra_id');
    }

    public function nguoiDuyet()
    {
        return $this->belongsTo(\App\Models\User::class, 'nguoi_duyet_id');
    }

    public function chiTiets()
    {
        return $this->hasMany(TraHangNhapChiTiet::class, 'phieu_tra_id');
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
        return 'TH' . str_pad($number, 5, '0', STR_PAD_LEFT);
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
                    $chiTiet->so_luong_tra,
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
        $this->tong_tien_tra = $this->chiTiets->sum('thanh_tien');
        $this->tong_tien_hoan = $this->tong_tien_tra; // Can be adjusted
        $this->save();
    }
}
