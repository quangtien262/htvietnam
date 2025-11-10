<?php

namespace App\Services\Document;

use App\Models\Document\File;
use App\Models\Document\ThuMuc;
use App\Models\Document\PhienBan;
use App\Models\Document\PhanQuyen;
use App\Models\Document\ChiaSeLink;
use App\Models\Document\HoatDong;
use App\Models\Document\Quota;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use thiagoalessio\TesseractOCR\TesseractOCR;

class DocumentService
{
    /**
     * Upload file với version control
     */
    public function uploadFile($request, $userId)
    {
        $uploadedFile = $request->file('file');
        $thuMucId = $request->input('thu_muc_id');

        // Check/Create quota
        $quota = Quota::forUser($userId)->first();
        if (!$quota) {
            // Auto-create quota with 10GB limit
            $quota = Quota::create([
                'user_id' => $userId,
                'loai' => 'user',
                'dung_luong_gioi_han' => 10737418240, // 10GB
                'dung_luong_su_dung' => 0,
                'ty_le_su_dung' => 0,
                'canh_bao_tu' => 80, // Warn at 80%
                'da_canh_bao' => false,
            ]);
        }

        if (!$quota->canUpload($uploadedFile->getSize())) {
            throw new \Exception('Vượt quá hạn ngạch lưu trữ. Đã dùng: ' . $quota->getFormattedUsage() . '/' . $quota->getFormattedLimit());
        }

        // Check if file exists (same name in same folder)
        $existingFile = File::where('thu_muc_id', $thuMucId)
                            ->where('ten_file', $uploadedFile->getClientOriginalName())
                            ->first();

        if ($existingFile) {
            // Create new version
            return $this->createNewVersion($existingFile, $uploadedFile, $userId, $request->input('ghi_chu'));
        }

        // Upload new file
        $fileName = time() . '_' . Str::slug(pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME))
                    . '.' . $uploadedFile->getClientOriginalExtension();
        $path = $uploadedFile->storeAs('documents', $fileName, 'public');

        $fileData = [
            'thu_muc_id' => $thuMucId,
            'ten_file' => $uploadedFile->getClientOriginalName(),
            'ten_goc' => $uploadedFile->getClientOriginalName(),
            'mo_ta' => $request->input('mo_ta'),
            'duong_dan' => $path,
            'kich_thuoc' => $uploadedFile->getSize(),
            'mime_type' => $uploadedFile->getMimeType(),
            'extension' => $uploadedFile->getClientOriginalExtension(),
            'nguoi_tai_len_id' => $userId,
            'hash_md5' => md5_file($uploadedFile->getRealPath()),
            'hash_sha256' => hash_file('sha256', $uploadedFile->getRealPath()),
            'tags' => $request->input('tags', []),
        ];

        $file = File::create($fileData);

        // Create first version
        PhienBan::create([
            'file_id' => $file->id,
            'phien_ban' => 1,
            'duong_dan' => $path,
            'kich_thuoc' => $uploadedFile->getSize(),
            'hash_md5' => $fileData['hash_md5'],
            'nguoi_tai_len_id' => $userId,
            'ghi_chu_thay_doi' => 'Phiên bản đầu tiên',
        ]);

        // Update quota
        $quota->updateUsage($uploadedFile->getSize());

        // Log activity
        HoatDong::log([
            'file_id' => $file->id,
            'loai_doi_tuong' => 'file',
            'user_id' => $userId,
            'hanh_dong' => 'upload',
            'chi_tiet' => ['ten_file' => $file->ten_file],
        ]);

        // OCR if image or PDF
        if (in_array($file->mime_type, ['image/jpeg', 'image/png', 'application/pdf'])) {
            $this->performOCR($file);
        }

