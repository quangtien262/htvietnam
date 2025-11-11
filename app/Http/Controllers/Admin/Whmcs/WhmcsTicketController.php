<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\WhmcsTicket;
use App\Models\Whmcs\WhmcsTicketDepartment;
use App\Services\Admin\WhmcsTicketService;
use Illuminate\Http\Request;

class WhmcsTicketController extends Controller
{
    protected $service;

    public function __construct(WhmcsTicketService $service)
    {
        $this->service = $service;
    }

    public function apiList(Request $request)
    {
        try {
            $perPage = $request->input('perPage', 20);
            $search = $request->input('search', '');
            $status = $request->input('status', '');
            $departmentId = $request->input('department_id', '');
            $priorityId = $request->input('priority_id', '');
            $clientId = $request->input('client_id', '');

            $query = WhmcsTicket::with(['client', 'department', 'priority', 'adminUser']);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('ticket_number', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%");
                });
            }

            if ($status) {
                $query->where('status', $status);
            }

            if ($departmentId) {
                $query->where('department_id', $departmentId);
            }

            if ($priorityId) {
                $query->where('priority_id', $priorityId);
            }

            if ($clientId) {
                $query->where('client_id', $clientId);
            }

            $tickets = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $tickets
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiDetail($id)
    {
        try {
            $ticket = WhmcsTicket::with([
                'client',
                'department',
                'priority',
                'adminUser',
                'replies.attachments',
                'replies.admin'
            ])->findOrFail($id);

            // Mark as read
            if (!$ticket->admin_read) {
                $ticket->update(['admin_read' => true]);
            }

            return response()->json([
                'success' => true,
                'data' => $ticket
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function apiAdd(Request $request)
    {
        try {
            $validated = $request->validate([
                'client_id' => 'required|exists:whmcs_clients,id',
                'department_id' => 'required|exists:whmcs_ticket_departments,id',
                'priority_id' => 'required|exists:whmcs_ticket_priorities,id',
                'subject' => 'required|string|max:255',
                'message' => 'required|string',
                'related_service_id' => 'nullable|exists:whmcs_services,id'
            ]);

            $ticket = $this->service->createTicket($validated);

            return response()->json([
                'success' => true,
                'message' => 'Tạo ticket thành công',
                'data' => $ticket
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiReply(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'message' => 'required|string',
                'admin_id' => 'required|exists:admin_users,id'
            ]);

            $ticket = WhmcsTicket::findOrFail($id);
            $reply = $this->service->addReply($ticket, $validated['message'], $validated['admin_id']);

            return response()->json([
                'success' => true,
                'message' => 'Trả lời ticket thành công',
                'data' => $reply
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiClose($id)
    {
        try {
            $ticket = WhmcsTicket::findOrFail($id);

            if ($ticket->status == 'Closed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket đã được đóng'
                ], 400);
            }

            $ticket->update(['status' => 'Closed']);

            return response()->json([
                'success' => true,
                'message' => 'Đóng ticket thành công',
                'data' => $ticket
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiDepartments()
    {
        try {
            $departments = WhmcsTicketDepartment::orderBy('name', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $departments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
