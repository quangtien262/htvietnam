<?php

namespace App\Services\Admin;

use App\Models\Whmcs\WhmcsService;
use App\Models\Whmcs\WhmcsActivityLog;

class WhmcsServiceService
{
    public function suspendService(WhmcsService $service)
    {
        $service->update([
            'status' => 'Suspended',
            'suspension_reason' => 'Suspended by admin'
        ]);

        $this->logActivity($service, 'Service Suspended', 'Service has been suspended');

        // TODO: Call server API to suspend the service

        return $service;
    }

    public function unsuspendService(WhmcsService $service)
    {
        $service->update([
            'status' => 'Active',
            'suspension_reason' => null
        ]);

        $this->logActivity($service, 'Service Unsuspended', 'Service has been unsuspended');

        // TODO: Call server API to unsuspend the service

        return $service;
    }

    public function terminateService(WhmcsService $service)
    {
        $service->update([
            'status' => 'Terminated',
            'termination_date' => now()
        ]);

        $this->logActivity($service, 'Service Terminated', 'Service has been terminated');

        // TODO: Call server API to terminate the service

        return $service;
    }

    public function autoProvision(WhmcsService $service)
    {
        $product = $service->product;

        if ($product->auto_setup == 'on' ||
            ($product->auto_setup == 'payment' && $service->payment_status == 'paid')) {

            // TODO: Implement auto-provisioning logic based on server_type
            // For now, just activate the service
            $service->update(['status' => 'Active']);

            $this->logActivity($service, 'Service Auto-Provisioned', 'Service has been automatically provisioned');
        }

        return $service;
    }

    protected function logActivity(WhmcsService $service, string $action, string $description)
    {
        WhmcsActivityLog::create([
            'client_id' => $service->client_id,
            'admin_user_id' => auth('admin')->id(),
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);
    }
}
