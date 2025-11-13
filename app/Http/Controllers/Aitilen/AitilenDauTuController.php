<?php

namespace App\Http\Controllers\Aitilen;

use App\Http\Controllers\Controller;
use App\Models\Aitilen\AitilenDauTu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AitilenDauTuController extends Controller
{
    /**
     * Lấy danh sách chi phí đầu tư
     */
    public function list(Request $request)
    {
        try {
            $searchData = $request->input('searchData', []);
            $page = $searchData['page'] ?? 1;
            $perPage = $searchData['per_page'] ?? 30;

            $query = AitilenDauTu::query()
                ->with(['supplier', 'loaiChi', 'apartment', 'room'])
                ->orderBy('sort_order', 'asc')
                ->orderBy('created_at', 'desc');

            // Filter by apartment
            if (!empty($searchData['apartment_id'])) {
                $query->where('apartment_id', $searchData['apartment_id']);
            }

            // Filter by room
            if (!empty($searchData['room_id'])) {
                $query->where('room_id', $searchData['room_id']);
            }

            // Filter by loai_chi
            if (!empty($searchData['loai_chi_id'])) {
                $query->where('loai_chi_id', $searchData['loai_chi_id']);
            }

            // Search
            if (!empty($searchData['keyword'])) {
                $keyword = $searchData['keyword'];
                $query->where(function($q) use ($keyword) {
                    $q->where('name', 'like', "%{$keyword}%")
                      ->orWhere('content', 'like', "%{$keyword}%");
                });
            }

            $total = $query->count();
            $data = $query->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => [
                    'datas' => $data,
                    'total' => $total,
                    'current_page' => $page,
                    'per_page' => $perPage,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Thêm mới chi phí đầu tư
     */
    public function add(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string',
                'content' => 'nullable|string',
                'supplier_id' => 'nullable|integer',
                'loai_chi_id' => 'nullable|integer',
                'apartment_id' => 'nullable|integer',
                'room_id' => 'nullable|integer',
                'price' => 'nullable|numeric',
                'is_save2soquy' => 'nullable|boolean',
                'is_save_purchase_orders' => 'nullable|boolean',
                'sort_order' => 'nullable|integer',
                'is_active' => 'nullable|boolean',
            ]);

            $dauTu = AitilenDauTu::create($validated);

            // Nếu chọn lưu sang sổ quỹ
            if ($request->is_save2soquy) {
                $this->saveThoSoQuy($dauTu);
            }

            // Nếu chọn lưu sang đơn mua hàng
            if ($request->is_save_purchase_orders) {
                $this->saveToPurchaseOrder($dauTu);
            }

            return response()->json([
                'status_code' => 200,
                'message' => 'Thêm chi phí đầu tư thành công',
                'data' => $dauTu->load(['supplier', 'loaiChi', 'apartment', 'room']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật chi phí đầu tư
     */
    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'required|integer|exists:aitilen_dau_tu,id',
                'name' => 'required|string',
                'content' => 'nullable|string',
                'supplier_id' => 'nullable|integer',
                'loai_chi_id' => 'nullable|integer',
                'apartment_id' => 'nullable|integer',
                'room_id' => 'nullable|integer',
                'price' => 'nullable|numeric',
                'is_save2soquy' => 'nullable|boolean',
                'is_save_purchase_orders' => 'nullable|boolean',
                'sort_order' => 'nullable|integer',
                'is_active' => 'nullable|boolean',
            ]);

            $dauTu = AitilenDauTu::findOrFail($request->id);
            $dauTu->update($validated);

            return response()->json([
                'status_code' => 200,
                'message' => 'Cập nhật chi phí đầu tư thành công',
                'data' => $dauTu->load(['supplier', 'loaiChi', 'apartment', 'room']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xóa chi phí đầu tư
     */
    public function delete(Request $request)
    {
        try {
            $validated = $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'required|integer|exists:aitilen_dau_tu,id',
            ]);

            AitilenDauTu::whereIn('id', $request->ids)->delete();

            return response()->json([
                'status_code' => 200,
                'message' => 'Xóa chi phí đầu tư thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật sort order
     */
    public function updateSortOrder(Request $request)
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array',
                'items.*.id' => 'required|integer|exists:aitilen_dau_tu,id',
                'items.*.sort_order' => 'required|integer',
            ]);

            foreach ($request->items as $item) {
                AitilenDauTu::where('id', $item['id'])
                    ->update(['sort_order' => $item['sort_order']]);
            }

            return response()->json([
                'status_code' => 200,
                'message' => 'Cập nhật thứ tự thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lưu sang sổ quỹ
     */
    private function saveThoSoQuy($dauTu)
    {
        // TODO: Implement logic lưu sang sổ quỹ
        // Tạo record trong bảng so_quy
    }

    /**
     * Lưu sang đơn mua hàng
     */
    private function saveToPurchaseOrder($dauTu)
    {
        // TODO: Implement logic lưu sang đơn mua hàng
        // Tạo record trong bảng purchase_orders
    }

    /**
     * Lấy danh sách để select
     */
    public function selectData(Request $request)
    {
        try {
            // Get suppliers (if table exists)
            try {
                $suppliers = DB::table('suppliers')
                    ->select('id', 'name')
                    ->where('is_active', 1)
                    ->orderBy('name', 'asc')
                    ->get();
            } catch (\Exception $e) {
                $suppliers = [];
            }

            // Get loai_chi
            $loaiChi = DB::table('loai_chi')
                ->select('id', 'name')
                ->orderBy('name', 'asc')
                ->get();

            // Get apartments (không có is_active column)
            $apartments = DB::table('apartment')
                ->select('id', 'name')
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Success',
                'data' => [
                    'suppliers' => $suppliers,
                    'loai_chi' => $loaiChi,
                    'apartments' => $apartments,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Thêm nhanh nhiều chi phí đầu tư cùng lúc
     */
    public function addBulk(Request $request)
    {
        try {
            // Validate basic structure
            $request->validate([
                'items' => 'required|array|min:1',
                'items.*.name' => 'nullable|string',
                'items.*.price' => 'nullable|numeric',
                'items.*.apartment_id' => 'nullable|integer',
                'items.*.loai_chi_id' => 'nullable|integer',
            ]);

            // Filter out empty items (items without name)
            $validItems = collect($request->items)->filter(function($item) {
                return !empty($item['name']) && trim($item['name']) !== '';
            })->values()->all();

            if (count($validItems) === 0) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Vui lòng nhập ít nhất 1 chi phí có tên',
                ], 400);
            }

            $created = [];
            $errors = [];

            DB::beginTransaction();

            foreach ($validItems as $index => $item) {
                try {
                    // Validate: if name exists, price is required
                    if (empty($item['price']) || $item['price'] <= 0) {
                        $errors[] = "Dòng " . ($index + 1) . ": Giá trị phải lớn hơn 0 khi đã có tên chi phí";
                        continue;
                    }

                    $dauTu = AitilenDauTu::create([
                        'name' => $item['name'],
                        'price' => $item['price'],
                        'apartment_id' => $item['apartment_id'] ?? null,
                        'loai_chi_id' => $item['loai_chi_id'] ?? null,
                        'is_active' => true,
                        'sort_order' => 0,
                    ]);
                    $created[] = $dauTu;
                } catch (\Exception $e) {
                    $errors[] = "Dòng " . ($index + 1) . ": " . $e->getMessage();
                }
            }

            if (count($errors) > 0) {
                DB::rollBack();
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Có lỗi xảy ra',
                    'errors' => $errors,
                ], 400);
            }

            DB::commit();

            return response()->json([
                'status_code' => 200,
                'message' => 'Thêm nhanh ' . count($created) . ' chi phí thành công',
                'data' => [
                    'created' => $created,
                    'total' => count($created),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status_code' => 500,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
