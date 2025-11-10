<?php

namespace App\Models\Document;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ThuMuc extends Model
{
    use SoftDeletes;

    protected $table = 'tai_lieu_thu_muc';

    protected $fillable = [
        'ma_thu_muc', 'parent_id', 'ten_thu_muc', 'mo_ta',
        'nguoi_tao_id', 'phong_ban_id', 'is_public', 'loai',
        'lien_ket_id', 'loai_lien_ket', 'thu_tu_sap_xep',
        'mau_sac', 'icon'
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'thu_tu_sap_xep' => 'integer',
    ];

    // Auto-generate ma_thu_muc
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_thu_muc)) {
                $latest = static::withTrashed()->orderBy('id', 'desc')->first();
                $nextId = $latest ? $latest->id + 1 : 1;
                $model->ma_thu_muc = 'TM' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    // Relationships
    public function parent() { return $this->belongsTo(ThuMuc::class, 'parent_id'); }
    public function children() { return $this->hasMany(ThuMuc::class, 'parent_id')->orderBy('thu_tu_sap_xep'); }
    public function files() { return $this->hasMany(File::class, 'thu_muc_id'); }
    public function nguoiTao() { return $this->belongsTo(\App\Models\AdminUser::class, 'nguoi_tao_id'); }
    public function phanQuyen() { return $this->hasMany(PhanQuyen::class, 'thu_muc_id'); }
    public function phanQuyens() { return $this->hasMany(PhanQuyen::class, 'thu_muc_id'); }
    public function binhLuans() { return $this->hasMany(BinhLuan::class, 'thu_muc_id'); }
    public function hoatDongs() { return $this->hasMany(HoatDong::class, 'thu_muc_id'); }

    // Scopes
    public function scopeRoot($query) { return $query->whereNull('parent_id'); }
    public function scopePublic($query) { return $query->where('is_public', true); }
    public function scopeCaNhan($query) { return $query->where('loai', 'ca_nhan'); }
    public function scopePhongBan($query) { return $query->where('loai', 'phong_ban'); }

    // Helper: Get full path
    public function getFullPathAttribute()
    {
        $path = [$this->ten_thu_muc];
        $parent = $this->parent;
        while ($parent) {
            array_unshift($path, $parent->ten_thu_muc);
            $parent = $parent->parent;
        }
        return implode(' / ', $path);
    }
}
