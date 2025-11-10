<?php

namespace App\Events\Whmcs;

use App\Models\Whmcs\Service;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ServiceProvisioned
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Service $service
    ) {}
}
