<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Project\ProjectController;
use App\Http\Controllers\Project\TaskController;

/*
|--------------------------------------------------------------------------
| Project Management API Routes
| Prefix: project/api
|--------------------------------------------------------------------------
*/

// Project routes
Route::prefix('projects')->name('projects.')->group(function () {
    Route::get('/', [ProjectController::class, 'index'])->name('index');
    Route::post('/', [ProjectController::class, 'store'])->name('store');
    Route::get('/dashboard', [ProjectController::class, 'dashboard'])->name('dashboard');
    Route::get('/{id}', [ProjectController::class, 'show'])->name('show');
    Route::put('/{id}', [ProjectController::class, 'update'])->name('update');
    Route::delete('/{id}', [ProjectController::class, 'destroy'])->name('destroy');
    
    // Project members
    Route::post('/{id}/members', [ProjectController::class, 'addMember'])->name('add_member');
    Route::delete('/{id}/members/{memberId}', [ProjectController::class, 'removeMember'])->name('remove_member');
});

// Task routes
Route::prefix('tasks')->name('tasks.')->group(function () {
    Route::get('/', [TaskController::class, 'index'])->name('index');
    Route::post('/', [TaskController::class, 'store'])->name('store');
    Route::get('/kanban/{projectId}', [TaskController::class, 'kanban'])->name('kanban');
    Route::get('/gantt/{projectId}', [TaskController::class, 'gantt'])->name('gantt');
    Route::put('/{id}', [TaskController::class, 'update'])->name('update');
    Route::put('/{id}/status', [TaskController::class, 'updateStatus'])->name('update_status');
    Route::delete('/{id}', [TaskController::class, 'destroy'])->name('destroy');
    Route::post('/{id}/comments', [TaskController::class, 'addComment'])->name('add_comment');
});

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
        'data' => \App\Models\AdminUser::where('status', 1)
            ->select('id', 'name', 'email', 'phone')
            ->orderBy('name')
            ->get(),
    ]);
});
