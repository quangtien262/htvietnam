<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\Webhook;
use App\Services\Whmcs\WebhookService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WebhookController extends Controller
{
    protected $webhookService;

    public function __construct(WebhookService $webhookService)
    {
        $this->webhookService = $webhookService;
    }

    /**
     * Get list of webhooks
     */
    public function index(Request $request)
    {
        $query = Webhook::query()->with('recentLogs');

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('url', 'like', '%' . $request->search . '%');
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $webhooks = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json($webhooks);
    }

    /**
     * Get webhook details
     */
    public function show($id)
    {
        $webhook = Webhook::with(['logs' => function($query) {
            $query->latest()->limit(50);
        }])->findOrFail($id);

        $statistics = $this->webhookService->getStatistics($webhook);

        return response()->json([
            'webhook' => $webhook,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Create new webhook
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'url' => 'required|url',
            'secret' => 'nullable|string',
            'events' => 'required|array|min:1',
            'events.*' => 'string|in:' . implode(',', array_keys(Webhook::availableEvents())),
            'content_type' => 'nullable|string|in:application/json,application/x-www-form-urlencoded',
            'custom_headers' => 'nullable|array',
            'retry_attempts' => 'nullable|integer|min:0|max:10',
            'timeout' => 'nullable|integer|min:5|max:120',
            'verify_ssl' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $webhook = Webhook::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Webhook created successfully',
            'data' => $webhook,
        ], 201);
    }

    /**
     * Update webhook
     */
    public function update(Request $request, $id)
    {
        $webhook = Webhook::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'url' => 'sometimes|required|url',
            'secret' => 'nullable|string',
            'events' => 'sometimes|required|array|min:1',
            'events.*' => 'string|in:' . implode(',', array_keys(Webhook::availableEvents())),
            'is_active' => 'nullable|boolean',
            'content_type' => 'nullable|string|in:application/json,application/x-www-form-urlencoded',
            'custom_headers' => 'nullable|array',
            'retry_attempts' => 'nullable|integer|min:0|max:10',
            'timeout' => 'nullable|integer|min:5|max:120',
            'verify_ssl' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $webhook->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Webhook updated successfully',
            'data' => $webhook,
        ]);
    }

    /**
     * Delete webhook
     */
    public function destroy($id)
    {
        $webhook = Webhook::findOrFail($id);
        $webhook->delete();

        return response()->json([
            'success' => true,
            'message' => 'Webhook deleted successfully',
        ]);
    }

    /**
     * Toggle webhook active status
     */
    public function toggleActive($id)
    {
        $webhook = Webhook::findOrFail($id);
        $webhook->update(['is_active' => !$webhook->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Webhook status updated',
            'data' => $webhook,
        ]);
    }

    /**
     * Test webhook
     */
    public function test($id)
    {
        $webhook = Webhook::findOrFail($id);
        $result = $this->webhookService->testWebhook($webhook);

        return response()->json($result);
    }

    /**
     * Get webhook logs
     */
    public function logs(Request $request, $id)
    {
        $webhook = Webhook::findOrFail($id);
        
        $query = $webhook->logs();

        if ($request->has('success')) {
            $query->where('success', $request->success);
        }

        if ($request->has('event')) {
            $query->where('event', $request->event);
        }

        $logs = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json($logs);
    }

    /**
     * Get available webhook events
     */
    public function availableEvents()
    {
        return response()->json([
            'events' => Webhook::availableEvents(),
        ]);
    }

    /**
     * Retry failed webhook
     */
    public function retry($id, $logId)
    {
        $webhook = Webhook::findOrFail($id);
        $log = $webhook->logs()->findOrFail($logId);

        if ($log->success) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot retry successful webhook',
            ], 400);
        }

        $success = $this->webhookService->sendWebhook(
            $webhook,
            $log->event,
            $log->payload['data'] ?? []
        );

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Webhook retry successful' : 'Webhook retry failed',
        ]);
    }
}
