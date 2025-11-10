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
        'reference_id',
        'doanh_thu',
        'phan_tram',
        'tien_hoa_hong',
        'ngay_thuc_hien',
        'trang_thai',
    ];

    protected $casts = [
        'ktv_id' => 'integer',
        'hoa_don_id' => 'integer',
        'reference_id' => 'integer',
        'doanh_thu' => 'decimal:0',
        'phan_tram' => 'decimal:2',
        'tien_hoa_hong' => 'decimal:0',
        'ngay_thuc_hien' => 'date',
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
    public function scopePending($query)
    {
        return $query->where('trang_thai', 'cho_thanh_toan');
    }

    public function scopePaid($query)
    {
        return $query->where('trang_thai', 'da_thanh_toan');
    }

    public function scopeByMonth($query, $month, $year)
    {
        return $query->whereYear('ngay_thuc_hien', $year)
            ->whereMonth('ngay_thuc_hien', $month);
    }

    // Accessors
    public function getTienHoaHongFormattedAttribute()
    {
        return number_format($this->tien_hoa_hong, 0, ',', '.');
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
