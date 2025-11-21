<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Admin\ProjectSettingAddTaskExpress;
use Illuminate\Http\Request;

class TaskTemplateController extends Controller
{
    /**
     * Display a listing of task templates
     */
    public function index()
    {
        $templates = ProjectSettingAddTaskExpress::orderBy('sort_order')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $templates,
        ]);
    }

    /**
     * Store a newly created template
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tasks' => 'required|json',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $template = ProjectSettingAddTaskExpress::create([
            'name' => $validated['name'],
            'tasks' => $validated['tasks'],
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? 1,
            'create_by' => auth('admin_users')->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo mẫu thành công',
            'data' => $template,
        ]);
    }

    /**
     * Update the specified template
     */
    public function update(Request $request, $id)
    {
        $template = ProjectSettingAddTaskExpress::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'tasks' => 'sometimes|required|json',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $template->update([
            'name' => $validated['name'] ?? $template->name,
            'tasks' => $validated['tasks'] ?? $template->tasks,
            'sort_order' => $validated['sort_order'] ?? $template->sort_order,
            'is_active' => $validated['is_active'] ?? $template->is_active,
            'update_by' => auth('admin_users')->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật mẫu thành công',
            'data' => $template,
        ]);
    }

    /**
     * Remove the specified template
     */
    public function destroy($id)
    {
        $template = ProjectSettingAddTaskExpress::findOrFail($id);
        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa mẫu thành công',
        ]);
    }
}
