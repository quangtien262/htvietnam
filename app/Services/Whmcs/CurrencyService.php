<?php

namespace App\Services\Whmcs;

use App\Models\Whmcs\Currency;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class CurrencyService
{
    /**
     * Get all active currencies
     */
    public function getActiveCurrencies()
    {
        return Currency::active()->orderBy('code')->get();
    }

    /**
     * Get base currency
     */
    public function getBaseCurrency(): ?Currency
    {
        return Cache::remember('whmcs_base_currency', 3600, function () {
            return Currency::getBase();
        });
    }

    /**
     * Convert amount between currencies
     */
    public function convert(float $amount, string $fromCode, string $toCode): float
    {
        if ($fromCode === $toCode) {
            return $amount;
        }

        $fromCurrency = Currency::getByCode($fromCode);
        $toCurrency = Currency::getByCode($toCode);

        if (!$fromCurrency || !$toCurrency) {
            throw new \Exception('Invalid currency code');
        }

        return $fromCurrency->convertTo($amount, $toCurrency);
    }

    /**
     * Convert to base currency
     */
    public function convertToBase(float $amount, string $fromCode): float
    {
        $baseCurrency = $this->getBaseCurrency();
        if (!$baseCurrency) {
            throw new \Exception('Base currency not found');
        }

        return $this->convert($amount, $fromCode, $baseCurrency->code);
    }

    /**
     * Format amount with currency
     */
    public function format(float $amount, string $currencyCode): string
    {
        $currency = Currency::getByCode($currencyCode);
        
        if (!$currency) {
            return number_format($amount, 2);
        }

        return $currency->formatAmount($amount);
    }

    /**
     * Update exchange rate from external API
     */
    public function updateExchangeRates(): array
    {
        $baseCurrency = $this->getBaseCurrency();
        if (!$baseCurrency) {
            throw new \Exception('Base currency not found');
        }

        // Using exchangerate-api.com (free tier: 1500 requests/month)
        // Alternative: fixer.io, openexchangerates.org, currencyapi.com
        $apiKey = env('EXCHANGE_RATE_API_KEY', '');
        
        if (!$apiKey) {
            throw new \Exception('Exchange rate API key not configured');
        }

        try {
            $response = Http::get("https://v6.exchangerate-api.com/v6/{$apiKey}/latest/{$baseCurrency->code}");
            
            if (!$response->successful()) {
                throw new \Exception('Failed to fetch exchange rates');
            }

            $data = $response->json();
            $rates = $data['conversion_rates'] ?? [];

            $updated = [];
            foreach (Currency::active()->where('is_base', false)->get() as $currency) {
                if (isset($rates[$currency->code])) {
                    $currency->update(['exchange_rate' => $rates[$currency->code]]);
                    $updated[] = $currency->code;
                }
            }

            Cache::forget('whmcs_base_currency');

            return [
                'success' => true,
                'updated_count' => count($updated),
                'updated_currencies' => $updated,
                'timestamp' => now()->toDateTimeString(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Set currency as base
     */
    public function setBaseCurrency(int $currencyId): bool
    {
        $currency = Currency::find($currencyId);
        
        if (!$currency) {
            return false;
        }

        // Remove base flag from all currencies
        Currency::where('is_base', true)->update(['is_base' => false]);

        // Set new base currency
        $currency->update([
            'is_base' => true,
            'exchange_rate' => 1.000000,
        ]);

        Cache::forget('whmcs_base_currency');

        return true;
    }

    /**
     * Create new currency
     */
    public function createCurrency(array $data): Currency
    {
        // If this is marked as base, remove base from others
        if ($data['is_base'] ?? false) {
            Currency::where('is_base', true)->update(['is_base' => false]);
            $data['exchange_rate'] = 1.000000;
        }

        $currency = Currency::create($data);

        Cache::forget('whmcs_base_currency');

        return $currency;
    }

    /**
     * Update currency
     */
    public function updateCurrency(int $id, array $data): ?Currency
    {
        $currency = Currency::find($id);
        
        if (!$currency) {
            return null;
        }

        // If this is marked as base, remove base from others
        if (($data['is_base'] ?? false) && !$currency->is_base) {
            Currency::where('is_base', true)->update(['is_base' => false]);
            $data['exchange_rate'] = 1.000000;
        }

        $currency->update($data);

        Cache::forget('whmcs_base_currency');

        return $currency->fresh();
    }

    /**
     * Delete currency
     */
    public function deleteCurrency(int $id): bool
    {
        $currency = Currency::find($id);
        
        if (!$currency) {
            return false;
        }

        // Cannot delete base currency
        if ($currency->is_base) {
            throw new \Exception('Cannot delete base currency');
        }

        // Cannot delete if has related records
        if ($currency->invoices()->exists() || $currency->services()->exists() || $currency->transactions()->exists()) {
            throw new \Exception('Cannot delete currency with existing transactions');
        }

        $currency->delete();

        return true;
    }

    /**
     * Get currency statistics
     */
    public function getCurrencyStatistics(): array
    {
        $currencies = Currency::withCount(['invoices', 'services', 'transactions'])->get();

        return $currencies->map(function ($currency) {
            $totalInvoices = $currency->invoices()->sum('total');
            $totalServices = $currency->services()->sum('recurring_amount');

            return [
                'id' => $currency->id,
                'code' => $currency->code,
                'name' => $currency->name,
                'symbol' => $currency->symbol,
                'is_base' => $currency->is_base,
                'is_active' => $currency->is_active,
                'exchange_rate' => $currency->exchange_rate,
                'invoices_count' => $currency->invoices_count,
                'services_count' => $currency->services_count,
                'transactions_count' => $currency->transactions_count,
                'total_invoices_value' => $totalInvoices,
                'total_services_value' => $totalServices,
                'formatted_invoice_value' => $currency->formatAmount($totalInvoices),
                'formatted_service_value' => $currency->formatAmount($totalServices),
            ];
        })->toArray();
    }
}
