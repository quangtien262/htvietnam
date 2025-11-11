<?php

namespace App\Models\Whmcs;

use App\Models\Admin\AdminUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use SoftDeletes;

    protected $table = 'whmcs_tickets';

    protected $fillable = [
        'user_id',
        'service_id',
        'ticket_number',
        'subject',
        'department',
        'priority',
        'status',
        'assigned_to',
        'last_reply_at',
    ];

    protected $casts = [
        'last_reply_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (!$ticket->ticket_number) {
                $ticket->ticket_number = self::generateTicketNumber();
            }
        });
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'assigned_to');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(TicketReply::class);
    }

    // Helper Methods
    public static function generateTicketNumber(): string
    {
        $prefix = 'TKT';
        $timestamp = now()->format('ymd');
        $random = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        
        return "{$prefix}{$timestamp}{$random}";
    }

    public function isOpen(): bool
    {
        return in_array($this->status, ['open', 'awaiting_reply', 'in_progress']);
    }

    public function isClosed(): bool
    {
        return $this->status === 'closed';
    }

    public function close(): void
    {
        $this->update(['status' => 'closed']);
    }

    public function reopen(): void
    {
        $this->update(['status' => 'open']);
    }

    public function assignTo(int $adminUserId): void
    {
        $this->update([
            'assigned_to' => $adminUserId,
            'status' => 'in_progress',
        ]);
    }

    public function markAsAnswered(): void
    {
        $this->update([
            'status' => 'answered',
            'last_reply_at' => now(),
        ]);
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['open', 'awaiting_reply', 'in_progress']);
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    public function scopeByDepartment($query, string $department)
    {
        return $query->where('department', $department);
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeUrgent($query)
    {
        return $query->where('priority', 'urgent');
    }
}
