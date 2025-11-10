<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConfigurableOption extends Model
{
    protected $table = 'whmcs_configurable_options';

    protected $fillable = [
        'product_id', 'name', 'type', 'options', 'order'
    ];

    protected $casts = [
        'options' => 'array',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
