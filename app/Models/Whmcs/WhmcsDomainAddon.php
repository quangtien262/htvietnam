<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhmcsDomainAddon extends Model
{
    protected $table = 'whmcs_domain_addons';

    protected $fillable = [
        'domain_id',
        'addon_name',
        'addon_type',
        'price',
        'billing_cycle',
        'next_due_date',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'next_due_date' => 'date',
    ];

    public function domain(): BelongsTo
    {
        return $this->belongsTo(WhmcsDomain::class, 'domain_id');
    }
}
