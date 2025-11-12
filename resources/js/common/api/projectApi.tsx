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
};

export default {
    projectApi,
    taskApi,
    referenceApi,
};
