<?php

namespace App\Http\Controllers\Document;

use App\Http\Controllers\Controller;
use App\Models\Document\ChiaSeLink;
use App\Models\Document\File;
use App\Models\Document\ThuMuc;
use App\Models\Document\HoatDong;
use App\Services\Document\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ShareLinkController extends Controller
{
    protected $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    /**
     * Tạo link chia sẻ
     */
    public function create(Request $request)
    {
        $validated = $request->validate([
            'loai_doi_tuong' => 'required|in:file,thu_muc',
            'doi_tuong_id' => 'required|integer',
            'quyen' => 'required|in:viewer,editor,commenter',
            'mat_khau' => 'nullable|string|min:4',
            'ngay_het_han' => 'nullable|date',
            'luot_truy_cap_toi_da' => 'nullable|integer|min:1',
        ]);

        $link = $this->documentService->createShareLink(
            $validated['loai_doi_tuong'],
            $validated['doi_tuong_id'],
            $validated['quyen'],
            $validated['mat_khau'] ?? null,
            $validated['ngay_het_han'] ?? null,
            $validated['luot_truy_cap_toi_da'] ?? null
        );

        return response()->json([
            'link' => $link,
            'url' => $link->getFullUrl(),
        ], 201);
    }

    /**
     * Truy cập public link
     */
    public function access($hash, Request $request)
    {
        $link = ChiaSeLink::where('ma_link', $hash)->firstOrFail();

        if (!$link->isValid()) {
            return response()->json(['error' => 'Link đã hết hạn hoặc không hợp lệ'], 403);
        }

        // Check password if exists
        if ($link->mat_khau) {
            $request->validate(['mat_khau' => 'required|string']);
            
            if (!Hash::check($request->mat_khau, $link->mat_khau)) {
                return response()->json(['error' => 'Mật khẩu không đúng'], 401);
            }
        }

        $link->incrementAccess();

        // Get file/folder data
        $data = null;
        if ($link->file_id) {
            $data = File::with(['thuMuc', 'nguoiTaiLen'])->findOrFail($link->file_id);
        } else {
            $data = ThuMuc::with(['nguoiTao', 'files'])->findOrFail($link->thu_muc_id);
        }

        HoatDong::log([
            'file_id' => $link->file_id,
            'thu_muc_id' => $link->thu_muc_id,
            'loai_doi_tuong' => $link->loai_doi_tuong,
            'user_id' => null, // Public access
            'hanh_dong' => 'view',
            'chi_tiet' => ['via' => 'share_link', 'ma_link' => $hash],
        ]);

        return response()->json([
            'link' => $link,
            'data' => $data,
            'permission' => $link->quyen,
        ]);
    }

    /**
     * Danh sách link đã tạo
     */
    public function index(Request $request)
    {
        $query = ChiaSeLink::with(['file', 'thuMuc', 'nguoiTao'])
                            ->where('nguoi_tao_id', auth()->id());

        if ($request->file_id) {
            $query->where('file_id', $request->file_id);
        }

        if ($request->thu_muc_id) {
            $query->where('thu_muc_id', $request->thu_muc_id);
        }

        $links = $query->orderBy('created_at', 'desc')->get();

        return response()->json($links);
    }

    /**
     * Thu hồi link
     */
    public function revoke($id)
    {
        $link = ChiaSeLink::findOrFail($id);
        
        if ($link->nguoi_tao_id !== auth()->id()) {
            return response()->json(['error' => 'Không có quyền'], 403);
        }

        $link->update(['is_active' => false]);

        HoatDong::log([
            'file_id' => $link->file_id,
            'thu_muc_id' => $link->thu_muc_id,
            'loai_doi_tuong' => $link->loai_doi_tuong,
            'user_id' => auth()->id(),
            'hanh_dong' => 'revoke',
            'chi_tiet' => ['ma_link' => $link->ma_link],
        ]);

        return response()->json(['message' => 'Đã thu hồi link']);
    }
}
