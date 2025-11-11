<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhmcsTicketAttachment extends Model
{
    protected $table = 'whmcs_ticket_attachments';

    protected $fillable = [
        'ticket_id',
        'reply_id',
        'filename',
        'original_filename',
        'mime_type',
        'file_size',
        'file_path',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(WhmcsTicket::class, 'ticket_id');
    }

    public function reply(): BelongsTo
    {
        return $this->belongsTo(WhmcsTicketReply::class, 'reply_id');
    }
}
