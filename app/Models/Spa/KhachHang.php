<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Casts\Json;

class KhachHang extends Model
{
    use SoftDeletes;

    protected $table = 'spa_khach_hang';

    protected $fillable = [
        'ma_khach_hang',
        'ho_ten',
        'ngay_sinh',
        'gioi_tinh',
        'so_dien_thoai',
        'email',
        'dia_chi',
        'avatar',
        'ngay_dang_ky',
        'nguon_khach',
        'loai_khach',
        'tong_chi_tieu',
        'lan_mua_cuoi',
        'so_lan_su_dung_dich_vu',
        'diem_tich_luy',
        'ghi_chu',
        'tags',
        'trang_thai',
    ];

    protected $casts = [
        'ngay_sinh' => 'date',
        'ngay_dang_ky' => 'datetime',
        'lan_mua_cuoi' => 'datetime',
        'tong_chi_tieu' => 'decimal:0',
        'so_lan_su_dung_dich_vu' => 'integer',
        'diem_tich_luy' => 'integer',
        'tags' => Json::class,
    ];

    // Relationships
    public function hoSoSucKhoe()
    {
        return $this->hasMany(HoSoSucKhoe::class, 'khach_hang_id');
    }

    public function hoSoDa()
    {
        return $this->hasMany(HoSoDa::class, 'khach_hang_id');
    }

    public function progressPhotos()
    {
        return $this->hasMany(ProgressPhoto::class, 'khach_hang_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'khach_hang_id');
    }

    public function hoaDons()
    {
        return $this->hasMany(HoaDon::class, 'khach_hang_id');
    }

    public function lieuTrinhs()
    {
        return $this->hasMany(KhachHangLieuTrinh::class, 'khach_hang_id');
    }

    public function membershipCards()
    {
        return $this->hasMany(KhachHangThe::class, 'khach_hang_id');
    }

    public function diemThuongLichSu()
    {
        return $this->hasMany(DiemThuongLichSu::class, 'khach_hang_id');
    }

    public function danhGias()
    {
        return $this->hasMany(DanhGia::class, 'khach_hang_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'active');
    }

    public function scopeVip($query)
    {
        return $query->where('loai_khach', 'VIP');
    }

    public function scopeBySource($query, $source)
    {
        return $query->where('nguon_khach', $source);
    }

    // Accessors & Mutators
    public function getIsVipAttribute()
    {
        return $this->loai_khach === 'VIP';
    }

    public function getTongChiTieuFormattedAttribute()
    {
        return number_format($this->tong_chi_tieu, 0, ',', '.');
    }

    // Business Logic Methods
    public function updateRFMScore()
    {
        // Calculate RFM (Recency, Frequency, Monetary) score
        $recencyDays = $this->lan_mua_cuoi ? now()->diffInDays($this->lan_mua_cuoi) : 365;
        $frequency = $this->so_lan_su_dung_dich_vu;
        $monetary = $this->tong_chi_tieu;

        // Simple RFM scoring (1-5 scale)
        $rScore = $recencyDays <= 30 ? 5 : ($recencyDays <= 90 ? 4 : ($recencyDays <= 180 ? 3 : ($recencyDays <= 365 ? 2 : 1)));
        $fScore = $frequency >= 20 ? 5 : ($frequency >= 10 ? 4 : ($frequency >= 5 ? 3 : ($frequency >= 2 ? 2 : 1)));
        $mScore = $monetary >= 50000000 ? 5 : ($monetary >= 20000000 ? 4 : ($monetary >= 10000000 ? 3 : ($monetary >= 5000000 ? 2 : 1)));

        $totalScore = $rScore + $fScore + $mScore;

        // Auto classify customer type based on RFM
        if ($totalScore >= 13) {
            $this->loai_khach = 'VIP';
        } elseif ($totalScore >= 9) {
            $this->loai_khach = 'Thuong';
        } else {
            $this->loai_khach = 'Moi';
        }

        return [
            'recency' => $rScore,
            'frequency' => $fScore,
            'monetary' => $mScore,
            'total' => $totalScore,
            'type' => $this->loai_khach,
        ];
    }

    public function addPoints($points, $type, $reference_id, $description)
    {
        $this->diem_tich_luy += $points;
        $this->save();

        // Create points history
        DiemThuongLichSu::create([
            'khach_hang_id' => $this->id,
            'loai_giao_dich' => $type,
            'so_diem' => $points,
            'reference_id' => $reference_id,
            'ghi_chu' => $description,
        ]);

        return $this->diem_tich_luy;
    }

    public function usePoints($points, $reference_id, $description)
    {
        if ($this->diem_tich_luy < $points) {
            throw new \Exception('Không đủ điểm để sử dụng');
        }

        $this->diem_tich_luy -= $points;
        $this->save();

        // Create points history
        DiemThuongLichSu::create([
            'khach_hang_id' => $this->id,
            'loai_giao_dich' => 'su_dung',
            'so_diem' => -$points,
            'reference_id' => $reference_id,
            'ghi_chu' => $description,
        ]);

        return $this->diem_tich_luy;
    }
}
