<?php

namespace App\Services\Project;

use App\Models\Project\Task;
use App\Models\Project\TaskChecklist;
use App\Models\Project\TaskComment;
use App\Models\Project\TaskAttachment;
use App\Models\Project\TaskTimeLog;
use App\Models\Project\ActivityLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class TaskService
{
    /**
     * Get task by ID with all relationships
     *
     * @param int $id Task ID
     * @return Task Model with loaded relationships (status, priority, assignee,
     *              checklists, comments, attachments, time logs)
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException if task not found
     */
    public function getById($id)
    {
        return Task::with([
            'trangThai',
            'uuTien',
            'nguoiThucHien',
            'nguoiGiaoViec',
            'supporters',
            'project.members',
            'parent',
            'checklists' => function ($query) {
                $query->with('assignedUser')->orderBy('sort_order');
            },
            'comments' => function ($query) {
                $query->with('adminUser')->whereNull('parent_id')->orderBy('created_at', 'desc');
            },
            'comments.replies' => function ($query) {
                $query->with('adminUser')->orderBy('created_at', 'asc');
            },
            'attachments' => function ($query) {
                $query->with('uploader')->orderBy('created_at', 'desc');
            },
            'timeLogs' => function ($query) {
                $query->with('user')->orderBy('started_at', 'desc');
            }
        ])->findOrFail($id);
    }

    public function getList($params = [])
    {
        $query = Task::with([
            'trangThai',
            'uuTien',
            'nguoiThucHien',
            'project',
            'parent'
        ]);

        // Filter by user access - only show tasks from projects user has access to
        $userId = auth('admin_users')->id();
        if ($userId && $userId !== 1) { // Skip filter for super admin (ID = 1)
            $query->whereHas('project', function($projectQuery) use ($userId) {
                $projectQuery->where(function($q) use ($userId) {
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
            });
        }

        // Filter by project
        if (!empty($params['project_id'])) {
            $query->where('project_id', $params['project_id']);
        }

        // Search
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function($q) use ($search) {
                $q->where('ma_nhiem_vu', 'like', "%{$search}%")
                  ->orWhere('tieu_de', 'like', "%{$search}%");
            });
        }

        // Filters
        if (!empty($params['trang_thai_id'])) {
            $query->where('trang_thai_id', $params['trang_thai_id']);
        }

        if (!empty($params['uu_tien_id'])) {
            $query->where('uu_tien_id', $params['uu_tien_id']);
        }

        if (!empty($params['nguoi_thuc_hien_id'])) {
            $query->where('nguoi_thuc_hien_id', $params['nguoi_thuc_hien_id']);
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

    public function getKanbanData($projectId)
    {
        $tasks = Task::with([
            'trangThai',
            'uuTien',
            'nguoiThucHien',
            'checklists'
        ])
        ->where('project_id', $projectId)
        ->orderBy('kanban_order')
        ->get()
        ->groupBy('trang_thai_id');

        return $tasks;
    }

    public function getGanttData($projectId)
    {
        $tasks = Task::with([
            'trangThai',
            'uuTien',
            'nguoiThucHien',
            'dependencies.dependsOnTask'
        ])
        ->where('project_id', $projectId)
        ->whereNotNull('ngay_bat_dau')
        ->whereNotNull('ngay_ket_thuc_du_kien')
        ->orderBy('ngay_bat_dau')
        ->get();

        // Format for Gantt chart
        $ganttData = $tasks->map(function($task) {
            return [
                'id' => $task->id,
                'title' => $task->tieu_de,
                'start' => $task->ngay_bat_dau->format('Y-m-d'),
                'end' => $task->ngay_ket_thuc_du_kien->format('Y-m-d'),
                'progress' => $task->tien_do,
                'assignee' => $task->nguoiThucHien?->name,
                'status' => $task->trangThai->name,
                'dependencies' => $task->dependencies->pluck('depends_on_task_id')->toArray(),
            ];
        });

        return $ganttData;
    }

    public function create($data)
    {
        DB::beginTransaction();
        try {
            // Generate mã nhiệm vụ nếu chưa có
            if (empty($data['ma_nhiem_vu'])) {
                $data['ma_nhiem_vu'] = $this->generateTaskCode($data['project_id']);
            }

            $data['created_by'] = Auth::guard('admin_users')->id();
            $data['nguoi_giao_viec_id'] = Auth::guard('admin_users')->id();

            $task = Task::create($data);

            // Add checklists if provided
            if (!empty($data['checklists'])) {
                foreach ($data['checklists'] as $index => $checklist) {
                    TaskChecklist::create([
                        'task_id' => $task->id,
                        'noi_dung' => $checklist['noi_dung'],
                        'assigned_to' => $checklist['assigned_to'] ?? null,
                        'sort_order' => $index,
                        'is_completed' => false,
                    ]);
                }
            }

            // Log activity
            $this->logActivity($task->id, 'created', 'Tạo nhiệm vụ mới');

            // Update project progress
            app(ProjectService::class)->updateProgress($task->project_id);

            DB::commit();
            return $task->load(['trangThai', 'uuTien', 'nguoiThucHien', 'checklists']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function update($id, $data)
    {
        DB::beginTransaction();
        try {
            $task = Task::findOrFail($id);
            $oldData = $task->toArray();

            $data['updated_by'] = Auth::guard('admin_users')->id();
            $task->update($data);

            // Update checklists if provided
            if (isset($data['checklists'])) {
                \Log::info('📝 Updating checklists for task ' . $id, [
                    'checklists' => $data['checklists']
                ]);

                TaskChecklist::where('task_id', $id)->delete();

                foreach ($data['checklists'] as $checklist) {
                    $created = TaskChecklist::create([
                        'task_id' => $id,
                        'noi_dung' => $checklist['noi_dung'],
                        'assigned_to' => $checklist['assigned_to'] ?? null,
                        'mo_ta' => $checklist['mo_ta'] ?? null,
                        'sort_order' => isset($checklist['sort_order']) ? $checklist['sort_order'] : 0,
                        'is_completed' => $checklist['is_completed'] ?? false,
                    ]);
                    \Log::info('✅ Created checklist: ' . $created->id);
                }
            }

            // Log activity
            $this->logActivity($id, 'updated', 'Cập nhật nhiệm vụ', $oldData, $task->toArray());

            // Update project progress
            app(ProjectService::class)->updateProgress($task->project_id);

            DB::commit();

            // Re-query task from DB with all relationships to get updated data
            $updatedTask = Task::with([
                'trangThai',
                'uuTien',
                'nguoiThucHien',
                'project.members',
                'parent',
                'checklists' => function ($query) {
                    $query->with('assignedUser')->orderBy('sort_order');
                },
                'comments' => function ($query) {
                    $query->with('adminUser')->whereNull('parent_id')->orderBy('created_at', 'desc');
                },
                'comments.replies' => function ($query) {
                    $query->with('adminUser')->orderBy('created_at', 'asc');
                },
                'attachments' => function ($query) {
                    $query->with('uploader')->orderBy('created_at', 'desc');
                },
                'timeLogs' => function ($query) {
                    $query->with('user')->orderBy('started_at', 'desc');
                }
            ])->find($id);

            \Log::info('📦 Returning task with checklists:', [
                'task_id' => $id,
                'checklists_count' => $updatedTask->checklists->count(),
                'checklists' => $updatedTask->checklists->toArray()
            ]);

            return $updatedTask;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateStatus($id, $statusId, $kanbanOrder = null)
    {
        DB::beginTransaction();
        try {
            $task = Task::findOrFail($id);
            $oldStatus = $task->trang_thai_id;
            $projectId = $task->project_id;

            // Update task status
            $task->trang_thai_id = $statusId;
            $task->save();

            // If kanbanOrder is provided, reorder all tasks in the destination status
            if ($kanbanOrder !== null) {
                // Get all tasks in the new status (including the moved task)
                $tasksInNewStatus = Task::where('project_id', $projectId)
                    ->where('trang_thai_id', $statusId)
                    ->orderBy('kanban_order')
                    ->get();

                // Remove the moved task from its current position
                $movedTask = $tasksInNewStatus->firstWhere('id', $id);
                $tasksInNewStatus = $tasksInNewStatus->reject(function($t) use ($id) {
                    return $t->id == $id;
                });

                // Insert the moved task at the new position
                $tasksInNewStatus->splice($kanbanOrder, 0, [$movedTask]);

                // Update kanban_order for all tasks in the new status
                foreach ($tasksInNewStatus as $index => $t) {
                    Task::where('id', $t->id)->update(['kanban_order' => $index]);
                }

                // If moved to a different status, reorder tasks in the old status
                if ($oldStatus != $statusId) {
                    $tasksInOldStatus = Task::where('project_id', $projectId)
                        ->where('trang_thai_id', $oldStatus)
                        ->orderBy('kanban_order')
                        ->get();

                    foreach ($tasksInOldStatus as $index => $t) {
                        Task::where('id', $t->id)->update(['kanban_order' => $index]);
                    }
                }
            }

            // Log activity
            $this->logActivity($id, 'status_changed', "Thay đổi trạng thái từ {$oldStatus} sang {$statusId}");

            // Update project progress
            app(ProjectService::class)->updateProgress($projectId);

            DB::commit();
            return $task->load(['trangThai']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function delete($id)
    {
        DB::beginTransaction();
        try {
            $task = Task::findOrFail($id);
            $projectId = $task->project_id;
            $task->delete();

            // Log activity
            $this->logActivity($id, 'deleted', 'Xóa nhiệm vụ');

            // Update project progress
            app(ProjectService::class)->updateProgress($projectId);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function addComment($taskId, $content, $parentId = null)
    {
        $comment = TaskComment::create([
            'task_id' => $taskId,
            'admin_user_id' => Auth::guard('admin_users')->id(),
            'noi_dung' => $content,
            'parent_id' => $parentId,
        ]);

        return $comment->load('adminUser');
    }

    public function uploadAttachment($taskId, UploadedFile $file, $description = null)
    {
        DB::beginTransaction();
        try {
            // Generate unique filename
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $filename = time() . '_' . str_replace(' ', '_', $originalName);

            // Store file in storage/app/project_attachments
            $path = $file->storeAs('project_attachments', $filename);

            // Create attachment record
            $attachment = TaskAttachment::create([
                'task_id' => $taskId,
                'ten_file' => $originalName,
                'duong_dan' => $path,
                'loai_file' => $file->getMimeType(),
                'kich_thuoc' => $file->getSize(),
                'uploaded_by' => Auth::guard('admin_users')->id(),
                'mo_ta' => $description,
            ]);

            // Log activity
            $this->logActivity($taskId, 'attachment_uploaded', "Tải lên file: {$originalName}");

            DB::commit();
            return $attachment->load('uploader');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateAttachment($attachmentId, $description)
    {
        $attachment = TaskAttachment::findOrFail($attachmentId);
        $attachment->update(['mo_ta' => $description]);

        return $attachment->load('uploader');
    }

    public function deleteAttachment($attachmentId)
    {
        DB::beginTransaction();
        try {
            $attachment = TaskAttachment::findOrFail($attachmentId);
            $taskId = $attachment->task_id;
            $filename = $attachment->ten_file;

            // Delete file from storage
            if (Storage::exists($attachment->duong_dan)) {
                Storage::delete($attachment->duong_dan);
            }

            // Delete record
            $attachment->delete();

            // Log activity
            $this->logActivity($taskId, 'attachment_deleted', "Xóa file: {$filename}");

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    // ============================================
    // TIME TRACKING METHODS
    // ============================================

    /**
     * Start a timer for a task
     *
     * Creates a new time log entry with is_running=true. Validates that the user
     * doesn't already have a running timer (only one timer per user allowed).
     *
     * @param int $taskId The task ID to track time for
     * @return TaskTimeLog The created time log with user relationship loaded
     * @throws \Exception if user already has a running timer
     * @throws \Exception on database error
     */
    public function startTimer($taskId)
    {
        $userId = Auth::guard('admin_users')->id();

        // Check if there's already a running timer for this user
        $runningTimer = TaskTimeLog::where('admin_user_id', $userId)
            ->where('is_running', true)
            ->first();

        if ($runningTimer) {
            throw new \Exception('Bạn đang có timer đang chạy. Vui lòng dừng timer hiện tại trước.');
        }

        DB::beginTransaction();
        try {
            $timeLog = TaskTimeLog::create([
                'task_id' => $taskId,
                'admin_user_id' => $userId,
                'started_at' => now(),
                'is_running' => true,
            ]);

            $this->logActivity($taskId, 'timer_started', 'Bắt đầu đếm thời gian');

            DB::commit();
            return $timeLog->load('user');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Stop a running timer
     *
     * Calculates the duration and updates the time log with ended_at and duration.
     *
     * @param int $timeLogId The time log ID to stop
     * @return TaskTimeLog The updated time log with user relationship loaded
     * @throws \Exception if timer is already stopped
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException if time log not found
     * @throws \Exception on database error
     */
    public function stopTimer($timeLogId)
    {
        DB::beginTransaction();
        try {
            $timeLog = TaskTimeLog::findOrFail($timeLogId);

            if (!$timeLog->is_running) {
                throw new \Exception('Timer này đã được dừng.');
            }

            $endedAt = now();
            $duration = $endedAt->diffInSeconds($timeLog->started_at);

            $timeLog->update([
                'ended_at' => $endedAt,
                'duration' => $duration,
                'is_running' => false,
            ]);

            $this->logActivity($timeLog->task_id, 'timer_stopped', 'Dừng đếm thời gian: ' . $timeLog->formatted_duration);

            DB::commit();
            return $timeLog->fresh()->load('user');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Add a manual time log entry
     *
     * Creates a time log entry with specific start and end times.
     * Validates that end time is after start time.
     *
     * @param int $taskId The task ID
     * @param array $data [
     *   'started_at' => string, // DateTime string (ISO format)
     *   'ended_at' => string, // DateTime string (ISO format)
     *   'mo_ta' => string, // Optional description
     * ]
     * @return TaskTimeLog The created time log with user relationship loaded
     * @throws \Exception if end time is before or equal to start time
     * @throws \Exception on database error
     */
    public function addManualTimeLog($taskId, $data)
    {
        DB::beginTransaction();
        try {
            $startedAt = new \DateTime($data['started_at']);
            $endedAt = new \DateTime($data['ended_at']);
            $duration = $endedAt->getTimestamp() - $startedAt->getTimestamp();

            if ($duration <= 0) {
                throw new \Exception('Thời gian kết thúc phải sau thời gian bắt đầu.');
            }

            $timeLog = TaskTimeLog::create([
                'task_id' => $taskId,
                'admin_user_id' => Auth::guard('admin_users')->id(),
                'started_at' => $startedAt,
                'ended_at' => $endedAt,
                'duration' => $duration,
                'mo_ta' => $data['mo_ta'] ?? null,
                'is_running' => false,
            ]);

            $this->logActivity($taskId, 'manual_time_logged', 'Thêm log thời gian thủ công: ' . $timeLog->formatted_duration);

            DB::commit();
            return $timeLog->load('user');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getTimeLogs($taskId)
    {
        return TaskTimeLog::where('task_id', $taskId)
            ->with('user')
            ->orderBy('started_at', 'desc')
            ->get();
    }

    public function deleteTimeLog($timeLogId)
    {
        DB::beginTransaction();
        try {
            $timeLog = TaskTimeLog::findOrFail($timeLogId);
            $taskId = $timeLog->task_id;

            $timeLog->delete();

            $this->logActivity($taskId, 'time_log_deleted', 'Xóa log thời gian');

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getRunningTimer($userId = null)
    {
        $userId = $userId ?? Auth::guard('admin_users')->id();

        return TaskTimeLog::where('admin_user_id', $userId)
            ->where('is_running', true)
            ->with(['task', 'user'])
            ->first();
    }

    private function generateTaskCode($projectId)
    {
        $project = \App\Models\Project\Project::findOrFail($projectId);
        $projectCode = $project->ma_du_an;

        // Count tasks in this project (including soft deleted) to generate next number
        $taskCount = Task::withTrashed()->where('project_id', $projectId)->count();
        $number = $taskCount + 1;

        // Generate code with project prefix: {PROJECT_CODE}-T{NUMBER}
        // Example: PRJ001-T001, PRJ001-T002, etc.
        $taskCode = $projectCode . '-T' . str_pad($number, 3, '0', STR_PAD_LEFT);

        // Ensure uniqueness across all projects
        $attempt = 0;
        while (Task::withTrashed()->where('ma_nhiem_vu', $taskCode)->exists() && $attempt < 100) {
            $number++;
            $taskCode = $projectCode . '-T' . str_pad($number, 3, '0', STR_PAD_LEFT);
            $attempt++;
        }

        return $taskCode;
    }

    private function logActivity($taskId, $action, $description, $oldData = null, $newData = null)
    {
        ActivityLog::create([
            'loai_doi_tuong' => 'task',
            'doi_tuong_id' => $taskId,
            'hanh_dong' => $action,
            'mo_ta' => $description,
            'du_lieu_cu' => $oldData,
            'du_lieu_moi' => $newData,
            'admin_user_id' => Auth::guard('admin_users')->id(),
        ]);
    }
}
