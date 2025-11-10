<?php

namespace App\Services\Whmcs;

use App\Models\Whmcs\Server;
use App\Models\Whmcs\Service;
use App\Services\Whmcs\Contracts\ServerManagementServiceInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class ServerManagementService implements ServerManagementServiceInterface
{
    public function getBestAvailableServer(int $productId): ?Server
    {
        $servers = Server::where('active', true)
            ->whereHas('products', function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })
            ->get();

        if ($servers->isEmpty()) {
            return null;
        }

        // Sort by available capacity (lowest usage first)
        return $servers->sortBy(function ($server) {
            $stats = $this->getServerUsageStats($server->id);
            return $stats['disk_usage'] + $stats['account_count_percentage'];
        })->first();
    }

    public function checkServerCapacity(int $serverId, array $requirements): bool
    {
        $server = Server::findOrFail($serverId);
        $stats = $this->getServerUsageStats($serverId);

        $diskAvailable = $server->max_disk_space - ($server->max_disk_space * $stats['disk_usage'] / 100);
        $accountsAvailable = $server->max_accounts - $stats['account_count'];

        return $diskAvailable >= ($requirements['disk'] ?? 0) 
            && $accountsAvailable >= ($requirements['accounts'] ?? 1);
    }

    public function getServerUsageStats(int $serverId): array
    {
        $server = Server::findOrFail($serverId);

        $activeServices = Service::where('server_id', $serverId)
            ->where('status', 'active')
            ->get();

        $totalDiskUsed = $activeServices->sum('disk_usage');
        $totalBandwidthUsed = $activeServices->sum('bandwidth_usage');
        $accountCount = $activeServices->count();

        return [
            'disk_usage' => $server->max_disk_space > 0 
                ? round(($totalDiskUsed / $server->max_disk_space) * 100, 2) 
                : 0,
            'bandwidth_usage' => $server->max_bandwidth > 0 
                ? round(($totalBandwidthUsed / $server->max_bandwidth) * 100, 2) 
                : 0,
            'account_count' => $accountCount,
            'account_count_percentage' => $server->max_accounts > 0 
                ? round(($accountCount / $server->max_accounts) * 100, 2) 
                : 0,
            'total_disk_used' => $totalDiskUsed,
            'total_bandwidth_used' => $totalBandwidthUsed,
            'disk_available' => max(0, $server->max_disk_space - $totalDiskUsed),
            'bandwidth_available' => max(0, $server->max_bandwidth - $totalBandwidthUsed),
            'accounts_available' => max(0, $server->max_accounts - $accountCount),
        ];
    }

    public function updateServerStatus(int $serverId, bool $isActive, ?string $reason = null): Server
    {
        $server = Server::findOrFail($serverId);
        
        $server->update([
            'active' => $isActive,
            'status_reason' => $reason,
        ]);

        Log::info("Server #{$serverId} status updated", [
            'server_id' => $serverId,
            'active' => $isActive,
            'reason' => $reason,
        ]);

        return $server;
    }

    public function syncServerAccounts(int $serverId): array
    {
        $server = Server::with('services')->findOrFail($serverId);
        
        $synced = 0;
        $failed = 0;
        $errors = [];

        try {
            $remoteAccounts = $this->fetchAccountsFromPanel($server);

            foreach ($remoteAccounts as $account) {
                try {
                    $service = Service::where('server_id', $serverId)
                        ->where('username', $account['username'])
                        ->first();

                    if ($service) {
                        $service->update([
                            'disk_usage' => $account['disk_usage'] ?? 0,
                            'bandwidth_usage' => $account['bandwidth_usage'] ?? 0,
                        ]);
                        $synced++;
                    }
                } catch (\Exception $e) {
                    $failed++;
                    $errors[] = "Failed to sync {$account['username']}: {$e->getMessage()}";
                }
            }

            Log::info("Server #{$serverId} accounts synced", [
                'synced' => $synced,
                'failed' => $failed,
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to fetch accounts from server #{$serverId}", [
                'error' => $e->getMessage(),
            ]);
            $errors[] = $e->getMessage();
        }

        return [
            'synced' => $synced,
            'failed' => $failed,
            'errors' => $errors,
        ];
    }

    public function getServersByGroup(?int $groupId = null, bool $activeOnly = true): Collection
    {
        $query = Server::query();

        if ($groupId !== null) {
            $query->where('server_group_id', $groupId);
        }

        if ($activeOnly) {
            $query->where('active', true);
        }

        return $query->with('group')->get();
    }

    public function testServerConnection(int $serverId): array
    {
        $server = Server::findOrFail($serverId);
        
        try {
            $startTime = microtime(true);
            
            $response = $this->callPanelAPI($server, 'version');
            
            $responseTime = round((microtime(true) - $startTime), 2);

            if ($response['success']) {
                return [
                    'success' => true,
                    'message' => 'Connected successfully',
                    'version' => $response['data']['version'] ?? 'Unknown',
                    'response_time' => $responseTime,
                ];
            }

            return [
                'success' => false,
                'message' => $response['message'] ?? 'Connection failed',
                'response_time' => $responseTime,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'response_time' => 0,
            ];
        }
    }

    public function migrateService(int $serviceId, int $targetServerId, bool $autoBackup = true): array
    {
        $service = Service::findOrFail($serviceId);
        $oldServer = $service->server;
        $newServer = Server::findOrFail($targetServerId);

        $backupFile = null;

        try {
            if ($autoBackup) {
                $backupFile = $this->createBackup($service, $oldServer);
            }

            // Restore on new server
            $this->restoreBackup($service, $newServer, $backupFile);

            // Update service
            $service->update([
                'server_id' => $targetServerId,
            ]);

            Log::info("Service #{$serviceId} migrated", [
                'service_id' => $serviceId,
                'old_server' => $oldServer->id,
                'new_server' => $newServer->id,
            ]);

            return [
                'success' => true,
                'old_server' => $oldServer->id,
                'new_server' => $newServer->id,
                'backup_file' => $backupFile,
            ];

        } catch (\Exception $e) {
            Log::error("Service migration failed", [
                'service_id' => $serviceId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getRecommendedServers(int $productId, int $limit = 3): Collection
    {
        return Server::where('active', true)
            ->whereHas('products', function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })
            ->get()
            ->sortBy(function ($server) {
                $stats = $this->getServerUsageStats($server->id);
                return $stats['disk_usage'] + $stats['account_count_percentage'];
            })
            ->take($limit)
            ->values();
    }

    // Helper methods for cPanel/Plesk API integration

    protected function fetchAccountsFromPanel(Server $server): array
    {
        $response = $this->callPanelAPI($server, 'listaccts');
        
        if (!$response['success']) {
            throw new \Exception("Failed to fetch accounts: {$response['message']}");
        }

        return $response['data'] ?? [];
    }

    protected function callPanelAPI(Server $server, string $action, array $params = []): array
    {
        // cPanel WHM API example
        if ($server->type === 'cpanel') {
            return $this->callCPanelAPI($server, $action, $params);
        }

        // Plesk API example
        if ($server->type === 'plesk') {
            return $this->callPleskAPI($server, $action, $params);
        }

        return ['success' => false, 'message' => 'Unsupported server type'];
    }

    protected function callCPanelAPI(Server $server, string $action, array $params = []): array
    {
        try {
            $url = "https://{$server->hostname}:2087/json-api/{$action}";
            
            $response = Http::withHeaders([
                'Authorization' => 'WHM ' . $server->username . ':' . $server->access_hash,
            ])->get($url, $params);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => $response->body(),
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    protected function callPleskAPI(Server $server, string $action, array $params = []): array
    {
        // TODO: Implement Plesk API integration
        return ['success' => false, 'message' => 'Plesk API not implemented yet'];
    }

    protected function createBackup(Service $service, Server $server): string
    {
        // TODO: Implement backup creation via cPanel API
        return "/backups/{$service->username}-" . time() . ".tar.gz";
    }

    protected function restoreBackup(Service $service, Server $server, string $backupFile): void
    {
        // TODO: Implement backup restoration via cPanel API
    }
}
