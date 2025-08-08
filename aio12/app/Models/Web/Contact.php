<?php

namespace App\Models\Web;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model {

    //
    protected $table = 'contact';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'content',
        'product_id',
        'product_name'
    ];
}
