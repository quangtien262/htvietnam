<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use SoftDeletes;

    protected $table = 'pro___projects';

    protected $fillable = [
        'ma_du_an',
        'ten_du_an',
        'mo_ta',
        'loai_du_an_id',
        'trang_thai_id',
        'uu_tien_id',
        'khach_hang_id',
        'ten_khach_hang',
        'ngay_bat_dau',
        'ngay_ket_thuc_du_kien',
        'ngay_ket_thuc_thuc_te',
        'ngan_sach_du_kien',
        'chi_phi_thuc_te',
        'tien_do',
        'quan_ly_du_an_id',
        'tags',
        'mau_sac',
        'ghi_chu',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'tags' => 'array',
        'ngay_bat_dau' => 'date',
        'ngay_ket_thuc_du_kien' => 'date',
        'ngay_ket_thuc_thuc_te' => 'date',
        'ngan_sach_du_kien' => 'decimal:2',
        'chi_phi_thuc_te' => 'decimal:2',
        'tien_do' => 'integer',
    ];

    // Relationships
    public function loaiDuAn(): BelongsTo
    {
        return $this->belongsTo(ProjectType::class, 'loai_du_an_id');
    }

    public function trangThai(): BelongsTo
    {
        return $this->belongsTo(ProjectStatus::class, 'trang_thai_id');
    }

    public function uuTien(): BelongsTo
    {
        return $this->belongsTo(Priority::class, 'uu_tien_id');
    }

    public function quanLyDuAn(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'quan_ly_du_an_id');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'project_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(ProjectMember::class, 'project_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ProjectAttachment::class, 'project_id');
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(ProjectChecklist::class, 'project_id')->orderBy('sort_order');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class, 'doi_tuong_id')
            ->where('loai_doi_tuong', 'project')
            ->orderBy('created_at', 'desc');
    }

    // Accessors
    public function getCompletedTasksCountAttribute()
    {
        return $this->tasks()->whereHas('trangThai', function($query) {
            $query->where('is_done', true);
        })->count();
    }

    public function getTotalTasksCountAttribute()
    {
        return $this->tasks()->count();
    }

    public function getCompletionRateAttribute()
    {
        $total = $this->total_tasks_count;
        if ($total == 0) return 0;
        return round(($this->completed_tasks_count / $total) * 100, 2);
    }
}
