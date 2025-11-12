<?php

namespace App\Services\Project;

use App\Models\Project\Task;
use App\Models\Project\TaskChecklist;
use App\Models\Project\TaskComment;
use App\Models\Project\TaskAttachment;
use App\Models\Project\ActivityLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class TaskService
{
    public function getById($id)
    {
        return Task::with([
            'trangThai',
            'uuTien',
            'nguoiThucHien',
            'project',
            'parent',
            'checklists' => function ($query) {
                $query->orderBy('thu_tu');
            },
            'comments' => function ($query) {
                $query->with('adminUser')->whereNull('parent_id')->orderBy('created_at', 'desc');
            },
            'comments.replies' => function ($query) {
                $query->with('adminUser')->orderBy('created_at', 'asc');
            },
            'attachments' => function ($query) {
                $query->with('uploader')->orderBy('created_at', 'desc');
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
                'status' => $task->trangThai->ten_trang_thai,
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
                        'thu_tu' => $index,
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
                        'thu_tu' => isset($checklist['thu_tu']) ? $checklist['thu_tu'] : 0,
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
            
            // Re-query task from DB with all relationships to get updated checklists
            $updatedTask = Task::with([
                'trangThai',
                'uuTien',
                'nguoiThucHien',
                'checklists' => function ($query) {
                    $query->orderBy('thu_tu');
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

            $updateData = ['trang_thai_id' => $statusId];
            if ($kanbanOrder !== null) {
                $updateData['kanban_order'] = $kanbanOrder;
            }

            $task->update($updateData);

            // Log activity
            $this->logActivity($id, 'status_changed', "Thay đổi trạng thái từ {$oldStatus} sang {$statusId}");

            // Update project progress
            app(ProjectService::class)->updateProgress($task->project_id);

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

    private function generateTaskCode($projectId)
    {
        // Include soft deleted tasks to avoid duplicate codes
        $lastTask = Task::withTrashed()->where('project_id', $projectId)->orderBy('id', 'desc')->first();
        $number = $lastTask ? (int)substr($lastTask->ma_nhiem_vu, -3) + 1 : 1;
        return 'TASK-' . str_pad($number, 3, '0', STR_PAD_LEFT);
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
