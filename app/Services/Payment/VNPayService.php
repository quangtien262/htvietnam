<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Log;

class VNPayService implements PaymentGatewayInterface
{
    private $vnpUrl;
    private $vnpTmnCode;
    private $vnpHashSecret;
    private $vnpReturnUrl;

    public function __construct()
    {
        $this->vnpUrl = config('whmcs.payment_gateways.vnpay.url');
        $this->vnpTmnCode = config('whmcs.payment_gateways.vnpay.tmn_code');
        $this->vnpHashSecret = config('whmcs.payment_gateways.vnpay.hash_secret');
        
        // Build full URL for return_url (config now stores relative path)
        $returnPath = config('whmcs.payment_gateways.vnpay.return_url');
        $this->vnpReturnUrl = str_starts_with($returnPath, 'http') 
            ? $returnPath 
            : url($returnPath);
    }

    /**
     * Create VNPay payment URL
     * 
     * @param array $data [
     *   'invoice_id' => int,
     *   'amount' => float,
     *   'description' => string,
     *   'customer_ip' => string
     * ]
     */
    public function createPaymentUrl(array $data): string
    {
        $vnpData = [
            'vnp_Version' => '2.1.0',
            'vnp_Command' => 'pay',
            'vnp_TmnCode' => $this->vnpTmnCode,
            'vnp_Amount' => $data['amount'] * 100, // VNPay requires amount in VND * 100
            'vnp_CurrencyCode' => 'VND',
            'vnp_TxnRef' => $data['invoice_id'] . '_' . time(),
            'vnp_OrderInfo' => $data['description'] ?? 'Payment for invoice #' . $data['invoice_id'],
            'vnp_OrderType' => 'billpayment',
            'vnp_Locale' => 'vn',
            'vnp_ReturnUrl' => $this->vnpReturnUrl,
            'vnp_IpAddr' => $data['customer_ip'] ?? request()->ip(),
            'vnp_CreateDate' => date('YmdHis'),
        ];

        // Optional: Bank code for direct payment
        if (!empty($data['bank_code'])) {
            $vnpData['vnp_BankCode'] = $data['bank_code'];
        }

        // Sort params by key
        ksort($vnpData);

        // Build query string
        $query = http_build_query($vnpData);

        // Create secure hash
        $vnpSecureHash = hash_hmac('sha512', $query, $this->vnpHashSecret);

        // Final payment URL
        $paymentUrl = $this->vnpUrl . '?' . $query . '&vnp_SecureHash=' . $vnpSecureHash;

        Log::info('VNPay Payment URL Created', [
            'invoice_id' => $data['invoice_id'],
            'amount' => $data['amount'],
            'txn_ref' => $vnpData['vnp_TxnRef'],
        ]);

        return $paymentUrl;
    }

    /**
     * Handle VNPay IPN/Return callback
     */
    public function handleCallback(array $data): array
    {
        Log::info('VNPay Callback Received', $data);

        if (!$this->verifySignature($data)) {
            Log::error('VNPay Invalid Signature', $data);
            return [
                'success' => false,
                'message' => 'Invalid signature',
            ];
        }

        $responseCode = $data['vnp_ResponseCode'] ?? '';
        $transactionStatus = $data['vnp_TransactionStatus'] ?? '';

        // Parse invoice ID from vnp_TxnRef
        $txnRef = $data['vnp_TxnRef'] ?? '';
        $invoiceId = explode('_', $txnRef)[0] ?? null;

        return [
            'success' => $responseCode === '00' && $transactionStatus === '00',
            'invoice_id' => $invoiceId,
            'transaction_id' => $data['vnp_TransactionNo'] ?? null,
            'amount' => ($data['vnp_Amount'] ?? 0) / 100, // Convert back to normal amount
            'bank_code' => $data['vnp_BankCode'] ?? null,
            'card_type' => $data['vnp_CardType'] ?? null,
            'pay_date' => $data['vnp_PayDate'] ?? null,
            'response_code' => $responseCode,
            'message' => $this->getResponseMessage($responseCode),
        ];
    }

    /**
     * Verify VNPay signature
     */
    public function verifySignature(array $data): bool
    {
        $vnpSecureHash = $data['vnp_SecureHash'] ?? '';
        unset($data['vnp_SecureHash']);
        unset($data['vnp_SecureHashType']);

        // Sort params
        ksort($data);

        // Build hash data
        $hashData = http_build_query($data);

        // Calculate hash
        $secureHash = hash_hmac('sha512', $hashData, $this->vnpHashSecret);

        return $secureHash === $vnpSecureHash;
    }

    /**
     * Query transaction status from VNPay
     */
    public function queryTransaction(string $transactionId): array
    {
        // TODO: Implement VNPay query API
        // VNPay requires IP whitelisting for query API
        
        return [
            'success' => false,
            'message' => 'Query transaction not implemented yet',
        ];
    }

    /**
     * Process refund (VNPay doesn't support automatic refund)
     */
    public function refund(string $transactionId, float $amount): array
    {
        // VNPay doesn't support automatic refund via API
        // Must contact VNPay support for manual refund
        
        return [
            'success' => false,
            'message' => 'VNPay does not support automatic refund. Please contact VNPay support.',
        ];
    }

    /**
     * Get response message from response code
     */
    private function getResponseMessage(string $code): string
    {
        $messages = [
            '00' => 'Transaction successful',
            '07' => 'Transaction successful. Suspected fraud',
            '09' => 'Customer card not registered for Internet Banking',
            '10' => 'Customer authentication failed more than 3 times',
            '11' => 'Payment timeout. Please retry',
            '12' => 'Customer card locked',
            '13' => 'Invalid OTP',
            '24' => 'Customer cancelled transaction',
            '51' => 'Insufficient balance',
            '65' => 'Customer exceeded daily limit',
            '75' => 'Payment bank under maintenance',
            '79' => 'Payment exceeded time limit',
            '99' => 'Unknown error',
        ];

        return $messages[$code] ?? 'Unknown error';
    }

    /**
     * Get available bank codes
     */
    public static function getBankCodes(): array
    {
        return [
            'VNPAYQR' => 'VNPay QR',
            'VNBANK' => 'Local Bank',
            'INTCARD' => 'International Card',
            'VIETCOMBANK' => 'Vietcombank',
            'VIETINBANK' => 'VietinBank',
            'BIDV' => 'BIDV',
            'AGRIBANK' => 'Agribank',
            'SACOMBANK' => 'Sacombank',
            'TECHCOMBANK' => 'Techcombank',
            'ACB' => 'ACB',
            'MB' => 'MB Bank',
            'TPBANK' => 'TPBank',
            'VPBank' => 'VPBank',
        ];
    }
}
