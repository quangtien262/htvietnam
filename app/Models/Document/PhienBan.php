<?php

namespace App\Models\Document;

use Illuminate\Database\Eloquent\Model;

class PhienBan extends Model
{
    protected $table = 'tai_lieu_phien_ban';
    
    public $timestamps = true;
    const UPDATED_AT = null;

    protected $fillable = [
        'file_id', 'phien_ban', 'duong_dan', 'kich_thuoc',
        'hash_md5', 'nguoi_tai_len_id', 'ghi_chu_thay_doi'
    ];

    protected $casts = [
        'kich_thuoc' => 'integer',
        'phien_ban' => 'integer',
    ];

    // Relationships
    public function file() { return $this->belongsTo(File::class, 'file_id'); }
    public function nguoiTaiLen() { return $this->belongsTo(\App\Models\AdminUser::class, 'nguoi_tai_len_id'); }

    // Helpers
    public function getKichThuocFormatted()
    {
        $bytes = $this->kich_thuoc;
        if ($bytes >= 1073741824) return number_format($bytes / 1073741824, 2) . ' GB';
        if ($bytes >= 1048576) return number_format($bytes / 1048576, 2) . ' MB';
        if ($bytes >= 1024) return number_format($bytes / 1024, 2) . ' KB';
        return $bytes . ' bytes';
    }
}
