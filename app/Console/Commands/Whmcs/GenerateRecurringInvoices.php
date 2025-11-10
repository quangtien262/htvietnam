<?php

namespace App\Console\Commands\Whmcs;

use App\Models\Whmcs\Service;
use App\Models\Whmcs\Invoice;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GenerateRecurringInvoices extends Command
{
    protected $signature = 'whmcs:generate-invoices';
    protected $description = 'Generate recurring invoices for active services';

    public function handle()
    {
        $this->info('Generating recurring invoices...');

        // Get services that need invoice generation
        // Services with next_due_date within the next 7 days
        $services = Service::where('status', 'active')
            ->whereNotNull('next_due_date')
            ->where('next_due_date', '<=', now()->addDays(7))
            ->with(['client', 'product'])
            ->get();

        $generatedCount = 0;

        foreach ($services as $service) {
            // Check if invoice already exists for this service and period
            $existingInvoice = Invoice::where('client_id', $service->client_id)
                ->whereHas('items', function ($query) use ($service) {
                    $query->where('description', 'like', "%{$service->domain}%");
                })
                ->where('due_date', '>=', now())
                ->exists();

            if ($existingInvoice) {
                $this->info("Invoice already exists for service: {$service->domain}");
                continue;
            }

            DB::beginTransaction();
            try {
                // Create invoice
                $invoice = Invoice::create([
                    'client_id' => $service->client_id,
                    'invoice_number' => $this->generateInvoiceNumber(),
                    'status' => 'unpaid',
                    'due_date' => $service->next_due_date,
                    'subtotal' => $service->recurring_amount,
                    'tax' => 0,
                    'total' => $service->recurring_amount,
                    'notes' => "Recurring invoice for {$service->domain}",
                ]);

                // Add invoice item
                $invoice->items()->create([
                    'description' => "{$service->product->name} - {$service->domain}",
                    'quantity' => 1,
                    'unit_price' => $service->recurring_amount,
                    'total' => $service->recurring_amount,
                    'service_id' => $service->id,
                ]);

                // Update service next due date
                $service->update([
                    'next_due_date' => $this->calculateNextDueDate(
                        $service->next_due_date,
                        $service->billing_cycle
                    ),
                ]);

                DB::commit();

                $this->info("Generated invoice {$invoice->invoice_number} for service: {$service->domain}");
                $generatedCount++;

                Log::info('Recurring Invoice Generated', [
                    'invoice_id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'service_id' => $service->id,
                    'amount' => $service->recurring_amount,
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                
                $this->error("Failed to generate invoice for service {$service->domain}: {$e->getMessage()}");
                
                Log::error('Invoice Generation Failed', [
                    'service_id' => $service->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Generated {$generatedCount} recurring invoices.");

        return Command::SUCCESS;
    }

    /**
     * Generate unique invoice number
     */
    private function generateInvoiceNumber(): string
    {
        $prefix = 'INV';
        $date = now()->format('Ymd');
        $lastInvoice = Invoice::whereDate('created_at', today())->latest()->first();
        $sequence = $lastInvoice ? (int)substr($lastInvoice->invoice_number, -4) + 1 : 1;
        
        return "{$prefix}{$date}" . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Calculate next due date based on billing cycle
     */
    private function calculateNextDueDate($currentDueDate, $billingCycle)
    {
        $date = \Carbon\Carbon::parse($currentDueDate);

        switch ($billingCycle) {
            case 'monthly':
                return $date->addMonth();
            case 'quarterly':
                return $date->addMonths(3);
            case 'semi_annually':
                return $date->addMonths(6);
            case 'annually':
                return $date->addYear();
            case 'biennially':
                return $date->addYears(2);
            case 'triennially':
                return $date->addYears(3);
            default:
                return $date->addMonth();
        }
    }
}
