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
    public function user() { return $this->belongsTo(\App\Models\AdminUser::class, 'user_id'); }
    public function nguoiChiaSe() { return $this->belongsTo(\App\Models\AdminUser::class, 'nguoi_chia_se_id'); }

    // Scopes
    public function scopeActive($query) { 
        return $query->where('is_active', true)
                    ->where(function($q) {
                        $q->whereNull('ngay_het_han')
                          ->orWhere('ngay_het_han', '>', now());
                    });
    }

    public function scopeOwners($query) { return $query->where('quyen', 'owner'); }
    public function scopeManagers($query) { return $query->where('quyen', 'manager'); }
    public function scopeEditors($query) { return $query->where('quyen', 'editor'); }
    public function scopeCommenters($query) { return $query->where('quyen', 'commenter'); }
    public function scopeViewers($query) { return $query->where('quyen', 'viewer'); }

    // Check expired
    public function isExpired()
    {
        return $this->ngay_het_han && $this->ngay_het_han->isPast();
    }

    // Permission helper methods
    public function canView()
    {
        return in_array($this->quyen, ['owner', 'manager', 'editor', 'commenter', 'viewer']);
    }

    public function canComment()
    {
        return in_array($this->quyen, ['owner', 'manager', 'editor', 'commenter']);
    }

    public function canEdit()
    {
        return in_array($this->quyen, ['owner', 'manager', 'editor']);
    }

    public function canManage()
    {
        return in_array($this->quyen, ['owner', 'manager']);
    }

    public function canDelete()
    {
        return $this->quyen === 'owner';
    }

    public function canShare()
    {
        return in_array($this->quyen, ['owner', 'manager']);
    }

    // Static helper to check user permission on object
    public static function userCan($userId, $objectType, $objectId, $permission)
    {
        $fieldName = $objectType === 'file' ? 'file_id' : 'thu_muc_id';
        
        $phanQuyen = static::where($fieldName, $objectId)
            ->where('user_id', $userId)
            ->active()
            ->first();

        if (!$phanQuyen) {
            return false;
        }

        switch ($permission) {
            case 'view':
                return $phanQuyen->canView();
            case 'comment':
                return $phanQuyen->canComment();
            case 'edit':
                return $phanQuyen->canEdit();
            case 'manage':
                return $phanQuyen->canManage();
            case 'delete':
                return $phanQuyen->canDelete();
            case 'share':
                return $phanQuyen->canShare();
            default:
                return false;
        }
    }
}
