<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\Product;
use App\Models\Whmcs\ProductGroup;
use App\Models\Whmcs\ProductPricing;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Danh sách products
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['group', 'pricings']); // Ensure pricings are loaded

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('group_id')) {
            $query->where('product_group_id', $request->group_id);
        }

        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $products = $query->orderBy('name')->get();

        return response()->json($products); // Return array directly for simpler frontend handling
    }

    /**
     * Tạo product mới
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|in:hosting,reseller,server,domain,ssl,other',
            'group_id' => 'nullable|exists:whmcs_product_groups,id',
            'server_package_name' => 'nullable|string',
            'disk_space' => 'nullable|integer|min:0',
            'bandwidth' => 'nullable|integer|min:0',
            'features' => 'nullable|array',
            'welcome_email' => 'nullable|string',
            'active' => 'boolean',
            'status' => 'nullable|string|in:active,inactive',
            'pricings' => 'nullable|array',
            'pricings.*.cycle' => 'required_with:pricings|string|in:monthly,quarterly,semiannually,annually,biennially,triennially,onetime',
            'pricings.*.price' => 'required_with:pricings|numeric|min:0',
            'pricings.*.setup_fee' => 'nullable|numeric|min:0',
        ]);

        $product = Product::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'group_id' => $validated['group_id'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);

        // Tạo pricing cho các billing cycles
        if (isset($validated['pricings']) && is_array($validated['pricings'])) {
            foreach ($validated['pricings'] as $pricing) {
                // Skip empty pricings
                if (empty($pricing['cycle']) || !isset($pricing['price'])) {
                    continue;
                }
                
                ProductPricing::create([
                    'product_id' => $product->id,
                    'cycle' => $pricing['cycle'],
                    'price' => $pricing['price'],
                    'setup_fee' => $pricing['setup_fee'] ?? 0,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product->load(['group', 'pricings']),
        ], 201);
    }

    /**
     * Chi tiết product
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::with(['group', 'pricings', 'configurableOptions', 'servers'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Cập nhật product
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|string|in:hosting,reseller,server,domain,ssl,other',
            'product_group_id' => 'nullable|exists:whmcs_product_groups,id',
            'server_package_name' => 'nullable|string',
            'disk_space' => 'nullable|integer|min:0',
            'bandwidth' => 'nullable|integer|min:0',
            'features' => 'nullable|array',
            'welcome_email' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product->fresh(['group', 'pricings']),
        ]);
    }

    /**
     * Xóa product
     */
    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        // Kiểm tra xem còn service nào đang active không
        if ($product->services()->where('status', 'active')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete product with active services',
            ], 400);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Cập nhật pricing của product
     */
    public function updatePricing(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'pricings' => 'required|array|min:1',
            'pricings.*.id' => 'nullable|exists:whmcs_product_pricing,id',
            'pricings.*.cycle' => 'required|string|in:monthly,quarterly,semiannually,annually,biennially,triennially,onetime',
            'pricings.*.price' => 'required|numeric|min:0',
            'pricings.*.setup_fee' => 'nullable|numeric|min:0',
        ]);

        foreach ($validated['pricings'] as $pricingData) {
            if (isset($pricingData['id'])) {
                // Update existing pricing
                ProductPricing::where('id', $pricingData['id'])
                    ->where('product_id', $product->id) // Security check
                    ->update([
                        'cycle' => $pricingData['cycle'],
                        'price' => $pricingData['price'],
                        'setup_fee' => $pricingData['setup_fee'] ?? 0,
                    ]);
            } else {
                // Create new pricing
                ProductPricing::create([
                    'product_id' => $product->id,
                    'cycle' => $pricingData['cycle'],
                    'price' => $pricingData['price'],
                    'setup_fee' => $pricingData['setup_fee'] ?? 0,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Pricing updated successfully',
            'data' => $product->fresh(['pricings']),
        ]);
    }

    /**
     * Xóa pricing
     */
    public function deletePricing(int $id, int $pricingId): JsonResponse
    {
        ProductPricing::where('product_id', $id)
            ->where('id', $pricingId)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pricing deleted successfully',
        ]);
    }

    /**
     * ===== PRODUCT GROUPS =====
     */

    /**
     * Danh sách product groups
     */
    public function groups(Request $request): JsonResponse
    {
        $groups = ProductGroup::withCount('products')->get();

        return response()->json([
            'success' => true,
            'data' => $groups,
        ]);
    }

    /**
     * Tạo product group mới
     */
    public function storeGroup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $group = ProductGroup::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product group created successfully',
            'data' => $group,
        ], 201);
    }

    /**
     * Cập nhật product group
     */
    public function updateGroup(Request $request, int $id): JsonResponse
    {
        $group = ProductGroup::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $group->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product group updated successfully',
            'data' => $group,
        ]);
    }

    /**
     * Xóa product group
     */
    public function destroyGroup(int $id): JsonResponse
    {
        $group = ProductGroup::findOrFail($id);

        if ($group->products()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete group with products',
            ], 400);
        }

        $group->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product group deleted successfully',
        ]);
    }
}
