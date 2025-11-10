<?php

namespace App\Events\Whmcs;

use App\Models\Whmcs\Invoice;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InvoicePaid
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Invoice $invoice
    ) {}
}
