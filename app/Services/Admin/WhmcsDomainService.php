<?php

namespace App\Services\Admin;

use App\Models\Whmcs\WhmcsDomain;
use App\Models\Whmcs\WhmcsInvoice;
use App\Models\Whmcs\WhmcsInvoiceItem;
use App\Models\Whmcs\WhmcsActivityLog;
use Illuminate\Support\Str;

class WhmcsDomainService
{
    public function renewDomain(WhmcsDomain $domain, int $renewalPeriod)
    {
        try {
            \DB::beginTransaction();

            // Calculate new expiry date
            $currentExpiry = new \DateTime($domain->expiry_date);
            $currentExpiry->modify("+{$renewalPeriod} years");
            $newExpiry = $currentExpiry->format('Y-m-d');

            // Update domain
            $domain->update([
                'expiry_date' => $newExpiry,
                'next_due_date' => $newExpiry
            ]);

            // Create renewal invoice
            $invoice = $this->createRenewalInvoice($domain, $renewalPeriod);

            // Log activity
            WhmcsActivityLog::create([
                'client_id' => $domain->client_id,
                'admin_user_id' => auth('admin')->id(),
                'action' => 'Domain Renewed',
                'description' => "Domain {$domain->domain} renewed for {$renewalPeriod} year(s)",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            \DB::commit();
            return $domain->fresh();
        } catch (\Exception $e) {
            \DB::rollBack();
            throw $e;
        }
    }

    protected function createRenewalInvoice(WhmcsDomain $domain, int $renewalPeriod)
    {
        $invoiceNumber = 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        $invoice = WhmcsInvoice::create([
            'invoice_number' => $invoiceNumber,
            'client_id' => $domain->client_id,
            'currency_id' => $domain->tld->currency_id ?? 1,
            'date' => now(),
            'due_date' => now()->addDays(7),
            'subtotal' => $domain->recurring_amount * $renewalPeriod,
            'tax' => 0,
            'total' => $domain->recurring_amount * $renewalPeriod,
            'status' => 'Unpaid',
            'payment_method' => null
        ]);

        WhmcsInvoiceItem::create([
            'invoice_id' => $invoice->id,
            'type' => 'Domain',
            'related_id' => $domain->id,
            'description' => "Domain Renewal - {$domain->domain} ({$renewalPeriod} year(s))",
            'amount' => $domain->recurring_amount * $renewalPeriod,
            'tax_rate' => 0
        ]);

        return $invoice;
    }
}
