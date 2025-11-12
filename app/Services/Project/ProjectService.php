<?php

namespace App\Services\Project;

use App\Models\Project\Project;
use App\Models\Project\ProjectMember;
use App\Models\Project\ActivityLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ProjectService
{
    public function getList($params = [])
    {
        $query = Project::with(['trangThai', 'loaiDuAn', 'uuTien', 'quanLyDuAn']);

        // Search
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function($q) use ($search) {
                $q->where('ma_du_an', 'like', "%{$search}%")
                  ->orWhere('ten_du_an', 'like', "%{$search}%")
                  ->orWhere('ten_khach_hang', 'like', "%{$search}%");
            });
        }

        // Filters
        if (!empty($params['trang_thai_id'])) {
            $query->where('trang_thai_id', $params['trang_thai_id']);
        }

        if (!empty($params['loai_du_an_id'])) {
            $query->where('loai_du_an_id', $params['loai_du_an_id']);
        }

        if (!empty($params['uu_tien_id'])) {
            $query->where('uu_tien_id', $params['uu_tien_id']);
        }

        if (!empty($params['quan_ly_du_an_id'])) {
            $query->where('quan_ly_du_an_id', $params['quan_ly_du_an_id']);
        }

        // Date range
        if (!empty($params['tu_ngay'])) {
            $query->where('ngay_bat_dau', '>=', $params['tu_ngay']);
        }

        if (!empty($params['den_ngay'])) {
            $query->where('ngay_ket_thuc_du_kien', '<=', $params['den_ngay']);
        }

        // Sorting
        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortOrder = $params['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $params['per_page'] ?? 20;
        return $query->paginate($perPage);
    }

    public function create($data)
    {
        DB::beginTransaction();
        try {
            // Generate mã dự án nếu chưa có
            if (empty($data['ma_du_an'])) {
                $data['ma_du_an'] = $this->generateProjectCode();
            }

            $data['created_by'] = Auth::guard('admin_users')->id();

            $project = Project::create($data);

            // Add project manager as member
            if (!empty($data['quan_ly_du_an_id'])) {
                ProjectMember::create([
                    'project_id' => $project->id,
                    'admin_user_id' => $data['quan_ly_du_an_id'],
                    'vai_tro' => 'quan_ly',
                    'is_active' => true,
                ]);
            }

            // Add members if provided
            if (!empty($data['members'])) {
                foreach ($data['members'] as $member) {
                    ProjectMember::create([
                        'project_id' => $project->id,
                        'admin_user_id' => $member['admin_user_id'],
                        'vai_tro' => $member['vai_tro'] ?? 'thanh_vien',
                        'is_active' => true,
                    ]);
                }
            }

            // Log activity
            $this->logActivity($project->id, 'created', 'Tạo dự án mới');

            DB::commit();
            return $project->load(['trangThai', 'loaiDuAn', 'uuTien', 'quanLyDuAn', 'members.adminUser']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function update($id, $data)
    {
        DB::beginTransaction();
        try {
            $project = Project::findOrFail($id);
            $oldData = $project->toArray();

            $data['updated_by'] = Auth::guard('admin_users')->id();
            $project->update($data);

            // Update members if provided
            if (isset($data['members'])) {
                // Remove old members
                ProjectMember::where('project_id', $id)->delete();

                // Add new members
                foreach ($data['members'] as $member) {
                    ProjectMember::create([
                        'project_id' => $id,
                        'admin_user_id' => $member['admin_user_id'],
                        'vai_tro' => $member['vai_tro'] ?? 'thanh_vien',
                        'is_active' => true,
                    ]);
                }
            }

            // Log activity
            $this->logActivity($id, 'updated', 'Cập nhật thông tin dự án', $oldData, $project->toArray());

            DB::commit();
            return $project->load(['trangThai', 'loaiDuAn', 'uuTien', 'quanLyDuAn', 'members.adminUser']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function delete($id)
    {
        DB::beginTransaction();
        try {
            $project = Project::findOrFail($id);
            $project->delete();

            // Log activity
            $this->logActivity($id, 'deleted', 'Xóa dự án');

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getById($id)
    {
        return Project::with([
            'trangThai',
            'loaiDuAn',
            'uuTien',
            'quanLyDuAn',
            'members.adminUser',
            'tasks.trangThai',
            'tasks.uuTien',
            'tasks.nguoiThucHien',
            'attachments' => function ($query) {
                $query->with('uploader')->orderBy('created_at', 'desc');
            }
        ])->findOrFail($id);
    }

    public function updateProgress($id)
    {
        $project = Project::findOrFail($id);

        // Calculate progress based on tasks
        $totalTasks = $project->tasks()->count();
        if ($totalTasks == 0) {
            $project->update(['tien_do' => 0]);
            return 0;
        }

        $completedTasks = $project->tasks()->whereHas('trangThai', function($query) {
            $query->where('is_done', true);
        })->count();

        $progress = round(($completedTasks / $totalTasks) * 100);
        $project->update(['tien_do' => $progress]);

        return $progress;
    }

    public function getDashboardStats()
    {
        $stats = [
            'total_projects' => Project::count(),
            'active_projects' => Project::whereHas('trangThai', function($query) {
                $query->where('ten_trang_thai', 'Đang thực hiện');
            })->count(),
            'completed_projects' => Project::whereHas('trangThai', function($query) {
                $query->where('ten_trang_thai', 'Hoàn thành');
            })->count(),
            'delayed_projects' => Project::where('ngay_ket_thuc_du_kien', '<', now())
                ->whereHas('trangThai', function($query) {
                    $query->where('ten_trang_thai', '!=', 'Hoàn thành');
                })->count(),
        ];

        return $stats;
    }

    private function generateProjectCode()
    {
        // Include soft deleted projects to avoid duplicate codes
        $lastProject = Project::withTrashed()->orderBy('id', 'desc')->first();
        $number = $lastProject ? (int)substr($lastProject->ma_du_an, 4) + 1 : 1;
        return 'PRJ-' . str_pad($number, 3, '0', STR_PAD_LEFT);
    }

    public function uploadAttachment($projectId, $file, $description = null)
    {
        DB::beginTransaction();
        try {
            // Generate unique filename
            $originalName = $file->getClientOriginalName();
            $filename = time() . '_' . str_replace(' ', '_', $originalName);
            
            // Store file
            $path = $file->storeAs('project_attachments', $filename);

            // Create attachment record
            $attachment = \App\Models\Project\ProjectAttachment::create([
                'project_id' => $projectId,
                'ten_file' => $originalName,
                'duong_dan' => $path,
                'loai_file' => $file->getMimeType(),
                'kich_thuoc' => $file->getSize(),
                'uploaded_by' => Auth::guard('admin_users')->id(),
                'mo_ta' => $description,
            ]);

            $this->logActivity($projectId, 'attachment_uploaded', "Tải lên file: {$originalName}");

            DB::commit();
            return $attachment->load('uploader');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateAttachment($attachmentId, $description)
    {
        $attachment = \App\Models\Project\ProjectAttachment::findOrFail($attachmentId);
        $attachment->update(['mo_ta' => $description]);
        
        return $attachment->load('uploader');
    }

    public function deleteAttachment($attachmentId)
    {
        DB::beginTransaction();
        try {
            $attachment = \App\Models\Project\ProjectAttachment::findOrFail($attachmentId);
            $projectId = $attachment->project_id;
            $filename = $attachment->ten_file;

            // Delete file from storage
            if (\Illuminate\Support\Facades\Storage::exists($attachment->duong_dan)) {
                \Illuminate\Support\Facades\Storage::delete($attachment->duong_dan);
            }

            $attachment->delete();
            $this->logActivity($projectId, 'attachment_deleted', "Xóa file: {$filename}");

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function logActivity($projectId, $action, $description, $oldData = null, $newData = null)
    {
        ActivityLog::create([
            'loai_doi_tuong' => 'project',
            'doi_tuong_id' => $projectId,
            'hanh_dong' => $action,
            'mo_ta' => $description,
            'du_lieu_cu' => $oldData,
            'du_lieu_moi' => $newData,
            'admin_user_id' => Auth::guard('admin_users')->id(),
        ]);
    }

    public function addMember($projectId, $data)
    {
        $project = Project::findOrFail($projectId);

        // Check if member already exists
        $exists = $project->members()
            ->where('admin_user_id', $data['admin_user_id'])
            ->exists();

        if ($exists) {
            throw new \Exception('Nhân viên này đã là thành viên của dự án');
        }

        $member = $project->members()->create([
            'admin_user_id' => $data['admin_user_id'],
            'vai_tro' => $data['vai_tro'],
            'ngay_tham_gia' => $data['ngay_tham_gia'] ?? now(),
            'is_active' => true,
        ]);

        $this->logActivity(
            $projectId,
            'Thêm thành viên',
            'Thêm thành viên vào dự án',
            null,
            $member->toArray()
        );

        return $member->load('adminUser');
    }

    public function removeMember($projectId, $memberId)
    {
        $project = Project::findOrFail($projectId);
        $member = $project->members()->findOrFail($memberId);

        $this->logActivity(
            $projectId,
            'Xóa thành viên',
            'Xóa thành viên khỏi dự án',
            $member->toArray(),
            null
        );

        $member->delete();
    }
}
