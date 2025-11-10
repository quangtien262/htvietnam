<?php

namespace App\Listeners\Whmcs;

use App\Events\Whmcs\ServiceSuspended;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotifyServiceSuspension
{
    public function handle(ServiceSuspended $event): void
    {
        $service = $event->service->load('user');

        try {
            // TODO: Send suspension notification email
            // Mail::to($service->user->email)->send(new SuspensionNotificationEmail($service, $event->reason));

            Log::info("Suspension notification sent for service #{$service->id}", [
                'service_id' => $service->id,
                'client_email' => $service->user->email,
                'reason' => $event->reason,
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send suspension notification for service #{$service->id}", [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
