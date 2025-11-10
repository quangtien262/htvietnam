<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Server extends Model
{
    protected $table = 'whmcs_servers';

    protected $fillable = [
        'name', 'hostname', 'ip_address', 'type', 'panel', 'port',
        'api_token', 'username', 'password', 'datacenter',
        'max_accounts', 'current_accounts', 'status', 'monitoring',
        'last_checked_at'
    ];

    protected $casts = [
        'monitoring' => 'array',
        'last_checked_at' => 'datetime',
    ];

    protected $hidden = ['api_token', 'password'];

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(ServerGroup::class, 'whmcs_server_group_members')
            ->withPivot('priority');
    }

    public function isAvailable(): bool
    {
        return $this->status === 'active' && $this->current_accounts < $this->max_accounts;
    }

    public function incrementAccounts(): void
    {
        $this->increment('current_accounts');
    }

    public function decrementAccounts(): void
    {
        $this->decrement('current_accounts');
    }

    public function updateMonitoring(array $data): void
    {
        $this->update([
            'monitoring' => $data,
            'last_checked_at' => now(),
        ]);
    }
}
