<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CommonSettingController extends Controller
{
    /**
     * Validate table name để tránh SQL injection
     */
    private function validateTableName($tableName)
    {
        // Lấy danh sách các bảng cho phép từ config
        $allowedTables = config('constant.allowed_setting_tables', []);

        if (!in_array($tableName, $allowedTables)) {
            return false;
        }

        // Kiểm tra bảng có tồn tại không
        if (!Schema::hasTable($tableName)) {
            return false;
        }

        return true;
    }

    /**
     * API: Lấy danh sách settings
     */
    public function apiList(Request $request, $tableName)
    {
        try {
            if (!$this->validateTableName($tableName)) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Tên bảng không hợp lệ',
                ], 400);
            }

            $searchData = $request->input('searchData', []);
            $page = $searchData['page'] ?? 1;
            $perPage = $searchData['per_page'] ?? 100;

            $query = DB::table($tableName);

            // Search by keyword
            if (!empty($searchData['keyword'])) {
                $keyword = $searchData['keyword'];
                $query->where('name', 'like', "%{$keyword}%");
            }

            // Order by sort_order
            if (Schema::hasColumn($tableName, 'sort_order')) {
                $query->orderBy('sort_order', 'asc');
            }
            $query->orderBy('id', 'asc');

            // Pagination
            $total = $query->count();
            $datas = $query->skip(($page - 1) * $perPage)
                          ->take($perPage)
                          ->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => [
                    'datas' => $datas,
                    'total' => $total,
                    'table_name' => $tableName,
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
     * API: Thêm mới setting
     */
    public function apiAdd(Request $request, $tableName)
    {
        try {
            if (!$this->validateTableName($tableName)) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Tên bảng không hợp lệ',
                ], 400);
            }

            DB::beginTransaction();

            $data = [
                'name' => $request->name,
            ];

            // Thêm các trường nếu tồn tại trong bảng
            if (Schema::hasColumn($tableName, 'color')) {
                $data['color'] = $request->color;
            }
            if (Schema::hasColumn($tableName, 'icon')) {
                $data['icon'] = $request->icon;
            }
            if (Schema::hasColumn($tableName, 'is_default')) {
                $data['is_default'] = $request->is_default ?? 0;
            }
            if (Schema::hasColumn($tableName, 'sort_order')) {
                // Lấy sort_order lớn nhất + 1
                $maxSortOrder = DB::table($tableName)->max('sort_order') ?? 0;
                $data['sort_order'] = $maxSortOrder + 1;
            }
            if (Schema::hasColumn($tableName, 'created_at')) {
                $data['created_at'] = now();
                $data['updated_at'] = now();
            }

            $id = DB::table($tableName)->insertGetId($data);

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Thêm mới thành công',
                'data' => ['id' => $id]
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
     * API: Cập nhật setting
     */
    public function apiUpdate(Request $request, $tableName)
    {
        try {
            if (!$this->validateTableName($tableName)) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Tên bảng không hợp lệ',
                ], 400);
            }

            DB::beginTransaction();

            $id = $request->id;
            $data = [
                'name' => $request->name,
            ];

            // Cập nhật các trường nếu tồn tại
            if (Schema::hasColumn($tableName, 'color')) {
                $data['color'] = $request->color;
            }
            if (Schema::hasColumn($tableName, 'icon')) {
                $data['icon'] = $request->icon;
            }
            if (Schema::hasColumn($tableName, 'is_default')) {
                $data['is_default'] = $request->is_default ?? 0;
            }
            if (Schema::hasColumn($tableName, 'updated_at')) {
                $data['updated_at'] = now();
            }

            DB::table($tableName)->where('id', $id)->update($data);

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
     * API: Xóa setting
     */
    public function apiDelete(Request $request, $tableName)
    {
        try {
            if (!$this->validateTableName($tableName)) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Tên bảng không hợp lệ',
                ], 400);
            }

            $ids = $request->ids ?? [];

            if (empty($ids)) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Vui lòng chọn mục cần xóa',
                ], 400);
            }

            DB::table($tableName)->whereIn('id', $ids)->delete();

            return response()->json([
                'status_code' => 200,
                'message' => 'Xóa thành công',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Cập nhật sort_order (kéo thả)
     */
    public function apiUpdateSortOrder(Request $request, $tableName)
    {
        try {
            if (!$this->validateTableName($tableName)) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Tên bảng không hợp lệ',
                ], 400);
            }

            if (!Schema::hasColumn($tableName, 'sort_order')) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Bảng không hỗ trợ sắp xếp',
                ], 400);
            }

            DB::beginTransaction();

            $items = $request->items ?? []; // [{ id: 1, sort_order: 1 }, ...]

            foreach ($items as $item) {
                DB::table($tableName)
                    ->where('id', $item['id'])
                    ->update(['sort_order' => $item['sort_order']]);
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
