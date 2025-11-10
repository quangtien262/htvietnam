<?php

namespace App\Models\Document;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BinhLuan extends Model
{
    use SoftDeletes;

    protected $table = 'tai_lieu_binh_luan';
    
    protected $fillable = [
        'file_id', 'thu_muc_id', 'loai_doi_tuong',
        'parent_comment_id', 'user_id', 'noi_dung', 'is_resolved'
    ];

    protected $casts = [
        'is_resolved' => 'boolean',
    ];

    // Relationships
    public function file() { return $this->belongsTo(File::class, 'file_id'); }
    public function thuMuc() { return $this->belongsTo(ThuMuc::class, 'thu_muc_id'); }
    public function user() { return $this->belongsTo(\App\Models\AdminUser::class, 'user_id'); }
    public function parentComment() { return $this->belongsTo(BinhLuan::class, 'parent_comment_id'); }
    public function replies() { return $this->hasMany(BinhLuan::class, 'parent_comment_id')->orderBy('created_at'); }

    // Scopes
    public function scopeTopLevel($query) { return $query->whereNull('parent_comment_id'); }
    public function scopeResolved($query) { return $query->where('is_resolved', true); }
    public function scopeUnresolved($query) { return $query->where('is_resolved', false); }
}
