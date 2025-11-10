<?php

namespace App\Console\Commands\Whmcs;

use App\Models\Whmcs\Service;
use App\Mail\Whmcs\ServiceSuspendedEmail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class AutoSuspendOverdueServices extends Command
{
    protected $signature = 'whmcs:auto-suspend';
    protected $description = 'Automatically suspend services with overdue invoices';

    public function handle()
    {
        $this->info('Checking for overdue services...');

        $autoSuspendDays = config('whmcs.provisioning.auto_suspend_days', 7);
        $cutoffDate = now()->subDays($autoSuspendDays);

        // Get active services with unpaid invoices older than cutoff date
        $services = Service::where('status', 'active')
            ->whereHas('client.invoices', function ($query) use ($cutoffDate) {
                $query->where('status', 'unpaid')
                    ->where('due_date', '<', $cutoffDate);
            })
            ->with('client')
            ->get();

        $suspendedCount = 0;

        foreach ($services as $service) {
            try {
                $service->suspend();
                
                // Send suspension email
                if (config('whmcs.provisioning.send_suspension_email', true)) {
                    Mail::to($service->client->email)->send(
                        new ServiceSuspendedEmail($service, 'Payment overdue')
                    );
                }

                $this->info("Suspended service: {$service->domain}");
                $suspendedCount++;

                Log::info('Service Auto-Suspended', [
                    'service_id' => $service->id,
                    'domain' => $service->domain,
                    'client_id' => $service->client_id,
                ]);

            } catch (\Exception $e) {
                $this->error("Failed to suspend service {$service->domain}: {$e->getMessage()}");
                
                Log::error('Auto-Suspend Failed', [
                    'service_id' => $service->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Suspended {$suspendedCount} services.");

        return Command::SUCCESS;
    }
}
