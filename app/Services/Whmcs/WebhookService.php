<?php

namespace App\Services\Whmcs;

use App\Models\Whmcs\Webhook;
use App\Models\Whmcs\WebhookLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookService
{
    /**
     * Trigger webhook for specific event
     */
    public function trigger(string $event, array $data): void
    {
        $webhooks = Webhook::active()
            ->forEvent($event)
            ->get();

        foreach ($webhooks as $webhook) {
            $this->sendWebhook($webhook, $event, $data);
        }
    }

    /**
     * Send webhook to endpoint
     */
    public function sendWebhook(Webhook $webhook, string $event, array $data, int $attemptNumber = 1): bool
    {
        $startTime = microtime(true);
        
        try {
            // Prepare payload
            $payload = [
                'event' => $event,
                'timestamp' => now()->toIso8601String(),
                'data' => $data,
            ];

            // Add signature if secret is set
            if ($webhook->secret) {
                $payload['signature'] = $this->generateSignature($payload, $webhook->secret);
            }

            // Prepare HTTP request
            $request = Http::timeout($webhook->timeout);
            
            if (!$webhook->verify_ssl) {
                $request = $request->withoutVerifying();
            }

            // Add custom headers
            if ($webhook->custom_headers) {
                $request = $request->withHeaders($webhook->custom_headers);
            }

            // Send request
            $response = $request->post($webhook->url, $payload);
            
            $duration = (microtime(true) - $startTime) * 1000; // Convert to milliseconds
            $success = $response->successful();

            // Log the attempt
            $this->logWebhook($webhook, $event, $payload, [
                'http_status' => $response->status(),
                'response_body' => $response->body(),
                'success' => $success,
                'duration_ms' => $duration,
                'attempt_number' => $attemptNumber,
            ]);

            // Update webhook statistics
            $webhook->incrementTriggers();
            
            if (!$success) {
                $webhook->incrementFailures();
                
                // Retry if configured and not exceeded max attempts
                if ($attemptNumber < $webhook->retry_attempts) {
                    $this->retryWebhook($webhook, $event, $data, $attemptNumber + 1);
                }
            }

            return $success;
            
        } catch (\Exception $e) {
            $duration = (microtime(true) - $startTime) * 1000;
            
            // Log error
            $this->logWebhook($webhook, $event, $payload ?? [], [
                'error_message' => $e->getMessage(),
                'success' => false,
                'duration_ms' => $duration,
                'attempt_number' => $attemptNumber,
            ]);

            $webhook->incrementTriggers();
            $webhook->incrementFailures();

            // Retry on exception
            if ($attemptNumber < $webhook->retry_attempts) {
                $this->retryWebhook($webhook, $event, $data, $attemptNumber + 1);
            }

            Log::error('Webhook failed', [
                'webhook_id' => $webhook->id,
                'event' => $event,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Retry webhook with delay
     */
    protected function retryWebhook(Webhook $webhook, string $event, array $data, int $attemptNumber): void
    {
        // Exponential backoff: 2^attempt seconds
        $delay = pow(2, $attemptNumber);
        
        dispatch(function () use ($webhook, $event, $data, $attemptNumber) {
            $this->sendWebhook($webhook, $event, $data, $attemptNumber);
        })->delay(now()->addSeconds($delay));
    }

    /**
     * Log webhook attempt
     */
    protected function logWebhook(Webhook $webhook, string $event, array $payload, array $details): void
    {
        WebhookLog::create([
            'webhook_id' => $webhook->id,
            'event' => $event,
            'payload' => $payload,
            'http_status' => $details['http_status'] ?? null,
            'response_body' => $details['response_body'] ?? null,
            'error_message' => $details['error_message'] ?? null,
            'success' => $details['success'] ?? false,
            'duration_ms' => $details['duration_ms'] ?? null,
            'attempt_number' => $details['attempt_number'] ?? 1,
            'sent_at' => now(),
        ]);
    }

    /**
     * Generate HMAC signature for webhook payload
     */
    protected function generateSignature(array $payload, string $secret): string
    {
        return hash_hmac('sha256', json_encode($payload), $secret);
    }

    /**
     * Test webhook endpoint
     */
    public function testWebhook(Webhook $webhook): array
    {
        $testData = [
            'test' => true,
            'webhook_id' => $webhook->id,
            'message' => 'This is a test webhook',
        ];

        $success = $this->sendWebhook($webhook, 'test.ping', $testData);

        return [
            'success' => $success,
            'message' => $success ? 'Webhook test successful' : 'Webhook test failed',
        ];
    }

    /**
     * Get webhook statistics
     */
    public function getStatistics(Webhook $webhook): array
    {
        $logs = $webhook->logs();

        return [
            'total_triggers' => $webhook->total_triggers,
            'failed_triggers' => $webhook->failed_triggers,
            'success_rate' => $webhook->getSuccessRate(),
            'avg_duration_ms' => $logs->avg('duration_ms'),
            'last_triggered_at' => $webhook->last_triggered_at?->toDateTimeString(),
            'recent_failures' => $logs->failed()->recent()->count(),
        ];
    }

    /**
     * Clean old webhook logs
     */
    public function cleanOldLogs(int $daysToKeep = 30): int
    {
        return WebhookLog::where('sent_at', '<', now()->subDays($daysToKeep))->delete();
    }
}
