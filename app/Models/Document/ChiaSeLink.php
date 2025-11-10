<?php

namespace App\Models\Document;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ChiaSeLink extends Model
{
    protected $table = 'tai_lieu_chia_se_link';
    
    protected $fillable = [
        'file_id', 'thu_muc_id', 'loai_doi_tuong',
        'ma_link', 'mat_khau', 'quyen',
        'luot_truy_cap', 'luot_truy_cap_toi_da',
        'ngay_het_han', 'is_active', 'nguoi_tao_id'
    ];

    protected $casts = [
        'ngay_het_han' => 'datetime',
        'is_active' => 'boolean',
        'luot_truy_cap' => 'integer',
        'luot_truy_cap_toi_da' => 'integer',
    ];

    // Auto-generate ma_link
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->ma_link)) {
                $model->ma_link = Str::random(32);
            }
        });
    }

    // Relationships
    public function file() { return $this->belongsTo(File::class, 'file_id'); }
    public function thuMuc() { return $this->belongsTo(ThuMuc::class, 'thu_muc_id'); }
    public function nguoiTao() { return $this->belongsTo(\App\Models\AdminUser::class, 'nguoi_tao_id'); }

    // Scopes
    public function scopeActive($query) { 
        return $query->where('is_active', true)
                    ->where(function($q) {
                        $q->whereNull('ngay_het_han')
                          ->orWhere('ngay_het_han', '>', now());
                    })
                    ->where(function($q) {
                        $q->whereNull('luot_truy_cap_toi_da')
                          ->orWhereRaw('luot_truy_cap < luot_truy_cap_toi_da');
                    });
    }

    // Helpers
    public function incrementAccess()
    {
        $this->increment('luot_truy_cap');
    }

    public function isValid()
    {
        if (!$this->is_active) return false;
        if ($this->ngay_het_han && $this->ngay_het_han->isPast()) return false;
        if ($this->luot_truy_cap_toi_da && $this->luot_truy_cap >= $this->luot_truy_cap_toi_da) return false;
        return true;
    }

    public function getFullUrl()
    {
        return url("/share/{$this->ma_link}");
    }
}
