<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ProductsController extends Controller
{
    /**
     * Get languages list ordered by sort_order
     */
    public function getLanguages()
    {
        try {
            $languages = DB::table('languages')
                ->orderBy('sort_order', 'asc')
                ->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Lấy danh sách ngôn ngữ thành công',
                'data' => $languages
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get products list with pagination and search
     */
    public function apiList(Request $request)
    {
        try {
            $searchData = $request->input('searchData', []);
            $page = $searchData['page'] ?? 1;
            $pageSize = $searchData['pageSize'] ?? 20;
            $search = $searchData['search'] ?? '';
            $menu_id = $searchData['menu_id'] ?? null;
            $product_group_id = $searchData['product_group_id'] ?? null;
            $product_status_id = $searchData['product_status_id'] ?? null;
            $is_active = $searchData['is_active'] ?? null;
            $is_front = $searchData['is_front'] ?? null;
            $is_hot = $searchData['is_hot'] ?? null;

            $query = DB::table('products')
                ->where('is_recycle_bin', 0);

            // Search by name or code
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                        ->orWhere('code', 'like', '%' . $search . '%');
                });
            }

            // Filter by menu_id
            if ($menu_id !== null && $menu_id !== '') {
                $query->where('menu_id', $menu_id);
            }

            // Filter by product_group_id
            if ($product_group_id !== null && $product_group_id !== '') {
                $query->where('product_group_id', $product_group_id);
            }

            // Filter by product_status_id
            if ($product_status_id !== null && $product_status_id !== '') {
                $query->where('product_status_id', $product_status_id);
            }

            // Filter by is_active
            if ($is_active !== null && $is_active !== '') {
                $query->where('is_active', $is_active);
            }

            // Filter by is_front
            if ($is_front !== null && $is_front !== '') {
                $query->where('is_front', $is_front);
            }

            // Filter by is_hot
            if ($is_hot !== null && $is_hot !== '') {
                $query->where('is_hot', $is_hot);
            }

            $total = $query->count();

            // Sắp xếp: Mới nhất trên đầu (id desc)
            $products = $query->orderBy('id', 'desc')
                ->skip(($page - 1) * $pageSize)
                ->take($pageSize)
                ->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Lấy danh sách sản phẩm thành công',
                'data' => [
                    'list' => $products,
                    'total' => $total,
                    'page' => $page,
                    'pageSize' => $pageSize
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get product detail with all language data
     */
    public function apiDetail(Request $request)
    {
        try {
            $id = $request->input('id');

            if (!$id) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'ID không hợp lệ'
                ]);
            }

            // Get product main data
            $product = DB::table('products')->where('id', $id)->first();

            if (!$product) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Không tìm thấy sản phẩm'
                ]);
            }

            // Get all language data
            $productsData = DB::table('products_data')
                ->where('data_id', $id)
                ->get();

            // Convert to keyed by language_id
            $productsDataByLang = [];
            foreach ($productsData as $data) {
                $productsDataByLang[$data->languages_id] = $data;
            }

            return response()->json([
                'status_code' => 200,
                'message' => 'Lấy chi tiết sản phẩm thành công',
                'data' => [
                    'product' => $product,
                    'products_data' => $productsDataByLang
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Add new product
     */
    public function apiAdd(Request $request)
    {
        try {
            $productData = $request->input('product', []);
            $productsDataByLang = $request->input('products_data', []);

            $user = Auth::guard('admin_users')->user();
            $createBy = $user ? $user->id : 0;

            // Get name from first language (id = 1)
            $name = '';
            if (isset($productsDataByLang[1]) && isset($productsDataByLang[1]['name_data'])) {
                $name = $productsDataByLang[1]['name_data'];
            } else {
                // Fallback to first available language
                $firstLang = reset($productsDataByLang);
                $name = $firstLang['name_data'] ?? '';
            }

            // Insert product
            $productId = DB::table('products')->insertGetId([
                'code' => $productData['code'] ?? '',
                'name' => $name,
                'menu_id' => $productData['menu_id'] ?? 0,
                'product_group_id' => $productData['product_group_id'] ?? 0,
                'product_application_id' => $productData['product_application_id'] ?? 0,
                'product_status_id' => $productData['product_status_id'] ?? 1,
                'is_hot' => $productData['is_hot'] ?? 2,
                'gia_ban' => $productData['gia_ban'] ?? 0,
                'images' => $productData['images'] ?? '',
                'is_active' => $productData['is_active'] ?? 1,
                'is_front' => $productData['is_front'] ?? 0,
                'views' => $productData['views'] ?? 0,
                'sort_order' => $productData['sort_order'] ?? 0,
                'parent_id' => $productData['parent_id'] ?? 0,
                'create_by' => $createBy,
                'is_recycle_bin' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Insert products_data for each language
            foreach ($productsDataByLang as $langId => $data) {
                DB::table('products_data')->insert([
                    'data_id' => $productId,
                    'languages_id' => $langId,
                    'name_data' => $data['name_data'] ?? '',
                    'description' => $data['description'] ?? '',
                    'content' => $data['content'] ?? '',
                    'content02' => $data['content02'] ?? '',
                    'content03' => $data['content03'] ?? '',
                    'meta_title' => $data['meta_title'] ?? '',
                    'meta_keyword' => $data['meta_keyword'] ?? '',
                    'meta_description' => $data['meta_description'] ?? '',
                    'create_by' => $createBy,
                    'parent_id' => 0,
                    'is_recycle_bin' => 0,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return response()->json([
                'status_code' => 200,
                'message' => 'Thêm sản phẩm thành công',
                'data' => ['id' => $productId]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update product
     */
    public function apiUpdate(Request $request)
    {
        try {
            $id = $request->input('id');
            $productData = $request->input('product', []);
            $productsDataByLang = $request->input('products_data', []);

            if (!$id) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'ID không hợp lệ'
                ]);
            }

            $user = Auth::guard('admin_users')->user();
            $createBy = $user ? $user->id : 0;

            // Get name from first language (id = 1)
            $name = '';
            if (isset($productsDataByLang[1]) && isset($productsDataByLang[1]['name_data'])) {
                $name = $productsDataByLang[1]['name_data'];
            } else {
                // Fallback to first available language
                $firstLang = reset($productsDataByLang);
                $name = $firstLang['name_data'] ?? '';
            }

            // Update product
            DB::table('products')
                ->where('id', $id)
                ->update([
                    'code' => $productData['code'] ?? '',
                    'name' => $name,
                    'menu_id' => $productData['menu_id'] ?? 0,
                    'product_group_id' => $productData['product_group_id'] ?? 0,
                    'product_application_id' => $productData['product_application_id'] ?? 0,
                    'product_status_id' => $productData['product_status_id'] ?? 1,
                    'is_hot' => $productData['is_hot'] ?? 2,
                    'gia_ban' => $productData['gia_ban'] ?? 0,
                    'images' => $productData['images'] ?? '',
                    'is_active' => $productData['is_active'] ?? 1,
                    'is_front' => $productData['is_front'] ?? 0,
                    'views' => $productData['views'] ?? 0,
                    'sort_order' => $productData['sort_order'] ?? 0,
                    'parent_id' => $productData['parent_id'] ?? 0,
                    'updated_at' => now()
                ]);

            // Delete old products_data
            DB::table('products_data')->where('data_id', $id)->delete();

            // Insert new products_data
            foreach ($productsDataByLang as $langId => $data) {
                DB::table('products_data')->insert([
                    'data_id' => $id,
                    'languages_id' => $langId,
                    'name_data' => $data['name_data'] ?? '',
                    'description' => $data['description'] ?? '',
                    'content' => $data['content'] ?? '',
                    'content02' => $data['content02'] ?? '',
                    'content03' => $data['content03'] ?? '',
                    'meta_title' => $data['meta_title'] ?? '',
                    'meta_keyword' => $data['meta_keyword'] ?? '',
                    'meta_description' => $data['meta_description'] ?? '',
                    'create_by' => $createBy,
                    'parent_id' => 0,
                    'is_recycle_bin' => 0,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return response()->json([
                'status_code' => 200,
                'message' => 'Cập nhật sản phẩm thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Delete product (single or multiple)
     */
    public function apiDelete(Request $request)
    {
        try {
            $ids = $request->input('ids', []);

            if (empty($ids)) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Không có ID để xóa'
                ]);
            }

            // Soft delete products
            DB::table('products')
                ->whereIn('id', $ids)
                ->update(['is_recycle_bin' => 1]);

            // Soft delete products_data
            DB::table('products_data')
                ->whereIn('data_id', $ids)
                ->update(['is_recycle_bin' => 1]);

            return response()->json([
                'status_code' => 200,
                'message' => 'Xóa sản phẩm thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
        }
    }
}
