<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MoMoService implements PaymentGatewayInterface
{
    private $endpoint;
    private $partnerCode;
    private $accessKey;
    private $secretKey;
    private $returnUrl;
    private $notifyUrl;

    public function __construct()
    {
        $this->endpoint = config('whmcs.payment_gateways.momo.endpoint');
        $this->partnerCode = config('whmcs.payment_gateways.momo.partner_code');
        $this->accessKey = config('whmcs.payment_gateways.momo.access_key');
        $this->secretKey = config('whmcs.payment_gateways.momo.secret_key');
        $this->returnUrl = config('whmcs.payment_gateways.momo.return_url');
        $this->notifyUrl = config('whmcs.payment_gateways.momo.notify_url');
    }

    /**
     * Create MoMo payment URL
     * 
     * @param array $data [
     *   'invoice_id' => int,
     *   'amount' => float,
     *   'description' => string
     * ]
     */
    public function createPaymentUrl(array $data): string
    {
        $orderId = $data['invoice_id'] . '_' . time();
        $requestId = $orderId;
        $amount = (int)$data['amount'];
        $orderInfo = $data['description'] ?? 'Payment for invoice #' . $data['invoice_id'];
        $extraData = base64_encode(json_encode([
            'invoice_id' => $data['invoice_id'],
        ]));

        // Create raw signature
        $rawSignature = "accessKey={$this->accessKey}" .
                       "&amount={$amount}" .
                       "&extraData={$extraData}" .
                       "&ipnUrl={$this->notifyUrl}" .
                       "&orderId={$orderId}" .
                       "&orderInfo={$orderInfo}" .
                       "&partnerCode={$this->partnerCode}" .
                       "&redirectUrl={$this->returnUrl}" .
                       "&requestId={$requestId}" .
                       "&requestType=captureWallet";

        $signature = hash_hmac('sha256', $rawSignature, $this->secretKey);

        $requestData = [
            'partnerCode' => $this->partnerCode,
            'accessKey' => $this->accessKey,
            'requestId' => $requestId,
            'amount' => $amount,
            'orderId' => $orderId,
            'orderInfo' => $orderInfo,
            'redirectUrl' => $this->returnUrl,
            'ipnUrl' => $this->notifyUrl,
            'extraData' => $extraData,
            'requestType' => 'captureWallet',
            'signature' => $signature,
            'lang' => 'vi',
        ];

        Log::info('MoMo Payment Request', [
            'invoice_id' => $data['invoice_id'],
            'amount' => $amount,
            'order_id' => $orderId,
        ]);

        try {
            $response = Http::post($this->endpoint . '/v2/gateway/api/create', $requestData);
            $result = $response->json();

            if ($result['resultCode'] === 0) {
                return $result['payUrl'];
            }

            Log::error('MoMo Create Payment Failed', $result);
            throw new \Exception($result['message'] ?? 'Failed to create MoMo payment');

        } catch (\Exception $e) {
            Log::error('MoMo API Error', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Handle MoMo IPN callback
     */
    public function handleCallback(array $data): array
    {
        Log::info('MoMo Callback Received', $data);

        if (!$this->verifySignature($data)) {
            Log::error('MoMo Invalid Signature', $data);
            return [
                'success' => false,
                'message' => 'Invalid signature',
            ];
        }

        $resultCode = $data['resultCode'] ?? -1;
        
        // Parse invoice ID from extraData
        $invoiceId = null;
        if (!empty($data['extraData'])) {
            $extraData = json_decode(base64_decode($data['extraData']), true);
            $invoiceId = $extraData['invoice_id'] ?? null;
        }

        return [
            'success' => $resultCode === 0,
            'invoice_id' => $invoiceId,
            'transaction_id' => $data['transId'] ?? null,
            'amount' => $data['amount'] ?? 0,
            'order_id' => $data['orderId'] ?? null,
            'message' => $data['message'] ?? 'Unknown',
            'result_code' => $resultCode,
            'pay_type' => $data['payType'] ?? null,
        ];
    }

    /**
     * Verify MoMo signature
     */
    public function verifySignature(array $data): bool
    {
        $signature = $data['signature'] ?? '';

        $rawSignature = "accessKey={$this->accessKey}" .
                       "&amount={$data['amount']}" .
                       "&extraData={$data['extraData']}" .
                       "&message={$data['message']}" .
                       "&orderId={$data['orderId']}" .
                       "&orderInfo={$data['orderInfo']}" .
                       "&orderType={$data['orderType']}" .
                       "&partnerCode={$this->partnerCode}" .
                       "&payType={$data['payType']}" .
                       "&requestId={$data['requestId']}" .
                       "&responseTime={$data['responseTime']}" .
                       "&resultCode={$data['resultCode']}" .
                       "&transId={$data['transId']}";

        $expectedSignature = hash_hmac('sha256', $rawSignature, $this->secretKey);

        return $signature === $expectedSignature;
    }

    /**
     * Query transaction status from MoMo
     */
    public function queryTransaction(string $orderId): array
    {
        $requestId = $orderId . '_query_' . time();

        $rawSignature = "accessKey={$this->accessKey}" .
                       "&orderId={$orderId}" .
                       "&partnerCode={$this->partnerCode}" .
                       "&requestId={$requestId}";

        $signature = hash_hmac('sha256', $rawSignature, $this->secretKey);

        $requestData = [
            'partnerCode' => $this->partnerCode,
            'accessKey' => $this->accessKey,
            'requestId' => $requestId,
            'orderId' => $orderId,
            'signature' => $signature,
            'lang' => 'vi',
        ];

        try {
            $response = Http::post($this->endpoint . '/v2/gateway/api/query', $requestData);
            $result = $response->json();

            return [
                'success' => $result['resultCode'] === 0,
                'data' => $result,
            ];

        } catch (\Exception $e) {
            Log::error('MoMo Query Error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Process refund
     */
    public function refund(string $transactionId, float $amount): array
    {
        $orderId = 'REFUND_' . $transactionId . '_' . time();
        $requestId = $orderId;

        $rawSignature = "accessKey={$this->accessKey}" .
                       "&amount={$amount}" .
                       "&description=Refund transaction {$transactionId}" .
                       "&orderId={$orderId}" .
                       "&partnerCode={$this->partnerCode}" .
                       "&requestId={$requestId}" .
                       "&transId={$transactionId}";

        $signature = hash_hmac('sha256', $rawSignature, $this->secretKey);

        $requestData = [
            'partnerCode' => $this->partnerCode,
            'accessKey' => $this->accessKey,
            'requestId' => $requestId,
            'amount' => (int)$amount,
            'orderId' => $orderId,
            'transId' => $transactionId,
            'description' => "Refund transaction {$transactionId}",
            'signature' => $signature,
            'lang' => 'vi',
        ];

        try {
            $response = Http::post($this->endpoint . '/v2/gateway/api/refund', $requestData);
            $result = $response->json();

            Log::info('MoMo Refund Result', $result);

            return [
                'success' => $result['resultCode'] === 0,
                'message' => $result['message'] ?? 'Unknown',
                'data' => $result,
            ];

        } catch (\Exception $e) {
            Log::error('MoMo Refund Error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
