<?php

namespace App\Mail\Whmcs;

use App\Models\Whmcs\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InvoiceReminderEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $invoice;
    public $client;
    public $daysUntilDue;

    /**
     * Create a new message instance.
     */
    public function __construct(Invoice $invoice, int $daysUntilDue)
    {
        $this->invoice = $invoice;
        $this->client = $invoice->client;
        $this->daysUntilDue = $daysUntilDue;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = $this->daysUntilDue > 0
            ? "Invoice Due in {$this->daysUntilDue} Days"
            : "Invoice Overdue - Immediate Action Required";

        return $this->subject($subject)
                    ->markdown('emails.whmcs.invoice-reminder')
                    ->with([
                        'clientName' => $this->client->company_name ?? $this->client->user->name,
                        'invoiceNumber' => $this->invoice->invoice_number,
                        'total' => $this->invoice->total,
                        'dueDate' => $this->invoice->due_date->format('Y-m-d'),
                        'daysUntilDue' => $this->daysUntilDue,
                        'paymentUrl' => route('client.invoices.detail', $this->invoice->id),
                    ]);
    }
}
