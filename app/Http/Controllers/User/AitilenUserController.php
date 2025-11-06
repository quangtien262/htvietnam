<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Admin\AitilenInvoice;
use Illuminate\Http\Request;
use App\Models\Admin\Contract;
use App\Models\Admin\Task;
use App\Models\Admin\TaskChecklist;
use App\Models\Admin\TaskComment;
use App\Models\User;
use App\Models\Web\WebConfig;
use App\Services\Admin\TblService;
use Illuminate\Support\Facades\Auth;

class AitilenUserController extends Controller
{
    public function contract()
    {

        $contracts = Contract::baseQueryInfo()
            ->where('user_id', Auth::guard('web')->id())
            ->orderBy('id', 'desc')
            ->get();

        $phuLucHopDong = [];

        $contract = Contract::baseQueryInfo()->where('user_id', Auth::guard('web')->id())
            ->orderBy('id', 'desc')
            ->first();
        $datas = [
            'contracts' => $contracts,
            'contract' => $contract,
            'phuLucHopDong' => $phuLucHopDong,
        ];

        return $this->sendSuccessResponse($datas);
    }

    public function profile(Request $request)
    {
        $user = User::find(Auth::guard('web'));
        $result = [
            'user' => $user,
        ];
        return $this->sendSuccessResponse($result);
    }

    public function updateProfile(Request $request)
    {
        $user = User::find(Auth::guard('web')->id());
        $check = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'phone' => 'required|string|max:20',
            'ngay_sinh' => 'nullable|date',
            'gioi_tinh_id' => 'nullable|integer',
            'image' => 'nullable|image|max:2048',
        ]);
        $data = $request->all();
        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->phone = $data['phone'];
        $user->ngay_sinh = $data['ngay_sinh'] ?? $user->ngay_sinh;
        $user->gioi_tinh_id = $data['gioi_tinh_id'] ?? $user->gioi_tinh_id;
        $user->address = $data['address'] ?? $user->address;
        $user->cccd = $data['cccd'] ?? $user->cccd;
        $user->cccd = $data['address'] ?? $user->cccd;
        if (isset($data['image'])) {
            $imagePath = $data['image']->store('profile_images', 'public');
            $user->image = $imagePath;
        }
        $user->save();

        return $this->sendSuccessResponse($user);
    }

    /**
     * API cho màn hình gửi yêu cầu hỗ trợ
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function support(Request $request)
    {
        $user = Auth::guard('web')->user();
        $tasks = Task::select(
            'tasks.*',

            'task_category.name as category_name',
            'task_category.color as category_color',
            'task_category.icon as category_icon',

            'task_priority.name as priority_name',
            'task_priority.color as priority_color',

            'task_status.name as status_name',
            'task_status.color as status_color',
            'task_status.background as status_background',

            'admin_users.name as assigned_to',

        )
            ->leftJoin('task_category', 'task_category.id', 'tasks.task_category_id')
            ->leftJoin('task_priority', 'task_priority.id', 'tasks.task_priority_id')
            ->leftJoin('task_status', 'task_status.id', 'tasks.task_status_id')
            ->leftJoin('admin_users', 'admin_users.id', 'tasks.nguoi_thuc_hien')
            ->where('tasks.parent_name', 'aitilen')
            ->where('tasks.user_id', $user->id)
            ->get();

        $category = TblService::getDataSelect02('task_category', ['parent_name' => 'aitilen']);
        $status = TblService::getDataSelect02('task_status', ['parent_name' => 'aitilen']);
        $priority = TblService::getDataSelect02('task_priority', ['parent_name' => 'aitilen']);
        $contract = TblService::getDataSelect02('contract', ['user_id' => $user->id]);

        $result = [
            'tasks' => $tasks,
            'user' => $user,
            'category' => $category,
            'status' => $status,
            'priority' => $priority,
            'contract' => $contract
        ];
        return $this->sendSuccessResponse($result);
    }

    public function createTask(Request $request)
    {
        // dd($request->all());
        $contract = Contract::find($request->contract_id);
        // dd($contract);
        $user = Auth::guard('web')->user();
        $tasks = new Task();
        $tasks->name = $request->name;
        $tasks->description = $request->description;
        $tasks->user_id = $user->id;
        $tasks->parent_name = 'aitilen';
        $tasks->project_id = 2; // 2: id project Aitilen
        $tasks->task_category_id = $request->task_category_id;

        // 1: Urgent; 2: High; 3: Medium; 4: Low
        $tasks->task_priority_id = 1; // Mặc định ưu tiên cao

        // 1: chưa xử lý; 2: đang xử lý; 3: đã hoàn thành, 4: hủy
        $tasks->task_status_id = 5; // mặc định là chưa xử lý

        //
        $tasks->room_id = $contract->room_id;
        $tasks->apartment_id = $contract->apartment_id;

        $tasks->save();
        $tasks->code = 'TICKET-' . str_pad($tasks->id, 6, '0', STR_PAD_LEFT);
        $tasks->save();


        return $this->sendSuccessResponse($tasks);
    }

    public function getTaskInfo(Request $request)
    {
        if (empty($request->id)) {
            return $this->sendSuccessResponse([]);
        }
        $taskId = $request->id;
        $task = Task::select(
            'tasks.*',

            'task_category.name as category_name',
            'task_category.color as category_color',
            'task_category.icon as category_icon',

            'task_priority.name as priority_name',
            'task_priority.color as priority_color',

            'task_status.name as status_name',
            'task_status.color as status_color',
            'task_status.background as status_background',

            'admin_users.name as assigned_to',

        )
            ->leftJoin('task_category', 'task_category.id', 'tasks.task_category_id')
            ->leftJoin('task_priority', 'task_priority.id', 'tasks.task_priority_id')
            ->leftJoin('task_status', 'task_status.id', 'tasks.task_status_id')
            ->leftJoin('admin_users', 'admin_users.id', 'tasks.nguoi_thuc_hien')
            ->find($taskId);

        $comments = TaskComment::getByTask($taskId);

        $result = [
            'comments' => $comments,
            'task' => $task,
        ];
        return $this->sendSuccessResponse($result);
    }

    function addOrEditTaskComment(Request $request)
    {
        $user = Auth::guard('web')->user();
        if(empty($request->id)) {
            $comment = new TaskComment();
            $comment->user_id = $user->id;
        } else {
            $comment = TaskComment::find($request->id);
            if(!$comment) {
                return $this->sendErrorResponse('Comment not found');
            }
        }
        $comment->task_id = $request->task_id;
        $comment->content = $request->content;
        $comment->save();

        // get all comment after save
        $comment = TaskComment::getByTask($request->task_id);

        return $this->sendSuccessResponse(['comments' => $comment]);
    }

    function invoiceIndexApi(Request $request) {
        $user = Auth::guard('web')->user();
        $contracts = Contract::where('user_id', $user->id)->get();
        $contractIds = $contracts->pluck('id')->toArray();
        $invoices = AitilenInvoice::whereIn('contract_id', $contractIds)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->orderBy('id', 'desc')
            ->get();
        $currentInvoice = [];
        if(!empty($invoices[0])) {
            $currentInvoice = $invoices[0];
        }
        $result = [
            'invoices' => $invoices,
            'currentInvoice' => $currentInvoice,
        ];
        return $this->sendSuccessResponse($result);
    }
}
