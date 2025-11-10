<?php

namespace App\Http\Controllers\Client\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientPortalController extends Controller
{
    /**
     * Get client dashboard data
     */
    public function dashboard(Request $request)
    {
        $client = $this->getAuthenticatedClient($request);

        $stats = [
            'active_services' => $client->services()->active()->count(),
            'pending_invoices' => $client->invoices()->unpaid()->count(),
            'total_due' => $client->invoices()->unpaid()->sum('total'),
            'credit_balance' => $client->credit_balance,
            'open_tickets' => $client->tickets()->open()->count(),
            'active_domains' => $client->domains()->active()->count(),
        ];

        $recentInvoices = $client->invoices()
            ->with('items')
            ->latest()
            ->take(5)
            ->get();

        $recentServices = $client->services()
            ->with(['product', 'server'])
            ->latest()
            ->take(5)
            ->get();

        $openTickets = $client->tickets()
            ->open()
            ->with('assignedTo')
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_invoices' => $recentInvoices,
            'recent_services' => $recentServices,
            'open_tickets' => $openTickets,
        ]);
    }

    /**
     * Get client information
     */
    public function profile(Request $request)
    {
        $client = $this->getAuthenticatedClient($request);

        return response()->json($client->load('user'));
    }

    /**
     * Update client profile
     */
    public function updateProfile(Request $request)
    {
        $client = $this->getAuthenticatedClient($request);

        $validated = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip' => 'nullable|string|max:20',
        ]);

        $client->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'client' => $client,
        ]);
    }

    /**
     * Get client's invoices
     */
    public function invoices(Request $request)
    {
        $client = $this->getAuthenticatedClient($request);

        $status = $request->input('status'); // paid, unpaid, cancelled
        $perPage = $request->input('per_page', 20);

        $query = $client->invoices()->with('items');

        if ($status) {
            $query->where('status', $status);
        }

        $invoices = $query->latest()->paginate($perPage);

        return response()->json($invoices);
    }

    /**
     * Get single invoice details
     */
    public function invoiceDetail(Request $request, $id)
    {
        $client = $this->getAuthenticatedClient($request);

        $invoice = $client->invoices()
            ->with(['items', 'transactions'])
            ->findOrFail($id);

        return response()->json($invoice);
    }

    /**
     * Get client's services
     */
    public function services(Request $request)
    {
        $client = $this->getAuthenticatedClient($request);

        $status = $request->input('status'); // active, suspended, terminated, pending
        $perPage = $request->input('per_page', 20);

        $query = $client->services()->with(['product', 'server']);

        if ($status) {
            $query->where('status', $status);
        }

        $services = $query->latest()->paginate($perPage);

        return response()->json($services);
    }

    /**
     * Get single service details
     */
    public function serviceDetail(Request $request, $id)
    {
        $client = $this->getAuthenticatedClient($request);

        $service = $client->services()
            ->with(['product', 'server'])
            ->findOrFail($id);

        return response()->json($service);
    }

    /**
     * Get client's domains
     */
    public function domains(Request $request)
    {
        $client = $this->getAuthenticatedClient($request);

        $status = $request->input('status');
        $perPage = $request->input('per_page', 20);

        $query = $client->domains();

        if ($status) {
            $query->where('status', $status);
        }

        $domains = $query->latest()->paginate($perPage);

        return response()->json($domains);
    }

    /**
     * Get client's tickets
     */
    public function tickets(Request $request)
    {
        $client = $this->getAuthenticatedClient($request);

        $status = $request->input('status'); // open, closed
        $perPage = $request->input('per_page', 20);

        $query = $client->tickets()->with(['assignedTo', 'service']);

        if ($status) {
            if ($status === 'open') {
                $query->open();
            } elseif ($status === 'closed') {
                $query->closed();
            }
        }

        $tickets = $query->latest()->paginate($perPage);

        return response()->json($tickets);
    }

    /**
     * Get single ticket details
     */
    public function ticketDetail(Request $request, $id)
    {
        $client = $this->getAuthenticatedClient($request);

        $ticket = $client->tickets()
            ->with(['replies.author', 'assignedTo', 'service'])
            ->findOrFail($id);

        // Only show public replies to clients
        $ticket->setRelation('replies', $ticket->replies()->public()->get());

        return response()->json($ticket);
    }

    /**
     * Create new ticket
     */
    public function createTicket(Request $request)
    {
        $client = $this->getAuthenticatedClient($request);

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'department' => 'required|in:support,billing,technical,sales',
            'priority' => 'required|in:low,medium,high,urgent',
            'service_id' => 'nullable|exists:whmcs_services,id',
            'message' => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            $ticket = $client->tickets()->create([
                'subject' => $validated['subject'],
                'department' => $validated['department'],
                'priority' => $validated['priority'],
                'service_id' => $validated['service_id'] ?? null,
                'status' => 'open',
            ]);

            // Add first reply (opening message)
            $ticket->replies()->create([
                'author_type' => User::class,
                'author_id' => $client->id,
                'message' => $validated['message'],
                'is_internal' => false,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Ticket created successfully',
                'ticket' => $ticket->load('replies'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create ticket',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reply to ticket
     */
    public function replyTicket(Request $request, $id)
    {
        $client = $this->getAuthenticatedClient($request);

        $ticket = $client->tickets()->findOrFail($id);

        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $reply = $ticket->replies()->create([
            'author_type' => User::class,
            'author_id' => $client->id,
            'message' => $validated['message'],
            'is_internal' => false,
        ]);

        // Update ticket status
        $ticket->update([
            'status' => 'awaiting_reply',
            'last_reply_at' => now(),
        ]);

        return response()->json([
            'message' => 'Reply added successfully',
            'reply' => $reply,
        ], 201);
    }

    /**
     * Close ticket
     */
    public function closeTicket(Request $request, $id)
    {
        $client = $this->getAuthenticatedClient($request);

        $ticket = $client->tickets()->findOrFail($id);
        $ticket->close();

        return response()->json([
            'message' => 'Ticket closed successfully',
        ]);
    }

    /**
     * Get payment methods (for making payments)
     */
    public function paymentMethods(Request $request)
    {
        $methods = [
            [
                'id' => 'vnpay',
                'name' => 'VNPay',
                'type' => 'gateway',
                'logo' => '/images/payment/vnpay.png',
                'enabled' => config('whmcs.payment_gateways.vnpay.enabled', false),
            ],
            [
                'id' => 'momo',
                'name' => 'MoMo',
                'type' => 'gateway',
                'logo' => '/images/payment/momo.png',
                'enabled' => config('whmcs.payment_gateways.momo.enabled', false),
            ],
            [
                'id' => 'bank_transfer',
                'name' => 'Bank Transfer',
                'type' => 'manual',
                'enabled' => true,
            ],
            [
                'id' => 'credit',
                'name' => 'Account Credit',
                'type' => 'credit',
                'enabled' => true,
            ],
        ];

        return response()->json(array_filter($methods, fn($m) => $m['enabled']));
    }

    /**
     * Helper method to get authenticated client
     */
    private function getAuthenticatedClient(Request $request): User
    {
        // TODO: Implement proper authentication
        // For now, get client from token or session
        $clientId = $request->header('X-Client-ID') ?? $request->input('client_id');
        
        return User::findOrFail($clientId);
    }
}
