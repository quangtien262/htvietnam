<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Models\Spa\TheGiaTri;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TheGiaTriController extends Controller
{
    /**
     * Get all gift cards
     */
    public function index(Request $request)
    {
        $query = TheGiaTri::query();

        // Filter by status
        if ($request->has('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ma_the', 'like', "%{$search}%")
                  ->orWhere('ten_the', 'like', "%{$search}%")
                  ->orWhere('ma_code', 'like', "%{$search}%");
            });
        }

        // Filter available for purchase
        if ($request->has('available') && $request->available) {
            $query->available();
        }

        $giftCards = $query->orderBy('created_at', 'desc')->get();

        return response()->json($giftCards);
    }

    /**
     * Get single gift card
     */
    public function show($id)
    {
        $giftCard = TheGiaTri::findOrFail($id);
        return response()->json($giftCard);
    }

    /**
     * Create new gift card
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ten_the' => 'required|string|max:255',
            'menh_gia' => 'required|numeric|min:0',
            'gia_ban' => 'required|numeric|min:0',
            'ti_le_thuong' => 'nullable|numeric|min:0|max:100',
            'ngay_het_han' => 'nullable|date|after:today',
            'trang_thai' => 'required|in:active,inactive',
            'mo_ta' => 'nullable|string',
            'ma_code' => 'nullable|string|max:50|unique:spa_the_gia_tri,ma_code',
            'so_luong_code' => 'nullable|integer|min:0',
            'code_het_han' => 'nullable|date|after:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Set defaults
        $data['ti_le_thuong'] = $data['ti_le_thuong'] ?? 0;
        $data['so_luong_code'] = $data['so_luong_code'] ?? 0;

        $giftCard = TheGiaTri::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Tạo thẻ giá trị thành công',
            'data' => $giftCard,
        ], 201);
    }

    /**
     * Update gift card
     */
    public function update(Request $request, $id)
    {
        $giftCard = TheGiaTri::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'ten_the' => 'sometimes|required|string|max:255',
            'menh_gia' => 'sometimes|required|numeric|min:0',
            'gia_ban' => 'sometimes|required|numeric|min:0',
            'ti_le_thuong' => 'nullable|numeric|min:0|max:100',
            'ngay_het_han' => 'nullable|date',
            'trang_thai' => 'sometimes|required|in:active,inactive',
            'mo_ta' => 'nullable|string',
            'ma_code' => 'nullable|string|max:50|unique:spa_the_gia_tri,ma_code,' . $id,
            'so_luong_code' => 'nullable|integer|min:0',
            'code_het_han' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $giftCard->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thẻ giá trị thành công',
            'data' => $giftCard->fresh(),
        ]);
    }

    /**
     * Delete gift card (soft delete)
     */
    public function destroy($id)
    {
        $giftCard = TheGiaTri::findOrFail($id);

        // Check if card has been used
        if ($giftCard->giaoDich()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa thẻ đã có giao dịch. Vui lòng đổi trạng thái thành inactive.',
            ], 422);
        }

        $giftCard->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa thẻ giá trị thành công',
        ]);
    }

    /**
     * Validate promo code
     */
    public function validateCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ma_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $giftCard = TheGiaTri::where('ma_code', $request->ma_code)
            ->where('trang_thai', 'active')
            ->first();

        if (!$giftCard) {
            return response()->json([
                'success' => false,
                'message' => 'Mã code không tồn tại hoặc đã bị vô hiệu hóa',
            ], 404);
        }

        if (!$giftCard->isCodeValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Mã code đã hết hạn hoặc đã hết lượt sử dụng',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mã code hợp lệ',
            'data' => [
                'gift_card' => $giftCard,
                'so_tien_nap' => $giftCard->so_tien_nap,
                'menh_gia' => $giftCard->menh_gia,
                'ti_le_thuong' => $giftCard->ti_le_thuong,
            ],
        ]);
    }
}
