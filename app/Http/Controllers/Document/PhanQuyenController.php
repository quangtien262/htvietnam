<?php

namespace App\Http\Controllers\Document;

use App\Http\Controllers\Controller;
use App\Models\Document\PhanQuyen;
use App\Services\Document\DocumentService;
use Illuminate\Http\Request;

class PhanQuyenController extends Controller
{
    protected $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    /**
     * Danh sách người được chia sẻ
     */
    public function index(Request $request)
    {
        $query = PhanQuyen::with(['user', 'nguoiChiaSe']);

        if ($request->file_id) {
            $query->where('file_id', $request->file_id);
        }

        if ($request->thu_muc_id) {
            $query->where('thu_muc_id', $request->thu_muc_id);
        }

        $permissions = $query->active()->get();

        return response()->json($permissions);
    }

    /**
     * Chia sẻ cho user hoặc public
     */
    public function share(Request $request)
    {
        $validated = $request->validate([
            'loai_doi_tuong' => 'required|in:file,thu_muc',
            'doi_tuong_id' => 'required|integer',
            'loai_chia_se' => 'required|in:user,public',
            'users' => 'required_if:loai_chia_se,user|array',
            'users.*' => 'exists:admin_users,id',
            'quyen' => 'required|in:owner,editor,viewer,commenter',
            'ngay_het_han' => 'nullable|date',
        ]);

        $userId = auth('admin_users')->id() ?? auth()->id();
        $objectType = $validated['loai_doi_tuong'];
        $objectId = $validated['doi_tuong_id'];
        $loaiChiaSe = $validated['loai_chia_se'];
        $quyen = $validated['quyen'];
        $ngayHetHan = $validated['ngay_het_han'] ?? null;

        $fieldName = $objectType === 'file' ? 'file_id' : 'thu_muc_id';

        if ($loaiChiaSe === 'public') {
            // Chia sẻ công khai
            $share = PhanQuyen::create([
                $fieldName => $objectId,
                'loai_doi_tuong' => $objectType === 'thu_muc' ? 'folder' : $objectType,
                'loai_nguoi_dung' => 'public',
                'quyen' => $quyen,
                'ngay_het_han' => $ngayHetHan,
                'nguoi_chia_se_id' => $userId,
                'is_active' => true,
            ]);

            return response()->json(['message' => 'Chia sẻ công khai thành công', 'share' => $share], 201);
        } else {
            // Chia sẻ cho người dùng cụ thể
            $shares = [];
            foreach ($validated['users'] as $targetUserId) {
                $shares[] = PhanQuyen::create([
                    $fieldName => $objectId,
                    'loai_doi_tuong' => $objectType === 'thu_muc' ? 'folder' : $objectType,
                    'user_id' => $targetUserId,
                    'loai_nguoi_dung' => 'user',
                    'quyen' => $quyen,
                    'ngay_het_han' => $ngayHetHan,
                    'nguoi_chia_se_id' => $userId,
                    'is_active' => true,
                ]);
            }

            return response()->json(['message' => 'Chia sẻ thành công', 'shares' => $shares], 201);
        }
    }

    /**
     * Cập nhật quyền
     */
    public function update(Request $request, $id)
    {
        $permission = PhanQuyen::findOrFail($id);

        $validated = $request->validate([
            'quyen' => 'required|in:owner,editor,viewer,commenter',
            'ngay_het_han' => 'nullable|date',
        ]);

        $permission->update($validated);

        return response()->json($permission);
    }

    /**
     * Thu hồi quyền
     */
    public function revoke($id)
    {
        $permission = PhanQuyen::findOrFail($id);
        $permission->update(['is_active' => false]);

        return response()->json(['message' => 'Đã thu hồi quyền']);
    }
}
