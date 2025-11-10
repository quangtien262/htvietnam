<?php

namespace App\Mail\Whmcs;

use App\Models\Whmcs\Service;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $service;
    public $client;

    /**
     * Create a new message instance.
     */
    public function __construct(Service $service)
    {
        $this->service = $service;
        $this->client = $service->client;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Welcome! Your Service is Now Active')
                    ->markdown('emails.whmcs.welcome')
                    ->with([
                        'clientName' => $this->client->company_name ?? $this->client->user->name,
                        'serviceDomain' => $this->service->domain,
                        'productName' => $this->service->product->name,
                        'username' => $this->service->username,
                        'password' => $this->service->password,
                        'serverIp' => $this->service->server->ip_address ?? 'N/A',
                        'cpanelUrl' => $this->service->server->hostname ?? 'N/A',
                    ]);
    }
}
