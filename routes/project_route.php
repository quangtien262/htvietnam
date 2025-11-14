<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Project\ProjectController;
use App\Http\Controllers\Project\TaskController;
use App\Http\Controllers\Project\PermissionController;

/*
|--------------------------------------------------------------------------
| Project Management API Routes
| Prefix: project/api
|--------------------------------------------------------------------------
*/

// Project routes
Route::prefix('projects')->name('projects.')->group(function () {
    // Routes that don't require project permission middleware
    Route::get('/', [ProjectController::class, 'index'])->name('index');
    Route::post('/', [ProjectController::class, 'store'])->name('store');
    Route::get('/dashboard', [ProjectController::class, 'dashboard'])->name('dashboard');
    Route::get('/{id}', [ProjectController::class, 'show'])->name('show');
    Route::get('/{id}/dashboard-stats', [ProjectController::class, 'getDashboardStats'])->name('dashboard_stats');

    // Update/Delete/Member management - Handled by Policy in Controller
    Route::put('/{id}', [ProjectController::class, 'update'])->name('update');
    Route::delete('/{id}', [ProjectController::class, 'destroy'])->name('destroy');
    Route::post('/{id}/members', [ProjectController::class, 'addMember'])->name('add_member');
    Route::delete('/{id}/members/{memberId}', [ProjectController::class, 'removeMember'])->name('remove_member');

    // Project attachments
    Route::post('/{id}/attachments', [ProjectController::class, 'uploadAttachment'])->name('upload_attachment');
});

// Task routes
Route::prefix('tasks')->name('tasks.')->group(function () {
    // View tasks
    Route::get('/', [TaskController::class, 'index'])->name('index');
    Route::get('/my-tasks', [TaskController::class, 'getMyTasks'])->name('my_tasks');
    Route::get('/kanban/{projectId}', [TaskController::class, 'kanban'])->name('kanban');
    Route::get('/gantt/{projectId}', [TaskController::class, 'gantt'])->name('gantt');
    Route::get('/{id}', [TaskController::class, 'show'])->name('show');
    Route::get('/{id}/time-logs', [TaskController::class, 'getTimeLogs'])->name('get_time_logs');

    // Create/Update tasks - Members and above
    Route::post('/', [TaskController::class, 'store'])->name('store');
    Route::put('/{id}', [TaskController::class, 'update'])->name('update');
    Route::put('/{id}/status', [TaskController::class, 'updateStatus'])->name('update_status');

    // Delete tasks - Managers and above
    Route::delete('/{id}', [TaskController::class, 'destroy'])->name('destroy');

    // Comments - Members and above
    Route::post('/{id}/comments', [TaskController::class, 'addComment'])->name('add_comment');

    // Attachments - Members and above
    Route::post('/{id}/attachments', [TaskController::class, 'uploadAttachment'])->name('upload_attachment');

    // Time tracking - Members and above
    Route::post('/{id}/time/start', [TaskController::class, 'startTimer'])->name('start_timer');
    Route::post('/{id}/time/manual', [TaskController::class, 'addManualTimeLog'])->name('add_manual_time');
});

// Time tracking global
Route::get('/time/running', [TaskController::class, 'getRunningTimer'])->name('get_running_timer');
Route::post('/time/{timeLogId}/stop', [TaskController::class, 'stopTimer'])->name('stop_timer');
Route::delete('/time/{timeLogId}', [TaskController::class, 'deleteTimeLog'])->name('delete_time_log');

// Task attachment routes
Route::get('/task-attachments/{id}/download', [TaskController::class, 'downloadAttachment'])->name('task_attachments.download');
Route::put('/task-attachments/{id}', [TaskController::class, 'updateAttachment'])->name('task_attachments.update');
Route::delete('/task-attachments/{id}', [TaskController::class, 'deleteAttachment'])->name('task_attachments.delete');

// Project attachment routes
Route::get('/project-attachments/{id}/download', [ProjectController::class, 'downloadAttachment'])->name('project_attachments.download');
Route::put('/project-attachments/{id}', [ProjectController::class, 'updateAttachment'])->name('project_attachments.update');
Route::delete('/project-attachments/{id}', [ProjectController::class, 'deleteAttachment'])->name('project_attachments.delete');

// Reference data routes
Route::get('/project-statuses', function () {
    return response()->json([
        'success' => true,
        'data' => \App\Models\Project\ProjectStatus::where('is_active', true)->orderBy('sort_order')->get(),
    ]);
});

Route::get('/project-types', function () {
    return response()->json([
        'success' => true,
        'data' => \App\Models\Project\ProjectType::where('is_active', true)->orderBy('sort_order')->get(),
    ]);
});

