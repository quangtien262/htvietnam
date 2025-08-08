<?php

namespace App\Models\Web;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Orders extends Model {

    protected $table = 'orders';

    protected $fillable = [
        'name',
        'user_id',
        'product_id',
        'bds_id',
        'price',
        'promo_price',
        'note',
        'sort_order',

        'phone',
        'email',
    ];
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
    public function products()
    {
        return $this->belongsToMany(Product::class,'product_id', 'id');
    }
}
