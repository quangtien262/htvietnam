<?php

namespace App\Http\Controllers\Document;

use App\Http\Controllers\Controller;
use App\Models\Document\ThuMuc;
use App\Models\Document\File;
use App\Models\Document\HoatDong;
use App\Models\Document\PhanQuyen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ThuMucController extends Controller
{
    /**
     * Lấy danh sách thư mục dạng tree
     */
    public function index(Request $request)
    {
        $query = ThuMuc::query();

        if ($request->loai) {
            $query->where('loai', $request->loai);
        }

        if ($request->is_public !== null) {
            $query->where('is_public', $request->is_public);
        }

        // Lấy tất cả thư mục root (không có parent)
        $rootFolders = $query->root()->orderBy('thu_tu_sap_xep')->get();

        // Load children recursively (without nguoiTao to avoid serialize issues)
        $rootFolders->load('children.children.children.children');

        return response()->json($rootFolders);
    }

    /**
     * Tạo thư mục mới
     */
    public function store(Request $request)
    {
        try {
            \Log::info('Create folder request:', $request->all());

            $validated = $request->validate([
                'ten_thu_muc' => 'required|string|max:255',
                'parent_id' => 'nullable|exists:tai_lieu_thu_muc,id',
                'mo_ta' => 'nullable|string',
                'loai' => 'nullable|in:ca_nhan,phong_ban,cong_ty,du_an',
                'is_public' => 'boolean',
                'mau_sac' => 'nullable|string|max:7',
                'icon' => 'nullable|string|max:50',
                'lien_ket_id' => 'nullable|integer',
                'loai_lien_ket' => 'nullable|string',
            ]);

            // Set default values
            $userId = auth('admin_users')->id() ?? auth()->id();
            \Log::info('User ID:', ['id' => $userId]);

            if (!$userId) {
                throw new \Exception('User not authenticated');
            }

            $validated['nguoi_tao_id'] = $userId;
            $validated['loai'] = $validated['loai'] ?? 'ca_nhan'; // Default là cá nhân
            $validated['is_public'] = $validated['is_public'] ?? false;

            \Log::info('Creating folder with data:', $validated);

            $folder = ThuMuc::create($validated);

            \Log::info('Folder created:', ['id' => $folder->id]);

            // Log activity (optional, skip if fails)
            try {
                HoatDong::log([
                    'thu_muc_id' => $folder->id,
                    'loai_doi_tuong' => 'folder',
                    'user_id' => $validated['nguoi_tao_id'],
                    'hanh_dong' => 'upload',
                    'chi_tiet' => ['ten_thu_muc' => $folder->ten_thu_muc],
                ]);
            } catch (\Exception $e) {
                \Log::warning('Activity log failed:', ['error' => $e->getMessage()]);
            }

            return response()->json([
                'id' => $folder->id,
                'ma_thu_muc' => $folder->ma_thu_muc,
                'ten_thu_muc' => $folder->ten_thu_muc,
                'parent_id' => $folder->parent_id,
                'loai' => $folder->loai,
                'is_public' => $folder->is_public,
                'mau_sac' => $folder->mau_sac,
                'icon' => $folder->icon,
                'created_at' => $folder->created_at,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error:', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Create folder error:', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Server error',
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Cập nhật thư mục
     */
    public function update(Request $request, $id)
    {
        $folder = ThuMuc::findOrFail($id);

        $validated = $request->validate([
            'ten_thu_muc' => 'string|max:255',
            'parent_id' => 'nullable|exists:tai_lieu_thu_muc,id',
            'mo_ta' => 'nullable|string',
            'mau_sac' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:50',
        ]);

        $oldData = ['ten_cu' => $folder->ten_thu_muc];
        $folder->update($validated);

        try {
            $userId = auth('admin_users')->id() ?? auth()->id();
            if ($userId) {
                HoatDong::log([
                    'thu_muc_id' => $folder->id,
                    'loai_doi_tuong' => 'folder',
                    'user_id' => $userId,
                    'hanh_dong' => 'rename',
                    'chi_tiet' => array_merge($oldData, ['ten_moi' => $folder->ten_thu_muc]),
                ]);
            }
        } catch (\Exception $e) {
            \Log::warning('Activity log failed:', ['error' => $e->getMessage()]);
        }

        return response()->json($folder);
    }

    /**
     * Xóa thư mục (soft delete)
     */
    public function destroy($id)
    {
        $folder = ThuMuc::findOrFail($id);
        $folder->delete();

        try {
            $userId = auth('admin_users')->id() ?? auth()->id();
            if ($userId) {
                HoatDong::log([
                    'thu_muc_id' => $folder->id,
                    'loai_doi_tuong' => 'folder',
                    'user_id' => $userId,
                    'hanh_dong' => 'delete',
                    'chi_tiet' => ['ten_thu_muc' => $folder->ten_thu_muc],
                ]);
            }
        } catch (\Exception $e) {
            \Log::warning('Activity log failed:', ['error' => $e->getMessage()]);
        }

        return response()->json(['message' => 'Đã xóa thư mục']);
    }

    /**
     * Khôi phục từ trash
     */
    public function restore($id)
    {
        $folder = ThuMuc::withTrashed()->findOrFail($id);
        $folder->restore();

        try {
            $userId = auth('admin_users')->id() ?? auth()->id();
            if ($userId) {
                HoatDong::log([
                    'thu_muc_id' => $folder->id,
                    'loai_doi_tuong' => 'folder',
                    'user_id' => $userId,
                    'hanh_dong' => 'restore',
                    'chi_tiet' => ['ten_thu_muc' => $folder->ten_thu_muc],
                ]);
            }
        } catch (\Exception $e) {
            \Log::warning('Activity log failed:', ['error' => $e->getMessage()]);
        }

        return response()->json($folder);
    }

    /**
     * Xóa vĩnh viễn thư mục và tất cả nội dung (force delete)
     */
    public function forceDelete($id)
    {
        $folder = ThuMuc::withTrashed()->findOrFail($id);
        
        // Recursively delete all files in this folder
        $files = File::withTrashed()->where('thu_muc_id', $folder->id)->get();
        foreach ($files as $file) {
            // Delete physical file
            if (Storage::disk('public')->exists($file->duong_dan)) {
                Storage::disk('public')->delete($file->duong_dan);
            }
            $file->forceDelete();
        }
        
        // Recursively delete all subfolders
        $subfolders = ThuMuc::withTrashed()->where('parent_id', $folder->id)->get();
        foreach ($subfolders as $subfolder) {
            $this->forceDelete($subfolder->id);
        }

        // Log before permanent deletion
        try {
            $userId = auth('admin_users')->id();
            if ($userId) {
                HoatDong::log([
                    'thu_muc_id' => $folder->id,
                    'loai_doi_tuong' => 'folder',
                    'user_id' => $userId,
                    'hanh_dong' => 'permanent_delete',
                    'chi_tiet' => [
                        'ten_thu_muc' => $folder->ten_thu_muc,
                        'files_deleted' => $files->count(),
                        'subfolders_deleted' => $subfolders->count()
                    ],
                ]);
            }
        } catch (\Exception $e) {
            \Log::warning('Activity log failed:', ['error' => $e->getMessage()]);
        }

        // Permanently delete the folder itself
        $folder->forceDelete();

        return response()->json(['message' => 'Đã xóa vĩnh viễn thư mục và tất cả nội dung']);
    }

    /**
     * Cập nhật thứ tự sắp xếp thư mục
     */
    public function updateSortOrder(Request $request)
    {
        try {
            \Log::info('Sort order request:', $request->all());

            $validated = $request->validate([
                'folders' => 'required|array',
                'folders.*.id' => 'required|exists:tai_lieu_thu_muc,id',
                'folders.*.thu_tu_sap_xep' => 'required|integer',
            ]);

            foreach ($validated['folders'] as $folderData) {
                ThuMuc::where('id', $folderData['id'])
                    ->update(['thu_tu_sap_xep' => $folderData['thu_tu_sap_xep']]);
            }

            // Log activity (optional, skip if fails)
            try {
                $userId = auth('admin_users')->id() ?? auth()->id();
                if ($userId) {
                    HoatDong::log([
                        'loai_doi_tuong' => 'folder',
                        'user_id' => $userId,
                        'hanh_dong' => 'edit',
                        'chi_tiet' => ['action' => 'reorder', 'so_luong' => count($validated['folders'])],
                    ]);
                }
            } catch (\Exception $e) {
                \Log::warning('Activity log failed:', ['error' => $e->getMessage()]);
            }

            return response()->json([
                'message' => 'Đã cập nhật thứ tự sắp xếp',
                'count' => count($validated['folders'])
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error:', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Update sort order error:', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Lỗi cập nhật thứ tự',
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Chia sẻ thư mục cho user hoặc public
     */
    public function share(Request $request, $id)
    {
        try {
            $folder = ThuMuc::findOrFail($id);
            $userId = auth('admin_users')->id() ?? auth()->id();

            $validated = $request->validate([
                'loai_chia_se' => 'required|in:user,public',
                'users' => 'required_if:loai_chia_se,user|array',
                'users.*' => 'exists:admin_users,id',
                'quyen' => 'required|in:owner,manager,editor,commenter,viewer',
                'ngay_het_han' => 'nullable|date',
            ]);

            $shares = [];

            if ($validated['loai_chia_se'] === 'public') {
                // Chia sẻ public
                $share = PhanQuyen::create([
                    'thu_muc_id' => $folder->id,
                    'loai_doi_tuong' => 'folder',
                    'loai_nguoi_dung' => 'public',
                    'quyen' => $validated['quyen'],
                    'ngay_het_han' => $validated['ngay_het_han'] ?? null,
                    'nguoi_chia_se_id' => $userId,
                    'is_active' => true,
                ]);
                $shares[] = $share;
            } else {
                // Chia sẻ cho users
                foreach ($validated['users'] as $targetUserId) {
                    $share = PhanQuyen::create([
                        'thu_muc_id' => $folder->id,
                        'loai_doi_tuong' => 'folder',
                        'user_id' => $targetUserId,
                        'loai_nguoi_dung' => 'user',
                        'quyen' => $validated['quyen'],
                        'ngay_het_han' => $validated['ngay_het_han'] ?? null,
                        'nguoi_chia_se_id' => $userId,
                        'is_active' => true,
                    ]);
                    $shares[] = $share;
                }
            }

            // Log activity
            try {
                if ($userId) {
                    HoatDong::log([
                        'thu_muc_id' => $folder->id,
                        'loai_doi_tuong' => 'folder',
                        'user_id' => $userId,
                        'hanh_dong' => 'share',
                        'chi_tiet' => [
                            'loai' => $validated['loai_chia_se'],
                            'so_luong' => count($shares),
                            'quyen' => $validated['quyen']
                        ],
                    ]);
                }
            } catch (\Exception $e) {
                \Log::warning('Activity log failed:', ['error' => $e->getMessage()]);
            }

            return response()->json([
                'message' => 'Đã chia sẻ thư mục',
                'shares' => $shares
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Share folder error:', [
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'message' => 'Lỗi chia sẻ thư mục',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách thư mục được chia sẻ với tôi
     */
    public function sharedWithMe(Request $request)
    {
        try {
            $userId = auth('admin_users')->id() ?? auth()->id();

            if (!$userId) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            // Lấy danh sách folder được chia sẻ (không tính public)
            $sharedFolders = ThuMuc::whereHas('phanQuyen', function ($query) use ($userId) {
                $query->where('user_id', $userId)
                      ->where('loai_nguoi_dung', 'user')
                      ->where('is_active', true)
                      ->where(function ($q) {
                          $q->whereNull('ngay_het_han')
                            ->orWhere('ngay_het_han', '>', now());
                      });
            })
            ->with(['nguoiTao', 'phanQuyen' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            }])
            ->orderBy('updated_at', 'desc')
            ->get();

            return response()->json($sharedFolders);
        } catch (\Exception $e) {
            \Log::error('Get shared folders error:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Lỗi lấy thư mục được chia sẻ',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách thư mục/file public
     */
    public function publicFolders(Request $request)
    {
        try {
            // Lấy folders public
            $publicFolders = ThuMuc::whereHas('phanQuyen', function ($query) {
                $query->where('loai_nguoi_dung', 'public')
                      ->where('is_active', true)
                      ->where(function ($q) {
                          $q->whereNull('ngay_het_han')
                            ->orWhere('ngay_het_han', '>', now());
                      });
            })
            ->with(['nguoiTao'])
            ->orderBy('updated_at', 'desc')
            ->get();

            return response()->json([
                'folders' => $publicFolders,
            ]);
        } catch (\Exception $e) {
            \Log::error('Get public folders error:', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Lỗi lấy thư mục chung',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
