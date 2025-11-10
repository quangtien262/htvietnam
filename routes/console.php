<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| WHMCS Automated Tasks Schedule
|--------------------------------------------------------------------------
*/

// Generate recurring invoices daily at 2:00 AM
Schedule::command('whmcs:generate-invoices')->dailyAt('02:00');

// Send invoice reminders daily at 9:00 AM
Schedule::command('whmcs:send-reminders')->dailyAt('09:00');

// Auto-suspend overdue services daily at 3:00 AM
Schedule::command('whmcs:auto-suspend')->dailyAt('03:00');
