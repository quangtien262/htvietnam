<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Services\Project\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Lấy danh sách thông báo
     */
    public function index(Request $request)
    {
        try {
            $userId = Auth::guard('admin_users')->id();
            $type = $request->get('type', 'unread'); // unread, all

            if ($type === 'unread') {
                $notifications = $this->notificationService->getUnreadNotifications($userId);
            } else {
                $notifications = $this->notificationService->getAllNotifications($userId);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => $notifications,
                    'count' => $notifications->count(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tải thông báo: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Đánh dấu đã đọc
     */
    public function markAsRead(Request $request, $id)
    {
        try {
            $userId = Auth::guard('admin_users')->id();
            $success = $this->notificationService->markAsRead($id, $userId);

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'Đã đánh dấu đã đọc',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông báo',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Đánh dấu tất cả đã đọc
     */
    public function markAllAsRead(Request $request)
    {
        try {
            $userId = Auth::guard('admin_users')->id();
            $count = $this->notificationService->markAllAsRead($userId);

            return response()->json([
                'success' => true,
                'message' => "Đã đánh dấu {$count} thông báo là đã đọc",
                'count' => $count,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    public function getUnreadCount()
    {
        try {
            $userId = Auth::guard('admin_users')->id();
            $count = $this->notificationService->countUnread($userId);

            return response()->json([
                'success' => true,
                'data' => [
                    'count' => $count,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }
}
