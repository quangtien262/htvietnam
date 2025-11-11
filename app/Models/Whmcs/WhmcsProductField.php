<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhmcsProductField extends Model
{
    protected $table = 'whmcs_product_fields';

    protected $fillable = [
        'product_id',
        'field_name',
        'field_type',
        'field_options',
        'description',
        'is_required',
        'sort_order',
    ];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(WhmcsProduct::class, 'product_id');
    }

    public function getOptionsArray(): array
    {
        if ($this->field_type === 'dropdown') {
            return json_decode($this->field_options, true) ?? [];
        }
        return [];
    }
}
