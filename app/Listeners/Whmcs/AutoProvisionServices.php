<?php

namespace App\Listeners\Whmcs;

use App\Events\Whmcs\InvoicePaid;
use App\Services\Whmcs\Contracts\ProvisioningServiceInterface;
use Illuminate\Support\Facades\Log;

class AutoProvisionServices
{
    public function __construct(
        protected ProvisioningServiceInterface $provisioning
    ) {}

    public function handle(InvoicePaid $event): void
    {
        try {
            $result = $this->provisioning->autoProvisionFromInvoice($event->invoice->id);

            Log::info("Auto-provisioning completed for invoice #{$event->invoice->invoice_number}", [
                'invoice_id' => $event->invoice->id,
                'provisioned' => count($result['provisioned_services']),
                'failed' => count($result['failed_services']),
            ]);

            if (!empty($result['failed_services'])) {
                Log::warning("Some services failed to provision", [
                    'invoice_id' => $event->invoice->id,
                    'failed_services' => $result['failed_services'],
                ]);
            }

        } catch (\Exception $e) {
            Log::error("Auto-provisioning failed for invoice #{$event->invoice->invoice_number}", [
                'invoice_id' => $event->invoice->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
