<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Whmcs\CurrencyService;
use App\Models\Whmcs\Currency;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    protected $currencyService;

    public function __construct(CurrencyService $currencyService)
    {
        $this->currencyService = $currencyService;
    }

    /**
     * Get all currencies
     */
    public function index(Request $request)
    {
        try {
            $query = Currency::query();

            if ($request->active_only) {
                $query->active();
            }

            $currencies = $query->orderBy('code')->get();

            return response()->json([
                'success' => true,
                'data' => $currencies,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch currencies: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create currency
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:3|unique:whmcs_currencies,code',
            'name' => 'required|string|max:255',
            'symbol' => 'required|string|max:10',
            'format' => 'required|string|max:255',
            'exchange_rate' => 'required|numeric|min:0',
            'is_base' => 'boolean',
            'is_active' => 'boolean',
            'decimal_places' => 'required|integer|min:0|max:8',
            'position' => 'required|in:before,after',
        ]);

        try {
            $currency = $this->currencyService->createCurrency($request->all());

            return response()->json([
                'success' => true,
                'data' => $currency,
                'message' => 'Currency created successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create currency: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single currency
     */
    public function show($id)
    {
        try {
            $currency = Currency::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $currency,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Currency not found',
            ], 404);
        }
    }

    /**
     * Update currency
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'code' => 'sometimes|string|size:3|unique:whmcs_currencies,code,' . $id,
            'name' => 'sometimes|string|max:255',
            'symbol' => 'sometimes|string|max:10',
            'format' => 'sometimes|string|max:255',
            'exchange_rate' => 'sometimes|numeric|min:0',
            'is_base' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
            'decimal_places' => 'sometimes|integer|min:0|max:8',
            'position' => 'sometimes|in:before,after',
        ]);

        try {
            $currency = $this->currencyService->updateCurrency($id, $request->all());

            if (!$currency) {
                return response()->json([
                    'success' => false,
                    'message' => 'Currency not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $currency,
                'message' => 'Currency updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update currency: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete currency
     */
    public function destroy($id)
    {
        try {
            $this->currencyService->deleteCurrency($id);

            return response()->json([
                'success' => true,
                'message' => 'Currency deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Set base currency
     */
    public function setBase($id)
    {
        try {
            $success = $this->currencyService->setBaseCurrency($id);

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Currency not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Base currency updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to set base currency: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update exchange rates
     */
    public function updateRates()
    {
        try {
            $result = $this->currencyService->updateExchangeRates();

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Convert amount
     */
    public function convert(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'from' => 'required|string|size:3',
            'to' => 'required|string|size:3',
        ]);

        try {
            $convertedAmount = $this->currencyService->convert(
                $request->amount,
                $request->from,
                $request->to
            );

            $formatted = $this->currencyService->format($convertedAmount, $request->to);

            return response()->json([
                'success' => true,
                'data' => [
                    'original_amount' => $request->amount,
                    'converted_amount' => $convertedAmount,
                    'formatted' => $formatted,
                    'from' => $request->from,
                    'to' => $request->to,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get currency statistics
     */
    public function statistics()
    {
        try {
            $stats = $this->currencyService->getCurrencyStatistics();

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics: ' . $e->getMessage(),
            ], 500);
        }
    }
}
