<?php

namespace App\Console\Commands\Whmcs;

use App\Models\Whmcs\Invoice;
use App\Mail\Whmcs\InvoiceReminderEmail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendInvoiceReminders extends Command
{
    protected $signature = 'whmcs:send-reminders';
    protected $description = 'Send invoice payment reminders to clients';

    public function handle()
    {
        $this->info('Sending invoice reminders...');

        if (!config('whmcs.invoice.auto_send_reminder', true)) {
            $this->info('Auto reminder is disabled in config.');
            return Command::SUCCESS;
        }

        $reminderDays = config('whmcs.invoice.reminder_days', [3, 7, 14]);
        $sentCount = 0;

        foreach ($reminderDays as $days) {
            $targetDate = now()->addDays($days)->startOfDay();

            $invoices = Invoice::where('status', 'unpaid')
                ->whereDate('due_date', $targetDate)
                ->with('client')
                ->get();

            foreach ($invoices as $invoice) {
                try {
                    Mail::to($invoice->client->email)->send(
                        new InvoiceReminderEmail($invoice, $days)
                    );

                    $this->info("Sent reminder for invoice {$invoice->invoice_number} (due in {$days} days)");
                    $sentCount++;

                    Log::info('Invoice Reminder Sent', [
                        'invoice_id' => $invoice->id,
                        'invoice_number' => $invoice->invoice_number,
                        'days_until_due' => $days,
                        'client_id' => $invoice->client_id,
                    ]);

                } catch (\Exception $e) {
                    $this->error("Failed to send reminder for invoice {$invoice->invoice_number}: {$e->getMessage()}");
                    
                    Log::error('Invoice Reminder Failed', [
                        'invoice_id' => $invoice->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        // Also send overdue reminders
        $overdueInvoices = Invoice::where('status', 'unpaid')
            ->where('due_date', '<', now())
            ->with('client')
            ->get();

        foreach ($overdueInvoices as $invoice) {
            $daysOverdue = now()->diffInDays($invoice->due_date, false);
            
            try {
                Mail::to($invoice->client->email)->send(
                    new InvoiceReminderEmail($invoice, $daysOverdue)
                );

                $this->warn("Sent overdue reminder for invoice {$invoice->invoice_number} ({$daysOverdue} days overdue)");
                $sentCount++;

                Log::warning('Overdue Invoice Reminder Sent', [
                    'invoice_id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'days_overdue' => abs($daysOverdue),
                    'client_id' => $invoice->client_id,
                ]);

            } catch (\Exception $e) {
                $this->error("Failed to send overdue reminder: {$e->getMessage()}");
            }
        }

        $this->info("Sent {$sentCount} invoice reminders.");

        return Command::SUCCESS;
    }
}
