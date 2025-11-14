<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project\Meeting;
use App\Models\Project\MeetingStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MeetingController extends Controller
{
    public function index(Request $request)
    {
        $query = Meeting::with([
            'status:id,name,color',
            'creator:id,name',
            'tasks:id,tieu_de,trang_thai_id',
            'tasks.trangThai:id,name,color',
            'projects:id,ten_du_an,ma_du_an'
        ]);

        // Filter by status
        if ($request->filled('meeting_status_id')) {
            $query->where('meeting_status_id', $request->meeting_status_id);
        }

        // Filter by type
        if ($request->filled('meeting_type')) {
            $query->where('meeting_type', $request->meeting_type);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Date range
        if ($request->filled('from_date')) {
            $query->whereDate('scheduled_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('scheduled_at', '<=', $request->to_date);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'scheduled_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 20);
        $meetings = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $meetings->items(),
            'current_page' => $meetings->currentPage(),
            'per_page' => $meetings->perPage(),
            'total' => $meetings->total(),
            'last_page' => $meetings->lastPage(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'meeting_status_id' => 'required|exists:pro___meeting_status,id',
            'content' => 'nullable|string',
            'meeting_type' => 'required|in:daily,weekly,monthly,yearly',
            'scheduled_at' => 'nullable|date',
            'started_at' => 'nullable|date',
            'ended_at' => 'nullable|date',
            'task_ids' => 'nullable|array',
            'task_ids.*' => 'exists:pro___tasks,id',
            'project_ids' => 'nullable|array',
            'project_ids.*' => 'exists:pro___projects,id',
        ]);

        DB::beginTransaction();
        try {
            $validated['created_by'] = auth()->guard('admin_users')->id();
            
            $meeting = Meeting::create($validated);

            // Attach tasks
            if ($request->filled('task_ids')) {
                $taskData = [];
                foreach ($request->task_ids as $index => $taskId) {
                    $taskData[$taskId] = ['sort_order' => $index];
                }
                $meeting->tasks()->attach($taskData);
            }

            // Attach projects
            if ($request->filled('project_ids')) {
                $projectData = [];
                foreach ($request->project_ids as $index => $projectId) {
                    $projectData[$projectId] = ['sort_order' => $index];
                }
                $meeting->projects()->attach($projectData);
            }

            $meeting->load([
                'status',
                'creator',
                'tasks.trangThai',
                'projects'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tạo meeting thành công',
                'data' => $meeting,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        $meeting = Meeting::with([
            'status:id,name,color',
            'creator:id,name',
            'tasks:id,tieu_de,mo_ta,trang_thai_id,uu_tien_id,nguoi_thuc_hien_id,tien_do,ngay_bat_dau,ngay_ket_thuc_du_kien',
            'tasks.trangThai:id,name,color',
            'tasks.uuTien:id,name,color',
            'tasks.nguoiThucHien:id,name',
            'tasks.project:id,ten_du_an,ma_du_an',
            'projects:id,ten_du_an,ma_du_an,mo_ta,trang_thai_id,ngay_bat_dau,ngay_ket_thuc_du_kien',
            'projects.trangThai:id,name,color'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $meeting,
        ]);
    }

    public function update(Request $request, $id)
    {
        $meeting = Meeting::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'meeting_status_id' => 'sometimes|exists:pro___meeting_status,id',
            'content' => 'nullable|string',
            'meeting_type' => 'sometimes|in:daily,weekly,monthly,yearly',
            'scheduled_at' => 'nullable|date',
            'started_at' => 'nullable|date',
            'ended_at' => 'nullable|date',
            'task_ids' => 'nullable|array',
            'task_ids.*' => 'exists:pro___tasks,id',
            'project_ids' => 'nullable|array',
            'project_ids.*' => 'exists:pro___projects,id',
        ]);

        DB::beginTransaction();
        try {
            $meeting->update($validated);

            // Update tasks if provided
            if ($request->has('task_ids')) {
                $taskData = [];
                foreach ($request->task_ids as $index => $taskId) {
                    $taskData[$taskId] = ['sort_order' => $index];
                }
                $meeting->tasks()->sync($taskData);
            }

            // Update projects if provided
            if ($request->has('project_ids')) {
                $projectData = [];
                foreach ($request->project_ids as $index => $projectId) {
                    $projectData[$projectId] = ['sort_order' => $index];
                }
                $meeting->projects()->sync($projectData);
            }

            $meeting->load([
                'status',
                'creator',
                'tasks.trangThai',
                'tasks.uuTien',
                'tasks.nguoiThucHien',
                'tasks.project',
                'projects.trangThai'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật thành công',
                'data' => $meeting,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        $meeting = Meeting::findOrFail($id);
        $meeting->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa meeting thành công',
        ]);
    }

    // Quick update single field
    public function quickUpdate(Request $request, $id)
    {
        $meeting = Meeting::findOrFail($id);
        
        $field = $request->input('field');
        $value = $request->input('value');

        $allowedFields = ['name', 'meeting_status_id', 'content', 'meeting_type', 'scheduled_at', 'started_at', 'ended_at'];
        
        if (!in_array($field, $allowedFields)) {
            return response()->json([
                'success' => false,
                'message' => 'Trường không được phép cập nhật',
            ], 400);
        }

        $meeting->update([$field => $value]);

        $meeting->load(['status', 'creator', 'tasks.trangThai', 'projects.trangThai']);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thành công',
            'data' => $meeting,
        ]);
    }

    // Get reference data
    public function getStatuses()
    {
        $statuses = MeetingStatus::orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $statuses,
        ]);
    }

    /**
     * Add project to meeting (auto-create or update)
     * If meeting with this type exists today, add to it
     * Otherwise create new meeting
     */
    public function addProjectToMeeting(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:pro___projects,id',
            'meeting_type' => 'required|in:daily,weekly,monthly,yearly',
            'note' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $today = now()->format('Y-m-d');
            $meetingType = $validated['meeting_type'];

            // Find existing meeting for this type today
            $meeting = Meeting::where('meeting_type', $meetingType)
                ->whereDate('scheduled_at', $today)
                ->first();

            // If no meeting exists, create one
            if (!$meeting) {
                $defaultStatus = MeetingStatus::orderBy('sort_order')->first();
                
                $meeting = Meeting::create([
                    'name' => $this->generateMeetingName($meetingType, $today),
                    'meeting_status_id' => $defaultStatus->id,
                    'meeting_type' => $meetingType,
                    'scheduled_at' => now(),
                    'created_by' => auth()->guard('admin_users')->id(),
                ]);
            }

            // Check if project already in meeting
            $exists = $meeting->projects()->where('project_id', $validated['project_id'])->exists();

            if ($exists) {
                // Update note if provided
                if (isset($validated['note'])) {
                    $meeting->projects()->updateExistingPivot($validated['project_id'], [
                        'note' => $validated['note'],
                    ]);
                }
                $message = 'Project đã có trong meeting, đã cập nhật';
            } else {
                // Add project to meeting
                $meeting->projects()->attach($validated['project_id'], [
                    'note' => $validated['note'] ?? null,
                    'sort_order' => $meeting->projects()->count(),
                ]);
                $message = 'Đã thêm project vào meeting thành công';
            }

            DB::commit();

            $meeting->load(['status', 'projects', 'tasks']);

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $meeting,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Add task to meeting (auto-create or update)
     */
    public function addTaskToMeeting(Request $request)
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:pro___tasks,id',
            'meeting_type' => 'required|in:daily,weekly,monthly,yearly',
            'note' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $today = now()->format('Y-m-d');
            $meetingType = $validated['meeting_type'];

            // Find existing meeting for this type today
            $meeting = Meeting::where('meeting_type', $meetingType)
                ->whereDate('scheduled_at', $today)
                ->first();

            // If no meeting exists, create one
            if (!$meeting) {
                $defaultStatus = MeetingStatus::orderBy('sort_order')->first();
                
                $meeting = Meeting::create([
                    'name' => $this->generateMeetingName($meetingType, $today),
                    'meeting_status_id' => $defaultStatus->id,
                    'meeting_type' => $meetingType,
                    'scheduled_at' => now(),
                    'created_by' => auth()->guard('admin_users')->id(),
                ]);
            }

            // Check if task already in meeting
            $exists = $meeting->tasks()->where('task_id', $validated['task_id'])->exists();

            if ($exists) {
                // Update note if provided
                if (isset($validated['note'])) {
                    $meeting->tasks()->updateExistingPivot($validated['task_id'], [
                        'note' => $validated['note'],
                    ]);
                }
                $message = 'Task đã có trong meeting, đã cập nhật';
            } else {
                // Add task to meeting
                $meeting->tasks()->attach($validated['task_id'], [
                    'note' => $validated['note'] ?? null,
                    'sort_order' => $meeting->tasks()->count(),
                ]);
                $message = 'Đã thêm task vào meeting thành công';
            }

            DB::commit();

            $meeting->load(['status', 'tasks', 'projects']);

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $meeting,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate meeting name based on type and date
     */
    private function generateMeetingName($type, $date)
    {
        $typeLabels = [
            'daily' => 'Daily Meeting',
            'weekly' => 'Weekly Meeting',
            'monthly' => 'Monthly Meeting',
            'yearly' => 'Yearly Meeting',
        ];

        $label = $typeLabels[$type] ?? 'Meeting';
        $formattedDate = date('d/m/Y', strtotime($date));

        return "{$label} - {$formattedDate}";
    }
}
