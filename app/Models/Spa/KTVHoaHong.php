<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class KTVHoaHong extends Model
{
    protected $table = 'spa_ktv_hoa_hong';
    public $timestamps = false;

    protected $fillable = [
        'ktv_id',
        'hoa_don_id',
        'loai',
        'gia_tri_goc',
        'phan_tram',
        'tien_hoa_hong',
        'thang',
    ];

    protected $casts = [
        'ktv_id' => 'integer',
        'hoa_don_id' => 'integer',
        'gia_tri_goc' => 'decimal:2',
        'phan_tram' => 'decimal:2',
        'tien_hoa_hong' => 'decimal:2',
        'thang' => 'date',
    ];

    // Relationships
    public function ktv()
    {
        return $this->belongsTo(KTV::class, 'ktv_id');
    }

    public function hoaDon()
    {
        return $this->belongsTo(HoaDon::class, 'hoa_don_id');
    }

    // Scopes
    public function scopeByMonth($query, $month, $year)
    {
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = date('Y-m-t', strtotime($startDate));
        
        return $query->whereBetween('thang', [$startDate, $endDate]);
    }

    // Accessors
    public function getDoanhThuAttribute()
    {
        return $this->gia_tri_goc;
    }

    public function getTienHoaHongFormattedAttribute()
    {
        return number_format((float)$this->tien_hoa_hong, 0, ',', '.');
    }

    public function getLoaiNameAttribute()
    {
        $types = [
            'dich_vu' => 'Dịch vụ',
            'san_pham' => 'Sản phẩm',
            'tip' => 'Tiền tip',
        ];
        return $types[$this->loai] ?? $this->loai;
    }
}
