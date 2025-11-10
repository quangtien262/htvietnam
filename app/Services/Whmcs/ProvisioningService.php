<?php

namespace App\Services\Whmcs;

use App\Models\Whmcs\Service;
use App\Models\Whmcs\Invoice;
use App\Models\Whmcs\Domain;
use App\Services\Whmcs\Contracts\ProvisioningServiceInterface;
use App\Services\Whmcs\Contracts\ServerManagementServiceInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ProvisioningService implements ProvisioningServiceInterface
{
    public function __construct(
        protected ServerManagementServiceInterface $serverManagement
    ) {}

    public function provisionHostingAccount(int $serviceId, array $params): array
    {
        $service = Service::with(['product', 'server', 'client'])->findOrFail($serviceId);

        if ($service->status === 'active') {
            return [
                'success' => false,
                'message' => 'Service is already provisioned',
            ];
        }

        try {
            // Generate credentials if not provided
            $username = $params['username'] ?? $this->generateUsername($params['domain']);
            $password = $params['password'] ?? Str::random(16);

            // Create account on server via cPanel/Plesk API
            $result = $this->createCPanelAccount($service->server, [
                'username' => $username,
                'password' => $password,
                'domain' => $params['domain'],
                'plan' => $service->product->server_package_name ?? 'default',
                'quota' => $service->disk_limit ?? 10240, // MB
                'email' => $params['email'] ?? $service->client->email,
            ]);

            if (!$result['success']) {
                throw new \Exception($result['message'] ?? 'Failed to create account');
            }

            // Update service
            $service->update([
                'status' => 'active',
                'username' => $username,
                'password' => encrypt($password),
                'domain' => $params['domain'],
                'dedicated_ip' => $result['data']['ip'] ?? null,
            ]);

            event(new \App\Events\Whmcs\ServiceProvisioned($service));

            Log::info("Service #{$serviceId} provisioned successfully", [
                'service_id' => $serviceId,
                'username' => $username,
                'domain' => $params['domain'],
            ]);

            return [
                'success' => true,
                'message' => 'Account provisioned successfully',
                'account_data' => [
                    'username' => $username,
                    'password' => $password,
                    'domain' => $params['domain'],
                    'server_ip' => $service->server->ip_address,
                    'control_panel_url' => "https://{$service->server->hostname}:2083",
                ],
            ];

        } catch (\Exception $e) {
            Log::error("Failed to provision service #{$serviceId}", [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function suspendAccount(int $serviceId, string $reason): array
    {
        $service = Service::with('server')->findOrFail($serviceId);

        try {
            $result = $this->suspendCPanelAccount($service->server, $service->username, $reason);

            if ($result['success']) {
                $service->update([
                    'status' => 'suspended',
                ]);

                event(new \App\Events\Whmcs\ServiceSuspended($service, $reason));

                Log::info("Service #{$serviceId} suspended", [
                    'service_id' => $serviceId,
                    'reason' => $reason,
                ]);
            }

            return $result;

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function unsuspendAccount(int $serviceId): array
    {
        $service = Service::with('server')->findOrFail($serviceId);

        try {
            $result = $this->unsuspendCPanelAccount($service->server, $service->username);

            if ($result['success']) {
                $service->update([
                    'status' => 'active',
                ]);

                Log::info("Service #{$serviceId} unsuspended", [
                    'service_id' => $serviceId,
                ]);
            }

            return $result;

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function terminateAccount(int $serviceId, bool $deleteBackups = false): array
    {
        $service = Service::with('server')->findOrFail($serviceId);

        try {
            $result = $this->terminateCPanelAccount(
                $service->server, 
                $service->username, 
                $deleteBackups
            );

            if ($result['success']) {
                $service->update([
                    'status' => 'terminated',
                ]);

                Log::info("Service #{$serviceId} terminated", [
                    'service_id' => $serviceId,
                    'delete_backups' => $deleteBackups,
                ]);
            }

            return $result;

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function changePassword(int $serviceId, string $newPassword): array
    {
        $service = Service::with('server')->findOrFail($serviceId);

        try {
            $result = $this->changeAccountPassword($service->server, $service->username, $newPassword);

            if ($result['success']) {
                $service->update([
                    'password' => encrypt($newPassword),
                ]);
            }

            return $result;

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function changePackage(int $serviceId, int $newProductId, bool $prorata = true): array
    {
        $service = Service::with(['product', 'client'])->findOrFail($serviceId);
        $newProduct = \App\Models\Whmcs\Product::with('pricings')->findOrFail($newProductId);

        try {
            $oldPrice = $service->recurring_amount;
            $newPrice = $newProduct->pricings
                ->where('billing_cycle', $service->billing_cycle)
                ->first()?->price ?? 0;

            $prorataAmount = 0;
            if ($prorata && $newPrice > $oldPrice) {
                $daysRemaining = now()->diffInDays($service->next_due_date);
                $totalDays = now()->diffInDays(now()->addMonths($this->getCycleMonths($service->billing_cycle)));
                $prorataAmount = ($newPrice - $oldPrice) * ($daysRemaining / $totalDays);
            }

            // Change package on server
            $result = $this->changeCPanelPackage(
                $service->server,
                $service->username,
                $newProduct->server_package_name
            );

            if (!$result['success']) {
                throw new \Exception($result['message'] ?? 'Failed to change package');
            }

            // Update service
            $service->update([
                'product_id' => $newProductId,
                'recurring_amount' => $newPrice,
            ]);

            $invoice = null;
            if ($prorataAmount > 0) {
                $billingService = app(\App\Services\Whmcs\Contracts\BillingServiceInterface::class);
                $invoice = $billingService->createInvoice($service->client_id, [
                    [
                        'type' => 'upgrade',
                        'description' => "Package Upgrade - {$service->product->name} to {$newProduct->name}",
                        'amount' => $prorataAmount,
                        'quantity' => 1,
                    ]
                ]);
            }

            return [
                'success' => true,
                'message' => 'Package changed successfully',
                'invoice_id' => $invoice?->id,
                'amount_due' => $prorataAmount,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function registerDomain(int $serviceId, array $params): array
    {
        $service = Service::with('client')->findOrFail($serviceId);

        try {
            // TODO: Integrate with domain registrar API (VNNIC, GoDaddy, etc.)
            $domain = Domain::create([
                'user_id' => $service->client_id,
                'domain' => $params['domain'],
                'registration_date' => now(),
                'expiry_date' => now()->addYears($params['years'] ?? 1),
                'status' => 'active',
                'registrar' => 'internal',
            ]);

            $service->update([
                'status' => 'active',
                'domain' => $params['domain'],
                'next_due_date' => $domain->expiry_date,
            ]);

            return [
                'success' => true,
                'message' => 'Domain registered successfully',
                'expiry_date' => $domain->expiry_date->format('Y-m-d'),
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function renewDomain(int $serviceId, int $years = 1): array
    {
        $service = Service::findOrFail($serviceId);
        $domain = Domain::where('domain', $service->domain)->first();

        if (!$domain) {
            return [
                'success' => false,
                'message' => 'Domain not found',
            ];
        }

        $newExpiryDate = $domain->expiry_date->addYears($years);
        $domain->update(['expiry_date' => $newExpiryDate]);
        
        $service->update(['next_due_date' => $newExpiryDate]);

        return [
            'success' => true,
            'message' => 'Domain renewed successfully',
            'new_expiry_date' => $newExpiryDate->format('Y-m-d'),
        ];
    }

    public function transferDomain(int $serviceId, array $params): array
    {
        // TODO: Implement domain transfer via registrar API
        return [
            'success' => true,
            'message' => 'Transfer initiated',
            'status' => 'pending',
        ];
    }

    public function updateNameservers(int $serviceId, array $nameservers): array
    {
        // TODO: Implement nameserver update via registrar API
        return [
            'success' => true,
            'message' => 'Nameservers updated',
        ];
    }

    public function autoProvisionFromInvoice(int $invoiceId): array
    {
        $invoice = Invoice::with('items.service')->findOrFail($invoiceId);
        
        $provisioned = [];
        $failed = [];

        foreach ($invoice->items as $item) {
            if ($item->type === 'service' && $item->service) {
                $service = $item->service;

                if ($service->status === 'pending' && $service->domain) {
                    $result = $this->provisionHostingAccount($service->id, [
                        'domain' => $service->domain,
                    ]);

                    if ($result['success']) {
                        $provisioned[] = $service->id;
                    } else {
                        $failed[] = [
                            'service_id' => $service->id,
                            'error' => $result['message'],
                        ];
                    }
                }
            }
        }

        return [
            'provisioned_services' => $provisioned,
            'failed_services' => $failed,
        ];
    }

    public function getServiceCredentials(int $serviceId): array
    {
        $service = Service::with('server')->findOrFail($serviceId);

        return [
            'username' => $service->username,
            'password' => $service->password ? decrypt($service->password) : null,
            'server_ip' => $service->server->ip_address,
            'control_panel_url' => "https://{$service->server->hostname}:2083",
            'nameserver1' => $service->server->nameserver1,
            'nameserver2' => $service->server->nameserver2,
        ];
    }

    // cPanel API Helper Methods

    protected function createCPanelAccount($server, array $params): array
    {
        try {
            $url = "https://{$server->hostname}:2087/json-api/createacct";
            
            $response = Http::withHeaders([
                'Authorization' => 'WHM ' . $server->username . ':' . $server->access_hash,
            ])->post($url, $params);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'data' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => $response->body(),
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    protected function suspendCPanelAccount($server, string $username, string $reason): array
    {
        // TODO: Implement via cPanel API
        return ['success' => true, 'message' => 'Account suspended'];
    }

    protected function unsuspendCPanelAccount($server, string $username): array
    {
        // TODO: Implement via cPanel API
        return ['success' => true, 'message' => 'Account unsuspended'];
    }

    protected function terminateCPanelAccount($server, string $username, bool $keepDns): array
    {
        // TODO: Implement via cPanel API
        return ['success' => true, 'message' => 'Account terminated'];
    }

    protected function changeAccountPassword($server, string $username, string $newPassword): array
    {
        // TODO: Implement via cPanel API
        return ['success' => true, 'message' => 'Password changed'];
    }

    protected function changeCPanelPackage($server, string $username, string $newPackage): array
    {
        // TODO: Implement via cPanel API
        return ['success' => true, 'message' => 'Package changed'];
    }

    protected function generateUsername(string $domain): string
    {
        $username = str_replace(['.', '-'], '', explode('.', $domain)[0]);
        return substr($username, 0, 8) . rand(100, 999);
    }

    protected function getCycleMonths(string $cycle): int
    {
        return match ($cycle) {
            'monthly' => 1,
            'quarterly' => 3,
            'semiannually' => 6,
            'annually' => 12,
            'biennially' => 24,
            'triennially' => 36,
            default => 1,
        };
    }
}
