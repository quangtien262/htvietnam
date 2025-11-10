<?php

namespace App\Http\Middleware;

use App\Services\Whmcs\ApiKeyService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyAuthentication
{
    protected ApiKeyService $apiKeyService;

    public function __construct(ApiKeyService $apiKeyService)
    {
        $this->apiKeyService = $apiKeyService;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ?string $permission = null): Response
    {
        $startTime = microtime(true);

        // Get API credentials from headers
        $apiKey = $request->header('X-API-Key');
        $apiSecret = $request->header('X-API-Secret');

        if (!$apiKey || !$apiSecret) {
            return $this->unauthorizedResponse('Missing API credentials');
        }

        // Validate credentials
        $validatedKey = $this->apiKeyService->validateCredentials($apiKey, $apiSecret);

        if (!$validatedKey) {
            return $this->unauthorizedResponse('Invalid API credentials');
        }

        // Check IP address
        $clientIp = $request->ip();
        if (!$this->apiKeyService->checkIpAddress($validatedKey, $clientIp)) {
            return $this->unauthorizedResponse('IP address not allowed');
        }

        // Check permission if specified
        if ($permission && !$this->apiKeyService->checkPermission($validatedKey, $permission)) {
            return $this->forbiddenResponse("Missing required permission: {$permission}");
        }

        // Update last used timestamp
        $this->apiKeyService->updateLastUsed($validatedKey);

        // Attach API key to request
        $request->merge(['api_key_model' => $validatedKey]);

        // Execute request
        $response = $next($request);

        // Log the request
        $executionTime = (microtime(true) - $startTime) * 1000; // Convert to milliseconds

        $this->apiKeyService->logRequest(
            $validatedKey,
            $request->path(),
            $request->method(),
            $this->sanitizeRequestData($request->all()),
            $this->sanitizeResponseData($response),
            $response->getStatusCode(),
            $clientIp,
            $request->userAgent() ?? 'Unknown',
            round($executionTime, 2)
        );

        return $response;
    }

    /**
     * Sanitize request data (remove sensitive info)
     */
    protected function sanitizeRequestData(array $data): array
    {
        $sensitiveKeys = ['password', 'secret', 'token', 'api_secret', 'card_number', 'cvv'];

        foreach ($sensitiveKeys as $key) {
            if (isset($data[$key])) {
                $data[$key] = '***REDACTED***';
            }
        }

        return $data;
    }

    /**
     * Sanitize response data
     */
    protected function sanitizeResponseData(Response $response): array
    {
        $content = $response->getContent();

        if (!$content) {
            return [];
        }

        $data = json_decode($content, true);

        if (!is_array($data)) {
            return ['raw' => substr($content, 0, 1000)]; // Limit size
        }

        return $data;
    }

    /**
     * Return unauthorized response
     */
    protected function unauthorizedResponse(string $message): Response
    {
        return response()->json([
            'success' => false,
            'error' => $message,
        ], 401);
    }

    /**
     * Return forbidden response
     */
    protected function forbiddenResponse(string $message): Response
    {
        return response()->json([
            'success' => false,
            'error' => $message,
        ], 403);
    }
}
