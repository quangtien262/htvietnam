<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;

class MeetingStatus extends Model
{
    protected $table = 'pro___meeting_status';

    protected $fillable = [
        'name',
        'color',
        'note',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function meetings()
    {
        return $this->hasMany(Meeting::class, 'meeting_status_id');
    }
}
