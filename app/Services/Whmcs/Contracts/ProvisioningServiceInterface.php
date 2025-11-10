<?php

namespace App\Services\Whmcs\Contracts;

use App\Models\Whmcs\Service;

interface ProvisioningServiceInterface
{
    /**
     * Tạo hosting account mới trên server
     *
     * @param int $serviceId
     * @param array $params ['domain' => 'example.com', 'username' => 'user123', 'password' => '...', 'email' => '...']
     * @return array ['success' => true, 'message' => '...', 'account_data' => [...]]
     */
    public function provisionHostingAccount(int $serviceId, array $params): array;

    /**
     * Suspend hosting account (tạm ngưng)
     *
     * @param int $serviceId
     * @param string $reason Lý do suspend
     * @return array ['success' => true, 'message' => 'Account suspended']
     */
    public function suspendAccount(int $serviceId, string $reason): array;

    /**
     * Unsuspend hosting account (khôi phục)
     *
     * @param int $serviceId
     * @return array ['success' => true, 'message' => 'Account unsuspended']
     */
    public function unsuspendAccount(int $serviceId): array;

    /**
     * Terminate hosting account (xóa vĩnh viễn)
     *
     * @param int $serviceId
     * @param bool $deleteBackups Xóa cả backup files
     * @return array ['success' => true, 'message' => 'Account terminated']
     */
    public function terminateAccount(int $serviceId, bool $deleteBackups = false): array;

    /**
     * Thay đổi mật khẩu hosting account
     *
     * @param int $serviceId
     * @param string $newPassword
     * @return array ['success' => true, 'message' => 'Password changed']
     */
    public function changePassword(int $serviceId, string $newPassword): array;

    /**
     * Thay đổi gói hosting (upgrade/downgrade)
     *
     * @param int $serviceId
     * @param int $newProductId
     * @param bool $prorata Tính tiền theo tỷ lệ
     * @return array ['success' => true, 'message' => '...', 'invoice_id' => 123, 'amount_due' => 50000]
     */
    public function changePackage(int $serviceId, int $newProductId, bool $prorata = true): array;

    /**
     * Register domain mới (qua API registry như VNNIC, GoDaddy, ...)
     *
     * @param int $serviceId Service type = domain
     * @param array $params ['domain' => 'example.com', 'years' => 1, 'nameservers' => [...], 'contact_info' => [...]]
     * @return array ['success' => true, 'message' => 'Domain registered', 'expiry_date' => '2026-12-31']
     */
    public function registerDomain(int $serviceId, array $params): array;

    /**
     * Renew domain (gia hạn)
     *
     * @param int $serviceId
     * @param int $years Số năm gia hạn
     * @return array ['success' => true, 'message' => 'Domain renewed', 'new_expiry_date' => '2027-12-31']
     */
    public function renewDomain(int $serviceId, int $years = 1): array;

    /**
     * Transfer domain từ nhà đăng ký khác
     *
     * @param int $serviceId
     * @param array $params ['domain' => 'example.com', 'epp_code' => 'ABC123XYZ']
     * @return array ['success' => true, 'message' => 'Transfer initiated', 'status' => 'pending']
     */
    public function transferDomain(int $serviceId, array $params): array;

    /**
     * Cập nhật nameservers của domain
     *
     * @param int $serviceId
     * @param array $nameservers ['ns1.example.com', 'ns2.example.com']
     * @return array ['success' => true, 'message' => 'Nameservers updated']
     */
    public function updateNameservers(int $serviceId, array $nameservers): array;

    /**
     * Tự động provision khi invoice được thanh toán
     *
     * @param int $invoiceId
     * @return array ['provisioned_services' => [...], 'failed_services' => [...]]
     */
    public function autoProvisionFromInvoice(int $invoiceId): array;

    /**
     * Lấy thông tin đăng nhập của service
     *
     * @param int $serviceId
     * @return array ['username' => '...', 'password' => '...', 'server_ip' => '...', 'control_panel_url' => '...']
     */
    public function getServiceCredentials(int $serviceId): array;
}
