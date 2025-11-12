import axios from 'axios';

const API_BASE = '/project/api';

// ============================================
// PROJECT APIs
// ============================================

export const projectApi = {
    // Get list projects with filters
    getList: (params?: any) => {
        return axios.get(`${API_BASE}/projects`, { params });
    },

    // Get project by ID
    getById: (id: number) => {
        return axios.get(`${API_BASE}/projects/${id}`);
    },

    // Create new project
    create: (data: any) => {
        return axios.post(`${API_BASE}/projects`, data);
    },

    // Update project
    update: (id: number, data: any) => {
        return axios.put(`${API_BASE}/projects/${id}`, data);
    },

    // Delete project
    delete: (id: number) => {
        return axios.delete(`${API_BASE}/projects/${id}`);
    },

    // Get dashboard stats
    getDashboard: () => {
        return axios.get(`${API_BASE}/projects/dashboard`);
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

export const taskApi = {
    // Get list tasks with filters
    getList: (params?: any) => {
        return axios.get(`${API_BASE}/tasks`, { params });
    },

    // Get task by ID with full details (checklists, comments)
    getById: (id: number) => {
        return axios.get(`${API_BASE}/tasks/${id}`);
    },

    // Get kanban data for project
    getKanban: (projectId: number) => {
        return axios.get(`${API_BASE}/tasks/kanban/${projectId}`);
    },

    // Get gantt data for project
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
