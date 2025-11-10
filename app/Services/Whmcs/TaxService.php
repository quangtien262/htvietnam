<?php

namespace App\Services\Whmcs;

use App\Models\Whmcs\TaxRule;
use App\Models\Whmcs\Invoice;
use App\Models\Whmcs\Product;
use App\Models\User;

class TaxService
{
    /**
     * Calculate tax for invoice
     */
    public function calculateInvoiceTax(Invoice $invoice): array
    {
        $client = $invoice->client;
        
        if (!$client) {
            return [
                'tax_amount' => 0,
                'tax_rate' => 0,
                'tax_name' => null,
                'breakdown' => [],
            ];
        }

        // Get client's country and state from profile
        $country = $client->country ?? 'VN'; // Default to Vietnam
        $state = $client->state ?? null;

        // Get applicable tax rules
        $taxRules = TaxRule::getApplicableRules($country, $state);

        if ($taxRules->isEmpty()) {
            return [
                'tax_amount' => 0,
                'tax_rate' => 0,
                'tax_name' => null,
                'breakdown' => [],
            ];
        }

        $subtotal = $invoice->subtotal ?? 0;
        $totalTax = 0;
        $breakdown = [];
        $primaryTaxRule = $taxRules->first();

        foreach ($taxRules as $taxRule) {
            $taxAmount = $taxRule->calculateTax($subtotal, $totalTax);
            $totalTax += $taxAmount;

            $breakdown[] = [
                'name' => $taxRule->name,
                'rate' => $taxRule->rate,
                'amount' => $taxAmount,
                'type' => $taxRule->type,
                'compound' => $taxRule->compound,
            ];
        }

        return [
            'tax_amount' => round($totalTax, 2),
            'tax_rate' => $primaryTaxRule->rate,
            'tax_name' => $primaryTaxRule->name,
            'breakdown' => $breakdown,
        ];
    }

    /**
     * Apply tax to invoice
     */
    public function applyTaxToInvoice(Invoice $invoice): void
    {
        $taxData = $this->calculateInvoiceTax($invoice);

        $invoice->update([
            'tax_rate' => $taxData['tax_rate'],
            'tax_amount' => $taxData['tax_amount'],
            'tax_name' => $taxData['tax_name'],
            'total' => $invoice->subtotal + $taxData['tax_amount'] - ($invoice->credit_applied ?? 0),
        ]);
    }

    /**
     * Get tax rules for product
     */
    public function getProductTaxRules(Product $product)
    {
        return $product->taxRules;
    }

    /**
     * Assign tax rule to product
     */
    public function assignTaxToProduct(int $productId, int $taxRuleId): bool
    {
        $product = Product::find($productId);
        $taxRule = TaxRule::find($taxRuleId);

        if (!$product || !$taxRule) {
            return false;
        }

        $product->taxRules()->syncWithoutDetaching([$taxRuleId]);

        return true;
    }

    /**
     * Remove tax rule from product
     */
    public function removeTaxFromProduct(int $productId, int $taxRuleId): bool
    {
        $product = Product::find($productId);

        if (!$product) {
            return false;
        }

        $product->taxRules()->detach($taxRuleId);

        return true;
    }

    /**
     * Get tax report by period
     */
    public function getTaxReport(string $startDate, string $endDate): array
    {
        $invoices = Invoice::where('status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $totalTaxCollected = $invoices->sum('tax_amount');
        
        // Group by tax name
        $byTaxType = $invoices->groupBy('tax_name')->map(function ($group) {
            return [
                'count' => $group->count(),
                'total_tax' => $group->sum('tax_amount'),
                'total_amount' => $group->sum('total'),
            ];
        })->toArray();

        // Group by country (from client)
        $byCountry = $invoices->groupBy(function ($invoice) {
            return $invoice->client->country ?? 'Unknown';
        })->map(function ($group) {
            return [
                'count' => $group->count(),
                'total_tax' => $group->sum('tax_amount'),
                'total_amount' => $group->sum('total'),
            ];
        })->toArray();

        return [
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'total_tax_collected' => $totalTaxCollected,
            'total_invoices' => $invoices->count(),
            'by_tax_type' => $byTaxType,
            'by_country' => $byCountry,
        ];
    }

    /**
     * Get tax statistics
     */
    public function getTaxStatistics(): array
    {
        $totalRules = TaxRule::count();
        $activeRules = TaxRule::active()->count();

        // Get tax collected this month
        $thisMonth = Invoice::where('status', 'paid')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('tax_amount');

        // Get tax collected last month
        $lastMonth = Invoice::where('status', 'paid')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('tax_amount');

        // Get tax by country
        $byCountry = TaxRule::active()
            ->selectRaw('country, COUNT(*) as rule_count, AVG(rate) as avg_rate')
            ->whereNotNull('country')
            ->groupBy('country')
            ->get()
            ->toArray();

        return [
            'total_rules' => $totalRules,
            'active_rules' => $activeRules,
            'tax_this_month' => $thisMonth,
            'tax_last_month' => $lastMonth,
            'growth' => $lastMonth > 0 ? (($thisMonth - $lastMonth) / $lastMonth) * 100 : 0,
            'by_country' => $byCountry,
        ];
    }

    /**
     * Create tax rule
     */
    public function createTaxRule(array $data): TaxRule
    {
        return TaxRule::create($data);
    }

    /**
     * Update tax rule
     */
    public function updateTaxRule(int $id, array $data): ?TaxRule
    {
        $taxRule = TaxRule::find($id);

        if (!$taxRule) {
            return null;
        }

        $taxRule->update($data);

        return $taxRule->fresh();
    }

    /**
     * Delete tax rule
     */
    public function deleteTaxRule(int $id): bool
    {
        $taxRule = TaxRule::find($id);

        if (!$taxRule) {
            return false;
        }

        // Check if tax rule is used in invoices
        $usedInInvoices = Invoice::where('tax_name', $taxRule->name)->exists();

        if ($usedInInvoices) {
            throw new \Exception('Cannot delete tax rule that has been used in invoices');
        }

        // Detach from products
        $taxRule->products()->detach();

        $taxRule->delete();

        return true;
    }

    /**
     * Calculate tax preview (without saving)
     */
    public function previewTax(float $amount, string $country, ?string $state = null): array
    {
        $taxRules = TaxRule::getApplicableRules($country, $state);

        if ($taxRules->isEmpty()) {
            return [
                'subtotal' => $amount,
                'tax_amount' => 0,
                'total' => $amount,
                'breakdown' => [],
            ];
        }

        $totalTax = 0;
        $breakdown = [];

        foreach ($taxRules as $taxRule) {
            $taxAmount = $taxRule->calculateTax($amount, $totalTax);
            $totalTax += $taxAmount;

            $breakdown[] = [
                'name' => $taxRule->name,
                'rate' => $taxRule->rate,
                'amount' => round($taxAmount, 2),
                'formatted_rate' => $taxRule->formatted_rate,
            ];
        }

        return [
            'subtotal' => $amount,
            'tax_amount' => round($totalTax, 2),
            'total' => round($amount + $totalTax, 2),
            'breakdown' => $breakdown,
        ];
    }
}
