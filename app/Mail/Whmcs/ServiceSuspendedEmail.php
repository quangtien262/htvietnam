<?php

namespace App\Mail\Whmcs;

use App\Models\Whmcs\Service;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ServiceSuspendedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $service;
    public $client;
    public $reason;

    /**
     * Create a new message instance.
     */
    public function __construct(Service $service, string $reason = 'Payment overdue')
    {
        $this->service = $service;
        $this->client = $service->client;
        $this->reason = $reason;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Service Suspended - Action Required')
                    ->markdown('emails.whmcs.service-suspended')
                    ->with([
                        'clientName' => $this->client->company_name ?? $this->client->user->name,
                        'serviceDomain' => $this->service->domain,
                        'productName' => $this->service->product->name,
                        'reason' => $this->reason,
                        'unpaidInvoices' => $this->client->invoices()->unpaid()->get(),
                        'totalDue' => $this->client->invoices()->unpaid()->sum('total'),
                    ]);
    }
}
