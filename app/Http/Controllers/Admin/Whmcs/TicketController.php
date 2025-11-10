<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\Ticket;
use App\Models\Whmcs\TicketReply;
use App\Models\Admin\AdminUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TicketController extends Controller
{
    /**
     * Get all tickets (admin view)
     */
    public function index(Request $request)
    {
        $status = $request->input('status');
        $department = $request->input('department');
        $priority = $request->input('priority');
        $assignedTo = $request->input('assigned_to');
        $search = $request->input('search');
        $perPage = $request->input('per_page', 20);

        $query = Ticket::with(['client', 'service', 'assignedTo']);

        if ($status) {
            if ($status === 'open') {
                $query->open();
            } elseif ($status === 'closed') {
                $query->closed();
            }
        }

        if ($department) {
            $query->byDepartment($department);
        }

        if ($priority) {
            $query->byPriority($priority);
        }

        if ($assignedTo) {
            $query->where('assigned_to', $assignedTo);
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
     * Get single ticket details
     */
    public function show($id)
    {
        $ticket = Ticket::with([
            'client',
            'service',
            'assignedTo',
            'replies.author'
        ])->findOrFail($id);

        return response()->json($ticket);
    }

    /**
     * Assign ticket to admin
     */
    public function assign(Request $request, $id)
    {
        $validated = $request->validate([
            'admin_user_id' => 'required|exists:admin_users,id',
        ]);

        $ticket = Ticket::findOrFail($id);
        $ticket->assignTo($validated['admin_user_id']);

        return response()->json([
            'message' => 'Ticket assigned successfully',
            'ticket' => $ticket->load('assignedTo'),
        ]);
    }

    /**
     * Reply to ticket (admin)
     */
    public function reply(Request $request, $id)
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'is_internal' => 'boolean',
            'admin_user_id' => 'required|exists:admin_users,id',
        ]);

        $ticket = Ticket::findOrFail($id);

        $reply = $ticket->replies()->create([
            'author_type' => AdminUser::class,
            'author_id' => $validated['admin_user_id'],
            'message' => $validated['message'],
            'is_internal' => $validated['is_internal'] ?? false,
        ]);

        // Update ticket status
        if (!$validated['is_internal']) {
            $ticket->markAsAnswered();
        }

        return response()->json([
            'message' => 'Reply added successfully',
            'reply' => $reply->load('author'),
        ], 201);
    }

    /**
     * Update ticket status
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:open,awaiting_reply,in_progress,answered,closed',
        ]);

        $ticket = Ticket::findOrFail($id);
        $ticket->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Ticket status updated successfully',
            'ticket' => $ticket,
        ]);
    }

    /**
     * Update ticket priority
     */
    public function updatePriority(Request $request, $id)
    {
        $validated = $request->validate([
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        $ticket = Ticket::findOrFail($id);
        $ticket->update(['priority' => $validated['priority']]);

        return response()->json([
            'message' => 'Ticket priority updated successfully',
            'ticket' => $ticket,
        ]);
    }

    /**
     * Close ticket
     */
    public function close($id)
    {
        $ticket = Ticket::findOrFail($id);
        $ticket->close();

        return response()->json([
            'message' => 'Ticket closed successfully',
        ]);
    }

    /**
     * Reopen ticket
     */
    public function reopen($id)
    {
        $ticket = Ticket::findOrFail($id);
        $ticket->reopen();

        return response()->json([
            'message' => 'Ticket reopened successfully',
        ]);
    }

    /**
     * Delete ticket
     */
    public function destroy($id)
    {
        $ticket = Ticket::findOrFail($id);
        $ticket->delete();

        return response()->json([
            'message' => 'Ticket deleted successfully',
        ]);
    }

    /**
     * Get ticket statistics
     */
    public function statistics()
    {
        $stats = [
            'total' => Ticket::count(),
            'open' => Ticket::open()->count(),
            'closed' => Ticket::closed()->count(),
            'urgent' => Ticket::urgent()->count(),
            'by_department' => Ticket::select('department', DB::raw('count(*) as total'))
                ->groupBy('department')
                ->get(),
            'by_status' => Ticket::select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->get(),
            'by_priority' => Ticket::select('priority', DB::raw('count(*) as total'))
                ->groupBy('priority')
                ->get(),
            'avg_response_time' => $this->calculateAvgResponseTime(),
        ];

        return response()->json($stats);
    }

    /**
     * Calculate average response time
     */
    private function calculateAvgResponseTime()
    {
        // TODO: Implement proper calculation
        return '2 hours'; // Placeholder
    }
}
