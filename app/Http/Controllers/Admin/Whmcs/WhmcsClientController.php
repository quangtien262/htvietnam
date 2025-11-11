<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\WhmcsClient;
use App\Services\Admin\WhmcsClientService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class WhmcsClientController extends Controller
{
    protected $service;

    public function __construct(WhmcsClientService $service)
    {
        $this->service = $service;
    }

    public function apiList(Request $request)
    {
        try {
            $perPage = $request->input('perPage', 20);
            $search = $request->input('search', '');
            $status = $request->input('status', '');
            $clientGroup = $request->input('client_group', '');

            $query = WhmcsClient::with(['currency', 'services', 'invoices']);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('firstname', 'like', "%{$search}%")
                        ->orWhere('lastname', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('company', 'like', "%{$search}%");
                });
            }

            if ($status) {
                $query->where('status', $status);
            }

            if ($clientGroup) {
                $query->where('client_group_id', $clientGroup);
            }

            $clients = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $clients
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
            $client = WhmcsClient::with([
                'currency',
                'services.product',
                'invoices',
                'orders',
                'domains',
                'tickets',
                'notes',
                'activityLogs'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $client
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
                'firstname' => 'required|string|max:255',
                'lastname' => 'required|string|max:255',
                'email' => 'required|email|unique:whmcs_clients,email',
                'company' => 'nullable|string|max:255',
                'address1' => 'required|string',
                'address2' => 'nullable|string',
                'city' => 'required|string|max:100',
                'state' => 'nullable|string|max:100',
                'postcode' => 'nullable|string|max:20',
                'country' => 'required|string|max:2',
                'phone' => 'required|string|max:20',
                'password' => 'required|string|min:6',
                'currency_id' => 'required|exists:whmcs_currencies,id',
                'status' => 'nullable|string|in:Active,Inactive,Closed',
                'notes' => 'nullable|string'
            ]);

            $validated['password'] = Hash::make($validated['password']);
            $validated['status'] = $validated['status'] ?? 'Active';

            $client = WhmcsClient::create($validated);

            // Log activity
            $this->service->logActivity($client->id, 'Client Created', 'New client account created');

            return response()->json([
                'success' => true,
                'message' => 'Tạo khách hàng thành công',
                'data' => $client
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiUpdate(Request $request, $id)
    {
        try {
            $client = WhmcsClient::findOrFail($id);

            $validated = $request->validate([
                'firstname' => 'string|max:255',
                'lastname' => 'string|max:255',
                'email' => 'email|unique:whmcs_clients,email,' . $id,
                'company' => 'nullable|string|max:255',
                'address1' => 'string',
                'address2' => 'nullable|string',
                'city' => 'string|max:100',
                'state' => 'nullable|string|max:100',
                'postcode' => 'nullable|string|max:20',
                'country' => 'string|max:2',
                'phone' => 'string|max:20',
                'currency_id' => 'exists:whmcs_currencies,id',
                'status' => 'string|in:Active,Inactive,Closed',
                'credit' => 'numeric|min:0',
                'notes' => 'nullable|string'
            ]);

            if (isset($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            }

            $client->update($validated);

            // Log activity
            $this->service->logActivity($client->id, 'Client Updated', 'Client information updated');

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật khách hàng thành công',
                'data' => $client
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiDelete($id)
    {
        try {
            $client = WhmcsClient::findOrFail($id);

            // Check if client has active services
            if ($client->services()->where('status', 'Active')->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa khách hàng có dịch vụ đang hoạt động'
                ], 400);
            }

            $client->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa khách hàng thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiStatistics()
    {
        try {
            $stats = [
                'total_clients' => WhmcsClient::count(),
                'active_clients' => WhmcsClient::where('status', 'Active')->count(),
                'inactive_clients' => WhmcsClient::where('status', 'Inactive')->count(),
                'closed_clients' => WhmcsClient::where('status', 'Closed')->count(),
                'new_this_month' => WhmcsClient::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'total_credit' => WhmcsClient::sum('credit')
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
