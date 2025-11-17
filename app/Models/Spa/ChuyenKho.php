<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ChuyenKho extends Model
{
    protected $table = 'spa_chuyen_kho';

    protected $fillable = [
        'ma_phieu',
        'chi_nhanh_xuat_id',
        'chi_nhanh_nhap_id',
        'nguoi_xuat_id',
        'nguoi_duyet_id',
        'nguoi_nhap_id',
        'ngay_xuat',
        'ngay_duyet',
        'ngay_nhap',
        'ngay_du_kien_nhan',
        'trang_thai',
        'ly_do',
        'ghi_chu',
        'ghi_chu_nhan_hang',
        'hinh_anh_xuat_ids',
        'hinh_anh_nhan_ids',
        'tong_so_luong_xuat',
        'tong_so_luong_nhan',
        'tong_so_luong_hong',
        'tong_gia_tri',
    ];

    protected $casts = [
        'ngay_xuat' => 'date',
        'ngay_duyet' => 'datetime',
        'ngay_nhap' => 'date',
        'ngay_du_kien_nhan' => 'date',
        'hinh_anh_xuat_ids' => 'array',
        'hinh_anh_nhan_ids' => 'array',
        'tong_so_luong_xuat' => 'integer',
        'tong_so_luong_nhan' => 'integer',
        'tong_so_luong_hong' => 'integer',
        'tong_gia_tri' => 'decimal:2',
    ];

    // Relationships
    public function chiNhanhXuat()
    {
        return $this->belongsTo(ChiNhanh::class, 'chi_nhanh_xuat_id');
    }

    public function chiNhanhNhap()
    {
        return $this->belongsTo(ChiNhanh::class, 'chi_nhanh_nhap_id');
    }

    public function nguoiXuat()
    {
        return $this->belongsTo(\App\Models\User::class, 'nguoi_xuat_id');
    }

    public function nguoiDuyet()
    {
        return $this->belongsTo(\App\Models\User::class, 'nguoi_duyet_id');
    }

    public function nguoiNhap()
    {
        return $this->belongsTo(\App\Models\User::class, 'nguoi_nhap_id');
    }

    public function chiTiets()
    {
        return $this->hasMany(ChuyenKhoChiTiet::class, 'phieu_chuyen_id');
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('trang_thai', $status);
    }

    public function scopeByBranch($query, $chiNhanhId, $type = 'all')
    {
        if ($type === 'xuat') {
            return $query->where('chi_nhanh_xuat_id', $chiNhanhId);
        } elseif ($type === 'nhap') {
            return $query->where('chi_nhanh_nhap_id', $chiNhanhId);
        } else {
            return $query->where(function ($q) use ($chiNhanhId) {
                $q->where('chi_nhanh_xuat_id', $chiNhanhId)
                  ->orWhere('chi_nhanh_nhap_id', $chiNhanhId);
            });
        }
    }

    // Business Logic
    public static function generateMaPhieu()
    {
        $latest = self::latest('id')->first();
        $number = $latest ? (int)substr($latest->ma_phieu, 2) + 1 : 1;
        return 'CK' . str_pad($number, 5, '0', STR_PAD_LEFT);
    }

    public function approve()
    {
        if ($this->trang_thai !== 'cho_duyet') {
            throw new \Exception('Chỉ có thể duyệt phiếu ở trạng thái chờ duyệt');
        }

        DB::transaction(function () {
            // Trừ tồn kho chi nhánh xuất
            foreach ($this->chiTiets as $chiTiet) {
                TonKhoChiNhanh::updateStock(
                    $this->chi_nhanh_xuat_id,
                    $chiTiet->san_pham_id,
                    $chiTiet->so_luong_xuat,
                    'decrease'
                );
            }

            $this->trang_thai = 'dang_chuyen';
            $this->ngay_duyet = now();
            $this->nguoi_duyet_id = auth()->id();
            $this->save();
        });

        return $this;
    }

    public function receive($chiTiets)
    {
        if ($this->trang_thai !== 'dang_chuyen') {
            throw new \Exception('Chỉ có thể nhận hàng khi phiếu đang ở trạng thái đang chuyển');
        }

        DB::transaction(function () use ($chiTiets) {
            foreach ($chiTiets as $item) {
                $chiTiet = ChuyenKhoChiTiet::find($item['id']);
                if ($chiTiet) {
                    $chiTiet->so_luong_nhan = $item['so_luong_nhan'];
                    $chiTiet->so_luong_hong = $item['so_luong_hong'] ?? 0;
                    $chiTiet->ly_do_hong = $item['ly_do_hong'] ?? null;
                    $chiTiet->save();

                    // Cộng tồn kho chi nhánh nhập (chỉ cộng số lượng nhận được)
                    if ($chiTiet->so_luong_nhan > 0) {
                        TonKhoChiNhanh::updateStock(
                            $this->chi_nhanh_nhap_id,
                            $chiTiet->san_pham_id,
                            $chiTiet->so_luong_nhan,
                            'increase',
                            $chiTiet->gia_von
                        );
                    }
                }
            }

            // Update totals
            $this->tong_so_luong_nhan = $this->chiTiets->sum('so_luong_nhan');
            $this->tong_so_luong_hong = $this->chiTiets->sum('so_luong_hong');

            $this->trang_thai = 'da_nhan';
            $this->ngay_nhap = now();
            $this->nguoi_nhap_id = auth()->id();
            $this->save();

            // Sync product total stock
            foreach ($this->chiTiets as $chiTiet) {
                TonKhoChiNhanh::syncWithProductTable($chiTiet->san_pham_id);
            }
        });

        return $this;
    }

    public function cancel()
    {
        DB::transaction(function () {
            if ($this->trang_thai === 'dang_chuyen') {
                // Hoàn trả tồn kho cho chi nhánh xuất
                foreach ($this->chiTiets as $chiTiet) {
                    TonKhoChiNhanh::updateStock(
                        $this->chi_nhanh_xuat_id,
                        $chiTiet->san_pham_id,
                        $chiTiet->so_luong_xuat,
                        'increase'
                    );
                }
            }

            $this->trang_thai = 'huy';
            $this->save();
        });

        return $this;
    }
}
