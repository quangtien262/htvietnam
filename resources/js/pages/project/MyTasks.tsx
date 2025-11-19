import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, Input, DatePicker, Button, Space, message, Avatar, Tooltip, Progress, Badge, Empty, Spin, List } from 'antd';
import { SearchOutlined, ReloadOutlined, CalendarOutlined, ProjectOutlined, FlagOutlined, TableOutlined, AppstoreOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { taskApi, referenceApi } from '@/common/api/projectApi';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import TaskDetail from './TaskDetail';
import ROUTE from '@/common/route';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Task {
    id: number;
    name: string;
    description: string;
    project: {
        id: number;
        name: string;
        code: string;
    };
    status: {
        id: number;
        name: string;
        color: string;
        is_done?: boolean;
    };
    priority: {
        id: number;
        name: string;
        color: string;
    };
    start_date: string;
    end_date: string;
    progress: number;
    assigned_users: Array<{
        id: number;
        name: string;
    }>;
    creator: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
    // For Kanban compatibility with backend
    tieu_de?: string;
    mo_ta?: string;
    ngay_ket_thuc_du_kien?: string;
    trang_thai?: {
        id: number;
        name: string;
        color: string;
        is_done?: boolean;
    };
    uu_tien?: {
        id: number;
        name: string;
        color: string;
    };
    tien_do?: number;
}

interface Filters {
    assigned_user_id?: number;
    project_id?: number;
    status_id?: number;
    priority_id?: number;
    search?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

type TaskViewMode = 'table' | 'kanban';

const MyTasks: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    // View mode
    const [viewMode, setViewMode] = useState<TaskViewMode>('table');
    const [kanbanData, setKanbanData] = useState<{ [key: number]: Task[] }>({});
    const [kanbanLoading, setKanbanLoading] = useState(false);

    // Task Detail Drawer
    const [detailVisible, setDetailVisible] = useState(false);
    const [detailTaskId, setDetailTaskId] = useState<number | null>(null);

    // Current user ID
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    // Mobile detection
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Filters
    const [filters, setFilters] = useState<Filters>({
        sort_by: 'ngay_ket_thuc_du_kien',
        sort_order: 'asc',
    });

    // Reference data
    const [projects, setProjects] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [priorities, setPriorities] = useState<any[]>([]);
    const [adminUsers, setAdminUsers] = useState<any[]>([]);

    // Inline editing state
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editingField, setEditingField] = useState<'status' | 'priority' | null>(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Get current user ID from auth (you may need to adjust this based on your auth implementation)
        const getCurrentUser = async () => {
            try {
                const userResponse = await referenceApi.getAdminUsers();
                if (userResponse.data.success && userResponse.data.data.length > 0) {
                    // Assuming the first user is the current logged in user
                    // You might need to adjust this based on your auth implementation
                    const currentUser = userResponse.data.data[0];
                    setCurrentUserId(currentUser.id);
                    // Set default filter to current user
                    setFilters(prev => ({
                        ...prev,
                        assigned_user_id: currentUser.id,
                    }));
                }
            } catch (error) {
                console.error('Error getting current user:', error);
            }
        };

        getCurrentUser();
        loadReferenceData();
    }, []);

    useEffect(() => {
        if (currentUserId !== null) {
            loadTasks();
        }
    }, [currentUserId]);

    useEffect(() => {
        if (viewMode === 'kanban' && currentUserId !== null) {
            loadKanbanData();
        }
    }, [viewMode, currentUserId]);

    const loadReferenceData = async () => {
        try {
            const [projectsRes, statusesRes, prioritiesRes, usersRes] = await Promise.all([
                referenceApi.getProjects(),
                referenceApi.getTaskStatuses(),
                referenceApi.getPriorities(),
                referenceApi.getAdminUsers(),
            ]);

            if (projectsRes.data.success) {
                // Handle paginated response from projects API
                const projectData = projectsRes.data.data;
                setProjects(Array.isArray(projectData) ? projectData : projectData.data || []);
            }
            if (statusesRes.data.success) {
                setStatuses(statusesRes.data.data);
            }
            if (prioritiesRes.data.success) {
                setPriorities(prioritiesRes.data.data);
            }
            if (usersRes.data.success) {
                setAdminUsers(usersRes.data.data);
            }
        } catch (error) {
            console.error('Error loading reference data:', error);
        }
    };

    const loadTasks = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                ...filters,
                page,
                per_page: pagination.pageSize,
            };

            const response = await taskApi.getAllTasks(params);

            if (response.data.success) {
                const { data, current_page, per_page, total } = response.data.data;
                setTasks(data);
                setPagination({
                    current: current_page,
                    pageSize: per_page,
                    total,
                });
            } else {
                message.error('Không thể tải danh sách task');
            }
        } catch (error: any) {
            console.error('Error loading tasks:', error);
            message.error(error.response?.data?.message || 'Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const loadKanbanData = async () => {
        setKanbanLoading(true);
        try {
            const params = {
                ...filters,
                per_page: 1000, // Load all tasks for kanban view
            };

            const response = await taskApi.getAllTasks(params);

            if (response.data.success) {
                const tasks = response.data.data.data || response.data.data;

                // Group tasks by status
                const kanban: { [key: number]: Task[] } = {};
                statuses.forEach(status => {
                    kanban[status.id] = [];
                });

                tasks.forEach((task: Task) => {
                    const statusId = task.status?.id || task.trang_thai?.id;
                    if (statusId && kanban[statusId]) {
                        kanban[statusId].push(task);
                    }
                });

                setKanbanData(kanban);
            } else {
                message.error('Không thể tải dữ liệu kanban');
            }
        } catch (error: any) {
            console.error('Error loading kanban:', error);
            message.error(error.response?.data?.message || 'Không thể tải dữ liệu kanban');
            // Initialize empty arrays on error
            const kanban: { [key: number]: Task[] } = {};
            statuses.forEach(status => {
                kanban[status.id] = [];
            });
            setKanbanData(kanban);
        } finally {
            setKanbanLoading(false);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        // Dropped outside the list
        if (!destination) return;

        // No change
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const sourceStatusId = Number(source.droppableId);
        const destStatusId = Number(destination.droppableId);
        const taskId = Number(draggableId);

        // Create new kanban data
        const newKanbanData = { ...kanbanData };
        const sourceTasks = Array.from(newKanbanData[sourceStatusId]);
        const destTasks = sourceStatusId === destStatusId
            ? sourceTasks
            : Array.from(newKanbanData[destStatusId]);

        // Remove from source
        const [movedTask] = sourceTasks.splice(source.index, 1);

        // Add to destination
        destTasks.splice(destination.index, 0, movedTask);

        // Update state
        newKanbanData[sourceStatusId] = sourceTasks;
        newKanbanData[destStatusId] = destTasks;
        setKanbanData(newKanbanData);

        // Update on server
        try {
            await taskApi.updateStatus(taskId, destStatusId, destination.index);
            message.success('Cập nhật trạng thái thành công');
        } catch (error: any) {
            message.error('Không thể cập nhật trạng thái');
            // Revert on error
            loadKanbanData();
        }
    };

    const handleTableChange = (pagination: TablePaginationConfig, _filters: any, sorter: any) => {
        if (pagination.current) {
            loadTasks(pagination.current);
        }

        if (sorter.field) {
            setFilters({
                ...filters,
                sort_by: sorter.field,
                sort_order: sorter.order === 'ascend' ? 'asc' : 'desc',
            });
        }
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters({
            ...filters,
            [key]: value,
        });
    };

    const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            setFilters({
                ...filters,
                start_date: dates[0].format('YYYY-MM-DD'),
                end_date: dates[1].format('YYYY-MM-DD'),
            });
        } else {
            const newFilters = { ...filters };
            delete newFilters.start_date;
            delete newFilters.end_date;
            setFilters(newFilters);
        }
    };

    const handleReset = () => {
        setFilters({
            assigned_user_id: currentUserId || undefined,
            sort_by: 'ngay_ket_thuc_du_kien',
            sort_order: 'asc',
        });
        setPagination({ ...pagination, current: 1 });
        loadTasks(1);
    };

    const handleSearch = () => {
        setPagination({ ...pagination, current: 1 });
        if (viewMode === 'table') {
            loadTasks(1);
        } else {
            loadKanbanData();
        }
    };

    const handleViewModeChange = (mode: TaskViewMode) => {
        setViewMode(mode);
    };

    const handleTaskDetailClose = () => {
        setDetailVisible(false);
        setDetailTaskId(null);
    };

    const handleTaskUpdate = () => {
        if (viewMode === 'table') {
            loadTasks(pagination.current);
        } else {
            loadKanbanData();
        }
    };

    const handleRowClick = (record: Task) => {
        setDetailTaskId(record.id);
        setDetailVisible(true);
    };

    const handleStatusClick = (e: React.MouseEvent, taskId: number) => {
        e.stopPropagation();
        setEditingTaskId(taskId);
        setEditingField('status');
    };

    const handlePriorityClick = (e: React.MouseEvent, taskId: number) => {
        e.stopPropagation();
        setEditingTaskId(taskId);
        setEditingField('priority');
    };

    const handleInlineUpdate = async (taskId: number, field: 'status' | 'priority', value: number) => {
        try {
            const updateData: any = {};
            if (field === 'status') {
                updateData.trang_thai_id = value;
            } else if (field === 'priority') {
                updateData.uu_tien_id = value;
            }

            await taskApi.update(taskId, updateData);
            message.success(`Cập nhật ${field === 'status' ? 'trạng thái' : 'độ ưu tiên'} thành công`);

            // Reload tasks
            if (viewMode === 'table') {
                loadTasks(pagination.current);
            } else {
                loadKanbanData();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setEditingTaskId(null);
            setEditingField(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setEditingField(null);
    };

    const handleProjectClick = (e: React.MouseEvent, projectId: number) => {
        e.stopPropagation();
        navigate(`${ROUTE.project_detail.replace(':id', projectId.toString())}?p=projects`);
    };

    const columns: ColumnsType<Task> = [
        {
            title: 'Task',
            dataIndex: 'name',
            key: 'name',
            width: 300,
            render: (text: string, record: Task) => (
                <div>
                    <div style={{ fontWeight: 500, marginBottom: 4, cursor: 'pointer', color: '#1890ff' }}>
                        {text}
                    </div>
                    {record.description && (
                        <div style={{ fontSize: 12, color: '#666', maxWidth: 280 }}>
                            {record.description.length > 60
                                ? record.description.substring(0, 60) + '...'
                                : record.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Dự án',
            dataIndex: 'project',
            key: 'project',
            width: 180,
            render: (project: Task['project']) => (
                <div
                    onClick={(e) => handleProjectClick(e, project.id)}
                    style={{ cursor: 'pointer' }}
                >
                    <div style={{ fontWeight: 500, color: '#1890ff' }}>{project.name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{project.code}</div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status: Task['status'], record: Task) => {
                const isEditing = editingTaskId === record.id && editingField === 'status';

                return isEditing ? (
                    <Select
                        size="small"
                        style={{ width: 130 }}
                        value={status?.id}
                        onChange={(value) => handleInlineUpdate(record.id, 'status', value)}
                        onBlur={handleCancelEdit}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        open
                    >
                        {statuses.map((s) => (
                            <Option key={s.id} value={s.id}>
                                <Tag color={s.color} style={{ margin: 0 }}>
                                    {s.name}
                                </Tag>
                            </Option>
                        ))}
                    </Select>
                ) : (
                    <Tag
                        color={status?.color}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => handleStatusClick(e, record.id)}
                    >
                        {status?.name}
                    </Tag>
                );
            },
        },
        {
            title: 'Ưu tiên',
            dataIndex: 'priority',
            key: 'priority',
            width: 130,
            render: (priority: Task['priority'], record: Task) => {
                const isEditing = editingTaskId === record.id && editingField === 'priority';

                return isEditing ? (
                    <Select
                        size="small"
                        style={{ width: 120 }}
                        value={priority?.id}
                        onChange={(value) => handleInlineUpdate(record.id, 'priority', value)}
                        onBlur={handleCancelEdit}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        open
                    >
                        {priorities.map((p) => (
                            <Option key={p.id} value={p.id}>
                                <Tag color={p.color} style={{ margin: 0 }}>
                                    <FlagOutlined /> {p.name}
                                </Tag>
                            </Option>
                        ))}
                    </Select>
                ) : (
                    <Tag
                        color={priority?.color}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => handlePriorityClick(e, record.id)}
                    >
                        <FlagOutlined /> {priority?.name}
                    </Tag>
                );
            },
        },
        {
            title: 'Tiến độ',
            dataIndex: 'progress',
            key: 'progress',
            width: 120,
            render: (progress: number) => (
                <Progress percent={progress} size="small" />
            ),
        },
        {
            title: 'Deadline',
            dataIndex: 'end_date',
            key: 'end_date',
            width: 120,
            sorter: true,
            render: (date: string) => {
                if (!date) return '-';
                const endDate = dayjs(date);
                const today = dayjs();
                const isOverdue = endDate.isBefore(today, 'day');
                const isToday = endDate.isSame(today, 'day');

                return (
                    <div style={{ color: isOverdue ? '#ff4d4f' : isToday ? '#faad14' : undefined }}>
                        <CalendarOutlined /> {endDate.format('DD/MM/YYYY')}
                        {isOverdue && <div style={{ fontSize: 11 }}>Quá hạn</div>}
                        {isToday && <div style={{ fontSize: 11 }}>Hôm nay</div>}
                    </div>
                );
            },
        },
        {
            title: 'Người giao',
            dataIndex: 'creator',
            key: 'creator',
            width: 120,
            render: (creator: Task['creator']) => (
                <Tooltip title={creator.name}>
                    <Avatar size="small">{creator.name?.charAt(0)}</Avatar>
                    <span style={{ marginLeft: 8, fontSize: 13 }}>{creator.name}</span>
                </Tooltip>
            ),
        },
    ];

    // Calculate statistics
    const stats = {
        total: pagination.total,
        overdue: tasks.filter((t) => dayjs(t.end_date).isBefore(dayjs(), 'day')).length,
        today: tasks.filter((t) => dayjs(t.end_date).isSame(dayjs(), 'day')).length,
        inProgress: tasks.filter((t) => t.progress > 0 && t.progress < 100).length,
    };

    // Mobile card render
    const renderMobileCard = (task: Task) => {
        const endDate = task.end_date ? dayjs(task.end_date) : null;
        const today = dayjs();
        const isOverdue = endDate ? endDate.isBefore(today, 'day') : false;
        const isToday = endDate ? endDate.isSame(today, 'day') : false;

        const isEditingStatus = editingTaskId === task.id && editingField === 'status';
        const isEditingPriority = editingTaskId === task.id && editingField === 'priority';

        return (
            <Card
                key={task.id}
                size="small"
                style={{
                    marginBottom: 12,
                    borderLeft: `4px solid ${task.priority?.color || '#1890ff'}`,
                    cursor: 'pointer',
                }}
                onClick={() => handleRowClick(task)}
            >
                {/* Header: Priority + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    {/* Priority */}
                    {isEditingPriority ? (
                        <Select
                            size="small"
                            style={{ width: 120 }}
                            value={task.priority?.id}
                            onChange={(value) => handleInlineUpdate(task.id, 'priority', value)}
                            onBlur={handleCancelEdit}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            open
                        >
                            {priorities.map((priority) => (
                                <Option key={priority.id} value={priority.id}>
                                    <Tag color={priority.color} style={{ margin: 0 }}>
                                        {priority.name}
                                    </Tag>
                                </Option>
                            ))}
                        </Select>
                    ) : (
                        <Tag
                            color={task.priority?.color}
                            style={{ margin: 0, fontSize: 11, cursor: 'pointer' }}
                            onClick={(e) => handlePriorityClick(e, task.id)}
                        >
                            <FlagOutlined /> {task.priority?.name}
                        </Tag>
                    )}

                    {/* Status */}
                    {isEditingStatus ? (
                        <Select
                            size="small"
                            style={{ width: 120 }}
                            value={task.status?.id}
                            onChange={(value) => handleInlineUpdate(task.id, 'status', value)}
                            onBlur={handleCancelEdit}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            open
                        >
                            {statuses.map((status) => (
                                <Option key={status.id} value={status.id}>
                                    <Tag color={status.color} style={{ margin: 0 }}>
                                        {status.name}
                                    </Tag>
                                </Option>
                            ))}
                        </Select>
                    ) : (
                        <Tag
                            color={task.status?.color}
                            style={{ margin: 0, fontSize: 11, cursor: 'pointer' }}
                            onClick={(e) => handleStatusClick(e, task.id)}
                        >
                            {task.status?.name}
                        </Tag>
                    )}
                </div>

                {/* Task Name */}
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: '#1890ff' }}>
                    {task.name}
                </div>

                {/* Project */}
                <div
                    onClick={(e) => handleProjectClick(e, task.project.id)}
                    style={{ fontSize: 12, color: '#1890ff', marginBottom: 8, cursor: 'pointer' }}
                >
                    <ProjectOutlined /> {task.project?.name}
                </div>

                {/* Progress */}
                <Progress
                    percent={task.progress}
                    size="small"
                    style={{ marginBottom: 8 }}
                    strokeColor={task.progress === 100 ? '#52c41a' : '#1890ff'}
                />

                {/* Footer: Deadline + Creator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    {endDate ? (
                        <div style={{
                            color: isOverdue ? '#ff4d4f' : isToday ? '#faad14' : '#8c8c8c',
                            fontWeight: isOverdue || isToday ? 600 : 400
                        }}>
                            <CalendarOutlined /> {endDate.format('DD/MM/YYYY')}
                            {isOverdue && <span style={{ marginLeft: 4 }}>(Quá hạn)</span>}
                            {isToday && <span style={{ marginLeft: 4 }}>(Hôm nay)</span>}
                        </div>
                    ) : (
                        <div style={{ color: '#8c8c8c' }}>Chưa có deadline</div>
                    )}
                    <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                        {task.creator?.name?.charAt(0)}
                    </Avatar>
                </div>
            </Card>
        );
    };

    return (
        <div style={{ padding: isMobile ? 12 : 24 }}>
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ProjectOutlined style={{ fontSize: isMobile ? 18 : 20 }} />
                        <span style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600 }}>Công việc của tôi</span>
                    </div>
                }
            >
                {/* Statistics */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                    gap: isMobile ? 8 : 16,
                    marginBottom: isMobile ? 12 : 24
                }}>
                    <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 600, color: '#1890ff' }}>
                                {stats.total}
                            </div>
                            <div style={{ fontSize: isMobile ? 11 : 13, color: '#999' }}>Tổng số task</div>
                        </div>
                    </Card>
                    <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 600, color: '#52c41a' }}>
                                {stats.inProgress}
                            </div>
                            <div style={{ fontSize: isMobile ? 11 : 13, color: '#999' }}>Đang thực hiện</div>
                        </div>
                    </Card>
                    <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 600, color: '#faad14' }}>
                                {stats.today}
                            </div>
                            <div style={{ fontSize: isMobile ? 11 : 13, color: '#999' }}>Deadline hôm nay</div>
                        </div>
                    </Card>
                    <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 600, color: '#ff4d4f' }}>
                                {stats.overdue}
                            </div>
                            <div style={{ fontSize: isMobile ? 11 : 13, color: '#999' }}>Quá hạn</div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <div style={{ marginBottom: isMobile ? 12 : 16 }}>
                    {isMobile ? (
                        // Mobile filters - Compact vertical layout
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <Input
                                placeholder="Tìm kiếm task..."
                                prefix={<SearchOutlined />}
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                onPressEnter={handleSearch}
                            />

                            <Space.Compact style={{ width: '100%' }}>
                                <Select
                                    placeholder="Người thực hiện"
                                    style={{ flex: 1 }}
                                    allowClear
                                    value={filters.assigned_user_id}
                                    onChange={(value) => handleFilterChange('assigned_user_id', value)}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {adminUsers.map((user) => (
                                        <Option key={user.id} value={user.id}>
                                            {user.name}
                                        </Option>
                                    ))}
                                </Select>
                                <Select
                                    placeholder="Dự án"
                                    style={{ flex: 1 }}
                                    allowClear
                                    value={filters.project_id}
                                    onChange={(value) => handleFilterChange('project_id', value)}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {projects.map((project) => (
                                        <Option key={project.id} value={project.id}>
                                            {project.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Space.Compact>

                            <Space.Compact style={{ width: '100%' }}>
                                <Select
                                    placeholder="Trạng thái"
                                    style={{ flex: 1 }}
                                    allowClear
                                    value={filters.status_id}
                                    onChange={(value) => handleFilterChange('status_id', value)}
                                >
                                    {statuses.map((status) => (
                                        <Option key={status.id} value={status.id}>
                                            {status.name}
                                        </Option>
                                    ))}
                                </Select>
                                <Select
                                    placeholder="Ưu tiên"
                                    style={{ flex: 1 }}
                                    allowClear
                                    value={filters.priority_id}
                                    onChange={(value) => handleFilterChange('priority_id', value)}
                                >
                                    {priorities.map((priority) => (
                                        <Option key={priority.id} value={priority.id}>
                                            {priority.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Space.Compact>

                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} block>
                                    Tìm kiếm
                                </Button>
                                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                                    Làm mới
                                </Button>
                                {!isMobile && (
                                    <Space>
                                        <Button
                                            type={viewMode === 'table' ? 'primary' : 'default'}
                                            icon={<TableOutlined />}
                                            onClick={() => handleViewModeChange('table')}
                                        >
                                            Bảng
                                        </Button>
                                        <Button
                                            type={viewMode === 'kanban' ? 'primary' : 'default'}
                                            icon={<AppstoreOutlined />}
                                            onClick={() => handleViewModeChange('kanban')}
                                        >
                                            Kanban
                                        </Button>
                                    </Space>
                                )}
                            </Space>
                        </Space>
                    ) : (
                        // Desktop filters - Original layout
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <Space wrap>
                                <Input
                                    placeholder="Tìm kiếm task..."
                                    prefix={<SearchOutlined />}
                                    style={{ width: 250 }}
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    onPressEnter={handleSearch}
                                />

                                <Select
                                    placeholder="Người thực hiện"
                                    style={{ width: 180 }}
                                    allowClear
                                    value={filters.assigned_user_id}
                                    onChange={(value) => handleFilterChange('assigned_user_id', value)}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {adminUsers.map((user) => (
                                        <Option key={user.id} value={user.id}>
                                            <UserOutlined /> {user.name}
                                        </Option>
                                    ))}
                                </Select>

                                <Select
                                    placeholder="Chọn dự án"
                                    style={{ width: 200 }}
                                    allowClear
                                    value={filters.project_id}
                                    onChange={(value) => handleFilterChange('project_id', value)}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {projects.map((project) => (
                                        <Option key={project.id} value={project.id}>
                                            {project.name}
                                        </Option>
                                    ))}
                                </Select>

                                <Select
                                    placeholder="Trạng thái"
                                    style={{ width: 150 }}
                                    allowClear
                                    value={filters.status_id}
                                    onChange={(value) => handleFilterChange('status_id', value)}
                                >
                                    {statuses.map((status) => (
                                        <Option key={status.id} value={status.id}>
                                            <Tag color={status.color}>{status.name}</Tag>
                                        </Option>
                                    ))}
                                </Select>

                                <Select
                                    placeholder="Ưu tiên"
                                    style={{ width: 130 }}
                                    allowClear
                                    value={filters.priority_id}
                                    onChange={(value) => handleFilterChange('priority_id', value)}
                                >
                                    {priorities.map((priority) => (
                                        <Option key={priority.id} value={priority.id}>
                                            <Tag color={priority.color}>{priority.name}</Tag>
                                        </Option>
                                    ))}
                                </Select>

                                <RangePicker
                                    placeholder={['Từ ngày', 'Đến ngày']}
                                    onChange={handleDateRangeChange}
                                    format="DD/MM/YYYY"
                                />

                                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                                    Tìm kiếm
                                </Button>

                                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                                    Làm mới
                                </Button>
                            </Space>

                            {/* View Mode Toggle */}
                            <Space>
                                <Button
                                    type={viewMode === 'table' ? 'primary' : 'default'}
                                    icon={<TableOutlined />}
                                    onClick={() => handleViewModeChange('table')}
                                >
                                    Bảng
                                </Button>
                                <Button
                                    type={viewMode === 'kanban' ? 'primary' : 'default'}
                                    icon={<AppstoreOutlined />}
                                    onClick={() => handleViewModeChange('kanban')}
                                >
                                    Kanban
                                </Button>
                            </Space>
                        </div>
                    )}
                </div>

                {/* Table or Kanban View */}
                {viewMode === 'table' ? (
                    isMobile ? (
                        // Mobile Card View
                        <Spin spinning={loading}>
                            {tasks.length > 0 ? (
                                <>
                                    {tasks.map(renderMobileCard)}
                                    {/* Mobile Pagination */}
                                    {pagination.total > pagination.pageSize && (
                                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                                            <Space>
                                                <Button
                                                    size="small"
                                                    disabled={pagination.current === 1}
                                                    onClick={() => loadTasks(pagination.current - 1)}
                                                >
                                                    Trước
                                                </Button>
                                                <span style={{ fontSize: 13 }}>
                                                    {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
                                                </span>
                                                <Button
                                                    size="small"
                                                    disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                                                    onClick={() => loadTasks(pagination.current + 1)}
                                                >
                                                    Sau
                                                </Button>
                                            </Space>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Empty description="Không có task nào" />
                            )}
                        </Spin>
                    ) : (
                        // Desktop Table View
                        <Table
                            columns={columns}
                            dataSource={tasks}
                            rowKey="id"
                            loading={loading}
                            pagination={pagination}
                            onChange={handleTableChange}
                            onRow={(record) => ({
                                onClick: () => handleRowClick(record),
                                style: { cursor: 'pointer' },
                            })}
                            scroll={{ x: 1200 }}
                        />
                    )
                ) : (
                    <Spin spinning={kanbanLoading}>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <div style={{
                                display: 'flex',
                                gap: 20,
                                overflowX: 'auto',
                                paddingBottom: 16,
                                paddingTop: 8,
                            }}>
                                {statuses.map((status) => {
                                    const tasks = kanbanData[status.id] || [];

                                    return (
                                        <div
                                            key={status.id}
                                            style={{
                                                flex: '0 0 300px',
                                                backgroundColor: '#fafafa',
                                                borderRadius: 12,
                                                padding: 16,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                            }}
                                        >
                                            <div style={{
                                                marginBottom: 16,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                paddingBottom: 12,
                                                borderBottom: '2px solid #e8e8e8',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div
                                                        style={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            backgroundColor: status.color,
                                                        }}
                                                    />
                                                    <span style={{
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                        color: '#262626',
                                                    }}>
                                                        {status.name}
                                                    </span>
                                                </div>
                                                <Badge
                                                    count={tasks.length}
                                                    showZero
                                                    style={{
                                                        backgroundColor: status.color,
                                                        fontWeight: 600,
                                                        boxShadow: 'none',
                                                    }}
                                                />
                                            </div>

                                            <Droppable droppableId={String(status.id)}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        style={{
                                                            minHeight: 200,
                                                            backgroundColor: snapshot.isDraggingOver ? '#e6f4ff' : 'transparent',
                                                            borderRadius: 8,
                                                            transition: 'background-color 0.2s ease',
                                                        }}
                                                    >
                                                        {tasks.length === 0 ? (
                                                            <Empty
                                                                description={
                                                                    <span style={{ color: '#bfbfbf', fontSize: 13 }}>
                                                                        Không có nhiệm vụ
                                                                    </span>
                                                                }
                                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                                style={{ margin: '30px 0' }}
                                                            />
                                                        ) : (
                                                            tasks.map((task: Task, index: number) => {
                                                                const taskName = task.name || task.tieu_de || '';
                                                                const taskPriority = task.priority || task.uu_tien;
                                                                const taskProgress = task.progress ?? task.tien_do ?? 0;
                                                                const taskEndDate = task.end_date || task.ngay_ket_thuc_du_kien;
                                                                const taskProject = task.project;

                                                                return (
                                                                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                                                        {(provided, snapshot) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                style={{
                                                                                    ...provided.draggableProps.style,
                                                                                    marginBottom: 12,
                                                                                }}
                                                                            >
                                                                                <Card
                                                                                    size="small"
                                                                                    hoverable
                                                                                    onClick={() => {
                                                                                        setDetailTaskId(task.id);
                                                                                        setDetailVisible(true);
                                                                                    }}
                                                                                    style={{
                                                                                        cursor: 'pointer',
                                                                                        backgroundColor: snapshot.isDragging ? '#fff' : '#fff',
                                                                                        borderLeft: `3px solid ${taskPriority?.color || '#1890ff'}`,
                                                                                        borderRadius: 8,
                                                                                        boxShadow: snapshot.isDragging
                                                                                            ? '0 8px 24px rgba(0,0,0,0.15)'
                                                                                            : '0 2px 4px rgba(0,0,0,0.08)',
                                                                                        transition: 'all 0.2s ease',
                                                                                    }}
                                                                                    bodyStyle={{ padding: 12 }}
                                                                                >
                                                                                    {/* Priority & Title */}
                                                                                    <div style={{ marginBottom: 8 }}>
                                                                                        {taskPriority && taskPriority.name ? (
                                                                                            <Tag
                                                                                                color={taskPriority.color}
                                                                                                style={{
                                                                                                    margin: 0,
                                                                                                    marginBottom: 6,
                                                                                                    fontSize: 11,
                                                                                                    fontWeight: 600,
                                                                                                    padding: '2px 8px',
                                                                                                    borderRadius: 10,
                                                                                                }}
                                                                                            >
                                                                                                {taskPriority.name}
                                                                                            </Tag>
                                                                                        ) : null}
                                                                                        <div style={{ fontWeight: 500, fontSize: 14 }}>
                                                                                            {taskName}
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Project */}
                                                                                    {taskProject && (
                                                                                        <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                                                                                            <ProjectOutlined /> {taskProject.name}
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Progress */}
                                                                                    <Progress
                                                                                        percent={taskProgress}
                                                                                        size="small"
                                                                                        style={{ marginBottom: 8 }}
                                                                                    />

                                                                                    {/* Deadline */}
                                                                                    {taskEndDate && (
                                                                                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                                                            <CalendarOutlined /> {dayjs(taskEndDate).format('DD/MM/YYYY')}
                                                                                        </div>
                                                                                    )}
                                                                                </Card>
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                );
                                                            })
                                                        )}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    );
                                })}
                            </div>
                        </DragDropContext>
                    </Spin>
                )}
            </Card>

            {/* Task Detail Drawer */}
            <TaskDetail
                taskId={detailTaskId}
                visible={detailVisible}
                onClose={handleTaskDetailClose}
                onUpdate={handleTaskUpdate}
            />
        </div>
    );
};

export default MyTasks;
