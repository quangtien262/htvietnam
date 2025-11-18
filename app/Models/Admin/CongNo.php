<?php
namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;


class CongNo extends Model
{
    protected $table = 'cong_no';

    protected $fillable = [
        'name',
        'code',
        'users_id',
        'nha_cung_cap_id',
        'loai_cong_no',
        'loai_chung_tu',
        'chung_tu_id',
        'ma_chung_tu',
        'product_id',
        'product_code',
        'tong_tien_hoa_don',
        'so_tien_da_thanh_toan',
        'so_tien_no',
        'cong_no_status_id',
        'ngay_hen_tat_toan',
        'ngay_tat_toan',
        'info',
    ];

    protected $casts = [
        'users_id' => 'integer',
        'nha_cung_cap_id' => 'integer',
        'loai_cong_no' => 'integer',
        'chung_tu_id' => 'integer',
        'product_id' => 'integer',
        'tong_tien_hoa_don' => 'integer',
        'so_tien_da_thanh_toan' => 'integer',
        'so_tien_no' => 'integer',
        'cong_no_status_id' => 'integer',
        'ngay_hen_tat_toan' => 'date',
        'ngay_tat_toan' => 'date',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'users_id');
    }

    public function nhaCungCap()
    {
        return $this->belongsTo(NhaCungCap::class, 'nha_cung_cap_id');
    }

    public function hoaDon()
    {
        return $this->belongsTo(\App\Models\Spa\HoaDon::class, 'chung_tu_id')
            ->where('loai_chung_tu', 'spa_hoa_don');
    }

    // Scopes
    public function scopeReceivable($query)
    {
        return $query->where('loai_cong_no', 1);
    }

    public function scopePayable($query)
    {
        return $query->where('loai_cong_no', 2);
    }

    public function scopeUnpaid($query)
    {
        return $query->where('cong_no_status_id', 3);
    }

    public function scopePartiallyPaid($query)
    {
        return $query->where('cong_no_status_id', 2);
    }

    public function scopePaid($query)
    {
        return $query->where('cong_no_status_id', 1);
    }
}
