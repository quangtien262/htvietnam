<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\Service;
use App\Services\Whmcs\Contracts\ProvisioningServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    public function __construct(
        protected ProvisioningServiceInterface $provisioning
    ) {}

    /**
     * Danh sách services
     */
    public function index(Request $request): JsonResponse
    {
        $query = Service::with(['client', 'product', 'server']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('server_id')) {
            $query->where('server_id', $request->server_id);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('domain', 'like', "%{$request->search}%")
                  ->orWhere('username', 'like', "%{$request->search}%");
            });
        }

        $services = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($services);
    }

    /**
     * Tạo service mới
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:whmcs_products,id',
            'domain' => 'required|string|max:255',
            'billing_cycle' => 'required|string|in:monthly,quarterly,semiannually,annually,biennially,triennially',
            'recurring_amount' => 'required|numeric|min:0',
            'registration_date' => 'nullable|date',
            'next_due_date' => 'required|date',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string',
            'auto_provision' => 'boolean',
        ]);

        $service = Service::create([
            'client_id' => $validated['client_id'],
            'product_id' => $validated['product_id'],
            'domain' => $validated['domain'],
            'payment_cycle' => $validated['billing_cycle'], // Map billing_cycle to payment_cycle
            'recurring_amount' => $validated['recurring_amount'],
            'registration_date' => $validated['registration_date'] ?? now(),
            'next_due_date' => $validated['next_due_date'],
            'status' => 'pending',
        ]);

        // Auto provision nếu được yêu cầu
        if ($request->boolean('auto_provision')) {
            $result = $this->provisioning->provisionHostingAccount($service->id, [
                'domain' => $validated['domain'],
                'username' => $validated['username'] ?? null,
                'password' => $validated['password'] ?? null,
            ]);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Service created but provisioning failed: ' . $result['message'],
                    'data' => $service,
                ], 201);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Service created successfully',
            'data' => $service->fresh(['client', 'product', 'server']),
        ], 201);
    }

    /**
     * Chi tiết service
     */
    public function show(int $id): JsonResponse
    {
        $service = Service::with(['client', 'product', 'server'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $service,
        ]);
    }

    /**
     * Cập nhật service
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'domain' => 'sometimes|string|max:255',
            'status' => 'sometimes|string|in:pending,active,suspended,terminated,cancelled',
            'billing_cycle' => 'sometimes|string|in:monthly,quarterly,semiannually,annually,biennially,triennially',
            'recurring_amount' => 'sometimes|numeric|min:0',
            'next_due_date' => 'sometimes|date',
            'disk_limit' => 'sometimes|integer|min:0',
            'bandwidth_limit' => 'sometimes|integer|min:0',
        ]);

        $service->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Service updated successfully',
            'data' => $service->fresh(),
        ]);
    }

    /**
     * Provision service
     */
    public function provision(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'domain' => 'sometimes|string',
            'username' => 'nullable|string',
            'password' => 'nullable|string',
            'email' => 'nullable|email',
        ]);

        $result = $this->provisioning->provisionHostingAccount($id, $validated);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Suspend service
     */
    public function suspend(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $service = Service::findOrFail($id);
        $service->suspend();

        return response()->json([
            'success' => true,
            'message' => 'Service suspended successfully',
            'data' => $service->fresh(),
        ]);
    }

    /**
     * Unsuspend service
     */
    public function unsuspend(int $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        $service->update(['status' => 'active']);

        return response()->json([
            'success' => true,
            'message' => 'Service unsuspended successfully',
            'data' => $service->fresh(),
        ]);
    }

    /**
     * Terminate service
     */
    public function terminate(Request $request, int $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        $service->terminate();

        return response()->json([
            'success' => true,
            'message' => 'Service terminated successfully',
            'data' => $service->fresh(),
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $result = $this->provisioning->changePassword($id, $validated['password']);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Change package (upgrade/downgrade)
     */
    public function changePackage(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'new_product_id' => 'required|exists:whmcs_products,id',
            'prorata' => 'boolean',
        ]);

        $result = $this->provisioning->changePackage(
            $id,
            $validated['new_product_id'],
            $validated['prorata'] ?? true
        );

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Lấy thông tin đăng nhập service
     */
    public function credentials(int $id): JsonResponse
    {
        try {
            $credentials = $this->provisioning->getServiceCredentials($id);

            return response()->json([
                'success' => true,
                'data' => $credentials,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
