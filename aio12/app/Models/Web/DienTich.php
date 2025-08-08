<?php

namespace App\Models\Web;
use Illuminate\Database\Eloquent\Model;

class DienTich extends Model {
    protected $table = 'dien_tich';

    /**
     * The attributes that are mass assignable.
     *
     * @var string[]
     */
    protected $fillable = [
        'name',
        'start',
        'end'
    ];
}
