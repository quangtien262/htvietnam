<?php

namespace App\Http\Controllers\Document;

use App\Http\Controllers\Controller;
use App\Models\Document\File;
use App\Models\Document\HoatDong;
use App\Services\Document\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    protected $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    /**
     * Danh sách file
     */
    public function index(Request $request)
    {
        $query = File::with(['thuMuc', 'nguoiTaiLen']);

        if ($request->thu_muc_id) {
            $query->where('thu_muc_id', $request->thu_muc_id);
        }

        if ($request->is_starred) {
            $query->starred();
        }

        if ($request->mime_type) {
            $query->byMimeType($request->mime_type);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('ten_file', 'like', '%' . $request->search . '%')
                  ->orWhere('ocr_data', 'like', '%' . $request->search . '%');
            });
        }

        $files = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json($files);
    }

    /**
     * Upload file
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:102400', // 100MB max
            'thu_muc_id' => 'nullable|exists:tai_lieu_thu_muc,id',
        ]);

        $file = $this->documentService->uploadFile($request, auth()->id());

        return response()->json($file->load(['thuMuc', 'nguoiTaiLen']), 201);
    }

    /**
     * Download file
     */
    public function download($id)
    {
        $file = File::findOrFail($id);
        $file->incrementDownload();

        HoatDong::log([
            'file_id' => $file->id,
            'loai_doi_tuong' => 'file',
            'user_id' => auth()->id(),
            'hanh_dong' => 'download',
            'chi_tiet' => ['ten_file' => $file->ten_file],
        ]);

        return Storage::disk('public')->download($file->duong_dan, $file->ten_file);
    }

    /**
     * Preview file (stream)
     */
    public function preview($id)
    {
        $file = File::findOrFail($id);
        $file->incrementView();

        HoatDong::log([
            'file_id' => $file->id,
            'loai_doi_tuong' => 'file',
            'user_id' => auth()->id(),
            'hanh_dong' => 'view',
            'chi_tiet' => ['ten_file' => $file->ten_file],
        ]);

        return Storage::disk('public')->response($file->duong_dan);
    }

    /**
     * Toggle starred
     */
    public function toggleStar($id)
    {
        $file = File::findOrFail($id);
        $file->is_starred = !$file->is_starred;
        $file->save();

        HoatDong::log([
            'file_id' => $file->id,
            'loai_doi_tuong' => 'file',
            'user_id' => auth()->id(),
            'hanh_dong' => $file->is_starred ? 'star' : 'unstar',
            'chi_tiet' => ['ten_file' => $file->ten_file],
        ]);

        return response()->json($file);
    }

    /**
     * Move file
     */
    public function move(Request $request, $id)
    {
        $file = File::findOrFail($id);
        $oldFolderId = $file->thu_muc_id;

        $request->validate([
            'thu_muc_id' => 'required|exists:tai_lieu_thu_muc,id',
        ]);

        $file->update(['thu_muc_id' => $request->thu_muc_id]);

        HoatDong::log([
            'file_id' => $file->id,
            'loai_doi_tuong' => 'file',
            'user_id' => auth()->id(),
            'hanh_dong' => 'move',
            'chi_tiet' => [
                'ten_file' => $file->ten_file,
                'from_folder' => $oldFolderId,
                'to_folder' => $request->thu_muc_id
            ],
        ]);

        return response()->json($file->load('thuMuc'));
    }

    /**
     * Copy file
     */
    public function copy(Request $request, $id)
    {
        $file = File::findOrFail($id);

        $request->validate([
            'thu_muc_id' => 'required|exists:tai_lieu_thu_muc,id',
        ]);

        $newFile = $file->replicate();
        $newFile->thu_muc_id = $request->thu_muc_id;
        $newFile->ten_file = 'Copy of ' . $file->ten_file;
        $newFile->nguoi_tai_len_id = auth()->id();
        $newFile->save();

        HoatDong::log([
            'file_id' => $newFile->id,
            'loai_doi_tuong' => 'file',
            'user_id' => auth()->id(),
            'hanh_dong' => 'copy',
            'chi_tiet' => ['copied_from' => $file->id, 'ten_file' => $newFile->ten_file],
        ]);

        return response()->json($newFile->load('thuMuc'), 201);
    }

    /**
     * Xóa file (soft delete)
     */
    public function destroy($id)
    {
        $file = File::findOrFail($id);
        $file->delete();

        HoatDong::log([
            'file_id' => $file->id,
            'loai_doi_tuong' => 'file',
            'user_id' => auth()->id(),
            'hanh_dong' => 'delete',
            'chi_tiet' => ['ten_file' => $file->ten_file],
        ]);

        return response()->json(['message' => 'Đã xóa file']);
    }

    /**
     * Khôi phục file
     */
    public function restore($id)
    {
        $file = File::withTrashed()->findOrFail($id);
        $file->restore();

        HoatDong::log([
            'file_id' => $file->id,
            'loai_doi_tuong' => 'file',
            'user_id' => auth()->id(),
            'hanh_dong' => 'restore',
            'chi_tiet' => ['ten_file' => $file->ten_file],
        ]);

        return response()->json($file);
    }

    /**
     * Danh sách file đã starred
     */
    public function starred()
    {
        $files = File::starred()->with(['thuMuc', 'nguoiTaiLen'])->get();
        return response()->json($files);
    }

    /**
     * Danh sách file recent
     */
    public function recent()
    {
        $files = File::recent()->with(['thuMuc', 'nguoiTaiLen'])->get();
        return response()->json($files);
    }

    /**
     * Danh sách file trong trash
     */
    public function trash()
    {
        $files = File::onlyTrashed()->with(['thuMuc', 'nguoiTaiLen'])->get();
        return response()->json($files);
    }
}
