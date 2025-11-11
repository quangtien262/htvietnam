<?php

namespace App\Services\Whmcs;

use App\Models\Whmcs\Invoice;
use App\Models\Whmcs\InvoiceItem;
use App\Models\User;
use App\Models\Whmcs\Transaction;
use App\Models\Whmcs\Service;
use App\Services\Whmcs\Contracts\BillingServiceInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class BillingService implements BillingServiceInterface
{
    public function createInvoice(int $userId, array $items, array $options = []): Invoice
    {
        return DB::transaction(function () use ($userId, $items, $options) {
            $client = User::findOrFail($userId);
            
            // Calculate totals (handle both amount/quantity and unit_price/qty formats)
            $subtotal = collect($items)->sum(function($item) {
                $price = $item['unit_price'] ?? $item['amount'] ?? 0;
                $qty = $item['qty'] ?? $item['quantity'] ?? 1;
                return $price * $qty;
            });
            
            $tax = $options['tax'] ?? 0;
            $total = $subtotal + $tax;
            
            $invoice = Invoice::create([
                'user_id' => $userId,
                'number' => $this->generateInvoiceNumber(),
                'status' => $options['status'] ?? 'unpaid',
                'subtotal' => $subtotal,
                'tax_total' => $tax,
                'total' => $total,
                'date' => now(),
                'due_date' => $options['due_date'] ?? now()->addDays(7),
                'notes' => $options['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                $unitPrice = $item['unit_price'] ?? $item['amount'] ?? 0;
                $qty = $item['qty'] ?? $item['quantity'] ?? 1;
                
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item['product_id'] ?? null,
                    'service_id' => $item['service_id'] ?? null,
                    'type' => $item['type'] ?? 'product',
                    'description' => $item['description'],
                    'unit_price' => $unitPrice,
                    'qty' => $qty,
                    'total' => $unitPrice * $qty,
                ]);
            }

            Log::info("Invoice #{$invoice->number} created for client #{$userId}", [
                'invoice_id' => $invoice->id,
                'total' => $total,
            ]);

            return $invoice->load('items');
        });
    }

    public function createServiceRenewalInvoice(int $serviceId, string $billingCycle): Invoice
    {
        $service = Service::with(['product.pricings', 'user'])->findOrFail($serviceId);
        
        $pricing = $service->product->pricings
            ->where('billing_cycle', $billingCycle)
            ->first();

        if (!$pricing) {
            throw new \Exception("No pricing found for billing cycle: {$billingCycle}");
        }

        $nextDueDate = Carbon::parse($service->next_due_date);
        
        return $this->createInvoice($service->user_id, [
            [
                'type' => 'service',
                'product_id' => $service->product_id,
                'description' => "Service Renewal - {$service->product->name} ({$service->domain})",
                'amount' => $pricing->price,
                'quantity' => 1,
            ]
        ], [
            'due_date' => $nextDueDate,
            'notes' => "Renewal for service period: {$nextDueDate->format('d/m/Y')} - {$nextDueDate->copy()->addMonths($this->getCycleMonths($billingCycle))->format('d/m/Y')}",
        ]);
    }

    public function recordPayment(int $invoiceId, float $amount, string $paymentMethod, array $metadata = []): Invoice
    {
        return DB::transaction(function () use ($invoiceId, $amount, $paymentMethod, $metadata) {
            $invoice = Invoice::findOrFail($invoiceId);

            if ($invoice->status === 'paid') {
                throw new \Exception("Invoice #{$invoice->invoice_number} is already paid");
            }

            $transaction = Transaction::create([
                'user_id' => $invoice->user_id,
                'invoice_id' => $invoice->id,
                'gateway' => $paymentMethod,
                'amount' => $amount,
                'transaction_id' => $metadata['transaction_id'] ?? null,
                'gateway_response' => $metadata['gateway_response'] ?? null,
                'status' => 'success',
            ]);

            $invoice->credit_applied += $amount;

            if ($invoice->credit_applied >= $invoice->total) {
                $invoice->status = 'paid';
                $invoice->paid_at = now();

                // Trigger event for auto-provisioning
                event(new \App\Events\Whmcs\InvoicePaid($invoice));
            }

            $invoice->save();

            Log::info("Payment recorded for invoice #{$invoice->invoice_number}", [
                'invoice_id' => $invoice->id,
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'transaction_id' => $transaction->id,
            ]);

            return $invoice->fresh();
        });
    }

    public function cancelInvoice(int $invoiceId, ?string $reason = null): Invoice
    {
        $invoice = Invoice::findOrFail($invoiceId);

        if ($invoice->status === 'paid') {
            throw new \Exception("Cannot cancel paid invoice #{$invoice->invoice_number}");
        }

        $invoice->update([
            'status' => 'cancelled',
            'notes' => $invoice->notes . "\n\nCancelled: " . ($reason ?? 'No reason provided'),
        ]);

        Log::info("Invoice #{$invoice->invoice_number} cancelled", [
            'invoice_id' => $invoice->id,
            'reason' => $reason,
        ]);

        return $invoice;
    }

    public function getOverdueInvoices(?int $daysOverdue = null): Collection
    {
        $query = Invoice::where('status', 'unpaid')
            ->where('due_date', '<', now());

        if ($daysOverdue !== null) {
            $query->where('due_date', '<=', now()->subDays($daysOverdue));
        }

        return $query->with(['client', 'items'])->get();
    }

    public function sendPaymentReminder(int $invoiceId, string $type = 'first'): bool
    {
        $invoice = Invoice::with('client')->findOrFail($invoiceId);

        // TODO: Implement email sending logic
        // Mail::to($invoice->user->email)->send(new PaymentReminderMail($invoice, $type));

        Log::info("Payment reminder sent for invoice #{$invoice->invoice_number}", [
            'invoice_id' => $invoice->id,
            'user_id' => $invoice->user_id,
            'type' => $type,
        ]);

        return true;
    }

    public function applyCreditToInvoice(int $invoiceId, ?float $amount = null): Invoice
    {
        return DB::transaction(function () use ($invoiceId, $amount) {
            $invoice = Invoice::with('client')->findOrFail($invoiceId);
            $client = $invoice->user;

            if ($client->credit <= 0) {
                throw new \Exception("Client has no available credit");
            }

            $creditToApply = $amount ?? min($client->credit, $invoice->total - $invoice->amount_paid);
            
            $client->credit -= $creditToApply;
            $client->save();

            return $this->recordPayment($invoice->id, $creditToApply, 'credit', [
                'transaction_id' => 'CREDIT-' . time(),
            ]);
        });
    }

    public function addCredit(int $userId, float $amount, string $description): User
    {
        $client = User::findOrFail($userId);
        $client->credit += $amount;
        $client->save();

        Log::info("Credit added to client #{$userId}", [
            'amount' => $amount,
            'description' => $description,
            'new_balance' => $client->credit,
        ]);

        return $client;
    }

    public function getRevenue(string $startDate, string $endDate, ?string $status = 'paid'): array
    {
        $query = Invoice::whereBetween('date', [$startDate, $endDate]);

        if ($status) {
            $query->where('status', $status);
        }

        $invoices = $query->get();

        $breakdown = $invoices->groupBy(function ($invoice) {
            return Carbon::parse($invoice->date)->format('Y-m');
        })->map(function ($monthInvoices) {
            return [
                'total' => $monthInvoices->sum('total'),
                'count' => $monthInvoices->count(),
            ];
        });

        return [
            'total' => $invoices->sum('total'),
            'count' => $invoices->count(),
            'breakdown' => $breakdown->toArray(),
        ];
    }

    protected function generateInvoiceNumber(): string
    {
        $latestInvoice = Invoice::latest('id')->first();
        $nextNumber = $latestInvoice ? ($latestInvoice->id + 1) : 1;
        
        return 'INV-' . date('Ymd') . '-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }

    protected function getCycleMonths(string $cycle): int
    {
        return match ($cycle) {
            'monthly' => 1,
            'quarterly' => 3,
            'semiannually' => 6,
            'annually' => 12,
            'biennially' => 24,
            'triennially' => 36,
            default => 1,
        };
    }
}
