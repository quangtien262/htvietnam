<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DanhGia extends Model
{
    use SoftDeletes;

    protected $table = 'spa_danh_gia';

    protected $fillable = [
        'khach_hang_id',
        'hoa_don_id',
        'dich_vu_id',
        'ktv_id',
        'diem_phuc_vu',
        'diem_chat_luong',
        'diem_khong_gian',
        'diem_gia_ca',
        'trung_binh',
        'nhan_xet',
        'phan_hoi',
        'trang_thai',
    ];

    protected $casts = [
        'khach_hang_id' => 'integer',
        'hoa_don_id' => 'integer',
        'dich_vu_id' => 'integer',
        'ktv_id' => 'integer',
        'diem_phuc_vu' => 'integer',
        'diem_chat_luong' => 'integer',
        'diem_khong_gian' => 'integer',
        'diem_gia_ca' => 'integer',
        'trung_binh' => 'decimal:1',
    ];

    // Relationships
    public function khachHang()
    {
        return $this->belongsTo(\App\Models\User::class, 'khach_hang_id');
    }

    public function hoaDon()
    {
        return $this->belongsTo(HoaDon::class, 'hoa_don_id');
    }

    public function dichVu()
    {
        return $this->belongsTo(DichVu::class, 'dich_vu_id');
    }

    public function ktv()
    {
        return $this->belongsTo(KTV::class, 'ktv_id');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('trang_thai', 'hien_thi');
    }

    public function scopeHighRating($query, $minRating = 4)
    {
        return $query->where('trung_binh', '>=', $minRating);
    }

    // Mutators
    public function setRatingsAttribute()
    {
        $ratings = [
            $this->diem_phuc_vu,
            $this->diem_chat_luong,
            $this->diem_khong_gian,
            $this->diem_gia_ca,
        ];

        $validRatings = array_filter($ratings, fn($r) => $r > 0);

        if (count($validRatings) > 0) {
            $this->trung_binh = round(array_sum($validRatings) / count($validRatings), 1);
        }
    }

    // Helper
    public function calculateAverage()
    {
        $ratings = array_filter([
            $this->diem_phuc_vu,
            $this->diem_chat_luong,
            $this->diem_khong_gian,
            $this->diem_gia_ca,
        ]);

        if (count($ratings) > 0) {
            $this->trung_binh = round(array_sum($ratings) / count($ratings), 1);
            $this->save();
        }
    }
}
