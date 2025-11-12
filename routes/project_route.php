<?php
<<<<<<< HEAD

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
    // Read permissions - Anyone in project can view
    Route::middleware('project.permission:project.view,id')->group(function () {
        Route::get('/', [ProjectController::class, 'index'])->name('index')->withoutMiddleware('project.permission');
        Route::get('/{id}', [ProjectController::class, 'show'])->name('show');
        Route::get('/dashboard', [ProjectController::class, 'dashboard'])->name('dashboard')->withoutMiddleware('project.permission');
        Route::get('/{id}/dashboard-stats', [ProjectController::class, 'getDashboardStats'])->name('dashboard_stats');
    });

    // Create/Update permissions - Only managers and above
    Route::middleware('project.permission:project.update,id')->group(function () {
        Route::post('/', [ProjectController::class, 'store'])->name('store')->withoutMiddleware('project.permission');
        Route::put('/{id}', [ProjectController::class, 'update'])->name('update');
    });

    // Delete permissions - Only admins
    Route::middleware('project.permission:project.delete,id')->group(function () {
        Route::delete('/{id}', [ProjectController::class, 'destroy'])->name('destroy');
    });

    // Member management - Only managers and above
    Route::middleware('project.permission:project.manage_members,id')->group(function () {
        Route::post('/{id}/members', [ProjectController::class, 'addMember'])->name('add_member');
        Route::delete('/{id}/members/{memberId}', [ProjectController::class, 'removeMember'])->name('remove_member');
    });

    // Project attachments - Members can upload
    Route::middleware('project.permission:attachment.create,id')->group(function () {
        Route::post('/{id}/attachments', [ProjectController::class, 'uploadAttachment'])->name('upload_attachment');
    });
});

// Task routes
Route::prefix('tasks')->name('tasks.')->group(function () {
    // View tasks
    Route::get('/', [TaskController::class, 'index'])->name('index');
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
        'data' => \App\Models\Project\ProjectStatus::where('is_active', true)->orderBy('thu_tu')->get(),
    ]);
});

Route::get('/project-types', function () {
    return response()->json([
        'success' => true,
        'data' => \App\Models\Project\ProjectType::where('is_active', true)->get(),
    ]);
});

Route::get('/task-statuses', function () {
    return response()->json([
        'success' => true,
        'data' => \App\Models\Project\TaskStatus::where('is_active', true)->orderBy('thu_tu')->get(),
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
=======
>>>>>>> 7aa265d92adf5cf9e2fd102b64445c607cad4f9e