Route::get('/task-statuses', function () {
    return response()->json([
        'success' => true,
        'data' => \App\Models\Project\TaskStatus::where('is_active', true)->orderBy('sort_order')->get(),
    ]);
});

Route::get('/priorities', function () {
    return response()->json([
        'success' => true,
        'data' => \App\Models\Project\Priority::orderBy('cap_do')->get(),
    ]);
});

Route::get('/admin-users', function () {
    return response()->json([
        'success' => true,
        'data' => \App\Models\AdminUser::where('admin_user_status_id', 1)
            ->select('id', 'name', 'email', 'phone')
            ->orderBy('name')
            ->get(),
    ]);
});

// RBAC - Role & Permission Management
Route::prefix('rbac')->name('rbac.')->group(function () {
    Route::get('roles', [PermissionController::class, 'getRoles'])->name('roles');
    Route::get('permissions', [PermissionController::class, 'getPermissions'])->name('permissions');
    Route::get('projects/{projectId}/members', [PermissionController::class, 'getProjectMembers'])->name('project_members');
    Route::post('projects/{projectId}/members/{memberId}/assign-role', [PermissionController::class, 'assignRole'])->name('assign_role');
    Route::get('projects/{projectId}/user-permissions', [PermissionController::class, 'getUserPermissions'])->name('user_permissions');
});

// Daily Report Routes
Route::prefix('reports')->name('reports.')->group(function () {
    // Get my daily report (auto-generated from time logs, tasks, activities)
    Route::get('daily/{date?}', [App\Http\Controllers\Project\ReportController::class, 'getMyDailyReport'])->name('my_daily');

    // Submit/update daily report
    Route::post('daily', [App\Http\Controllers\Project\ReportController::class, 'submitDailyReport'])->name('submit_daily');

    // Get daily report history
    Route::get('daily-history', [App\Http\Controllers\Project\ReportController::class, 'getDailyHistory'])->name('daily_history');

    // Get my statistics
    Route::get('my-stats', [App\Http\Controllers\Project\ReportController::class, 'getMyStats'])->name('my_stats');

    // Manager view: Get team daily reports
    Route::get('team-daily/{date?}', [App\Http\Controllers\Project\ReportController::class, 'getTeamDailyReports'])->name('team_daily');

    // Manager view: Get user daily report detail
    Route::get('user-daily/{userId}/{date?}', [App\Http\Controllers\Project\ReportController::class, 'getUserDailyReport'])->name('user_daily');
});

// Meeting Routes
Route::prefix('meetings')->name('meetings.')->group(function () {
    Route::get('/', [App\Http\Controllers\Project\MeetingController::class, 'index'])->name('index');
    Route::get('/{id}', [App\Http\Controllers\Project\MeetingController::class, 'show'])->name('show');
    Route::post('/', [App\Http\Controllers\Project\MeetingController::class, 'store'])->name('store');
    Route::put('/{id}', [App\Http\Controllers\Project\MeetingController::class, 'update'])->name('update');
    Route::delete('/{id}', [App\Http\Controllers\Project\MeetingController::class, 'destroy'])->name('destroy');
    Route::post('/{id}/quick-update', [App\Http\Controllers\Project\MeetingController::class, 'quickUpdate'])->name('quick_update');
});

// Meeting actions - Add project/task to meeting
Route::post('/meetings/add-project', [App\Http\Controllers\Project\MeetingController::class, 'addProjectToMeeting'])->name('meetings.add_project');
Route::post('/meetings/add-task', [App\Http\Controllers\Project\MeetingController::class, 'addTaskToMeeting'])->name('meetings.add_task');

// Meeting reference data
Route::get('/meeting-statuses', [App\Http\Controllers\Project\MeetingController::class, 'getStatuses']);

// Notification Routes
Route::prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [App\Http\Controllers\Project\NotificationController::class, 'index'])->name('index');
    Route::get('/unread-count', [App\Http\Controllers\Project\NotificationController::class, 'getUnreadCount'])->name('unread_count');
    Route::post('/{id}/read', [App\Http\Controllers\Project\NotificationController::class, 'markAsRead'])->name('mark_read');
    Route::post('/read-all', [App\Http\Controllers\Project\NotificationController::class, 'markAllAsRead'])->name('mark_all_read');
});

// Task Supporters Routes
Route::prefix('tasks/{taskId}/supporters')->name('tasks.supporters.')->group(function () {
    Route::post('/', [TaskController::class, 'addSupporters'])->name('add');
    Route::put('/', [TaskController::class, 'updateSupporters'])->name('update');
    Route::delete('/{userId}', [TaskController::class, 'removeSup porter'])->name('remove');
});
