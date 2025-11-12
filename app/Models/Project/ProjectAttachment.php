<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use App\Models\AdminUser;

class ProjectAttachment extends Model
{
    protected $table = 'pro___project_attachments';

    protected $fillable = [
        'project_id',
        'ten_file',
        'duong_dan',
        'loai_file',
        'kich_thuoc',
        'uploaded_by',
        'mo_ta',
    ];

    // Relationships
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function uploader()
    {
        return $this->belongsTo(AdminUser::class, 'uploaded_by');
    }

    // Helper: Get formatted file size
    public function getFormattedSizeAttribute()
    {
        if (!$this->kich_thuoc) {
            return '-';
        }

        $bytes = $this->kich_thuoc;
        if ($bytes < 1024) {
            return $bytes . ' B';
        } elseif ($bytes < 1048576) {
            return round($bytes / 1024, 2) . ' KB';
        } elseif ($bytes < 1073741824) {
            return round($bytes / 1048576, 2) . ' MB';
        } else {
            return round($bytes / 1073741824, 2) . ' GB';
        }
    }

    // Helper: Get file extension
    public function getExtensionAttribute()
    {
        return pathinfo($this->ten_file, PATHINFO_EXTENSION);
    }
}
