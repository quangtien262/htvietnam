<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\Ticket;
use App\Models\Whmcs\TicketReply;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ClientTicketController extends Controller
{
    /**
     * Get tickets for current client
     */
    public function index(Request $request)
    {
        $clientId = $request->input('client_id');
        $status = $request->input('status');
        $search = $request->input('search');
        $perPage = $request->input('per_page', 20);

        $query = Ticket::with(['service', 'assignedTo'])
            ->where('client_id', $clientId);

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $tickets = $query->latest()->paginate($perPage);

        return response()->json($tickets);
    }

    /**
     * Create new ticket (client)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:users,id',
            'department' => 'required|string|in:technical,billing,sales,support',
            'priority' => 'required|in:low,medium,high',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'service_id' => 'nullable|exists:whmcs_services,id',
        ]);

        // Generate unique ticket number
        $ticketNumber = 'TKT-' . strtoupper(Str::random(8));
        while (Ticket::where('ticket_number', $ticketNumber)->exists()) {
            $ticketNumber = 'TKT-' . strtoupper(Str::random(8));
        }

        $ticket = Ticket::create([
            'ticket_number' => $ticketNumber,
            'client_id' => $validated['client_id'],
            'service_id' => $validated['service_id'] ?? null,
            'department' => $validated['department'],
            'priority' => $validated['priority'],
            'subject' => $validated['subject'],
            'status' => 'open',
        ]);

        // Create first reply (initial message)
        $ticket->replies()->create([
            'author_type' => \App\Models\User::class,
            'author_id' => $validated['client_id'],
            'message' => $validated['message'],
            'is_internal' => false,
        ]);

        return response()->json([
            'message' => 'Ticket created successfully',
            'ticket' => $ticket->load('replies'),
        ], 201);
    }

    /**
     * Get single ticket (client)
     */
    public function show(Request $request, $id)
    {
        $clientId = $request->input('client_id');

        $ticket = Ticket::with(['service', 'assignedTo', 'replies.author'])
            ->where('client_id', $clientId)
            ->findOrFail($id);

        return response()->json($ticket);
    }

    /**
     * Reply to ticket (client)
     */
    public function reply(Request $request, $id)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $ticket = Ticket::where('client_id', $validated['client_id'])
            ->findOrFail($id);

        $reply = $ticket->replies()->create([
            'author_type' => \App\Models\User::class,
            'author_id' => $validated['client_id'],
            'message' => $validated['message'],
            'is_internal' => false,
        ]);

        // Update ticket status to customer-reply
        $ticket->update(['status' => 'customer-reply']);

        return response()->json([
            'message' => 'Reply added successfully',
            'reply' => $reply->load('author'),
        ], 201);
    }

    /**
     * Close ticket (client)
     */
    public function close(Request $request, $id)
    {
        $clientId = $request->input('client_id');

        $ticket = Ticket::where('client_id', $clientId)
            ->findOrFail($id);
        
        $ticket->close();

        return response()->json([
            'message' => 'Ticket closed successfully',
        ]);
    }
}
