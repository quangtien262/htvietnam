<?php

namespace App\Policies\Project;

use App\Models\AdminUser;
use App\Models\Project\Task;
use App\Models\Project\Project;
use App\Services\Project\PermissionService;
use Illuminate\Auth\Access\HandlesAuthorization;

class TaskPolicy
{
    use HandlesAuthorization;

    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Determine if the user can view tasks in the project.
     */
    public function viewAny(AdminUser $user, Project $project)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        // Check if user is PM in project table
        if ($project->quan_ly_du_an_id === $user->id) {
            return true;
        }

        // Check if user is creator
        if ($project->created_by === $user->id) {
            return true;
        }

        // Check if user is active member - all active members can view tasks
        $member = $project->members()->where('admin_user_id', $user->id)
            ->where('is_active', true)
            ->first();

        if ($member) {
            return true;
        }

        // Fallback to permission system
        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $project->id,
            'task.view'
        );
    }

    /**
     * Determine if the user can view the task.
     */
    public function view(AdminUser $user, Task $task)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        // Get project to check member role
        $project = $task->project;
        if ($project) {
            // Check if user is PM in project table
            if ($project->quan_ly_du_an_id === $user->id) {
                return true;
            }

            // Check if user is creator
            if ($project->created_by === $user->id) {
                return true;
            }

            // Check if user is active member - all active members can view tasks
            $member = $project->members()->where('admin_user_id', $user->id)
                ->where('is_active', true)
                ->first();

            if ($member) {
                return true;
            }
        }

        // Fallback to permission system
        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $task->project_id,
            'task.view'
        );
    }

    /**
     * Determine if the user can create tasks.
     */
    public function create(AdminUser $user, Project $project)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        // Check if user is PM in project table
        if ($project->quan_ly_du_an_id === $user->id) {
            return true;
        }

        // Check if user is creator
        if ($project->created_by === $user->id) {
            return true;
        }

        // Check if user is active member with vai_tro = 'quan_ly' or 'thanh_vien' - both can create tasks
        $member = $project->members()->where('admin_user_id', $user->id)
            ->where('is_active', true)
            ->first();

        if ($member && in_array($member->vai_tro, ['quan_ly', 'thanh_vien'])) {
            return true;
        }

        // Fallback to permission system
        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $project->id,
            'task.create'
        );
    }

    /**
     * Determine if the user can update the task.
     */
    public function update(AdminUser $user, Task $task)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        // Get project to check member role
        $project = $task->project;
        if ($project) {
            // Check if user is PM in project table
            if ($project->quan_ly_du_an_id === $user->id) {
                return true;
            }

            // Check if user is creator
            if ($project->created_by === $user->id) {
                return true;
            }

            // Check if user is active member
            $member = $project->members()->where('admin_user_id', $user->id)
                ->where('is_active', true)
                ->first();

            if ($member) {
                // Member với vai_tro = 'quan_ly' hoặc 'thanh_vien' có toàn quyền update task
                if (in_array($member->vai_tro, ['quan_ly', 'thanh_vien'])) {
                    return true;
                }
            }
        }

        // Check if user has general task.update permission
        if ($this->permissionService->userHasPermissionInProject(
            $user->id,
            $task->project_id,
            'task.update'
        )) {
            return true;
        }

        // Check if user has task.update_own and is the assignee
        if ($this->permissionService->userHasPermissionInProject(
            $user->id,
            $task->project_id,
            'task.update_own'
        ) && $task->nguoi_thuc_hien_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can delete the task.
     */
    public function delete(AdminUser $user, Task $task)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        // Get project to check member role
        $project = $task->project;
        if ($project) {
            // Check if user is PM in project table
            if ($project->quan_ly_du_an_id === $user->id) {
                return true;
            }

            // Check if user is creator
            if ($project->created_by === $user->id) {
                return true;
            }

            // Check if user is active member with vai_tro = 'quan_ly'
            $member = $project->members()->where('admin_user_id', $user->id)
                ->where('is_active', true)
                ->first();

            if ($member && $member->vai_tro === 'quan_ly') {
                return true;
            }
        }

        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $task->project_id,
            'task.delete'
        );
    }

    /**
     * Determine if the user can assign tasks to members.
     */
    public function assign(AdminUser $user, Task $task)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $task->project_id,
            'task.assign'
        );
    }

    /**
     * Determine if the user can add comments to the task.
     */
    public function comment(AdminUser $user, Task $task)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        // Get project to check member role
        $project = $task->project;
        if ($project) {
            // Check if user is active member with vai_tro = 'quan_ly' or 'thanh_vien'
            $member = $project->members()->where('admin_user_id', $user->id)
                ->where('is_active', true)
                ->first();

            if ($member && in_array($member->vai_tro, ['quan_ly', 'thanh_vien'])) {
                return true;
            }
        }

        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $task->project_id,
            'comment.create'
        );
    }

    /**
     * Determine if the user can delete a comment.
     */
    public function deleteComment(AdminUser $user, $comment, Task $task)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        // Check if user has general comment.delete permission
        if ($this->permissionService->userHasPermissionInProject(
            $user->id,
            $task->project_id,
            'comment.delete'
        )) {
            return true;
        }

        // Check if user has comment.delete_own and is the comment author
        if ($this->permissionService->userHasPermissionInProject(
            $user->id,
            $task->project_id,
            'comment.delete_own'
        ) && $comment->admin_user_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can upload attachments.
     */
    public function uploadAttachment(AdminUser $user, Task $task)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        // Get project to check member role
        $project = $task->project;
        if ($project) {
            // Check if user is active member with vai_tro = 'quan_ly' or 'thanh_vien'
            $member = $project->members()->where('admin_user_id', $user->id)
                ->where('is_active', true)
                ->first();

            if ($member && in_array($member->vai_tro, ['quan_ly', 'thanh_vien'])) {
                return true;
            }
        }

        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $task->project_id,
            'attachment.upload'
        );
    }

    /**
     * Determine if the user can download attachments.
     */
    public function downloadAttachment(AdminUser $user, Task $task)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $task->project_id,
            'attachment.download'
        );
    }

    /**
     * Determine if the user can delete attachments.
     */
    public function deleteAttachment(AdminUser $user, Task $task)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $task->project_id,
            'attachment.delete'
        );
    }

    /**
     * Determine if the user can log time for the task.
     */
    public function logTime(AdminUser $user, Task $task)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        // Get project to check member role
        $project = $task->project;
        if ($project) {
            // Check if user is active member with vai_tro = 'quan_ly' or 'thanh_vien'
            $member = $project->members()->where('admin_user_id', $user->id)
                ->where('is_active', true)
                ->first();

            if ($member && in_array($member->vai_tro, ['quan_ly', 'thanh_vien'])) {
                return true;
            }
        }

        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $task->project_id,
            'time.log'
        );
    }

    /**
     * Determine if the user can view all time logs.
     */
    public function viewAllTimeLogs(AdminUser $user, Task $task)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $task->project_id,
            'time.view_all'
        );
    }

    /**
     * Determine if the user can delete time logs.
     */
    public function deleteTimeLog(AdminUser $user, Task $task)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $task->project_id,
            'time.delete'
        );
    }
}
