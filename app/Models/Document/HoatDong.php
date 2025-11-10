<?php

namespace App\Models\Document;

use Illuminate\Database\Eloquent\Model;

class HoatDong extends Model
{
    protected $table = 'tai_lieu_hoat_dong';
    
    public $timestamps = false;
    const CREATED_AT = 'created_at';

    protected $fillable = [
        'file_id', 'thu_muc_id', 'loai_doi_tuong',
        'user_id', 'hanh_dong', 'chi_tiet',
        'ip_address', 'user_agent', 'created_at'
    ];

    protected $casts = [
        'chi_tiet' => 'array',
        'created_at' => 'datetime',
    ];

    // Relationships
    public function file() { return $this->belongsTo(File::class, 'file_id'); }
    public function thuMuc() { return $this->belongsTo(ThuMuc::class, 'thu_muc_id'); }
    public function user() { return $this->belongsTo(\App\Models\AdminUser::class, 'user_id'); }

    // Scopes
    public function scopeByAction($query, $action) { return $query->where('hanh_dong', $action); }
    public function scopeRecent($query, $days = 7) { 
        return $query->where('created_at', '>=', now()->subDays($days))->orderBy('created_at', 'desc'); 
    }
    public function scopeByUser($query, $userId) { return $query->where('user_id', $userId); }

    // Static log method
    public static function log($data)
    {
        return static::create(array_merge($data, [
            'created_at' => now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]));
    }
}
