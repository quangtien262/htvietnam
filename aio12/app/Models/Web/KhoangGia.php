<?php

namespace App\Models\Web;
use Illuminate\Database\Eloquent\Model;

class KhoangGia extends Model {
    protected $table = 'khoang_gia';

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
