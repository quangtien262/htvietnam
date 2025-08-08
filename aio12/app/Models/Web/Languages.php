<?php

namespace App\Models\Web;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Languages extends Model
{
    use HasFactory;

    protected $table = 'languages';
    public function menu() {
        return $this->belongsTo(Menu::class, 'menu_id');
    }
}
