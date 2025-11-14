<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Project\Task;
use App\Models\Project\TaskTimeLog;
use App\Models\Project\ActivityLog;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Get my daily report (auto-generated)
     *
     * @param string|null $date Format: Y-m-d, default: today
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyDailyReport($date = null)
    {
        $userId = Auth::guard('admin_users')->id();
        $reportDate = $date ? Carbon::parse($date) : Carbon::today();

        try {
            // 1. Get time logs for the day
            $timeLogs = TaskTimeLog::where('admin_user_id', $userId)
                ->whereDate('started_at', $reportDate)
                ->with(['task.project', 'task.trangThai'])
                ->get();

            $totalDuration = $timeLogs->sum('duration');

            // 2. Group time logs by project
            $timeByProject = $timeLogs->groupBy('task.project.ten_du_an')->map(function ($logs) {
                return [
                    'project_name' => $logs->first()->task->project->ten_du_an ?? 'N/A',
                    'project_id' => $logs->first()->task->project_id ?? null,
                    'hours' => round($logs->sum('duration') / 3600, 2),
                    'duration_seconds' => $logs->sum('duration'),
                ];
            })->values();

            // 3. Get tasks worked on (tasks with time logs on this day)
            $taskIds = $timeLogs->pluck('task_id')->unique();
            $tasksWorkedOn = Task::whereIn('id', $taskIds)
                ->with(['project', 'trangThai', 'uuTien', 'nguoiThucHien'])
                ->get()
                ->map(function ($task) use ($timeLogs, $reportDate) {
                    $taskTimeLogs = $timeLogs->where('task_id', $task->id);

                    return [
                        'task_id' => $task->id,
                        'task_code' => $task->ma_nhiem_vu,
                        'task_title' => $task->tieu_de,
                        'project_name' => $task->project->ten_du_an ?? 'N/A',
                        'project_id' => $task->project_id,
                        'time_spent_seconds' => $taskTimeLogs->sum('duration'),
                        'time_spent_formatted' => $this->formatDuration($taskTimeLogs->sum('duration')),
                        'progress' => $task->tien_do ?? 0,
                        'status' => $task->trangThai->name ?? 'N/A',
                        'status_color' => $task->trangThai->color ?? '#8c8c8c',
                        'priority' => $task->uuTien->name ?? 'N/A',
                        'priority_color' => $task->uuTien->color ?? '#8c8c8c',
                    ];
                });

            // 4. Get activities count for the day
            $activities = ActivityLog::where('admin_user_id', $userId)
                ->whereDate('created_at', $reportDate)
                ->get();

            $activitiesSummary = [
                'total' => $activities->count(),
                'comments' => $activities->where('loggable_type', 'App\Models\Project\TaskComment')->count(),
                'file_uploads' => $activities->where('loggable_type', 'App\Models\Project\TaskAttachment')->count(),
                'status_changes' => $activities->where('event', 'updated')
                    ->filter(function ($log) {
                        $properties = json_decode($log->properties, true);
                        return isset($properties['old']['trang_thai_id']) &&
                               $properties['old']['trang_thai_id'] !== ($properties['new']['trang_thai_id'] ?? null);
                    })->count(),
            ];

            // 5. Get tasks completed today
            $tasksCompleted = Task::where('nguoi_thuc_hien_id', $userId)
                ->whereDate('ngay_ket_thuc_thuc_te', $reportDate)
                ->whereHas('trangThai', function ($query) {
                    $query->where('name', 'Hoàn thành');
                })
                ->count();

            // 6. Get total tasks assigned to user
            $totalTasksAssigned = Task::where('nguoi_thuc_hien_id', $userId)
                ->whereHas('trangThai', function ($query) {
                    $query->where('name', '!=', 'Hoàn thành');
                })
                ->count();

            // 7. Check if report was submitted
            $reportSubmission = DB::table('pro___daily_reports')
                ->where('admin_user_id', $userId)
                ->whereDate('report_date', $reportDate)
                ->first();

            $report = [
                'date' => $reportDate->format('Y-m-d'),
                'date_formatted' => $reportDate->format('d/m/Y'),
                'user_id' => $userId,

                // Summary metrics
                'total_hours' => round($totalDuration / 3600, 2),
                'total_duration_seconds' => $totalDuration,
                'total_duration_formatted' => $this->formatDuration($totalDuration),
                'tasks_completed' => $tasksCompleted,
                'tasks_assigned' => $totalTasksAssigned,
                'activities_count' => $activitiesSummary['total'],

                // Detailed data
                'time_by_project' => $timeByProject,
                'tasks_worked_on' => $tasksWorkedOn,
                'activities' => $activitiesSummary,

                // Submission status
                'is_submitted' => $reportSubmission !== null,
                'submitted_at' => $reportSubmission->submitted_at ?? null,
                'notes' => $reportSubmission->notes ?? '',
                'blockers' => $reportSubmission->blockers ?? '',
                'plan_tomorrow' => $reportSubmission->plan_tomorrow ?? '',
                'status' => $reportSubmission->status ?? 'draft',
            ];

            return response()->json([
                'success' => true,
                'data' => $report,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tải báo cáo: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Submit/update daily report
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function submitDailyReport(Request $request)
    {
        $userId = Auth::guard('admin_users')->id();

        $validated = $request->validate([
            'report_date' => 'required|date',
            'notes' => 'nullable|string',
            'blockers' => 'nullable|string',
            'plan_tomorrow' => 'nullable|string',
            'status' => 'nullable|in:draft,submitted,approved',
        ]);

        try {
            $reportDate = Carbon::parse($validated['report_date']);

            $report = DB::table('pro___daily_reports')->updateOrInsert(
                [
                    'admin_user_id' => $userId,
                    'report_date' => $reportDate->format('Y-m-d'),
                ],
                [
                    'notes' => $validated['notes'] ?? '',
                    'blockers' => $validated['blockers'] ?? '',
                    'plan_tomorrow' => $validated['plan_tomorrow'] ?? '',
                    'status' => $validated['status'] ?? 'submitted',
                    'submitted_at' => now(),
                    'updated_at' => now(),
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Báo cáo đã được lưu thành công',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lưu báo cáo: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get daily report history
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDailyHistory(Request $request)
    {
        $userId = Auth::guard('admin_users')->id();
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        try {
            $reports = DB::table('pro___daily_reports')
                ->where('admin_user_id', $userId)
                ->whereBetween('report_date', [$startDate, $endDate])
                ->orderBy('report_date', 'desc')
                ->get();

            // Get time logs summary for each day
            $history = [];
            $currentDate = Carbon::parse($startDate);
            $end = Carbon::parse($endDate);

            while ($currentDate <= $end) {
                $dateStr = $currentDate->format('Y-m-d');
                $report = $reports->firstWhere('report_date', $dateStr);

                // Get time logs for this day
                $timeLogs = TaskTimeLog::where('admin_user_id', $userId)
                    ->whereDate('started_at', $currentDate)
                    ->sum('duration');

                $tasksCount = TaskTimeLog::where('admin_user_id', $userId)
                    ->whereDate('started_at', $currentDate)
                    ->distinct('task_id')
                    ->count('task_id');

                $history[] = [
                    'date' => $dateStr,
                    'date_formatted' => $currentDate->format('d/m/Y'),
                    'total_hours' => round($timeLogs / 3600, 2),
                    'tasks_count' => $tasksCount,
                    'is_submitted' => $report !== null,
                    'status' => $report->status ?? 'draft',
                    'submitted_at' => $report->submitted_at ?? null,
                ];

                $currentDate->addDay();
            }

            return response()->json([
                'success' => true,
                'data' => $history,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tải lịch sử báo cáo: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get my statistics
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyStats(Request $request)
    {
        $userId = Auth::guard('admin_users')->id();
        $period = $request->input('period', 'week'); // week, month, year

        try {
            $startDate = match ($period) {
                'week' => Carbon::now()->startOfWeek(),
                'month' => Carbon::now()->startOfMonth(),
                'year' => Carbon::now()->startOfYear(),
                default => Carbon::now()->startOfWeek(),
            };

            // Total hours
            $totalHours = TaskTimeLog::where('admin_user_id', $userId)
                ->where('started_at', '>=', $startDate)
                ->sum('duration');

            // Tasks completed
            $tasksCompleted = Task::where('nguoi_thuc_hien_id', $userId)
                ->where('ngay_ket_thuc_thuc_te', '>=', $startDate)
                ->whereHas('trangThai', function ($query) {
                    $query->where('name', 'Hoàn thành');
                })
                ->count();

            // Daily hours trend
            $dailyHours = TaskTimeLog::where('admin_user_id', $userId)
                ->where('started_at', '>=', $startDate)
                ->selectRaw('DATE(started_at) as date, SUM(duration) as total_duration')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return [
                        'date' => $item->date,
                        'hours' => round($item->total_duration / 3600, 2),
                    ];
                });

            // Top projects
            $topProjects = TaskTimeLog::where('admin_user_id', $userId)
                ->where('started_at', '>=', $startDate)
                ->with('task.project')
                ->get()
                ->groupBy('task.project.ten_du_an')
                ->map(function ($logs, $projectName) {
                    return [
                        'project_name' => $projectName,
                        'hours' => round($logs->sum('duration') / 3600, 2),
                    ];
                })
                ->sortByDesc('hours')
                ->take(5)
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => $period,
                    'start_date' => $startDate->format('Y-m-d'),
                    'total_hours' => round($totalHours / 3600, 2),
                    'tasks_completed' => $tasksCompleted,
                    'daily_hours' => $dailyHours,
                    'top_projects' => $topProjects,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tải thống kê: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get team daily reports (for managers)
     * - Admin (permission_group_id = 1): Xem tất cả
     * - Manager (vai_tro = 'quan_ly' trong dự án): Xem team của dự án mình quản lý
     * - Member (vai_tro = 'thanh_vien'): Chỉ xem của mình
     *
     * @param string|null $date
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTeamDailyReports($date = null)
    {
        $currentUserId = Auth::guard('admin_users')->id();
        $reportDate = $date ? Carbon::parse($date) : Carbon::today();

        try {
            // Get current user's permission group
            $currentUser = DB::table('admin_users')
                ->where('id', $currentUserId)
                ->select('id', 'permission_group_id')
                ->first();

            // Determine which users to include based on permission
            $teamMemberIds = [];

            // Check if user is Admin (permission_group_id = 1)
            if ($currentUser && $currentUser->permission_group_id == 1) {
                // Admin: Get all active users (admin_user_status_id = 1 means "Đang hoạt động")
                $teamMemberIds = DB::table('admin_users')
                    ->where('admin_user_status_id', 1)
                    ->pluck('id')
                    ->toArray();

            } else {
                // Check if user is Manager (quan_ly) in any project
                $isManager = DB::table('pro___project_members')
                    ->where('admin_user_id', $currentUserId)
                    ->where('vai_tro', 'quan_ly')
                    ->where('is_active', 1)
                    ->exists();

                if ($isManager) {
                    // Manager: Get members from projects where user has 'quan_ly' role
                    $teamMemberIds = DB::table('pro___project_members as pm1')
                        ->whereIn('pm1.project_id', function ($query) use ($currentUserId) {
                            $query->select('project_id')
                                ->from('pro___project_members')
                                ->where('admin_user_id', $currentUserId)
                                ->where('vai_tro', 'quan_ly')
                                ->where('is_active', 1);
                        })
                        ->where('pm1.is_active', 1)
                        ->distinct()
                        ->pluck('pm1.admin_user_id')
                        ->toArray();
                } else {
                    // Member: Only see own report
                    $teamMemberIds = [$currentUserId];
                }
            }

            if (empty($teamMemberIds)) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'date' => $reportDate->format('Y-m-d'),
                        'date_formatted' => $reportDate->format('d/m/Y'),
                        'reports' => [],
                    ],
                ]);
            }

            // Get time logs for team members on this date
            $timeLogs = TaskTimeLog::whereDate('started_at', $reportDate)
                ->whereIn('admin_user_id', $teamMemberIds)
                ->selectRaw('admin_user_id, SUM(duration) as total_duration, COUNT(DISTINCT task_id) as tasks_count')
                ->groupBy('admin_user_id')
                ->get()
                ->keyBy('admin_user_id');

            // Get all team members with their info
            $teamReports = DB::table('admin_users')
                ->whereIn('id', $teamMemberIds)
                ->where('admin_user_status_id', 1) // 1 = "Đang hoạt động"
                ->select('id', 'name')
                ->get()
                ->map(function ($user) use ($reportDate, $timeLogs) {
                    $timeLog = $timeLogs->get($user->id);
                    $totalDuration = $timeLog ? $timeLog->total_duration : 0;
                    $tasksCount = $timeLog ? $timeLog->tasks_count : 0;

                    // Check if report was submitted
                    $submission = DB::table('pro___daily_reports')
                        ->where('admin_user_id', $user->id)
                        ->whereDate('report_date', $reportDate)
                        ->first();

                    return [
                        'user_id' => $user->id,
                        'user_name' => $user->name,
                        'total_hours' => round($totalDuration / 3600, 2),
                        'tasks_count' => $tasksCount,
                        'is_submitted' => $submission !== null,
                        'status' => $submission ? $submission->status : 'not_submitted',
                    ];
                })
                ->sortByDesc('total_hours')
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'date' => $reportDate->format('Y-m-d'),
                    'date_formatted' => $reportDate->format('d/m/Y'),
                    'reports' => $teamReports,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tải báo cáo team: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Format duration seconds to human readable
     *
     * @param int $seconds
     * @return string
     */
    private function formatDuration($seconds)
    {
        if (!$seconds) {
            return '0m';
        }

        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);

        if ($hours > 0) {
            return sprintf('%dh %dm', $hours, $minutes);
        } elseif ($minutes > 0) {
            return sprintf('%dm', $minutes);
        } else {
            return sprintf('%ds', $seconds);
        }
    }

    /**
     * Get user daily report detail (for managers)
     *
     * @param int $userId
     * @param string|null $date
     * @return JsonResponse
     */
    public function getUserDailyReport($userId, $date = null)
    {
        $reportDate = $date ? Carbon::parse($date) : Carbon::today();

        try {
            // 1. Get time logs for the day
            $timeLogs = TaskTimeLog::where('admin_user_id', $userId)
                ->whereDate('started_at', $reportDate)
                ->with(['task.project', 'task.trangThai'])
                ->get();

            $totalDuration = $timeLogs->sum('duration');

            // 2. Group time logs by project
            $timeByProject = $timeLogs->groupBy('task.project.ten_du_an')->map(function ($logs) {
                return [
                    'project_name' => $logs->first()->task->project->ten_du_an ?? 'N/A',
                    'project_id' => $logs->first()->task->project_id ?? null,
                    'hours' => round($logs->sum('duration') / 3600, 2),
                    'duration_seconds' => $logs->sum('duration'),
                ];
            })->values();

            // 3. Get tasks worked on
            $taskIds = $timeLogs->pluck('task_id')->unique();
            $tasksWorkedOn = Task::whereIn('id', $taskIds)
                ->with(['project', 'trangThai', 'uuTien', 'nguoiThucHien'])
                ->get()
                ->map(function ($task) use ($timeLogs) {
                    $taskTimeLogs = $timeLogs->where('task_id', $task->id);

                    return [
                        'task_id' => $task->id,
                        'task_code' => $task->ma_nhiem_vu,
                        'task_title' => $task->tieu_de,
                        'project_name' => $task->project->ten_du_an ?? 'N/A',
                        'project_id' => $task->project_id,
                        'time_spent_seconds' => $taskTimeLogs->sum('duration'),
                        'time_spent_formatted' => $this->formatDuration($taskTimeLogs->sum('duration')),
                        'progress' => $task->tien_do ?? 0,
                        'status' => $task->trangThai->name ?? 'N/A',
                        'status_color' => $task->trangThai->color ?? '#8c8c8c',
                        'priority' => $task->uuTien->name ?? 'N/A',
                        'priority_color' => $task->uuTien->color ?? '#8c8c8c',
                    ];
                });

            // 4. Get user info
            $user = \App\Models\AdminUser::find($userId);

            // 5. Get daily report submission (notes, blockers, plan)
            $dailyReport = \DB::table('pro___daily_reports')
                ->where('admin_user_id', $userId)
                ->where('report_date', $reportDate->format('Y-m-d'))
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                    ],
                    'date' => $reportDate->format('Y-m-d'),
                    'date_formatted' => $reportDate->format('d/m/Y'),
                    'total_hours' => round($totalDuration / 3600, 2),
                    'total_duration_formatted' => $this->formatDuration($totalDuration),
                    'time_by_project' => $timeByProject,
                    'tasks' => $tasksWorkedOn,
                    'tasks_count' => $tasksWorkedOn->count(),
                    'report' => $dailyReport ? [
                        'notes' => $dailyReport->notes,
                        'blockers' => $dailyReport->blockers,
                        'plan_tomorrow' => $dailyReport->plan_tomorrow,
                        'status' => $dailyReport->status,
                        'submitted_at' => $dailyReport->submitted_at,
                    ] : null,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
