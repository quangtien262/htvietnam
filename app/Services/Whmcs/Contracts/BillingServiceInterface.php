<?php

namespace App\Services\Whmcs\Contracts;

use App\Models\Whmcs\Invoice;
use App\Models\User;
use Illuminate\Support\Collection;

interface BillingServiceInterface
{
    /**
     * Tạo hóa đơn mới cho khách hàng
     *
     * @param int $clientId
     * @param array $items [['product_id' => 1, 'description' => 'Web Hosting', 'amount' => 100000, 'quantity' => 1]]
     * @param array $options ['due_date' => '2025-12-31', 'notes' => '...']
     * @return Invoice
     */
    public function createInvoice(int $clientId, array $items, array $options = []): Invoice;

    /**
     * Tạo hóa đơn cho service (hosting/domain) khi gia hạn
     *
     * @param int $serviceId
     * @param string $billingCycle (monthly, quarterly, semiannually, annually, biennially, triennially)
     * @return Invoice
     */
    public function createServiceRenewalInvoice(int $serviceId, string $billingCycle): Invoice;

    /**
     * Thanh toán hóa đơn
     *
     * @param int $invoiceId
     * @param float $amount
     * @param string $paymentMethod (bank_transfer, vnpay, momo, cash, credit)
     * @param array $metadata ['transaction_id' => '...', 'gateway_response' => [...]]
     * @return Invoice
     */
    public function recordPayment(int $invoiceId, float $amount, string $paymentMethod, array $metadata = []): Invoice;

    /**
     * Hủy hóa đơn
     *
     * @param int $invoiceId
     * @param string|null $reason
     * @return Invoice
     */
    public function cancelInvoice(int $invoiceId, ?string $reason = null): Invoice;

    /**
     * Lấy danh sách hóa đơn đã quá hạn
     *
     * @param int|null $daysOverdue Số ngày quá hạn (null = tất cả)
     * @return Collection
     */
    public function getOverdueInvoices(?int $daysOverdue = null): Collection;

    /**
     * Gửi nhắc nhở thanh toán qua email
     *
     * @param int $invoiceId
     * @param string $type (first, second, third, overdue)
     * @return bool
     */
    public function sendPaymentReminder(int $invoiceId, string $type = 'first'): bool;

    /**
     * Áp dụng credit của khách hàng vào hóa đơn
     *
     * @param int $invoiceId
     * @param float|null $amount Số tiền credit sử dụng (null = dùng hết credit khả dụng)
     * @return Invoice
     */
    public function applyCreditToInvoice(int $invoiceId, ?float $amount = null): Invoice;

    /**
     * Thêm credit vào tài khoản khách hàng
     *
     * @param int $clientId
     * @param float $amount
     * @param string $description
     * @return User
     */
    public function addCredit(int $clientId, float $amount, string $description): User;

    /**
     * Tính tổng doanh thu theo khoảng thời gian
     *
     * @param string $startDate
     * @param string $endDate
     * @param string|null $status (paid, unpaid, cancelled, refunded)
     * @return array ['total' => 1000000, 'count' => 50, 'breakdown' => [...]]
     */
    public function getRevenue(string $startDate, string $endDate, ?string $status = 'paid'): array;
}