        return $file;
    }

    /**
     * Create new version for existing file
     */
    private function createNewVersion($file, $uploadedFile, $userId, $ghiChu = null)
    {
        $fileName = time() . '_' . Str::slug(pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME))
                    . '.' . $uploadedFile->getClientOriginalExtension();
        $path = $uploadedFile->storeAs('documents', $fileName, 'public');

        $newVersion = $file->phien_ban + 1;

        PhienBan::create([
            'file_id' => $file->id,
            'phien_ban' => $newVersion,
            'duong_dan' => $path,
            'kich_thuoc' => $uploadedFile->getSize(),
            'hash_md5' => md5_file($uploadedFile->getRealPath()),
            'nguoi_tai_len_id' => $userId,
            'ghi_chu_thay_doi' => $ghiChu ?? "Phiên bản {$newVersion}",
        ]);

        $file->update([
            'phien_ban' => $newVersion,
            'duong_dan' => $path,
            'kich_thuoc' => $uploadedFile->getSize(),
            'hash_md5' => md5_file($uploadedFile->getRealPath()),
        ]);

        // Update quota
        $quota = Quota::forUser($userId)->first();
        $quota->updateUsage($uploadedFile->getSize());

        HoatDong::log([
            'file_id' => $file->id,
            'loai_doi_tuong' => 'file',
            'user_id' => $userId,
            'hanh_dong' => 'upload',
            'chi_tiet' => ['phien_ban' => $newVersion],
        ]);

        return $file;
    }

    /**
     * Share file/folder
     */
    public function shareTo($objectType, $objectId, $users, $permission, $expiryDate = null)
    {
        $userId = auth()->id();
        $shares = [];

        foreach ($users as $targetUserId) {
            $share = PhanQuyen::create([
                $objectType . '_id' => $objectId,
                'loai_doi_tuong' => $objectType,
                'user_id' => $targetUserId,
                'loai_nguoi_dung' => 'user',
                'quyen' => $permission,
                'ngay_het_han' => $expiryDate,
                'nguoi_chia_se_id' => $userId,
            ]);

            HoatDong::log([
                $objectType . '_id' => $objectId,
                'loai_doi_tuong' => $objectType,
                'user_id' => $userId,
                'hanh_dong' => 'share',
                'chi_tiet' => ['shared_to' => $targetUserId, 'permission' => $permission],
            ]);

            $shares[] = $share;
        }

        return $shares;
    }

    /**
     * Create share link
     */
    public function createShareLink($objectType, $objectId, $permission = 'viewer', $password = null, $expiryDate = null, $maxAccess = null)
    {
        $link = ChiaSeLink::create([
            $objectType . '_id' => $objectId,
            'loai_doi_tuong' => $objectType,
            'quyen' => $permission,
            'mat_khau' => $password ? bcrypt($password) : null,
            'ngay_het_han' => $expiryDate,
            'luot_truy_cap_toi_da' => $maxAccess,
            'nguoi_tao_id' => auth()->id(),
        ]);

        HoatDong::log([
            $objectType . '_id' => $objectId,
            'loai_doi_tuong' => $objectType,
            'user_id' => auth()->id(),
            'hanh_dong' => 'share',
            'chi_tiet' => ['type' => 'public_link', 'ma_link' => $link->ma_link],
        ]);

        return $link;
    }

    /**
     * Perform OCR on image/PDF
     */
    private function performOCR($file)
    {
        try {
            $fullPath = storage_path('app/public/' . $file->duong_dan);

            if (!file_exists($fullPath)) return;

            $ocr = new TesseractOCR($fullPath);
            $ocr->lang('vie', 'eng'); // Vietnamese + English
            $text = $ocr->run();

            $file->update(['ocr_data' => $text]);

            // Extract CCCD data if contains keywords
            if (str_contains(strtolower($text), 'cong hoa') || str_contains(strtolower($text), 'can cuoc')) {
                $this->extractCCCDData($file, $text);
            }
        } catch (\Exception $e) {
            \Log::error('OCR failed: ' . $e->getMessage());
        }
    }

    /**
     * Extract CCCD data from OCR text
     */
    private function extractCCCDData($file, $text)
    {
        $data = ['type' => 'CCCD'];

        // Extract số CCCD (12 digits)
        if (preg_match('/\b\d{12}\b/', $text, $matches)) {
            $data['so_cccd'] = $matches[0];
        }

        // Extract ngày sinh
        if (preg_match('/(\d{2}\/\d{2}\/\d{4})/', $text, $matches)) {
            $data['ngay_sinh'] = $matches[1];
        }

        $file->update(['chi_tiet' => json_encode($data)]);
    }

    /**
     * Calculate storage usage
     */
    public function calculateUsage($userId)
    {
        $totalSize = File::where('nguoi_tai_len_id', $userId)->sum('kich_thuoc');

        $quota = Quota::forUser($userId)->first();
        if (!$quota) {
            $quota = Quota::create([
                'user_id' => $userId,
                'loai' => 'user',
                'dung_luong_gioi_han' => 10737418240, // 10GB default
                'dung_luong_su_dung' => 0,
            ]);
        }

        $quota->update([
            'dung_luong_su_dung' => $totalSize,
            'ty_le_su_dung' => ($totalSize / $quota->dung_luong_gioi_han) * 100,
        ]);

        return $quota;
    }
}
