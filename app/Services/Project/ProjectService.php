<?php

namespace App\Services\Project;

use App\Models\Project\Project;
use App\Models\Project\ProjectMember;
use App\Models\Project\ActivityLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ProjectService
{
    /**
     * Get paginated list of projects with filters
     *
     * @param array $params [
     *   'search' => string, // Search in ma_du_an, ten_du_an, ten_khach_hang
     *   'trang_thai_id' => int,
     *   'loai_du_an_id' => int,
     *   'uu_tien_id' => int,
     *   'quan_ly_du_an_id' => int,
     *   'tu_ngay' => string, // Date format: Y-m-d
     *   'den_ngay' => string, // Date format: Y-m-d
     *   'sort_by' => string, // Default: 'created_at'
     *   'sort_order' => string, // 'asc' or 'desc', default: 'desc'
     *   'per_page' => int, // Default: 20
     * ]
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getList($params = [])
    {
        $query = Project::with(['trangThai', 'loaiDuAn', 'uuTien', 'quanLyDuAn']);

        // Filter by user access - only show projects user has access to
        $userId = auth('admin_users')->id();
        if ($userId && $userId !== 1) { // Skip filter for super admin (ID = 1)
            $query->where(function($q) use ($userId) {
                // Projects where user is PM
                $q->where('quan_ly_du_an_id', $userId)
                  // Or projects where user is a member
                  ->orWhereHas('members', function($memberQuery) use ($userId) {
                      $memberQuery->where('admin_user_id', $userId)
                                  ->where('is_active', true);
                  })
                  // Or projects created by user
                  ->orWhere('created_by', $userId);
            });
        }

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

    /**
     * Create a new project with members
     *
     * @param array $data [
     *   'ma_du_an' => string (optional, auto-generated if empty),
     *   'ten_du_an' => string (required),
     *   'ten_khach_hang' => string,
     *   'ngay_bat_dau' => string,
     *   'ngay_ket_thuc_du_kien' => string,
     *   'quan_ly_du_an_id' => int,
     *   'trang_thai_id' => int,
     *   'loai_du_an_id' => int,
     *   'uu_tien_id' => int,
     *   'mo_ta' => string,
     *   'members' => array [ // Optional array of team members
     *     ['admin_user_id' => int, 'vai_tro' => string],
     *     ...
     *   ]
     * ]
     * @return Project Model with loaded relationships
     * @throws \Exception on database error
     */
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

            // Update checklists if provided
            if (isset($data['checklists'])) {
                \App\Models\Project\ProjectChecklist::where('project_id', $id)->delete();

                foreach ($data['checklists'] as $checklist) {
                    \App\Models\Project\ProjectChecklist::create([
                        'project_id' => $id,
                        'noi_dung' => $checklist['noi_dung'],
                        'assigned_to' => $checklist['assigned_to'] ?? null,
                        'mo_ta' => $checklist['mo_ta'] ?? null,
                        'sort_order' => isset($checklist['sort_order']) ? $checklist['sort_order'] : 0,
                        'is_completed' => $checklist['is_completed'] ?? false,
                    ]);
                }
            }

            // Log activity
            $this->logActivity($id, 'updated', 'Cập nhật thông tin dự án', $oldData, $project->toArray());

            DB::commit();
            return $project->load(['trangThai', 'loaiDuAn', 'uuTien', 'quanLyDuAn', 'members.adminUser', 'checklists.assignedUser', 'activityLogs.user']);
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
            'checklists' => function ($query) {
                $query->with('assignedUser')->orderBy('sort_order');
            },
            'attachments' => function ($query) {
                $query->with('uploader')->orderBy('created_at', 'desc');
            },
            'activityLogs.user'
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
                $query->where('name', 'Đang thực hiện');
            })->count(),
            'completed_projects' => Project::whereHas('trangThai', function($query) {
                $query->where('name', 'Hoàn thành');
            })->count(),
            'delayed_projects' => Project::where('ngay_ket_thuc_du_kien', '<', now())
                ->whereHas('trangThai', function($query) {
                    $query->where('name', '!=', 'Hoàn thành');
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

    // ============================================
    // DASHBOARD STATISTICS
    // ============================================

    /**
     * Get comprehensive dashboard statistics for a project
     *
     * This method aggregates various metrics including task distribution,
     * time tracking data, and project overview statistics.
     *
     * @param int $projectId The project ID
     * @param array $params [
     *   'tu_ngay' => string, // Start date filter (Y-m-d format)
     *   'den_ngay' => string, // End date filter (Y-m-d format)
     * ]
     * @return array [
     *   'tasks_by_status' => array, // Task count grouped by status
     *   'tasks_by_priority' => array, // Task count grouped by priority
     *   'tasks_progress' => array, // Progress data over time
     *   'time_by_member' => array, // Time logged by each team member
     *   'overview' => array, // Summary statistics (total tasks, completion rate, etc.)
     * ]
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException if project not found
     */
    public function getProjectDashboardStats($projectId, $params = [])
    {
        $project = Project::findOrFail($projectId);

        return [
            'tasks_by_status' => $this->getTasksByStatus($projectId),
            'tasks_by_priority' => $this->getTasksByPriority($projectId),
            'tasks_progress' => $this->getTasksProgress($projectId, $params),
            'time_by_member' => $this->getTimeSpentByMember($projectId, $params),
            'overview' => $this->getProjectOverview($projectId),
        ];
    }

    private function getTasksByStatus($projectId)
    {
        return DB::table('pro___tasks')
            ->join('pro___task_statuses', 'pro___tasks.trang_thai_id', '=', 'pro___task_statuses.id')
            ->where('pro___tasks.project_id', $projectId)
            ->whereNull('pro___tasks.deleted_at')
            ->select(
                'pro___task_statuses.ten_trang_thai as status',
                'pro___task_statuses.ma_mau as color',
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('pro___task_statuses.id', 'pro___task_statuses.ten_trang_thai', 'pro___task_statuses.ma_mau')
            ->get();
    }

    private function getTasksByPriority($projectId)
    {
        return DB::table('pro___tasks')
            ->join('pro___priorities', 'pro___tasks.uu_tien_id', '=', 'pro___priorities.id')
            ->where('pro___tasks.project_id', $projectId)
            ->whereNull('pro___tasks.deleted_at')
            ->select(
                'pro___priorities.ten_uu_tien as priority',
                'pro___priorities.ma_mau as color',
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('pro___priorities.id', 'pro___priorities.ten_uu_tien', 'pro___priorities.ma_mau')
            ->orderBy('pro___priorities.id')
            ->get();
    }

    private function getTasksProgress($projectId, $params = [])
    {
        $query = DB::table('pro___tasks')
            ->where('project_id', $projectId)
            ->whereNull('deleted_at');

        // Apply date filter
        if (!empty($params['tu_ngay'])) {
            $query->where('created_at', '>=', $params['tu_ngay']);
        }
        if (!empty($params['den_ngay'])) {
            $query->where('created_at', '<=', $params['den_ngay']);
        }

        return $query->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN tien_do = 100 THEN 1 ELSE 0 END) as completed'),
                DB::raw('SUM(CASE WHEN tien_do > 0 AND tien_do < 100 THEN 1 ELSE 0 END) as in_progress'),
                DB::raw('SUM(CASE WHEN tien_do = 0 THEN 1 ELSE 0 END) as not_started')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();
    }

    private function getTimeSpentByMember($projectId, $params = [])
    {
        $query = DB::table('pro___task_time_logs')
            ->join('pro___tasks', 'pro___task_time_logs.task_id', '=', 'pro___tasks.id')
            ->join('admin_users', 'pro___task_time_logs.admin_user_id', '=', 'admin_users.id')
            ->where('pro___tasks.project_id', $projectId)
            ->where('pro___task_time_logs.is_running', false)
            ->whereNotNull('pro___task_time_logs.duration');

        // Apply date filter
        if (!empty($params['tu_ngay'])) {
            $query->where('pro___task_time_logs.started_at', '>=', $params['tu_ngay']);
        }
        if (!empty($params['den_ngay'])) {
            $query->where('pro___task_time_logs.started_at', '<=', $params['den_ngay']);
        }

        return $query->select(
                'admin_users.name as member',
                DB::raw('SUM(pro___task_time_logs.duration) as total_seconds'),
                DB::raw('ROUND(SUM(pro___task_time_logs.duration) / 3600, 2) as total_hours')
            )
            ->groupBy('admin_users.id', 'admin_users.name')
            ->orderBy('total_seconds', 'desc')
            ->get();
    }

    private function getProjectOverview($projectId)
    {
        $project = Project::with('members')->findOrFail($projectId);

        $tasksByStatus = $this->getTasksByStatus($projectId);

        $totalTasks = $tasksByStatus->sum('count');

        // Count completed tasks where is_done = 1
        $completedTasks = DB::table('pro___tasks')
            ->join('pro___task_statuses', 'pro___tasks.trang_thai_id', '=', 'pro___task_statuses.id')
            ->where('pro___tasks.project_id', $projectId)
            ->where('pro___task_statuses.is_done', 1)
            ->whereNull('pro___tasks.deleted_at')
            ->count();

        // Count not-started tasks: status name contains specific keywords
        $notStartedTasks = DB::table('pro___tasks')
            ->join('pro___task_statuses', 'pro___tasks.trang_thai_id', '=', 'pro___task_statuses.id')
            ->where('pro___tasks.project_id', $projectId)
            ->where('pro___task_statuses.is_done', 0)
            ->where(function($query) {
                $query->where('pro___task_statuses.ten_trang_thai', 'LIKE', '%chưa bắt đầu%')
                      ->orWhere('pro___task_statuses.ten_trang_thai', 'LIKE', '%mới%')
                      ->orWhere('pro___task_statuses.ten_trang_thai', 'LIKE', '%to do%');
            })
            ->whereNull('pro___tasks.deleted_at')
            ->count();

        // In-progress: all other tasks (not completed and not "not started")
        $inProgressTasks = $totalTasks - $completedTasks - $notStartedTasks;

        $totalTimeLogged = DB::table('pro___task_time_logs')
            ->join('pro___tasks', 'pro___task_time_logs.task_id', '=', 'pro___tasks.id')
            ->where('pro___tasks.project_id', $projectId)
            ->where('pro___task_time_logs.is_running', false)
            ->sum('pro___task_time_logs.duration');

        return [
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'in_progress_tasks' => $inProgressTasks,
            'not_started_tasks' => $notStartedTasks,
            'completion_rate' => $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0,
            'total_time_logged' => $totalTimeLogged,
            'total_hours_logged' => round($totalTimeLogged / 3600, 2),
            'team_size' => $project->members()->count(),
        ];
    }
}
