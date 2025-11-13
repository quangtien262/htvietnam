// ============================================
// ENUMS
// ============================================

/**
 * Project status enumeration
 * Maps to database pro___project_statuses table
 */
export enum ProjectStatus {
    PLANNING = 1,
    IN_PROGRESS = 2,
    ON_HOLD = 3,
    COMPLETED = 4,
    CANCELLED = 5,
}

/**
 * Task status enumeration
 * Maps to database pro___task_statuses table
 */
export enum TaskStatus {
    NOT_STARTED = 1,
    IN_PROGRESS = 2,
    IN_REVIEW = 3,
    COMPLETED = 4,
    BLOCKED = 5,
}

/**
 * Priority level enumeration
 * Maps to database pro___priorities table
 */
export enum Priority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    URGENT = 4,
}

/**
 * Project member role types
 * Used in pro___project_members.vai_tro field
 */
export enum MemberRole {
    MANAGER = 'quan_ly',
    MEMBER = 'thanh_vien',
    VIEWER = 'xem',
}

// ============================================
// INTERFACES
// ============================================

export interface ProjectStatusType {
    id: number;
    name: string;
    color: string;
    icon?: string;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ProjectType {
    id: number;
    name: string;
    note?: string;
    color?: string;
    icon?: string;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface PriorityType {
    id: number;
    name: string;
    cap_do: number;
    color: string;
    sort_order: number;
    note?: string;
    created_at?: string;
    updated_at?: string;
}

export interface TaskStatusType {
    id: number;
    name: string;
    color: string;
    icon?: string;
    sort_order: number;
    note?: string;
    is_done: boolean;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

export interface ProjectMember {
    id: number;
    project_id: number;
    admin_user_id: number;
    user_id: number;
    vai_tro: MemberRole;
    ngay_tham_gia?: string;
    is_active: boolean;
    admin_user?: AdminUser;
    user?: AdminUser;
    created_at?: string;
    updated_at?: string;
}

export interface Project {
    id: number;
    ma_du_an: string;
    ten_du_an: string;
    mo_ta?: string;
    loai_du_an_id?: number;
    trang_thai_id: number;
    uu_tien_id: number;
    khach_hang_id?: number;
    ten_khach_hang?: string;
    ngay_bat_dau?: string;
    ngay_ket_thuc_du_kien?: string;
    ngay_ket_thuc_thuc_te?: string;
    ngan_sach_du_kien: number;
    ngan_sach: number;
    chi_phi_thuc_te: number;
    tien_do: number;
    quan_ly_du_an_id?: number;
    tags?: string[];
    mau_sac: string;
    ma_mau: string;
    ghi_chu?: string;
    created_by?: number;
    updated_by?: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;

    // Relationships
    loai_du_an?: ProjectType;
    trang_thai?: ProjectStatusType;
    uu_tien?: PriorityType;
    quan_ly_du_an?: AdminUser;
    nguoi_tao?: AdminUser;
    members?: ProjectMember[];
    tasks?: Task[];
    checklists?: ProjectChecklist[];
    attachments?: ProjectAttachment[];
    activity_logs?: ActivityLog[];

    // Computed
    completed_tasks_count?: number;
    total_tasks_count?: number;
    completion_rate?: number;
}

export interface TaskChecklist {
    id: number;
    task_id: number;
    noi_dung: string;
    is_completed: boolean;
    assigned_to?: number;
    assigned_user?: AdminUser;
    mo_ta?: string;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface TaskComment {
    id: number;
    task_id: number;
    admin_user_id: number;
    noi_dung: string;
    parent_id?: number;
    admin_user?: AdminUser;
    replies?: TaskComment[];
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface TaskAttachment {
    id: number;
    task_id: number;
    ten_file: string;
    duong_dan: string;
    loai_file?: string;
    kich_thuoc?: number;
    uploaded_by?: number;
    uploader?: AdminUser;
    mo_ta?: string;
    formatted_size?: string;
    extension?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProjectAttachment {
    id: number;
    project_id: number;
    ten_file: string;
    duong_dan: string;
    loai_file?: string;
    kich_thuoc?: number;
    uploaded_by?: number;
    uploader?: AdminUser;
    mo_ta?: string;
    formatted_size?: string;
    extension?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProjectChecklist {
    id: number;
    project_id: number;
    noi_dung: string;
    is_completed: boolean;
    assigned_to?: number;
    assigned_user?: AdminUser;
    mo_ta?: string;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface TaskDependency {
    id: number;
    task_id: number;
    depends_on_task_id: number;
    loai_phu_thuoc: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
    depends_on_task?: Task;
    created_at?: string;
    updated_at?: string;
}

/**
 * Time log entry for task time tracking
 * Represents a record in pro___task_time_logs table
 *
 * Supports both automatic timer (start/stop) and manual entry modes.
 * Duration is calculated automatically when timer is stopped.
 */
export interface TaskTimeLog {
    id: number;
    task_id: number;
    admin_user_id: number;
    started_at: string; // ISO datetime string
    ended_at?: string; // ISO datetime string (null if timer is running)
    duration?: number; // Total seconds (calculated on stop)
    mo_ta?: string; // Optional description
    is_running: boolean; // True if timer is currently active
    user?: AdminUser; // Relationship to user who created the log
    formatted_duration?: string; // Human-readable format (e.g., "2h 15m")
    current_duration?: number; // Live duration in seconds (for running timers)
    created_at?: string;
    updated_at?: string;
}

export interface Task {
    id: number;
    project_id: number;
    ma_nhiem_vu: string;
    tieu_de: string;
    mo_ta?: string;
    parent_id?: number;
    trang_thai_id: number;
    uu_tien_id: number;
    nguoi_thuc_hien_id?: number;
    nguoi_giao_viec_id?: number;
    ngay_bat_dau?: string;
    ngay_ket_thuc_du_kien?: string;
    ngay_ket_thuc_thuc_te?: string;
    thoi_gian_uoc_tinh?: number;
    thoi_gian_thuc_te?: number;
    tien_do: number;
    tags?: string[];
    ghi_chu?: string;
    kanban_order: number;
    created_by?: number;
    updated_by?: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;

    // Relationships
    project?: Project;
    parent?: Task;
    children?: Task[];
    trang_thai?: TaskStatusType;
    uu_tien?: PriorityType;
    nguoi_thuc_hien?: AdminUser;
    nguoi_giao_viec?: AdminUser;
    checklists?: TaskChecklist[];
    comments?: TaskComment[];
    attachments?: TaskAttachment[];
    dependencies?: TaskDependency[];
    timeLogs?: TaskTimeLog[];
    time_logs?: TaskTimeLog[]; // Laravel snake_case
}

export interface ActivityLog {
    id: number;
    loai_doi_tuong: 'project' | 'task';
    doi_tuong_id: number;
    hanh_dong: string;
    mo_ta?: string;
    du_lieu_cu?: any;
    du_lieu_moi?: any;
    admin_user_id?: number;
    admin_user?: AdminUser;
    user?: AdminUser;
    created_at?: string;
    updated_at?: string;
}

export interface TimeLog {
    id: number;
    task_id: number;
    admin_user_id: number;
    thoi_gian_bat_dau: string;
    thoi_gian_ket_thuc?: string;
    so_phut?: number;
    ghi_chu?: string;
    admin_user?: AdminUser;
    created_at?: string;
    updated_at?: string;
}

// ============================================
// FORM TYPES
// ============================================

export interface ProjectFormData {
    ten_du_an: string;
    mo_ta?: string;
    loai_du_an_id?: number;
    trang_thai_id: number;
    uu_tien_id: number;
    khach_hang_id?: number;
    ten_khach_hang?: string;
    ngay_bat_dau?: string;
    ngay_ket_thuc_du_kien?: string;
    ngan_sach_du_kien?: number;
    quan_ly_du_an_id?: number;
    tags?: string[];
    mau_sac?: string;
    ghi_chu?: string;
    members?: { admin_user_id: number; vai_tro: MemberRole }[];
}

export interface TaskFormData {
    project_id: number;
    tieu_de: string;
    mo_ta?: string;
    parent_id?: number;
    trang_thai_id: number;
    uu_tien_id: number;
    nguoi_thuc_hien_id?: number;
    ngay_bat_dau?: string;
    ngay_ket_thuc_du_kien?: string;
    thoi_gian_uoc_tinh?: number;
    tags?: string[];
    ghi_chu?: string;
    checklists?: { noi_dung: string; is_completed?: boolean }[];
}

// ============================================
// FILTER TYPES
// ============================================

export interface ProjectFilter {
    search?: string;
    trang_thai_id?: number[];
    loai_du_an_id?: number[];
    uu_tien_id?: number[];
    quan_ly_du_an_id?: number[];
    tu_ngay?: string;
    den_ngay?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
}

export interface TaskFilter {
    project_id?: number;
    search?: string;
    trang_thai_id?: number[];
    uu_tien_id?: number[];
    nguoi_thuc_hien_id?: number[];
    tu_ngay?: string;
    den_ngay?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    delayed_projects: number;
    total_tasks?: number;
    completed_tasks?: number;
    in_progress_tasks?: number;
    overdue_tasks?: number;
}

/**
 * Project dashboard statistics data structure
 *
 * Contains aggregated metrics and chart data for a single project.
 * Used by ProjectDetailDashboard component.
 *
 * Data can be filtered by date range (tu_ngay, den_ngay parameters).
 */
export interface ProjectDashboardStats {
    overview: {
        total_tasks: number;
        completed_tasks: number;
        in_progress_tasks: number;
        not_started_tasks: number;
        completion_rate: number; // Percentage (0-100)
        total_time_logged: number; // Total seconds
        total_hours_logged: number; // Total hours (decimal)
        team_size: number; // Number of active members
    };
    tasks_by_status: Array<{
        status: string; // Status name (e.g., "Hoàn thành")
        count: number; // Number of tasks
        color: string; // Hex color code
    }>;
    tasks_by_priority: Array<{
        priority: string; // Priority name (e.g., "Cao")
        count: number; // Number of tasks
        color: string; // Hex color code
    }>;
    progress_trend: Array<{
        date: string; // Date in Y-m-d format
        completed: number;
        in_progress: number;
        not_started: number;
    }>;
    time_by_member: Array<{
        member: string; // User name
        total_seconds: number; // Total time in seconds
        total_hours: number; // Total time in hours (decimal)
    }>;
}

export interface GanttTask {
    id: number;
    title: string;
    start: string;
    end: string;
    progress: number;
    assignee?: string;
    status: string;
    dependencies: number[];
}
