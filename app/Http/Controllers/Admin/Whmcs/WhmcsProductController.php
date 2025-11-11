<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\WhmcsProduct;
use App\Models\Whmcs\WhmcsProductGroup;
use Illuminate\Http\Request;

class WhmcsProductController extends Controller
{
    public function apiList(Request $request)
    {
        try {
            $perPage = $request->input('perPage', 20);
            $search = $request->input('search', '');
            $groupId = $request->input('group_id', '');
            $type = $request->input('type', '');
            $status = $request->input('status', '');

            $query = WhmcsProduct::with(['group', 'pricing']);

            if ($search) {
                $query->where('name', 'like', "%{$search}%");
            }

            if ($groupId) {
                $query->where('group_id', $groupId);
            }

            if ($type) {
                $query->where('type', $type);
            }

            if ($status !== '') {
                $query->where('hidden', $status == 'hidden' ? 1 : 0);
            }

            $products = $query->orderBy('order', 'asc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $products
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiDetail($id)
    {
        try {
            $product = WhmcsProduct::with(['group', 'pricing', 'fields', 'addons'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $product
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function apiAdd(Request $request)
    {
        try {
            $validated = $request->validate([
                'group_id' => 'required|exists:whmcs_product_groups,id',
                'type' => 'required|in:hosting,reseller,server,addon,other',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'welcome_email' => 'nullable|string',
                'stock_control' => 'boolean',
                'qty' => 'nullable|integer|min:0',
                'auto_setup' => 'nullable|in:on,payment,order',
                'server_type' => 'nullable|string',
                'hidden' => 'boolean',
                'order' => 'integer'
            ]);

            $product = WhmcsProduct::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Tạo sản phẩm thành công',
                'data' => $product
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiUpdate(Request $request, $id)
    {
        try {
            $product = WhmcsProduct::findOrFail($id);

            $validated = $request->validate([
                'group_id' => 'exists:whmcs_product_groups,id',
                'type' => 'in:hosting,reseller,server,addon,other',
                'name' => 'string|max:255',
                'description' => 'nullable|string',
                'welcome_email' => 'nullable|string',
                'stock_control' => 'boolean',
                'qty' => 'nullable|integer|min:0',
                'auto_setup' => 'nullable|in:on,payment,order',
                'server_type' => 'nullable|string',
                'hidden' => 'boolean',
                'order' => 'integer'
            ]);

            $product->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật sản phẩm thành công',
                'data' => $product
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiDelete($id)
    {
        try {
            $product = WhmcsProduct::findOrFail($id);

            // Check if product has active services
            if ($product->services()->where('status', 'Active')->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa sản phẩm có dịch vụ đang hoạt động'
                ], 400);
            }

            $product->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa sản phẩm thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiGroups()
    {
        try {
            $groups = WhmcsProductGroup::orderBy('order', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $groups
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
