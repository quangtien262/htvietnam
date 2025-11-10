<?php

namespace App\Services\Whmcs;

use App\Models\Whmcs\Domain;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DomainService
{
    private $vnnicApiUrl;
    private $vnnicUsername;
    private $vnnicPassword;

    public function __construct()
    {
        $this->vnnicApiUrl = config('whmcs.domain.vnnic_api_url', 'https://api.vnnic.vn');
        $this->vnnicUsername = config('whmcs.domain.vnnic_username');
        $this->vnnicPassword = config('whmcs.domain.vnnic_password');
    }

    /**
     * Check domain availability
     */
    public function checkAvailability(string $domain): array
    {
        try {
            // TODO: Implement actual VNNIC API call
            // This is a placeholder implementation
            
            $response = Http::timeout(10)->post($this->vnnicApiUrl . '/check', [
                'username' => $this->vnnicUsername,
                'password' => $this->vnnicPassword,
                'domain' => $domain,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                return [
                    'success' => true,
                    'available' => $data['available'] ?? false,
                    'domain' => $domain,
                    'price' => $data['price'] ?? 0,
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to check domain availability',
            ];

        } catch (\Exception $e) {
            Log::error('Domain Check Error', [
                'domain' => $domain,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Register new domain
     */
    public function register(Domain $domain, array $contactInfo): array
    {
        try {
            // TODO: Implement actual VNNIC API call
            
            $response = Http::timeout(30)->post($this->vnnicApiUrl . '/register', [
                'username' => $this->vnnicUsername,
                'password' => $this->vnnicPassword,
                'domain' => $domain->domain_name,
                'period' => $domain->registration_period,
                'nameservers' => $domain->nameservers ?? [],
                'registrant' => $contactInfo['registrant'] ?? [],
                'admin' => $contactInfo['admin'] ?? [],
                'tech' => $contactInfo['tech'] ?? [],
                'billing' => $contactInfo['billing'] ?? [],
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                $domain->update([
                    'status' => 'active',
                    'registered_at' => now(),
                    'expires_at' => now()->addYears($domain->registration_period),
                    'registrar_order_id' => $data['order_id'] ?? null,
                ]);

                Log::info('Domain Registered Successfully', [
                    'domain' => $domain->domain_name,
                    'order_id' => $data['order_id'] ?? null,
                ]);

                return [
                    'success' => true,
                    'message' => 'Domain registered successfully',
                    'order_id' => $data['order_id'] ?? null,
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to register domain',
            ];

        } catch (\Exception $e) {
            Log::error('Domain Registration Error', [
                'domain' => $domain->domain_name,
                'error' => $e->getMessage(),
            ]);

            $domain->update(['status' => 'failed']);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Transfer domain
     */
    public function transfer(Domain $domain, string $authCode, array $contactInfo): array
    {
        try {
            // TODO: Implement actual VNNIC API call
            
            $response = Http::timeout(30)->post($this->vnnicApiUrl . '/transfer', [
                'username' => $this->vnnicUsername,
                'password' => $this->vnnicPassword,
                'domain' => $domain->domain_name,
                'auth_code' => $authCode,
                'nameservers' => $domain->nameservers ?? [],
                'registrant' => $contactInfo['registrant'] ?? [],
                'admin' => $contactInfo['admin'] ?? [],
                'tech' => $contactInfo['tech'] ?? [],
                'billing' => $contactInfo['billing'] ?? [],
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                $domain->update([
                    'status' => 'pending_transfer',
                    'registrar_order_id' => $data['order_id'] ?? null,
                ]);

                Log::info('Domain Transfer Initiated', [
                    'domain' => $domain->domain_name,
                    'order_id' => $data['order_id'] ?? null,
                ]);

                return [
                    'success' => true,
                    'message' => 'Domain transfer initiated',
                    'order_id' => $data['order_id'] ?? null,
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to initiate domain transfer',
            ];

        } catch (\Exception $e) {
            Log::error('Domain Transfer Error', [
                'domain' => $domain->domain_name,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Renew domain
     */
    public function renew(Domain $domain, int $years = 1): array
    {
        try {
            // TODO: Implement actual VNNIC API call
            
            $response = Http::timeout(30)->post($this->vnnicApiUrl . '/renew', [
                'username' => $this->vnnicUsername,
                'password' => $this->vnnicPassword,
                'domain' => $domain->domain_name,
                'period' => $years,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                $domain->update([
                    'expires_at' => $domain->expires_at->addYears($years),
                    'auto_renew' => true,
                ]);

                Log::info('Domain Renewed Successfully', [
                    'domain' => $domain->domain_name,
                    'years' => $years,
                    'new_expiry' => $domain->expires_at,
                ]);

                return [
                    'success' => true,
                    'message' => 'Domain renewed successfully',
                    'expires_at' => $domain->expires_at,
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to renew domain',
            ];

        } catch (\Exception $e) {
            Log::error('Domain Renewal Error', [
                'domain' => $domain->domain_name,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update nameservers
     */
    public function updateNameservers(Domain $domain, array $nameservers): array
    {
        try {
            // Validate nameservers
            if (count($nameservers) < 2) {
                return [
                    'success' => false,
                    'message' => 'At least 2 nameservers are required',
                ];
            }

            // TODO: Implement actual VNNIC API call
            
            $response = Http::timeout(30)->post($this->vnnicApiUrl . '/update-nameservers', [
                'username' => $this->vnnicUsername,
                'password' => $this->vnnicPassword,
                'domain' => $domain->domain_name,
                'nameservers' => $nameservers,
            ]);

            if ($response->successful()) {
                $domain->update(['nameservers' => $nameservers]);

                Log::info('Nameservers Updated', [
                    'domain' => $domain->domain_name,
                    'nameservers' => $nameservers,
                ]);

                return [
                    'success' => true,
                    'message' => 'Nameservers updated successfully',
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to update nameservers',
            ];

        } catch (\Exception $e) {
            Log::error('Nameserver Update Error', [
                'domain' => $domain->domain_name,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get WHOIS information
     */
    public function getWhois(string $domain): array
    {
        try {
            // TODO: Implement actual WHOIS lookup
            
            $response = Http::timeout(10)->get($this->vnnicApiUrl . '/whois', [
                'domain' => $domain,
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to fetch WHOIS data',
            ];

        } catch (\Exception $e) {
            Log::error('WHOIS Lookup Error', [
                'domain' => $domain,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get EPP/Auth code for transfer
     */
    public function getAuthCode(Domain $domain): array
    {
        try {
            // TODO: Implement actual VNNIC API call
            
            $response = Http::timeout(10)->post($this->vnnicApiUrl . '/get-auth-code', [
                'username' => $this->vnnicUsername,
                'password' => $this->vnnicPassword,
                'domain' => $domain->domain_name,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'success' => true,
                    'auth_code' => $data['auth_code'] ?? null,
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to get auth code',
            ];

        } catch (\Exception $e) {
            Log::error('Auth Code Retrieval Error', [
                'domain' => $domain->domain_name,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
