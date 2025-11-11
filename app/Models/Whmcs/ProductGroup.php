<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductGroup extends Model
{
    use HasFactory;

    protected $table = 'whmcs_product_groups';

    protected $fillable = ['name', 'description', 'order'];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'group_id');
    }
}
