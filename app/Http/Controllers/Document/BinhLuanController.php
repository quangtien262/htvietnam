<?php

namespace App\Http\Controllers\Document;

use App\Http\Controllers\Controller;
use App\Models\Document\BinhLuan;
use App\Models\Document\File;
use App\Models\Document\ThuMuc;
use App\Models\Document\HoatDong;
use Illuminate\Http\Request;

class BinhLuanController extends Controller
{
    /**
     * Lấy danh sách bình luận của file hoặc folder
     */
    public function index(Request $request)
    {
        $request->validate([
            'file_id' => 'required_without:thu_muc_id|exists:tai_lieu_file,id',
            'thu_muc_id' => 'required_without:file_id|exists:tai_lieu_thu_muc,id',
        ]);

        $query = BinhLuan::with(['user', 'replies.user'])
            ->topLevel() // Chỉ lấy comment cha, không lấy replies
            ->orderBy('created_at', 'desc');

        if ($request->file_id) {
            $query->where('file_id', $request->file_id);
        }

        if ($request->thu_muc_id) {
            $query->where('thu_muc_id', $request->thu_muc_id);
        }

        $comments = $query->get();

        return response()->json($comments);
    }

    /**
     * Thêm bình luận mới
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'file_id' => 'required_without:thu_muc_id|exists:tai_lieu_file,id',
            'thu_muc_id' => 'required_without:file_id|exists:tai_lieu_thu_muc,id',
            'noi_dung' => 'required|string|max:2000',
            'parent_comment_id' => 'nullable|exists:tai_lieu_binh_luan,id',
        ]);

        $userId = auth('admin_users')->id();

        $comment = BinhLuan::create([
            'file_id' => $request->file_id,
            'thu_muc_id' => $request->thu_muc_id,
            'loai_doi_tuong' => $request->file_id ? 'file' : 'folder',
            'user_id' => $userId,
            'noi_dung' => $validated['noi_dung'],
            'parent_comment_id' => $request->parent_comment_id,
            'is_resolved' => false,
        ]);

        // Log activity
        HoatDong::log([
            'file_id' => $request->file_id,
            'thu_muc_id' => $request->thu_muc_id,
            'loai_doi_tuong' => $request->file_id ? 'file' : 'folder',
            'user_id' => $userId,
            'hanh_dong' => 'comment',
            'chi_tiet' => [
                'comment_id' => $comment->id,
                'noi_dung' => substr($validated['noi_dung'], 0, 100),
            ],
        ]);

        return response()->json($comment->load(['user', 'replies.user']), 201);
    }

    /**
     * Cập nhật bình luận
     */
    public function update(Request $request, $id)
    {
        $comment = BinhLuan::findOrFail($id);
        
        $userId = auth('admin_users')->id();
        
        // Chỉ cho phép người tạo sửa
        if ($comment->user_id !== $userId) {
            return response()->json(['error' => 'Không có quyền sửa bình luận này'], 403);
        }

        $validated = $request->validate([
            'noi_dung' => 'required|string|max:2000',
        ]);

        $comment->update($validated);

        return response()->json($comment->load('user'));
    }

    /**
     * Xóa bình luận
     */
    public function destroy($id)
    {
        $comment = BinhLuan::findOrFail($id);
        
        $userId = auth('admin_users')->id();
        
        // Chỉ cho phép người tạo xóa
        if ($comment->user_id !== $userId) {
            return response()->json(['error' => 'Không có quyền xóa bình luận này'], 403);
        }

        // Xóa cả replies
        $comment->replies()->delete();
        $comment->delete();

        return response()->json(['message' => 'Đã xóa bình luận']);
    }

    /**
     * Đánh dấu resolved/unresolved
     */
    public function toggleResolve($id)
    {
        $comment = BinhLuan::findOrFail($id);
        
        $comment->is_resolved = !$comment->is_resolved;
        $comment->save();

        return response()->json($comment);
    }

    /**
     * Lấy số lượng bình luận chưa giải quyết
     */
    public function unresolvedCount(Request $request)
    {
        $request->validate([
            'file_id' => 'required_without:thu_muc_id|exists:tai_lieu_file,id',
            'thu_muc_id' => 'required_without:file_id|exists:tai_lieu_thu_muc,id',
        ]);

        $query = BinhLuan::unresolved();

        if ($request->file_id) {
            $query->where('file_id', $request->file_id);
        }

        if ($request->thu_muc_id) {
            $query->where('thu_muc_id', $request->thu_muc_id);
        }

        $count = $query->count();

        return response()->json(['count' => $count]);
    }
}
