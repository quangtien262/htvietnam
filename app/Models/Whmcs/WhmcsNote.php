<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;

class WhmcsNote extends Model
{
    protected $table = 'whmcs_notes';

    protected $fillable = [
        'notable_type',
        'notable_id',
        'note',
        'is_sticky',
        'created_by',
    ];

    protected $casts = [
        'is_sticky' => 'boolean',
    ];

    public function notable()
    {
        return $this->morphTo();
    }
}
