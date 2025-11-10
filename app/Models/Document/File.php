<?php

namespace App\Models\Document;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class File extends Model
{
    use SoftDeletes;

    protected $table = 'tai_lieu_file';
    
    protected $fillable = [
        'ma_tai_lieu', 'thu_muc_id', 'ten_file', 'ten_goc', 'mo_ta',
        'duong_dan', 'kich_thuoc', 'mime_type', 'extension',
        'phien_ban', 'nguoi_tai_len_id', 'is_starred', 'tags',
        'luot_xem', 'luot_tai_ve', 'ngay_truy_cap_cuoi',
        'hash_md5', 'hash_sha256', 'ocr_data',
        'lien_ket_id', 'loai_lien_ket'
    ];

    protected $casts = [
        'tags' => 'array',
        'is_starred' => 'boolean',
        'kich_thuoc' => 'integer',
        'luot_xem' => 'integer',
        'luot_tai_ve' => 'integer',
        'ngay_truy_cap_cuoi' => 'datetime',
    ];

    // Auto-generate ma_tai_lieu
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_tai_lieu)) {
                $latest = static::withTrashed()->orderBy('id', 'desc')->first();
                $nextId = $latest ? $latest->id + 1 : 1;
                $model->ma_tai_lieu = 'TL' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    // Relationships
    public function thuMuc() { return $this->belongsTo(ThuMuc::class, 'thu_muc_id'); }
    public function nguoiTaiLen() { return $this->belongsTo(\App\Models\User::class, 'nguoi_tai_len_id'); }
    public function phienBans() { return $this->hasMany(PhienBan::class, 'file_id')->orderBy('phien_ban', 'desc'); }
    public function phanQuyens() { return $this->hasMany(PhanQuyen::class, 'file_id'); }
    public function binhLuans() { return $this->hasMany(BinhLuan::class, 'file_id'); }
    public function hoatDongs() { return $this->hasMany(HoatDong::class, 'file_id'); }
    public function shareLinks() { return $this->hasMany(ChiaSeLink::class, 'file_id'); }

    // Scopes
    public function scopeStarred($query) { return $query->where('is_starred', true); }
    public function scopeRecent($query) { return $query->orderBy('ngay_truy_cap_cuoi', 'desc')->limit(20); }
    public function scopeByMimeType($query, $type) { return $query->where('mime_type', 'like', $type . '%'); }
    public function scopeImages($query) { return $query->byMimeType('image'); }
    public function scopeDocuments($query) { return $query->byMimeType('application'); }
    public function scopeVideos($query) { return $query->byMimeType('video'); }

    // Helpers
    public function getKichThuocFormatted()
    {
        $bytes = $this->kich_thuoc;
        if ($bytes >= 1073741824) return number_format($bytes / 1073741824, 2) . ' GB';
        if ($bytes >= 1048576) return number_format($bytes / 1048576, 2) . ' MB';
        if ($bytes >= 1024) return number_format($bytes / 1024, 2) . ' KB';
        return $bytes . ' bytes';
    }

    public function incrementView()
    {
        $this->increment('luot_xem');
        $this->update(['ngay_truy_cap_cuoi' => now()]);
    }

    public function incrementDownload()
    {
        $this->increment('luot_tai_ve');
    }
}
