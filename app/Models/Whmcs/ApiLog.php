<?php

namespace App\Models\Whmcs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiLog extends Model
{
    protected $table = 'whmcs_api_logs';

    protected $fillable = [
        'api_key_id',
        'endpoint',
        'method',
        'request_data',
        'response_data',
        'response_code',
        'ip_address',
        'user_agent',
        'execution_time',
    ];

    protected $casts = [
        'request_data' => 'array',
        'response_data' => 'array',
        'execution_time' => 'float',
    ];

    // Relationships
    public function apiKey(): BelongsTo
    {
        return $this->belongsTo(ApiKey::class);
    }

    // Helper Methods
    public function isSuccessful(): bool
    {
        return $this->response_code >= 200 && $this->response_code < 300;
    }

    public function isError(): bool
    {
        return $this->response_code >= 400;
    }

    // Scopes
    public function scopeSuccessful($query)
    {
        return $query->whereBetween('response_code', [200, 299]);
    }

    public function scopeErrors($query)
    {
        return $query->where('response_code', '>=', 400);
    }

    public function scopeByEndpoint($query, string $endpoint)
    {
        return $query->where('endpoint', 'like', "%{$endpoint}%");
    }

    public function scopeByMethod($query, string $method)
    {
        return $query->where('method', strtoupper($method));
    }

    public function scopeSlow($query, float $threshold = 1000)
    {
        return $query->where('execution_time', '>', $threshold);
    }
}
