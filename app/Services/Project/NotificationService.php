<?php

namespace App\Services\Project;

use App\Models\ProNotification;
use App\Models\Project\Task;
use App\Models\Project\Project;
use Illuminate\Support\Facades\Auth;

class NotificationService
{
    /**
     * Tạo thông báo cho task
     */
    public function notifyTaskChange(Task $task, string $type, string $message, array $data = [])
    {
        $recipients = $this->getTaskRecipients($task);
        $createdBy = Auth::guard('admin_users')->id();

        if (!$createdBy) {
            return;
        }

        // Get creator name
        $creator = \App\Models\AdminUser::find($createdBy);
        $creatorName = $creator ? $creator->name : 'Ai đó';

        // Format message with creator name and task title
        $fullMessage = "{$creatorName} {$message} trong task \"{$task->tieu_de}\"";

        foreach ($recipients as $userId) {
            // Không gửi thông báo cho chính người tạo
            if ($userId == $createdBy) {
                continue;
            }

            ProNotification::create([
                'admin_user_id' => $userId,
                'created_by' => $createdBy,
                'type' => $type,
                'notifiable_type' => Task::class,
                'notifiable_id' => $task->id,
                'message' => $fullMessage,
                'data' => array_merge($data, [
                    'task_id' => $task->id,
                    'task_title' => $task->tieu_de,
                    'project_id' => $task->project_id,
                ]),
            ]);
        }
    }

    /**
     * Tạo thông báo cho project
     */
    public function notifyProjectChange(Project $project, string $type, string $message, array $data = [])
    {
        $recipients = $this->getProjectRecipients($project);
        $createdBy = Auth::guard('admin_users')->id();

        if (!$createdBy) {
            return;
        }

        // Get creator name
        $creator = \App\Models\AdminUser::find($createdBy);
        $creatorName = $creator ? $creator->name : 'Ai đó';

        // Format message with creator name and project name
        $fullMessage = "{$creatorName} {$message} trong dự án \"{$project->ten_du_an}\"";

        foreach ($recipients as $userId) {
            if ($userId == $createdBy) {
                continue;
            }

            ProNotification::create([
                'admin_user_id' => $userId,
                'created_by' => $createdBy,
                'type' => $type,
                'notifiable_type' => Project::class,
                'notifiable_id' => $project->id,
                'message' => $fullMessage,
                'data' => array_merge($data, [
                    'project_id' => $project->id,
                    'project_name' => $project->ten_du_an,
                ]),
            ]);
        }
    }

    /**
     * Lấy danh sách người nhận thông báo cho task
     */
    private function getTaskRecipients(Task $task): array
    {
        $recipients = [];

        // Người thực hiện
        if ($task->nguoi_thuc_hien_id) {
            $recipients[] = $task->nguoi_thuc_hien_id;
        }

        // Người giao việc
        if ($task->nguoi_giao_viec_id) {
            $recipients[] = $task->nguoi_giao_viec_id;
        }

        // Người support
        $supporters = $task->supporters()->pluck('admin_user_id')->toArray();
        $recipients = array_merge($recipients, $supporters);

        // Người tạo task
        if ($task->created_by) {
            $recipients[] = $task->created_by;
        }

        return array_unique($recipients);
    }

    /**
     * Lấy danh sách người nhận thông báo cho project
     */
    private function getProjectRecipients(Project $project): array
    {
        $recipients = [];

        // Quản lý dự án
        if ($project->quan_ly_du_an_id) {
            $recipients[] = $project->quan_ly_du_an_id;
        }

        // Tất cả thành viên dự án
        $members = $project->members()->pluck('admin_user_id')->toArray();
        $recipients = array_merge($recipients, $members);

        // Người tạo project
        if ($project->created_by) {
            $recipients[] = $project->created_by;
        }

        return array_unique($recipients);
    }

    /**
     * Lấy danh sách thông báo chưa đọc
     */
    public function getUnreadNotifications($userId, $limit = 50)
    {
        return ProNotification::where('admin_user_id', $userId)
            ->whereNull('read_at')
            ->with('creator')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Lấy tất cả thông báo
     */
    public function getAllNotifications($userId, $limit = 100)
    {
        return ProNotification::where('admin_user_id', $userId)
            ->with('creator')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Đánh dấu đã đọc
     */
    public function markAsRead($notificationId, $userId)
    {
        $notification = ProNotification::where('id', $notificationId)
            ->where('admin_user_id', $userId)
            ->first();

        if ($notification) {
            $notification->markAsRead();
            return true;
        }

        return false;
    }

    /**
     * Đánh dấu tất cả đã đọc
     */
    public function markAllAsRead($userId)
    {
        return ProNotification::where('admin_user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    public function countUnread($userId)
    {
        return ProNotification::where('admin_user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }
}
