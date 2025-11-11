<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhmcsTicket extends Model
{
    use SoftDeletes;

    protected $table = 'whmcs_tickets';

    protected $fillable = [
        'ticket_number',
        'client_id',
        'department_id',
        'priority_id',
        'service_id',
        'domain_id',
        'subject',
        'message',
        'status',
        'assigned_to',
        'flagged',
        'email',
        'name',
        'last_reply_at',
        'last_reply_by',
        'opened_at',
        'closed_at',
        'rating',
        'rating_comment',
        'admin_notes',
    ];

    protected $casts = [
        'flagged' => 'boolean',
        'last_reply_at' => 'datetime',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(WhmcsClient::class, 'client_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(WhmcsTicketDepartment::class, 'department_id');
    }

    public function priority(): BelongsTo
    {
        return $this->belongsTo(WhmcsTicketPriority::class, 'priority_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(WhmcsService::class, 'service_id');
    }

    public function domain(): BelongsTo
    {
        return $this->belongsTo(WhmcsDomain::class, 'domain_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'assigned_to');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(WhmcsTicketReply::class, 'ticket_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(WhmcsTicketAttachment::class, 'ticket_id');
    }

    public function isOpen(): bool
    {
        return !in_array($this->status, ['closed']);
    }

    public function close(): void
    {
        $this->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);
    }
}
