<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class KiemKho extends Model
{
    protected $table = 'spa_kiem_kho';

    protected $fillable = [
        'ma_phieu',
        'chi_nhanh_id',
        'nguoi_kiem_id',
        'nguoi_duyet_id',
        'ngay_kiem',
        'ngay_duyet',
        'trang_thai',
        'loai_kiem_kho',
        'tong_so_san_pham',
        'tong_chenh_lech',
        'tong_gia_tri_chenh_lech',
        'ly_do',
        'ghi_chu',
        'hinh_anh_ids',
    ];

    protected $casts = [
        'ngay_kiem' => 'date',
        'ngay_duyet' => 'datetime',
        'tong_so_san_pham' => 'integer',
        'tong_chenh_lech' => 'integer',
        'tong_gia_tri_chenh_lech' => 'decimal:2',
        'hinh_anh_ids' => 'array',
    ];

    // Relationships
    public function chiNhanh()
    {
        return $this->belongsTo(ChiNhanh::class, 'chi_nhanh_id');
    }

    public function nguoiKiem()
    {
        return $this->belongsTo(\App\Models\User::class, 'nguoi_kiem_id');
    }

    public function nguoiDuyet()
    {
        return $this->belongsTo(\App\Models\User::class, 'nguoi_duyet_id');
    }

    public function chiTiets()
    {
        return $this->hasMany(KiemKhoChiTiet::class, 'phieu_kiem_id');
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
        return 'KK' . str_pad($number, 5, '0', STR_PAD_LEFT);
    }

    public function approve()
    {
        if ($this->trang_thai !== 'cho_duyet') {
            throw new \Exception('Chỉ có thể duyệt phiếu ở trạng thái chờ duyệt');
        }

        DB::transaction(function () {
            // Update stock based on differences
            foreach ($this->chiTiets as $chiTiet) {
                $chenh_lech = $chiTiet->chenh_lech;

                if ($chenh_lech > 0) {
                    // Thực tế nhiều hơn hệ thống -> Cộng tồn
                    TonKhoChiNhanh::updateStock(
                        $this->chi_nhanh_id,
                        $chiTiet->san_pham_id,
                        abs($chenh_lech),
                        'increase',
                        $chiTiet->gia_von
                    );
                } elseif ($chenh_lech < 0) {
                    // Thực tế ít hơn hệ thống -> Trừ tồn
                    TonKhoChiNhanh::updateStock(
                        $this->chi_nhanh_id,
                        $chiTiet->san_pham_id,
                        abs($chenh_lech),
                        'decrease'
                    );
                }
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
        $this->tong_so_san_pham = $this->chiTiets->count();
        $this->tong_chenh_lech = $this->chiTiets->sum('chenh_lech');
        $this->tong_gia_tri_chenh_lech = $this->chiTiets->sum('thanh_tien_chenh_lech');
        $this->save();
    }
}
