<?php

namespace App\Models\Document;

use Illuminate\Database\Eloquent\Model;

class Quota extends Model
{
    protected $table = 'tai_lieu_quota';

    const CREATED_AT = null; // No created_at column
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'user_id', 'phong_ban_id', 'loai',
        'dung_luong_gioi_han', 'dung_luong_su_dung',
        'ty_le_su_dung', 'canh_bao_tu', 'da_canh_bao'
    ];

    protected $casts = [
        'dung_luong_gioi_han' => 'integer',
        'dung_luong_su_dung' => 'integer',
        'ty_le_su_dung' => 'decimal:2',
        'canh_bao_tu' => 'integer',
        'da_canh_bao' => 'boolean',
    ];

    // Relationships
    public function user() { return $this->belongsTo(\App\Models\User::class, 'user_id'); }

    // Scopes
    public function scopeForUser($query, $userId) {
        return $query->where('loai', 'user')->where('user_id', $userId);
    }

    public function scopeWarning($query) {
        return $query->whereRaw('ty_le_su_dung >= canh_bao_tu');
    }

    public function scopeOverLimit($query) {
        return $query->whereRaw('dung_luong_su_dung >= dung_luong_gioi_han');
    }

    // Helpers
    public function updateUsage($bytesAdded)
    {
        $this->dung_luong_su_dung += $bytesAdded;
        $this->ty_le_su_dung = ($this->dung_luong_su_dung / $this->dung_luong_gioi_han) * 100;

        if ($this->ty_le_su_dung >= $this->canh_bao_tu && !$this->da_canh_bao) {
            $this->da_canh_bao = true;
            // TODO: Send notification
        }

        $this->save();
    }

    public function canUpload($fileSize)
    {
        return ($this->dung_luong_su_dung + $fileSize) <= $this->dung_luong_gioi_han;
    }

    public function getFormattedLimit()
    {
        return $this->formatBytes($this->dung_luong_gioi_han);
    }

    public function getFormattedUsage()
    {
        return $this->formatBytes($this->dung_luong_su_dung);
    }

    private function formatBytes($bytes)
    {
        if ($bytes >= 1073741824) return number_format($bytes / 1073741824, 2) . ' GB';
        if ($bytes >= 1048576) return number_format($bytes / 1048576, 2) . ' MB';
        if ($bytes >= 1024) return number_format($bytes / 1024, 2) . ' KB';
        return $bytes . ' bytes';
    }
}
