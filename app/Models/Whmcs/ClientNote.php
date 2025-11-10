<?php

namespace App\Models\Whmcs;

use App\Models\Admin\AdminUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientNote extends Model
{
    protected $table = 'whmcs_client_notes';

    protected $fillable = [
        'client_id',
        'admin_user_id',
        'note',
        'is_sticky',
    ];

    protected $casts = [
        'is_sticky' => 'boolean',
    ];

    // Relationships
    public function client(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'client_id');
    }

    public function adminUser(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class);
    }

    // Helper Methods
    public function pin(): void
    {
        $this->update(['is_sticky' => true]);
    }

    public function unpin(): void
    {
        $this->update(['is_sticky' => false]);
    }

    public function togglePin(): void
    {
        $this->update(['is_sticky' => !$this->is_sticky]);
    }

    // Scopes
    public function scopeSticky($query)
    {
        return $query->where('is_sticky', true);
    }

    public function scopeRegular($query)
    {
        return $query->where('is_sticky', false);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('is_sticky', 'desc')
                    ->orderBy('created_at', 'desc');
    }
}
