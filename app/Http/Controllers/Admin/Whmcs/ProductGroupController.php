<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\ProductGroup;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductGroupController extends Controller
{
    /**
     * Danh sách product groups
     */
    public function index(): JsonResponse
    {
        $groups = ProductGroup::orderBy('order')->orderBy('name')->get();
        return response()->json($groups);
    }

    /**
     * Tạo product group mới
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
        ]);

        $group = ProductGroup::create($validated);

        return response()->json([
            'success' => true,
            'data' => $group,
            'message' => 'Tạo nhóm sản phẩm thành công'
        ], 201);
    }

    /**
     * Chi tiết product group
     */
    public function show(ProductGroup $productGroup): JsonResponse
    {
        return response()->json($productGroup);
    }

    /**
     * Cập nhật product group
     */
    public function update(Request $request, ProductGroup $productGroup): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
        ]);

        $productGroup->update($validated);

        return response()->json([
            'success' => true,
            'data' => $productGroup,
            'message' => 'Cập nhật nhóm sản phẩm thành công'
        ]);
    }

    /**
     * Xóa product group
     */
    public function destroy(ProductGroup $productGroup): JsonResponse
    {
        // Check if group has products
        if ($productGroup->products()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa nhóm có sản phẩm. Vui lòng chuyển sản phẩm sang nhóm khác trước.'
            ], 422);
        }

        $productGroup->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa nhóm sản phẩm thành công'
        ]);
    }
}
