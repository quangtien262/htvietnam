<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;

class Priority extends Model
{
    protected $table = 'pro___priorities';

    protected $fillable = [
        'name',
        'cap_do',
        'color',
        'sort_order',
        'note',
    ];

    protected $casts = [
        'cap_do' => 'integer',
        'sort_order' => 'integer',
    ];
}
