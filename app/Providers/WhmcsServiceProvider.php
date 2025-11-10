<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Services\Whmcs\Contracts\BillingServiceInterface;
use App\Services\Whmcs\BillingService;
use App\Services\Whmcs\Contracts\ServerManagementServiceInterface;
use App\Services\Whmcs\ServerManagementService;
use App\Services\Whmcs\Contracts\ProvisioningServiceInterface;
use App\Services\Whmcs\ProvisioningService;

class WhmcsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind service interfaces to implementations
        $this->app->bind(BillingServiceInterface::class, BillingService::class);
        $this->app->bind(ServerManagementServiceInterface::class, ServerManagementService::class);
        $this->app->bind(ProvisioningServiceInterface::class, ProvisioningService::class);

        // Merge config
        $this->mergeConfigFrom(__DIR__ . '/../../config/whmcs.php', 'whmcs');
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Tạm comment events để debug UrlGenerator issue
        /*
        // Register event listeners
        Event::listen(
            \App\Events\Whmcs\InvoicePaid::class,
            \App\Listeners\Whmcs\AutoProvisionServices::class,
        );

        Event::listen(
            \App\Events\Whmcs\ServiceProvisioned::class,
            \App\Listeners\Whmcs\SendWelcomeEmail::class,
        );

        Event::listen(
            \App\Events\Whmcs\ServiceSuspended::class,
            \App\Listeners\Whmcs\NotifyServiceSuspension::class,
        );
        */

        // Publish config (optional - for Laravel package development)
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../../config/whmcs.php' => config_path('whmcs.php'),
            ], 'whmcs-config');
        }
    }
}
