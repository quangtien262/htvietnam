<?php

namespace App\Models\Document;

use Illuminate\Database\Eloquent\Model;

class PhanQuyen extends Model
{
    protected $table = 'tai_lieu_phan_quyen';
    
    protected $fillable = [
        'file_id', 'thu_muc_id', 'loai_doi_tuong',
        'user_id', 'phong_ban_id', 'loai_nguoi_dung',
        'quyen', 'ngay_het_han', 'is_active', 'nguoi_chia_se_id'
    ];

    protected $casts = [
        'ngay_het_han' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function file() { return $this->belongsTo(File::class, 'file_id'); }
    public function thuMuc() { return $this->belongsTo(ThuMuc::class, 'thu_muc_id'); }
    public function user() { return $this->belongsTo(\App\Models\User::class, 'user_id'); }
    public function nguoiChiaSe() { return $this->belongsTo(\App\Models\User::class, 'nguoi_chia_se_id'); }

    // Scopes
    public function scopeActive($query) { 
        return $query->where('is_active', true)
                    ->where(function($q) {
                        $q->whereNull('ngay_het_han')
                          ->orWhere('ngay_het_han', '>', now());
                    });
    }

    public function scopeOwners($query) { return $query->where('quyen', 'owner'); }
    public function scopeEditors($query) { return $query->where('quyen', 'editor'); }
    public function scopeViewers($query) { return $query->where('quyen', 'viewer'); }

    // Check expired
    public function isExpired()
    {
        return $this->ngay_het_han && $this->ngay_het_han->isPast();
    }
}
