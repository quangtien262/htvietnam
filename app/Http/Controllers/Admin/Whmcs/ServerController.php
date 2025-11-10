<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\Server;
use App\Models\Whmcs\ServerGroup;
use App\Services\Whmcs\Contracts\ServerManagementServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ServerController extends Controller
{
    public function __construct(
        protected ServerManagementServiceInterface $serverManagement
    ) {}

    /**
     * Danh sách servers
     */
    public function index(Request $request): JsonResponse
    {
        $query = Server::with('group');

        if ($request->has('group_id')) {
            $query->where('server_group_id', $request->group_id);
        }

        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $servers = $query->get();

        // Thêm usage stats cho mỗi server
        $servers->each(function ($server) {
            $server->usage_stats = $this->serverManagement->getServerUsageStats($server->id);
        });

        return response()->json([
            'success' => true,
            'data' => $servers,
        ]);
    }

    /**
     * Tạo server mới
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'hostname' => 'required|string|max:255',
            'ip_address' => 'required|ip',
            'type' => 'required|string|in:cpanel,plesk,directadmin,other',
            'username' => 'required|string|max:255',
            'password' => 'nullable|string',
            'access_hash' => 'nullable|string',
            'port' => 'nullable|integer',
            'nameserver1' => 'nullable|string',
            'nameserver2' => 'nullable|string',
            'max_accounts' => 'nullable|integer|min:0',
            'max_disk_space' => 'nullable|integer|min:0',
            'max_bandwidth' => 'nullable|integer|min:0',
            'server_group_id' => 'nullable|exists:whmcs_server_groups,id',
            'active' => 'boolean',
        ]);

        $server = Server::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Server created successfully',
            'data' => $server,
        ], 201);
    }

    /**
     * Chi tiết server
     */
    public function show(int $id): JsonResponse
    {
        $server = Server::with(['group', 'services'])->findOrFail($id);
        $server->usage_stats = $this->serverManagement->getServerUsageStats($id);

        return response()->json([
            'success' => true,
            'data' => $server,
        ]);
    }

    /**
     * Cập nhật server
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $server = Server::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'hostname' => 'sometimes|string|max:255',
            'ip_address' => 'sometimes|ip',
            'type' => 'sometimes|string|in:cpanel,plesk,directadmin,other',
            'username' => 'sometimes|string|max:255',
            'password' => 'nullable|string',
            'access_hash' => 'nullable|string',
            'port' => 'nullable|integer',
            'nameserver1' => 'nullable|string',
            'nameserver2' => 'nullable|string',
            'max_accounts' => 'nullable|integer|min:0',
            'max_disk_space' => 'nullable|integer|min:0',
            'max_bandwidth' => 'nullable|integer|min:0',
            'server_group_id' => 'nullable|exists:whmcs_server_groups,id',
            'active' => 'boolean',
        ]);

        $server->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Server updated successfully',
            'data' => $server->fresh(),
        ]);
    }

    /**
     * Xóa server
     */
    public function destroy(int $id): JsonResponse
    {
        $server = Server::findOrFail($id);

        // Kiểm tra xem còn service nào đang active không
        if ($server->services()->where('status', 'active')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete server with active services',
            ], 400);
        }

        $server->delete();

        return response()->json([
            'success' => true,
            'message' => 'Server deleted successfully',
        ]);
    }

    /**
     * Test kết nối server
     */
    public function testConnection(int $id): JsonResponse
    {
        $result = $this->serverManagement->testServerConnection($id);

        return response()->json([
            'success' => $result['success'],
            'data' => $result,
        ]);
    }

    /**
     * Đồng bộ accounts từ server
     */
    public function syncAccounts(int $id): JsonResponse
    {
        $result = $this->serverManagement->syncServerAccounts($id);

        return response()->json([
            'success' => $result['failed'] === 0,
            'message' => "Synced {$result['synced']} accounts, {$result['failed']} failed",
            'data' => $result,
        ]);
    }

    /**
     * Cập nhật trạng thái server
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'active' => 'required|boolean',
            'reason' => 'nullable|string',
        ]);

        $server = $this->serverManagement->updateServerStatus(
            $id,
            $validated['active'],
            $validated['reason'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Server status updated successfully',
            'data' => $server,
        ]);
    }

    /**
     * Lấy server recommendations
     */
    public function recommendations(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:whmcs_products,id',
            'limit' => 'nullable|integer|min:1|max:10',
        ]);

        $servers = $this->serverManagement->getRecommendedServers(
            $validated['product_id'],
            $validated['limit'] ?? 3
        );

        return response()->json([
            'success' => true,
            'data' => $servers,
        ]);
    }

    /**
     * ===== SERVER GROUPS =====
     */

    /**
     * Danh sách server groups
     */
    public function groups(Request $request): JsonResponse
    {
        $groups = ServerGroup::withCount('servers')->get();

        return response()->json([
            'success' => true,
            'data' => $groups,
        ]);
    }

    /**
     * Tạo server group mới
     */
    public function storeGroup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $group = ServerGroup::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Server group created successfully',
            'data' => $group,
        ], 201);
    }

    /**
     * Cập nhật server group
     */
    public function updateGroup(Request $request, int $id): JsonResponse
    {
        $group = ServerGroup::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $group->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Server group updated successfully',
            'data' => $group,
        ]);
    }

    /**
     * Xóa server group
     */
    public function destroyGroup(int $id): JsonResponse
    {
        $group = ServerGroup::findOrFail($id);

        if ($group->servers()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete group with servers',
            ], 400);
        }

        $group->delete();

        return response()->json([
            'success' => true,
            'message' => 'Server group deleted successfully',
        ]);
    }
}
