<?php

namespace App\Listeners\Whmcs;

use App\Events\Whmcs\ServiceProvisioned;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmail
{
    public function handle(ServiceProvisioned $event): void
    {
        $service = $event->service->load(['user', 'product', 'server']);

        try {
            // TODO: Send welcome email with account details
            // Mail::to($service->user->email)->send(new WelcomeEmail($service));

            Log::info("Welcome email sent for service #{$service->id}", [
                'service_id' => $service->id,
                'client_email' => $service->user->email,
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send welcome email for service #{$service->id}", [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
