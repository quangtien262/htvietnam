<?php

namespace App\Services\Whmcs;

use App\Models\Whmcs\ApiKey;
use App\Models\Whmcs\ApiLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ApiKeyService
{
    /**
     * Create a new API key
     */
    public function createApiKey(array $data): ApiKey
    {
        $key = ApiKey::generateKey();
        $secret = ApiKey::generateSecret();

        return ApiKey::create([
            'client_id' => $data['client_id'] ?? null,
            'admin_user_id' => $data['admin_user_id'] ?? null,
            'name' => $data['name'],
            'key' => $key,
            'secret' => hash('sha256', $secret), // Store hashed secret
            'permissions' => $data['permissions'] ?? [],
            'allowed_ips' => $data['allowed_ips'] ?? null,
            'status' => 'active',
            'expires_at' => $data['expires_at'] ?? null,
        ]);
    }

    /**
     * Validate API key and secret
     */
    public function validateCredentials(string $key, string $secret): ?ApiKey
    {
        $apiKey = ApiKey::where('key', $key)
                       ->where('status', 'active')
                       ->first();

        if (!$apiKey) {
            return null;
        }

        if (!$apiKey->isActive()) {
            return null;
        }

        if (!$apiKey->verifySecret($secret)) {
            return null;
        }

        return $apiKey;
    }

    /**
     * Check if API key has permission
     */
    public function checkPermission(ApiKey $apiKey, string $permission): bool
    {
        return $apiKey->hasPermission($permission);
    }

    /**
     * Check if IP is allowed
     */
    public function checkIpAddress(ApiKey $apiKey, string $ip): bool
    {
        return $apiKey->isIpAllowed($ip);
    }

    /**
     * Log API request
     */
    public function logRequest(
        ApiKey $apiKey,
        string $endpoint,
        string $method,
        array $requestData,
        array $responseData,
        int $responseCode,
        string $ipAddress,
        string $userAgent,
        float $executionTime
    ): ApiLog {
        return ApiLog::create([
            'api_key_id' => $apiKey->id,
            'endpoint' => $endpoint,
            'method' => $method,
            'request_data' => $requestData,
            'response_data' => $responseData,
            'response_code' => $responseCode,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'execution_time' => $executionTime,
        ]);
    }

    /**
     * Update API key last used timestamp
     */
    public function updateLastUsed(ApiKey $apiKey): void
    {
        $apiKey->updateLastUsed();
    }

    /**
     * Revoke API key
     */
    public function revokeApiKey(int $apiKeyId): bool
    {
        $apiKey = ApiKey::find($apiKeyId);

        if (!$apiKey) {
            return false;
        }

        $apiKey->revoke();
        return true;
    }

    /**
     * Regenerate API secret
     */
    public function regenerateSecret(int $apiKeyId): ?array
    {
        $apiKey = ApiKey::find($apiKeyId);

        if (!$apiKey) {
            return null;
        }

        $newSecret = ApiKey::generateSecret();
        $apiKey->update([
            'secret' => hash('sha256', $newSecret),
        ]);

        return [
            'key' => $apiKey->key,
            'secret' => $newSecret, // Return plain secret only once
        ];
    }

    /**
     * Update API key permissions
     */
    public function updatePermissions(int $apiKeyId, array $permissions): bool
    {
        $apiKey = ApiKey::find($apiKeyId);

        if (!$apiKey) {
            return false;
        }

        $apiKey->update(['permissions' => $permissions]);
        return true;
    }

    /**
     * Update allowed IPs
     */
    public function updateAllowedIps(int $apiKeyId, ?string $allowedIps): bool
    {
        $apiKey = ApiKey::find($apiKeyId);

        if (!$apiKey) {
            return false;
        }

        $apiKey->update(['allowed_ips' => $allowedIps]);
        return true;
    }

    /**
     * Get API usage statistics
     */
    public function getUsageStats(int $apiKeyId, ?string $startDate = null, ?string $endDate = null): array
    {
        $query = ApiLog::where('api_key_id', $apiKeyId);

        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        return [
            'total_requests' => $query->count(),
            'successful_requests' => (clone $query)->successful()->count(),
            'failed_requests' => (clone $query)->errors()->count(),
            'avg_execution_time' => round($query->avg('execution_time'), 2),
            'max_execution_time' => round($query->max('execution_time'), 2),
            'requests_by_endpoint' => (clone $query)
                ->select('endpoint', DB::raw('count(*) as count'))
                ->groupBy('endpoint')
                ->get()
                ->toArray(),
            'requests_by_status' => (clone $query)
                ->select('response_code', DB::raw('count(*) as count'))
                ->groupBy('response_code')
                ->get()
                ->toArray(),
        ];
    }

    /**
     * Clean up expired API keys
     */
    public function cleanupExpiredKeys(): int
    {
        return ApiKey::expired()
                    ->where('status', 'active')
                    ->update(['status' => 'inactive']);
    }

    /**
     * Get all API keys for a client
     */
    public function getClientApiKeys(int $clientId): \Illuminate\Database\Eloquent\Collection
    {
        return ApiKey::where('client_id', $clientId)
                    ->orderBy('created_at', 'desc')
                    ->get();
    }

    /**
     * Get all API keys for admin user
     */
    public function getAdminApiKeys(int $adminUserId): \Illuminate\Database\Eloquent\Collection
    {
        return ApiKey::where('admin_user_id', $adminUserId)
                    ->orderBy('created_at', 'desc')
                    ->get();
    }
}
