<?php

namespace App\Services\Whmcs\Contracts;

use App\Models\Whmcs\Server;
use App\Models\Whmcs\Service;
use Illuminate\Support\Collection;

interface ServerManagementServiceInterface
{
    /**
     * Lấy server tốt nhất để tạo hosting account mới
     *
     * @param int $productId ID của sản phẩm hosting
     * @return Server|null
     */
    public function getBestAvailableServer(int $productId): ?Server;

    /**
     * Kiểm tra server có đủ tài nguyên không
     *
     * @param int $serverId
     * @param array $requirements ['disk' => 10240, 'bandwidth' => 100000, 'accounts' => 1]
     * @return bool
     */
    public function checkServerCapacity(int $serverId, array $requirements): bool;

    /**
     * Lấy thống kê sử dụng tài nguyên của server
     *
     * @param int $serverId
     * @return array ['disk_usage' => 50.5, 'bandwidth_usage' => 30.2, 'account_count' => 150, ...]
     */
    public function getServerUsageStats(int $serverId): array;

    /**
     * Cập nhật trạng thái server (online/offline)
     *
     * @param int $serverId
     * @param bool $isActive
     * @param string|null $reason
     * @return Server
     */
    public function updateServerStatus(int $serverId, bool $isActive, ?string $reason = null): Server;

    /**
     * Đồng bộ danh sách account từ cPanel/Plesk API
     *
     * @param int $serverId
     * @return array ['synced' => 10, 'failed' => 0, 'errors' => [...]]
     */
    public function syncServerAccounts(int $serverId): array;

    /**
     * Lấy danh sách server theo nhóm
     *
     * @param int|null $groupId null = tất cả server
     * @param bool $activeOnly Chỉ lấy server đang hoạt động
     * @return Collection
     */
    public function getServersByGroup(?int $groupId = null, bool $activeOnly = true): Collection;

    /**
     * Test kết nối đến server (cPanel/Plesk API)
     *
     * @param int $serverId
     * @return array ['success' => true, 'message' => 'Connected successfully', 'version' => 'cPanel 110.0', 'response_time' => 0.5]
     */
    public function testServerConnection(int $serverId): array;

    /**
     * Migrate service từ server này sang server khác
     *
     * @param int $serviceId
     * @param int $targetServerId
     * @param bool $autoBackup Tự động backup trước khi migrate
     * @return array ['success' => true, 'old_server' => 1, 'new_server' => 2, 'backup_file' => '...']
     */
    public function migrateService(int $serviceId, int $targetServerId, bool $autoBackup = true): array;

    /**
     * Lấy server recommendations dựa trên load balancing
     *
     * @param int $productId
     * @param int $limit Số lượng server gợi ý
     * @return Collection
     */
    public function getRecommendedServers(int $productId, int $limit = 3): Collection;
}
