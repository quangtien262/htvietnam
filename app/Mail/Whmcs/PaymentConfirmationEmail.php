<?php

namespace App\Mail\Whmcs;

use App\Models\Whmcs\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $transaction;
    public $invoice;
    public $client;

    /**
     * Create a new message instance.
     */
    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;
        $this->invoice = $transaction->invoice;
        $this->client = $transaction->client;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Payment Received - Thank You!')
                    ->markdown('emails.whmcs.payment-confirmation')
                    ->with([
                        'clientName' => $this->client->company_name ?? $this->client->user->name,
                        'transactionId' => $this->transaction->transaction_id,
                        'amount' => $this->transaction->amount,
                        'paymentMethod' => $this->transaction->payment_method,
                        'invoiceNumber' => $this->invoice->invoice_number ?? 'N/A',
                        'date' => $this->transaction->created_at->format('Y-m-d H:i:s'),
                    ]);
    }
}
