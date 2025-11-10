<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServerGroup extends Model
{
    protected $table = 'whmcs_server_groups';

    protected $fillable = ['name', 'type'];

    public function servers(): BelongsToMany
    {
        return $this->belongsToMany(Server::class, 'whmcs_server_group_members')
            ->withPivot('priority')
            ->orderBy('priority', 'desc');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'server_group_id');
    }
}
