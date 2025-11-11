<?php

namespace App\Services\Admin;

use App\Models\Whmcs\WhmcsInvoice;
use App\Models\Whmcs\WhmcsInvoiceItem;
use App\Models\Whmcs\WhmcsInvoicePayment;
use App\Models\Whmcs\WhmcsTransaction;
use App\Models\Whmcs\WhmcsActivityLog;
use Illuminate\Support\Str;

class WhmcsInvoiceService
{
    public function createInvoice(array $data)
    {
        try {
            \DB::beginTransaction();

            $invoiceNumber = 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(6));

            $invoice = WhmcsInvoice::create([
                'invoice_number' => $invoiceNumber,
                'client_id' => $data['client_id'],
                'currency_id' => $data['currency_id'],
                'date' => $data['date'],
                'due_date' => $data['due_date'],
                'subtotal' => 0,
                'tax' => 0,
                'total' => 0,
                'status' => 'Unpaid',
                'payment_method' => $data['payment_method'] ?? null,
                'notes' => $data['notes'] ?? null
            ]);

            $subtotal = 0;
            $totalTax = 0;

            foreach ($data['items'] as $item) {
                $itemTax = $item['amount'] * ($item['tax_rate'] ?? 0) / 100;

                WhmcsInvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'type' => 'Product',
                    'description' => $item['description'],
                    'amount' => $item['amount'],
                    'tax_rate' => $item['tax_rate'] ?? 0
                ]);

                $subtotal += $item['amount'];
                $totalTax += $itemTax;
            }

            $invoice->update([
                'subtotal' => $subtotal,
                'tax' => $totalTax,
                'total' => $subtotal + $totalTax
            ]);

            \DB::commit();
            return $invoice->load('items');
        } catch (\Exception $e) {
            \DB::rollBack();
            throw $e;
        }
    }

    public function markInvoiceAsPaid(WhmcsInvoice $invoice, array $data)
    {
        try {
            \DB::beginTransaction();

            // Create payment record
            WhmcsInvoicePayment::create([
                'invoice_id' => $invoice->id,
                'amount' => $data['amount'],
                'payment_method' => $data['payment_method'],
                'transaction_id' => $data['transaction_id'] ?? null,
                'date' => $data['payment_date']
            ]);

            // Create transaction
            WhmcsTransaction::create([
                'client_id' => $invoice->client_id,
                'invoice_id' => $invoice->id,
                'transaction_id' => $data['transaction_id'] ?? 'MANUAL-' . strtoupper(Str::random(8)),
                'gateway_id' => null, // Manual payment
                'currency_id' => $invoice->currency_id,
                'date' => $data['payment_date'],
                'amount' => $data['amount'],
                'description' => 'Manual payment for invoice ' . $invoice->invoice_number
            ]);

            // Update invoice status
            $invoice->update([
                'status' => 'Paid',
                'date_paid' => $data['payment_date']
            ]);

            // Log activity
            WhmcsActivityLog::create([
                'client_id' => $invoice->client_id,
                'admin_user_id' => auth('admin')->id(),
                'action' => 'Invoice Paid',
                'description' => "Invoice {$invoice->invoice_number} marked as paid",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            // Activate related services
            $this->activateRelatedServices($invoice);

            \DB::commit();
            return $invoice->load('payments', 'transactions');
        } catch (\Exception $e) {
            \DB::rollBack();
            throw $e;
        }
    }

    protected function activateRelatedServices(WhmcsInvoice $invoice)
    {
        // If invoice is from an order, activate the services
        if ($invoice->order) {
            foreach ($invoice->order->items as $orderItem) {
                $service = $orderItem->service;
                if ($service && $service->status == 'Pending') {
                    $service->update(['status' => 'Active']);
                }
            }
        }
    }

    public function generateRecurringInvoice(WhmcsInvoice $originalInvoice)
    {
        $data = [
            'client_id' => $originalInvoice->client_id,
            'currency_id' => $originalInvoice->currency_id,
            'date' => now(),
            'due_date' => now()->addDays(7),
            'payment_method' => $originalInvoice->payment_method,
            'items' => $originalInvoice->items->map(function ($item) {
                return [
                    'description' => $item->description,
                    'amount' => $item->amount,
                    'tax_rate' => $item->tax_rate
                ];
            })->toArray()
        ];

        return $this->createInvoice($data);
    }
}
