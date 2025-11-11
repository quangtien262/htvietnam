<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskAttachment extends Model
{
    protected $table = 'pro___task_attachments';

    protected $fillable = [
        'task_id',
        'ten_file',
        'duong_dan',
        'loai_file',
        'kich_thuoc',
        'uploaded_by',
    ];

    protected $casts = [
        'kich_thuoc' => 'integer',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'uploaded_by');
    }
}
