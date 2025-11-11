<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use SoftDeletes;

    protected $table = 'pro___tasks';

    protected $fillable = [
        'project_id',
        'ma_nhiem_vu',
        'tieu_de',
        'mo_ta',
        'parent_id',
        'trang_thai_id',
        'uu_tien_id',
        'nguoi_thuc_hien_id',
        'nguoi_giao_viec_id',
        'ngay_bat_dau',
        'ngay_ket_thuc_du_kien',
        'ngay_ket_thuc_thuc_te',
        'thoi_gian_uoc_tinh',
        'thoi_gian_thuc_te',
        'tien_do',
        'tags',
        'ghi_chu',
        'kanban_order',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'tags' => 'array',
        'ngay_bat_dau' => 'datetime',
        'ngay_ket_thuc_du_kien' => 'datetime',
        'ngay_ket_thuc_thuc_te' => 'datetime',
        'tien_do' => 'integer',
        'thoi_gian_uoc_tinh' => 'integer',
        'thoi_gian_thuc_te' => 'integer',
        'kanban_order' => 'integer',
    ];

    // Relationships
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Task::class, 'parent_id');
    }

    public function trangThai(): BelongsTo
    {
        return $this->belongsTo(TaskStatus::class, 'trang_thai_id');
    }

    public function uuTien(): BelongsTo
    {
        return $this->belongsTo(Priority::class, 'uu_tien_id');
    }

    public function nguoiThucHien(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'nguoi_thuc_hien_id');
    }

    public function nguoiGiaoViec(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'nguoi_giao_viec_id');
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(TaskChecklist::class, 'task_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class, 'task_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class, 'task_id');
    }

    public function dependencies(): HasMany
    {
        return $this->hasMany(TaskDependency::class, 'task_id');
    }

    public function timeLogs(): HasMany
    {
        return $this->hasMany(TimeLog::class, 'task_id');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class, 'doi_tuong_id')
            ->where('loai_doi_tuong', 'task')
            ->orderBy('created_at', 'desc');
    }
}
