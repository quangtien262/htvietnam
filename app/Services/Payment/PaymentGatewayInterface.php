<?php

namespace App\Services\Payment;

interface PaymentGatewayInterface
{
    /**
     * Create payment URL for customer to pay
     */
    public function createPaymentUrl(array $data): string;

    /**
     * Handle payment callback/IPN from gateway
     */
    public function handleCallback(array $data): array;

    /**
     * Verify payment signature
     */
    public function verifySignature(array $data): bool;

    /**
     * Query payment status from gateway
     */
    public function queryTransaction(string $transactionId): array;

    /**
     * Process refund
     */
    public function refund(string $transactionId, float $amount): array;
}
