<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class MenuController extends Controller
{
    /**
     * Chuyển đổi flat list thành tree structure
     */
    private function buildTree($items, $parentId = 0)
    {
        $branch = [];
        foreach ($items as $item) {
            if ($item->parent_id == $parentId) {
                $children = $this->buildTree($items, $item->id);
                if ($children) {
                    $item->children = $children;
                }
                $branch[] = $item;
            }
        }
        return $branch;
    }

    /**
     * API: Lấy danh sách languages
     */
    public function getLanguages(Request $request)
    {
        try {
            $languages = DB::table('languages')
                ->orderBy('sort_order', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => ['datas' => $languages]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Lấy danh sách menu dạng tree
     */
    public function apiList(Request $request)
    {
        try {
            $searchData = $request->input('searchData', []);

            // Lấy tất cả menus
            $query = DB::table('menus')
                ->where('is_recycle_bin', 0)
                ->orderBy('sort_order', 'asc')
                ->orderBy('id', 'asc');

            // Search by keyword
            if (!empty($searchData['keyword'])) {
                $keyword = $searchData['keyword'];
                $query->where('name', 'like', "%{$keyword}%");
            }

            $menus = $query->get();

            // Build tree structure
            $treeData = $this->buildTree($menus);

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => [
                    'datas' => $treeData,
                    'total' => count($menus),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Lấy chi tiết menu kèm data đa ngôn ngữ
     */
    public function apiDetail(Request $request)
    {
        try {
            $id = $request->id;

            $menu = DB::table('menus')->where('id', $id)->first();

            if (!$menu) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Không tìm thấy menu',
                ], 404);
            }

            // Lấy data đa ngôn ngữ
            $menuData = DB::table('menus_data')
                ->where('data_id', $id)
                ->get()
                ->keyBy('languages_id');

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => [
                    'menu' => $menu,
                    'menu_data' => $menuData,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Thêm mới menu
     */
    public function apiAdd(Request $request)
    {
        try {
            DB::beginTransaction();

            $user = Auth::guard('admin_users')->user();

            // Lấy sort_order lớn nhất trong cùng parent
            $maxSortOrder = DB::table('menus')
                ->where('parent_id', $request->parent_id ?? 0)
                ->max('sort_order') ?? 0;

            // Get name from first language (id = 1)
            $name = '';
            if ($request->menu_data && isset($request->menu_data[1]) && isset($request->menu_data[1]['name_data'])) {
                $name = $request->menu_data[1]['name_data'];
            } else if ($request->menu_data) {
                // Fallback to first available language
                $firstLang = reset($request->menu_data);
                $name = $firstLang['name_data'] ?? '';
            }

            // Thêm menu chính
            $menuId = DB::table('menus')->insertGetId([
                'name' => $name,
                'images' => $request->images ? json_encode($request->images) : null,
                'parent_id' => $request->parent_id ?? 0,
                'current_link' => $request->current_link,
                'icon' => $request->icon,
                'is_active' => $request->is_active ?? 1,
                'is_front' => $request->is_front ?? 0,
                'sort_order' => $maxSortOrder + 1,
                'create_by' => $user ? $user->id : 0,
                'is_recycle_bin' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Thêm data đa ngôn ngữ
            if ($request->menu_data) {
                foreach ($request->menu_data as $langId => $data) {
                    if (!empty($data['name_data'])) {
                        DB::table('menus_data')->insert([
                            'data_id' => $menuId,
                            'languages_id' => $langId,
                            'name_data' => $data['name_data'],
                            'name_data_description' => $data['name_data_description'] ?? null,
                            'description' => $data['description'] ?? null,
                            'content' => $data['content'] ?? null,
                            'meta_title' => $data['meta_title'] ?? null,
                            'meta_description' => $data['meta_description'] ?? null,
                            'meta_keyword' => $data['meta_keyword'] ?? null,
                            'create_by' => $user ? $user->id : 0,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Thêm mới thành công',
                'data' => ['id' => $menuId]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Cập nhật menu
     */
    public function apiUpdate(Request $request)
    {
        try {
            DB::beginTransaction();

            $id = $request->id;
            $user = Auth::guard('admin_users')->user();

            // Get name from first language (id = 1)
            $name = '';
            if ($request->menu_data && isset($request->menu_data[1]) && isset($request->menu_data[1]['name_data'])) {
                $name = $request->menu_data[1]['name_data'];
            } else if ($request->menu_data) {
                // Fallback to first available language
                $firstLang = reset($request->menu_data);
                $name = $firstLang['name_data'] ?? '';
            }

            // Cập nhật menu chính
            DB::table('menus')->where('id', $id)->update([
                'name' => $name,
                'images' => $request->images ? json_encode($request->images) : null,
                'current_link' => $request->current_link,
                'icon' => $request->icon,
                'is_active' => $request->is_active ?? 1,
                'is_front' => $request->is_front ?? 0,
                'updated_at' => now(),
            ]);

            // Xóa data cũ và thêm mới
            DB::table('menus_data')->where('data_id', $id)->delete();

            if ($request->menu_data) {
                foreach ($request->menu_data as $langId => $data) {
                    if (!empty($data['name_data'])) {
                        DB::table('menus_data')->insert([
                            'data_id' => $id,
                            'languages_id' => $langId,
                            'name_data' => $data['name_data'],
                            'name_data_description' => $data['name_data_description'] ?? null,
                            'description' => $data['description'] ?? null,
                            'content' => $data['content'] ?? null,
                            'meta_title' => $data['meta_title'] ?? null,
                            'meta_description' => $data['meta_description'] ?? null,
                            'meta_keyword' => $data['meta_keyword'] ?? null,
                            'create_by' => $user ? $user->id : 0,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Cập nhật thành công',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Xóa menu (đệ quy xóa cả menu con)
     */
    public function apiDelete(Request $request)
    {
        try {
            $ids = $request->ids ?? [];

            if (empty($ids)) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Vui lòng chọn menu cần xóa',
                ], 400);
            }

            DB::beginTransaction();

            // Hàm đệ quy lấy tất cả menu con
            $getAllChildIds = function($parentIds) use (&$getAllChildIds) {
                $childIds = DB::table('menus')
                    ->whereIn('parent_id', $parentIds)
                    ->pluck('id')
                    ->toArray();

                if (empty($childIds)) {
                    return [];
                }

                return array_merge($childIds, $getAllChildIds($childIds));
            };

            // Lấy tất cả ID cần xóa (bao gồm cả menu con)
            $allIds = array_merge($ids, $getAllChildIds($ids));

            // Xóa menu data
            DB::table('menus_data')->whereIn('data_id', $allIds)->delete();

            // Xóa menu
            DB::table('menus')->whereIn('id', $allIds)->delete();

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Xóa thành công',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Cập nhật sort_order và parent_id khi kéo thả
     */
    public function apiUpdateSortOrder(Request $request)
    {
        try {
            DB::beginTransaction();

            $items = $request->items ?? []; // [{ id, parent_id, sort_order }, ...]

            foreach ($items as $item) {
                DB::table('menus')
                    ->where('id', $item['id'])
                    ->update([
                        'parent_id' => $item['parent_id'] ?? 0,
                        'sort_order' => $item['sort_order'],
                        'updated_at' => now(),
                    ]);
            }

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Cập nhật thứ tự thành công',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
