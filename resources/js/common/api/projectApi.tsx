import axios from 'axios';

const API_BASE = '/project/api';

// ============================================
// PROJECT APIs
// ============================================

/**
 * Project API methods
 *
 * Provides methods for CRUD operations on projects, member management,
 * file attachments, and dashboard statistics.
 */
export const projectApi = {
    /**
     * Get paginated list of projects with optional filters
     * @param params - Filter parameters (search, trang_thai_id, loai_du_an_id, etc.)
     * @returns Promise with paginated project list
     */
    getList: (params?: any) => {
        return axios.get(`${API_BASE}/projects`, { params });
    },

    /**
     * Get single project by ID
     * @param id - Project ID
     * @returns Promise with project details including relationships
     */
    getById: (id: number) => {
        return axios.get(`${API_BASE}/projects/${id}`);
    },

    /**
     * Create a new project
     * @param data - Project data (ten_du_an, ngay_bat_dau, members, etc.)
     * @returns Promise with created project
     */
    create: (data: any) => {
        return axios.post(`${API_BASE}/projects`, data);
    },

    /**
     * Update existing project
     * @param id - Project ID
     * @param data - Updated project data
     * @returns Promise with updated project
     */
    update: (id: number, data: any) => {
        return axios.put(`${API_BASE}/projects/${id}`, data);
    },

    /**
     * Delete a project
     * @param id - Project ID
     * @returns Promise with deletion confirmation
     */
    delete: (id: number) => {
        return axios.delete(`${API_BASE}/projects/${id}`);
    },

    /**
     * Get dashboard overview for all projects
     * @returns Promise with summary statistics
     */
    getDashboard: () => {
        return axios.get(`${API_BASE}/projects/dashboard`);
    },

    /**
     * Get comprehensive dashboard statistics for a specific project
     * @param projectId - Project ID
     * @param params - Optional date range filters (tu_ngay, den_ngay)
     * @returns Promise with dashboard data (charts, overview, time tracking)
     */
    getDashboardStats: (projectId: number, params?: any) => {
        return axios.get(`${API_BASE}/projects/${projectId}/dashboard-stats`, { params });
    },

    // Add member to project
    addMember: (projectId: number, data: any) => {
        return axios.post(`${API_BASE}/projects/${projectId}/members`, data);
    },

    // Remove member from project
    removeMember: (projectId: number, memberId: number) => {
        return axios.delete(`${API_BASE}/projects/${projectId}/members/${memberId}`);
    },

    // Upload attachment
    uploadAttachment: (projectId: number, formData: FormData) => {
        return axios.post(`${API_BASE}/projects/${projectId}/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Update attachment description
    updateAttachment: (attachmentId: number, description: string) => {
        return axios.put(`${API_BASE}/project-attachments/${attachmentId}`, {
            mo_ta: description,
        });
    },

    // Download attachment
    downloadAttachment: (attachmentId: number) => {
        return axios.get(`${API_BASE}/project-attachments/${attachmentId}/download`, {
            responseType: 'blob',
        });
    },

    // Delete attachment
    deleteAttachment: (attachmentId: number) => {
        return axios.delete(`${API_BASE}/project-attachments/${attachmentId}`);
    },
};

// ============================================
// TASK APIs
// ============================================

/**
 * Task API methods
 *
 * Provides methods for task CRUD, status updates, comments, attachments,
 * and time tracking functionality.
 */
export const taskApi = {
    /**
     * Get paginated list of tasks with optional filters
     * @param params - Filter parameters (project_id, trang_thai_id, search, etc.)
     * @returns Promise with paginated task list
     */
    getList: (params?: any) => {
        return axios.get(`${API_BASE}/tasks`, { params });
    },

    /**
     * Get all tasks assigned to current user across all projects
     * @param params - Filter parameters (project_id, status_id, priority_id, search, etc.)
     * @returns Promise with paginated task list for current user
     */
    getMyTasks: (params?: any) => {
        return axios.get(`${API_BASE}/tasks/my-tasks`, { params });
    },

    /**
     * Get single task by ID with all relationships
     * @param id - Task ID
     * @returns Promise with task details (checklists, comments, attachments, time logs)
     */
    getById: (id: number) => {
        return axios.get(`${API_BASE}/tasks/${id}`);
    },

    /**
     * Get kanban board data for a project
     * @param projectId - Project ID
     * @returns Promise with tasks grouped by status
     */
    getKanban: (projectId: number) => {
        return axios.get(`${API_BASE}/tasks/kanban/${projectId}`);
    },

    /**
     * Get Gantt chart data for a project
     * @param projectId - Project ID
     * @returns Promise with task timeline data
     */
    getGantt: (projectId: number) => {
        return axios.get(`${API_BASE}/tasks/gantt/${projectId}`);
    },

    // Create new task
    create: (data: any) => {
        return axios.post(`${API_BASE}/tasks`, data);
    },

    // Update task
    update: (id: number, data: any) => {
        return axios.put(`${API_BASE}/tasks/${id}`, data);
    },

    // Update task status (for Kanban drag & drop)
    updateStatus: (id: number, statusId: number, kanbanOrder?: number) => {
        return axios.put(`${API_BASE}/tasks/${id}/status`, {
            trang_thai_id: statusId,
            kanban_order: kanbanOrder,
        });
    },

    // Delete task
    delete: (id: number) => {
        return axios.delete(`${API_BASE}/tasks/${id}`);
    },

    // Add comment to task
    addComment: (taskId: number, content: string, parentId?: number) => {
        return axios.post(`${API_BASE}/tasks/${taskId}/comments`, {
            noi_dung: content,
            parent_id: parentId,
        });
    },

    uploadAttachment: (taskId: number, formData: FormData) => {
        return axios.post(`${API_BASE}/tasks/${taskId}/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    updateAttachment: (attachmentId: number, description: string) => {
        return axios.put(`${API_BASE}/task-attachments/${attachmentId}`, {
            mo_ta: description,
        });
    },

    downloadAttachment: (attachmentId: number) => {
        return axios.get(`${API_BASE}/task-attachments/${attachmentId}/download`, {
            responseType: 'blob',
        });
    },

    deleteAttachment: (attachmentId: number) => {
        return axios.delete(`${API_BASE}/task-attachments/${attachmentId}`);
    },

    // ========================================
    // TIME TRACKING METHODS
    // ========================================

    /**
     * Start a timer for a task
     * @param taskId - Task ID to track time for
     * @returns Promise with created time log entry
     * @throws Error if user already has a running timer
     */
    startTimer: (taskId: number) => {
        return axios.post(`${API_BASE}/tasks/${taskId}/time/start`);
    },

    /**
     * Stop a running timer
     * @param timeLogId - Time log ID to stop
     * @returns Promise with updated time log (includes calculated duration)
     */
    stopTimer: (timeLogId: number) => {
        return axios.post(`${API_BASE}/time/${timeLogId}/stop`);
    },

    /**
     * Add a manual time log entry
     * @param taskId - Task ID
     * @param data - Time log data with start/end timestamps and optional description
     * @returns Promise with created time log
     */
    addManualTimeLog: (taskId: number, data: { started_at: string; ended_at: string; mo_ta?: string }) => {
        return axios.post(`${API_BASE}/tasks/${taskId}/time/manual`, data);
    },

    /**
     * Get all time logs for a task
     * @param taskId - Task ID
     * @returns Promise with array of time logs
     */
    getTimeLogs: (taskId: number) => {
        return axios.get(`${API_BASE}/tasks/${taskId}/time-logs`);
    },

    /**
     * Delete a time log entry
     * @param timeLogId - Time log ID
     * @returns Promise with deletion confirmation
     */
    deleteTimeLog: (timeLogId: number) => {
        return axios.delete(`${API_BASE}/time/${timeLogId}`);
    },

    /**
     * Get currently running timer for authenticated user
     * @returns Promise with running timer or null
     */
    getRunningTimer: () => {
        return axios.get(`${API_BASE}/time/running`);
    },

    // ========================================
    // SUPPORTERS METHODS
    // ========================================

    /**
     * Add supporters to a task
     * @param taskId - Task ID
     * @param supporterIds - Array of admin user IDs
     * @returns Promise with success message
     */
    addSupporters: (taskId: number, supporterIds: number[]) => {
        return axios.post(`${API_BASE}/tasks/${taskId}/supporters`, { supporter_ids: supporterIds });
    },

    /**
     * Update supporters for a task (replaces existing)
     * @param taskId - Task ID
     * @param supporterIds - Array of admin user IDs
     * @returns Promise with success message
     */
    updateSupporters: (taskId: number, supporterIds: number[]) => {
        return axios.put(`${API_BASE}/tasks/${taskId}/supporters`, { supporter_ids: supporterIds });
    },

    /**
     * Remove a supporter from a task
     * @param taskId - Task ID
     * @param userId - Admin user ID to remove
     * @returns Promise with success message
     */
    removeSupporter: (taskId: number, userId: number) => {
        return axios.delete(`${API_BASE}/tasks/${taskId}/supporters/${userId}`);
    },
};

// ============================================
// NOTIFICATION APIs
// ============================================

/**
 * Notification API methods
 *
 * Real-time notifications for project/task changes
 */
export const notificationApi = {
    /**
     * Get notifications for current user
     * @param type - Filter by type ('unread' or 'all')
     * @returns Promise with notifications list
     */
    getNotifications: (type: 'unread' | 'all' = 'all') => {
        return axios.get(`${API_BASE}/notifications`, { params: { type } });
    },

    /**
     * Get unread notification count
     * @returns Promise with count
     */
    getUnreadCount: () => {
        return axios.get(`${API_BASE}/notifications/unread-count`);
    },

    /**
     * Mark a notification as read
     * @param id - Notification ID
     * @returns Promise with success message
     */
    markAsRead: (id: number) => {
        return axios.post(`${API_BASE}/notifications/${id}/read`);
    },

    /**
     * Mark all notifications as read
     * @returns Promise with success message
     */
    markAllAsRead: () => {
        return axios.post(`${API_BASE}/notifications/read-all`);
    },
};

// ============================================
// REFERENCE DATA APIs
// ============================================

export const referenceApi = {
    // Get project statuses
    getProjectStatuses: () => {
        return axios.get(`${API_BASE}/project-statuses`);
    },

    // Get project types
    getProjectTypes: () => {
        return axios.get(`${API_BASE}/project-types`);
    },

    // Get task statuses
    getTaskStatuses: () => {
        return axios.get(`${API_BASE}/task-statuses`);
    },

    // Get priorities
    getPriorities: () => {
        return axios.get(`${API_BASE}/priorities`);
    },

    // Get all admin users
    getAdminUsers: () => {
        return axios.get(`${API_BASE}/admin-users`);
    },

    // Get all projects (for filters)
    getProjects: () => {
        return axios.get(`${API_BASE}/projects`);
    },
};

// ============================================
// REPORT APIs
// ============================================

/**
 * Report API methods
 *
 * Daily work reports and statistics
 */
export const reportApi = {
    /**
     * Get my daily report (auto-generated from time logs, tasks, activities)
     * @param date - Date in format YYYY-MM-DD (optional, default: today)
     * @returns Promise with daily report data
     */
    getMyDailyReport: (date?: string) => {
        const url = date ? `${API_BASE}/reports/daily/${date}` : `${API_BASE}/reports/daily`;
        return axios.get(url);
    },

    /**
     * Submit/update daily report
     * @param data - Report data (report_date, notes, blockers, plan_tomorrow, status)
     * @returns Promise with submission confirmation
     */
    submitDailyReport: (data: any) => {
        return axios.post(`${API_BASE}/reports/daily`, data);
    },

    /**
     * Get daily report history
     * @param params - Filter parameters (start_date, end_date)
     * @returns Promise with report history
     */
    getDailyHistory: (params?: any) => {
        return axios.get(`${API_BASE}/reports/daily-history`, { params });
    },

    /**
     * Get my statistics (week/month/year)
     * @param period - Period filter ('week', 'month', 'year')
     * @returns Promise with statistics
     */
    getMyStats: (period?: string) => {
        return axios.get(`${API_BASE}/reports/my-stats`, { params: { period } });
    },

    /**
     * Get team daily reports (for managers)
     * @param date - Date in format YYYY-MM-DD (optional, default: today)
     * @returns Promise with team reports
     */
    getTeamDailyReports: (date?: string) => {
        const url = date ? `${API_BASE}/reports/team-daily/${date}` : `${API_BASE}/reports/team-daily`;
        return axios.get(url);
    },

    /**
     * Get user daily report detail (for managers)
     * @param userId - User ID
     * @param date - Date in format YYYY-MM-DD (optional, default: today)
     * @returns Promise with user report detail
     */
    getUserDailyReport: (userId: number, date?: string) => {
        const url = date
            ? `${API_BASE}/reports/user-daily/${userId}/${date}`
            : `${API_BASE}/reports/user-daily/${userId}`;
        return axios.get(url);
    },
};

// ============================================
// MEETING APIs
// ============================================

/**
 * Meeting API methods
 */
export const meetingApi = {
    /**
     * Get paginated list of meetings with filters
     */
    getList: (params?: any) => {
        return axios.get(`${API_BASE}/meetings`, { params });
    },

    /**
     * Get single meeting by ID
     */
    getById: (id: number) => {
        return axios.get(`${API_BASE}/meetings/${id}`);
    },

    /**
     * Create new meeting
     */
    create: (data: any) => {
        return axios.post(`${API_BASE}/meetings`, data);
    },

    /**
     * Update meeting
     */
    update: (id: number, data: any) => {
        return axios.put(`${API_BASE}/meetings/${id}`, data);
    },

    /**
     * Delete meeting
     */
    delete: (id: number) => {
        return axios.delete(`${API_BASE}/meetings/${id}`);
    },

    /**
     * Quick update single field
     */
    quickUpdate: (id: number, field: string, value: any) => {
        return axios.post(`${API_BASE}/meetings/${id}/quick-update`, { field, value });
    },

    /**
     * Get meeting statuses
     */
    getStatuses: () => {
        return axios.get(`${API_BASE}/meeting-statuses`);
    },

    /**
     * Add project to meeting (auto-create or update)
     */
    addProject: (projectId: number, meetingType: string, note?: string) => {
        return axios.post(`${API_BASE}/meetings/add-project`, {
            project_id: projectId,
            meeting_type: meetingType,
            note,
        });
    },

    /**
     * Add task to meeting (auto-create or update)
     */
    addTask: (taskId: number, meetingType: string, note?: string) => {
        return axios.post(`${API_BASE}/meetings/add-task`, {
            task_id: taskId,
            meeting_type: meetingType,
            note,
        });
    },
};

export default {
    projectApi,
    taskApi,
    notificationApi,
    referenceApi,
    reportApi,
    meetingApi,
};
