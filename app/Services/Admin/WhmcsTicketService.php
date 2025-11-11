<?php

namespace App\Services\Admin;

use App\Models\Whmcs\WhmcsTicket;
use App\Models\Whmcs\WhmcsTicketReply;
use Illuminate\Support\Str;

class WhmcsTicketService
{
    public function createTicket(array $data)
    {
        try {
            \DB::beginTransaction();

            $ticketNumber = 'TKT-' . date('Ymd') . '-' . strtoupper(Str::random(6));

            $ticket = WhmcsTicket::create([
                'ticket_number' => $ticketNumber,
                'client_id' => $data['client_id'],
                'department_id' => $data['department_id'],
                'priority_id' => $data['priority_id'],
                'related_service_id' => $data['related_service_id'] ?? null,
                'subject' => $data['subject'],
                'message' => $data['message'],
                'status' => 'Open',
                'admin_read' => false,
                'client_read' => true
            ]);

            \DB::commit();
            return $ticket;
        } catch (\Exception $e) {
            \DB::rollBack();
            throw $e;
        }
    }

    public function addReply(WhmcsTicket $ticket, string $message, int $adminId)
    {
        $reply = WhmcsTicketReply::create([
            'ticket_id' => $ticket->id,
            'admin_id' => $adminId,
            'message' => $message,
            'admin_reply' => true
        ]);

        // Update ticket status and timestamp
        $ticket->update([
            'status' => 'Answered',
            'client_read' => false,
            'admin_read' => true
        ]);

        // TODO: Send email notification to client

        return $reply;
    }
}
