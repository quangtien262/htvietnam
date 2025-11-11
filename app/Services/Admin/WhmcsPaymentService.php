<?php

namespace App\Services\Admin;

use App\Models\Whmcs\WhmcsTransaction;
use App\Models\Whmcs\WhmcsInvoice;
use App\Models\Whmcs\WhmcsInvoicePayment;

class WhmcsPaymentService
{
    public function addPayment(array $data)
    {
        try {
            \DB::beginTransaction();

            $invoice = WhmcsInvoice::findOrFail($data['invoice_id']);

            // Create payment record
            WhmcsInvoicePayment::create([
                'invoice_id' => $data['invoice_id'],
                'amount' => $data['amount'],
                'payment_method' => $data['payment_method'],
                'transaction_id' => $data['transaction_id'],
                'date' => $data['date']
            ]);

            // Create transaction record
            $transaction = WhmcsTransaction::create([
                'client_id' => $invoice->client_id,
                'invoice_id' => $data['invoice_id'],
                'transaction_id' => $data['transaction_id'],
                'gateway_id' => $data['gateway_id'],
                'currency_id' => $data['currency_id'],
                'date' => $data['date'],
                'amount' => $data['amount'],
                'description' => $data['description'] ?? 'Payment for invoice ' . $invoice->invoice_number
            ]);

            // Update invoice if fully paid
            $totalPaid = $invoice->payments()->sum('amount');
            if ($totalPaid >= $invoice->total) {
                $invoice->update([
                    'status' => 'Paid',
                    'date_paid' => $data['date']
                ]);
            }

            \DB::commit();
            return $transaction;
        } catch (\Exception $e) {
            \DB::rollBack();
            throw $e;
        }
    }
}
