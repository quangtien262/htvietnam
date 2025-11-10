<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Whmcs\TaxService;
use App\Models\Whmcs\TaxRule;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    protected $taxService;

    public function __construct(TaxService $taxService)
    {
        $this->taxService = $taxService;
    }

    /**
     * Get all tax rules
     */
    public function index(Request $request)
    {
        try {
            $query = TaxRule::query();

            if ($request->active_only) {
                $query->active();
            }

            if ($request->country) {
                $query->byCountry($request->country);
            }

            $taxRules = $query->orderBy('priority')->orderBy('name')->get();

            return response()->json([
                'success' => true,
                'data' => $taxRules,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tax rules: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create tax rule
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0',
            'type' => 'required|in:percentage,fixed',
            'country' => 'nullable|string|size:2',
            'state' => 'nullable|string|max:255',
            'compound' => 'boolean',
            'priority' => 'integer|min:0',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        try {
            $taxRule = $this->taxService->createTaxRule($request->all());

            return response()->json([
                'success' => true,
                'data' => $taxRule,
                'message' => 'Tax rule created successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create tax rule: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single tax rule
     */
    public function show($id)
    {
        try {
            $taxRule = TaxRule::with('products')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $taxRule,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tax rule not found',
            ], 404);
        }
    }

    /**
     * Update tax rule
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'rate' => 'sometimes|numeric|min:0',
            'type' => 'sometimes|in:percentage,fixed',
            'country' => 'nullable|string|size:2',
            'state' => 'nullable|string|max:255',
            'compound' => 'sometimes|boolean',
            'priority' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'description' => 'nullable|string',
        ]);

        try {
            $taxRule = $this->taxService->updateTaxRule($id, $request->all());

            if (!$taxRule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tax rule not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $taxRule,
                'message' => 'Tax rule updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update tax rule: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete tax rule
     */
    public function destroy($id)
    {
        try {
            $this->taxService->deleteTaxRule($id);

            return response()->json([
                'success' => true,
                'message' => 'Tax rule deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get tax report
     */
    public function report(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        try {
            $report = $this->taxService->getTaxReport(
                $request->start_date,
                $request->end_date
            );

            return response()->json([
                'success' => true,
                'data' => $report,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get tax statistics
     */
    public function statistics()
    {
        try {
            $stats = $this->taxService->getTaxStatistics();

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

    /**
     * Preview tax calculation
     */
    public function preview(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'country' => 'required|string|size:2',
            'state' => 'nullable|string|max:255',
        ]);

        try {
            $preview = $this->taxService->previewTax(
                $request->amount,
                $request->country,
                $request->state
            );

            return response()->json([
                'success' => true,
                'data' => $preview,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to preview tax: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign tax to product
     */
    public function assignToProduct(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:whmcs_products,id',
            'tax_rule_id' => 'required|integer|exists:whmcs_tax_rules,id',
        ]);

        try {
            $success = $this->taxService->assignTaxToProduct(
                $request->product_id,
                $request->tax_rule_id
            );

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to assign tax to product',
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Tax assigned to product successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove tax from product
     */
    public function removeFromProduct(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:whmcs_products,id',
            'tax_rule_id' => 'required|integer|exists:whmcs_tax_rules,id',
        ]);

        try {
            $success = $this->taxService->removeTaxFromProduct(
                $request->product_id,
                $request->tax_rule_id
            );

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to remove tax from product',
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Tax removed from product successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
