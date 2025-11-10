<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Whmcs\ApiKeyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApiKeyController extends Controller
{
    protected ApiKeyService $apiKeyService;

    public function __construct(ApiKeyService $apiKeyService)
    {
        $this->apiKeyService = $apiKeyService;
    }

    /**
     * Get all API keys
     */
    public function index(Request $request): JsonResponse
    {
        $query = \App\Models\Whmcs\ApiKey::query();

        // Filter by client
        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        // Filter by admin user
        if ($request->has('admin_user_id')) {
            $query->where('admin_user_id', $request->admin_user_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $apiKeys = $query->with(['client', 'adminUser'])
                        ->orderBy('created_at', 'desc')
                        ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $apiKeys,
        ]);
    }

    /**
     * Get single API key
     */
    public function show(int $id): JsonResponse
    {
        $apiKey = \App\Models\Whmcs\ApiKey::with(['client', 'adminUser'])->find($id);

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'API key not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $apiKey,
        ]);
    }

    /**
     * Create new API key
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'client_id' => 'nullable|exists:users,id',
            'admin_user_id' => 'nullable|exists:admin_users,id',
            'permissions' => 'nullable|array',
            'allowed_ips' => 'nullable|string',
            'expires_at' => 'nullable|date|after:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Must have either client_id or admin_user_id
        if (!$request->client_id && !$request->admin_user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Either client_id or admin_user_id is required',
            ], 422);
        }

        $apiKey = $this->apiKeyService->createApiKey($request->all());

        // Get the plain secret (only shown once!)
        $secret = \App\Models\Whmcs\ApiKey::generateSecret();
        $apiKey->update(['secret' => hash('sha256', $secret)]);

        return response()->json([
            'success' => true,
            'message' => 'API key created successfully',
            'data' => [
                'api_key' => $apiKey,
                'key' => $apiKey->key,
                'secret' => $secret, // ONLY shown once!
                'warning' => 'Store the secret securely. It will not be shown again.',
            ],
        ], 201);
    }

    /**
     * Update API key
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $apiKey = \App\Models\Whmcs\ApiKey::find($id);

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'API key not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'permissions' => 'sometimes|array',
            'allowed_ips' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,revoked',
            'expires_at' => 'nullable|date|after:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $apiKey->update($request->only([
            'name',
            'permissions',
            'allowed_ips',
            'status',
            'expires_at',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'API key updated successfully',
            'data' => $apiKey->fresh(),
        ]);
    }

    /**
     * Revoke API key
     */
    public function revoke(int $id): JsonResponse
    {
        $success = $this->apiKeyService->revokeApiKey($id);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'API key not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'API key revoked successfully',
        ]);
    }

    /**
     * Regenerate API secret
     */
    public function regenerateSecret(int $id): JsonResponse
    {
        $credentials = $this->apiKeyService->regenerateSecret($id);

        if (!$credentials) {
            return response()->json([
                'success' => false,
                'message' => 'API key not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Secret regenerated successfully',
            'data' => [
                'key' => $credentials['key'],
                'secret' => $credentials['secret'], // ONLY shown once!
                'warning' => 'Store the new secret securely. It will not be shown again.',
            ],
        ]);
    }

    /**
     * Delete API key
     */
    public function destroy(int $id): JsonResponse
    {
        $apiKey = \App\Models\Whmcs\ApiKey::find($id);

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'API key not found',
            ], 404);
        }

        $apiKey->delete();

        return response()->json([
            'success' => true,
            'message' => 'API key deleted successfully',
        ]);
    }

    /**
     * Get API key usage statistics
     */
    public function statistics(Request $request, int $id): JsonResponse
    {
        $apiKey = \App\Models\Whmcs\ApiKey::find($id);

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'API key not found',
            ], 404);
        }

        $stats = $this->apiKeyService->getUsageStats(
            $id,
            $request->start_date,
            $request->end_date
        );

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get API logs
     */
    public function logs(Request $request, int $id): JsonResponse
    {
        $apiKey = \App\Models\Whmcs\ApiKey::find($id);

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'API key not found',
            ], 404);
        }

        $query = \App\Models\Whmcs\ApiLog::where('api_key_id', $id);

        // Filter by endpoint
        if ($request->has('endpoint')) {
            $query->where('endpoint', 'like', '%' . $request->endpoint . '%');
        }

        // Filter by method
        if ($request->has('method')) {
            $query->where('method', $request->input('method'));
        }

        // Filter by response code
        if ($request->has('response_code')) {
            $query->where('response_code', $request->response_code);
        }

        // Filter errors only
        if ($request->has('errors_only') && $request->errors_only) {
            $query->errors();
        }

        $logs = $query->orderBy('created_at', 'desc')
                     ->paginate($request->per_page ?? 50);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }
}
