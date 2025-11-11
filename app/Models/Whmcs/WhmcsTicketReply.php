<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WhmcsTicketReply extends Model
{
    protected $table = 'whmcs_ticket_replies';

    protected $fillable = [
        'ticket_id',
        'replied_by_type',
        'client_id',
        'admin_user_id',
        'message',
        'attachments',
        'email',
        'name',
        'ip_address',
    ];

    protected $casts = [
        'attachments' => 'array',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(WhmcsTicket::class, 'ticket_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(WhmcsClient::class, 'client_id');
    }

    public function adminUser(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'admin_user_id');
    }

    public function replyAttachments(): HasMany
    {
        return $this->hasMany(WhmcsTicketAttachment::class, 'reply_id');
    }
}
