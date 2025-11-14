import React, { useEffect, useState } from 'react';
import { Card, Tabs, Descriptions, Tag, Button, Space, Progress, Statistic, Row, Col, Timeline, Avatar, Empty, Spin, message, Table, Tooltip, Modal, Form, Input, Select, DatePicker, Radio, Badge, Checkbox, Dropdown, Popconfirm } from 'antd';
import { ArrowLeftOutlined, EditOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, PlusOutlined, TableOutlined, AppstoreOutlined, FileOutlined, DashboardOutlined, DeleteOutlined, CheckSquareOutlined, DownOutlined, CalendarOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { projectApi, taskApi, referenceApi, meetingApi } from '../../common/api/projectApi';
import { Project, ActivityLog, Task, ProjectChecklist } from '../../types/project';
import ROUTE from '../../common/route';
import TaskDetail from './TaskDetail';
import ProjectAttachments from '../../components/project/ProjectAttachments';
import ProjectDetailDashboard from './ProjectDetailDashboard';
import { Can } from '../../components/rbac';
import { PermissionProvider } from '../../contexts/PermissionContext';
import dayjs from 'dayjs';

type TaskViewMode = 'table' | 'kanban';

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [project, setProject] = useState<Project | null>(null);

    const [detailVisible, setDetailVisible] = useState(false);
    const [detailTaskId, setDetailTaskId] = useState<number | null>(null);

    // Detect mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Task view mode - Default to Kanban on desktop, Table on mobile
    const getDefaultViewMode = (): TaskViewMode => {
        return window.innerWidth < 768 ? 'table' : 'kanban';
    };
    const [taskViewMode, setTaskViewMode] = useState<TaskViewMode>(getDefaultViewMode());
    const [kanbanData, setKanbanData] = useState<{ [key: number]: Task[] }>({});
    const [kanbanLoading, setKanbanLoading] = useState(false);

    // Add Task Modal
    const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
    const [addTaskForm] = Form.useForm();
    const [taskStatuses, setTaskStatuses] = useState<any[]>([]);
    const [priorities, setPriorities] = useState<any[]>([]);
    const [projectMembers, setProjectMembers] = useState<any[]>([]);

    // Add Member Modal
    const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
    const [addMemberForm] = Form.useForm();
    const [allAdminUsers, setAllAdminUsers] = useState<any[]>([]);

    // Add to Meeting Modal
    const [addToMeetingModalVisible, setAddToMeetingModalVisible] = useState(false);
    const [addToMeetingForm] = Form.useForm();
    const [addingToMeeting, setAddingToMeeting] = useState(false);

    // Quick Add Tasks Modal
    const [quickAddModalVisible, setQuickAddModalVisible] = useState(false);
    const [quickAddTasks, setQuickAddTasks] = useState<any[]>([
        { tieu_de: '', trang_thai_id: null, nguoi_thuc_hien_id: null, uu_tien_id: null, mo_ta: '' },
        { tieu_de: '', trang_thai_id: null, nguoi_thuc_hien_id: null, uu_tien_id: null, mo_ta: '' },
        { tieu_de: '', trang_thai_id: null, nguoi_thuc_hien_id: null, uu_tien_id: null, mo_ta: '' },
        { tieu_de: '', trang_thai_id: null, nguoi_thuc_hien_id: null, uu_tien_id: null, mo_ta: '' },
    ]);
    const [applyAllStatus, setApplyAllStatus] = useState(true);
    const [applyAllAssignee, setApplyAllAssignee] = useState(true);
    const [applyAllPriority, setApplyAllPriority] = useState(true);
    const [quickAddLoading, setQuickAddLoading] = useState(true);

    // Active tab state - to preserve tab after reload
    const [activeTabKey, setActiveTabKey] = useState<string>('tasks');

    // Handle window resize for responsive view mode
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // Auto switch to table view on mobile if currently on kanban
            if (mobile && taskViewMode === 'kanban') {
                setTaskViewMode('table');
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [taskViewMode]);

    useEffect(() => {
        if (id) {
            loadProject();
            loadReferenceData();
        }
    }, [id]);

    useEffect(() => {
        if (id && taskStatuses.length > 0 && taskViewMode === 'kanban') {
            loadKanbanData();
        }
    }, [id, taskStatuses, taskViewMode]);

    const loadReferenceData = async () => {
        try {
            const [statusRes, priorityRes, adminUsersRes] = await Promise.all([
                referenceApi.getTaskStatuses(),
                referenceApi.getPriorities(),
                referenceApi.getAdminUsers(),
            ]);

            if (statusRes.data.success) {
                setTaskStatuses(statusRes.data.data);
            }
            if (priorityRes.data.success) {
                setPriorities(priorityRes.data.data);
            }
            if (adminUsersRes.data.success) {
                setAllAdminUsers(adminUsersRes.data.data);
            }
        } catch (error) {
            console.error('Failed to load reference data:', error);
        }
    };

    const loadProject = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const response = await projectApi.getById(Number(id));

            if (response.data.success) {
                setProject(response.data.data);
                // Set project members for task assignment
                setProjectMembers(response.data.data.members || []);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tải thông tin dự án');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async () => {
        try {
            const values = await addTaskForm.validateFields();

            const payload = {
                ...values,
                project_id: Number(id), // Backend expects 'project_id' not 'du_an_id'
                ngay_bat_dau: values.ngay_bat_dau ? values.ngay_bat_dau.format('YYYY-MM-DD') : null,
                ngay_ket_thuc_du_kien: values.ngay_ket_thuc_du_kien ? values.ngay_ket_thuc_du_kien.format('YYYY-MM-DD') : null,
            };

            const response = await taskApi.create(payload);

            if (response.data.success) {
                message.success('Tạo nhiệm vụ thành công');
                setAddTaskModalVisible(false);
                addTaskForm.resetFields();
                loadProject(); // Reload to show new task
                if (taskViewMode === 'kanban') {
                    loadKanbanData();
                }
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tạo nhiệm vụ');
        }
    };

    const handleOpenAddTaskModal = () => {
        // Set initial values when opening modal
        addTaskForm.setFieldsValue({
            trang_thai_id: taskStatuses.find(s => !s.is_done)?.id,
            uu_tien_id: priorities.find(p => p.muc_uu_tien === 2)?.id,
        });
        setAddTaskModalVisible(true);
    };

    const loadKanbanData = async () => {
        if (!id) return;

        setKanbanLoading(true);
        try {
            const response = await taskApi.getKanban(Number(id));
            if (response.data.success) {
                const data = response.data.data;

                // Initialize empty arrays for all statuses
                const kanban: { [key: number]: Task[] } = {};
                taskStatuses.forEach(status => {
                    kanban[status.id] = data[status.id] || [];
                });

                setKanbanData(kanban);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tải dữ liệu kanban');
            // Initialize empty arrays on error
            const kanban: { [key: number]: Task[] } = {};
            taskStatuses.forEach(status => {
                kanban[status.id] = [];
            });
            setKanbanData(kanban);
        } finally {
            setKanbanLoading(false);
        }
    };

    const handleTaskStatusChange = async (taskId: number, newStatusId: number) => {
        try {
            await taskApi.updateStatus(taskId, newStatusId);
            message.success('Cập nhật trạng thái thành công');
            loadKanbanData();
            loadProject();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
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
            loadProject(); // Reload to update task counts
        } catch (error: any) {
            message.error('Không thể cập nhật trạng thái');
            // Revert on error
            loadKanbanData();
        }
    };

    useEffect(() => {
        if (taskViewMode === 'kanban' && id) {
            loadKanbanData();
        }
    }, [taskViewMode, id]);

    const handleAddMember = async () => {
        try {
            const values = await addMemberForm.validateFields();
            const { admin_user_ids, vai_tro, ngay_tham_gia } = values;

            // Add members sequentially
            let successCount = 0;
            let errorCount = 0;

            for (const userId of admin_user_ids) {
                try {
                    await projectApi.addMember(Number(id), {
                        admin_user_id: userId,
                        vai_tro,
                        ngay_tham_gia,
                    });
                    successCount++;
                } catch (error) {
                    errorCount++;
                }
            }

            if (successCount > 0) {
                message.success(`Đã thêm ${successCount} thành viên thành công`);
            }
            if (errorCount > 0) {
                message.warning(`${errorCount} thành viên không thể thêm (có thể đã tồn tại)`);
            }

            setAddMemberModalVisible(false);
            addMemberForm.resetFields();
            loadProject(); // Reload to show new members
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể thêm thành viên');
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        try {
            const response = await projectApi.removeMember(Number(id), memberId);

            if (response.data.success) {
                message.success('Xóa thành viên thành công');
                loadProject();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa thành viên');
        }
    };

    const handleAddToMeeting = async () => {
        if (!project) return;

        try {
            setAddingToMeeting(true);
            const values = await addToMeetingForm.validateFields();

            const response = await meetingApi.addProject(
                project.id,
                values.meeting_type,
                values.note
            );

            if (response.data.success) {
                message.success(response.data.message);
                setAddToMeetingModalVisible(false);
                addToMeetingForm.resetFields();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể thêm vào meeting');
        } finally {
            setAddingToMeeting(false);
        }
    };

    const handleQuickAddTasks = async () => {
        // Validate: at least one task must have a title
        const validTasks = quickAddTasks.filter(task => task.tieu_de && task.tieu_de.trim() !== '');

        if (validTasks.length === 0) {
            message.warning('Vui lòng nhập ít nhất 1 tiêu đề nhiệm vụ');
            return;
        }

        // Validate: all valid tasks must have status and priority
        const invalidTasks = validTasks.filter(task => !task.trang_thai_id || !task.uu_tien_id);
        if (invalidTasks.length > 0) {
            message.error('Vui lòng chọn trạng thái và ưu tiên cho tất cả nhiệm vụ');
            return;
        }

        setQuickAddLoading(true);
        try {
            // Create tasks sequentially
            for (const task of validTasks) {
                await taskApi.create({
                    ...task,
                    project_id: Number(id),
                });
            }

            message.success(`Đã tạo ${validTasks.length} nhiệm vụ thành công`);
            setQuickAddModalVisible(false);
            // Reset form
            setQuickAddTasks([
                { tieu_de: '', trang_thai_id: null, nguoi_thuc_hien_id: null, uu_tien_id: null, mo_ta: '' },
                { tieu_de: '', trang_thai_id: null, nguoi_thuc_hien_id: null, uu_tien_id: null, mo_ta: '' },
                { tieu_de: '', trang_thai_id: null, nguoi_thuc_hien_id: null, uu_tien_id: null, mo_ta: '' },
                { tieu_de: '', trang_thai_id: null, nguoi_thuc_hien_id: null, uu_tien_id: null, mo_ta: '' },
            ]);
            setApplyAllStatus(false);
            setApplyAllAssignee(false);
            setApplyAllPriority(false);
            loadProject();
            if (taskViewMode === 'kanban') {
                loadKanbanData();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tạo nhiệm vụ');
        } finally {
            setQuickAddLoading(false);
        }
    };

    const updateQuickAddTask = (index: number, field: string, value: any) => {
        const newTasks = [...quickAddTasks];
        newTasks[index] = { ...newTasks[index], [field]: value };

        // Apply to all if checkbox is checked
        if (applyAllStatus && field === 'trang_thai_id') {
            newTasks.forEach((task, i) => {
                newTasks[i] = { ...newTasks[i], trang_thai_id: value };
            });
        }

        if (applyAllAssignee && field === 'nguoi_thuc_hien_id') {
            newTasks.forEach((task, i) => {
                newTasks[i] = { ...newTasks[i], nguoi_thuc_hien_id: value };
            });
        }

        if (applyAllPriority && field === 'uu_tien_id') {
            newTasks.forEach((task, i) => {
                newTasks[i] = { ...newTasks[i], uu_tien_id: value };
            });
        }

        setQuickAddTasks(newTasks);
    };

    const addQuickAddTaskRow = () => {
        setQuickAddTasks([
            ...quickAddTasks,
            { tieu_de: '', trang_thai_id: null, nguoi_thuc_hien_id: null, uu_tien_id: null, mo_ta: '' }
        ]);
    };

    const removeQuickAddTaskRow = (index: number) => {
        if (quickAddTasks.length > 1) {
            setQuickAddTasks(quickAddTasks.filter((_, i) => i !== index));
        }
    };

    const renderChecklistTab = () => {
        const checklists = project?.checklists || [];

        const handleToggleChecklist = async (checklistId: number, isCompleted: boolean) => {
            try {
                const updatedChecklists = checklists.map(item =>
                    item.id === checklistId ? { ...item, is_completed: isCompleted } : item
                );

                const response = await projectApi.update(project!.id, { checklists: updatedChecklists });

                // Update project state without full reload
                if (response.data.success && response.data.data) {
                    setProject(response.data.data);
                }
                message.success('Cập nhật checklist thành công');
            } catch (error) {
                message.error('Cập nhật checklist thất bại');
            }
        };

        const handleUpdateChecklist = async (checklistId: number, field: string, value: any) => {
            try {
                const updatedChecklists = checklists.map(item =>
                    item.id === checklistId ? { ...item, [field]: value } : item
                );

                const response = await projectApi.update(project!.id, { checklists: updatedChecklists });

                // Update project state without full reload
                if (response.data.success && response.data.data) {
                    setProject(response.data.data);
                }
                message.success('Cập nhật checklist thành công');
            } catch (error) {
                message.error('Cập nhật checklist thất bại');
            }
        };

        const handleDeleteChecklist = async (checklistId: number) => {
            try {
                const updatedChecklists = checklists.filter(item => item.id !== checklistId);
                const response = await projectApi.update(project!.id, { checklists: updatedChecklists });

                // Update project state without full reload
                if (response.data.success && response.data.data) {
                    setProject(response.data.data);
                }
                message.success('Xóa checklist thành công');
            } catch (error) {
                message.error('Xóa checklist thất bại');
            }
        };

        const handleAddChecklist = async () => {
            try {
                const newChecklist = {
                    noi_dung: 'Checklist mới',
                    is_completed: false,
                    assigned_to: null,
                    mo_ta: '',
                    sort_order: 0,
                };

                // Add new checklist at the beginning and update sort_order for existing ones
                const updatedChecklists = [
                    newChecklist,
                    ...checklists.map((item, index) => ({
                        ...item,
                        sort_order: index + 1,
                    })),
                ];

                const response = await projectApi.update(project!.id, {
                    checklists: updatedChecklists
                });

                // Update project state without full reload
                if (response.data.success && response.data.data) {
                    setProject(response.data.data);
                }
                message.success('Thêm checklist thành công');
            } catch (error) {
                message.error('Thêm checklist thất bại');
            }
        };

        return (
            <Card
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddChecklist}>
                        Thêm checklist
                    </Button>
                }
            >
                {checklists.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {checklists.map((item: ProjectChecklist) => (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    padding: '12px',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: '8px',
                                    backgroundColor: item.is_completed ? '#f6ffed' : '#fff',
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <Checkbox
                                            checked={item.is_completed}
                                            onChange={(e) => handleToggleChecklist(item.id, e.target.checked)}
                                        />
                                        <Input
                                            defaultValue={item.noi_dung}
                                            onBlur={(e) => {
                                                if (e.target.value !== item.noi_dung) {
                                                    handleUpdateChecklist(item.id, 'noi_dung', e.target.value);
                                                }
                                            }}
                                            onPressEnter={(e) => {
                                                e.currentTarget.blur();
                                            }}
                                            style={{
                                                flex: 1,
                                                textDecoration: item.is_completed ? 'line-through' : 'none',
                                                border: 'none',
                                                background: 'transparent',
                                                padding: 0,
                                            }}
                                        />
                                        <Select
                                            value={item.assigned_to}
                                            onChange={(value) => handleUpdateChecklist(item.id, 'assigned_to', value)}
                                            placeholder="Chọn người thực hiện"
                                            style={{ width: 200 }}
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {(project?.members || []).map((member: any) => {
                                                return (<Select.Option
                                                    key={member.admin_user_id}
                                                    value={member.admin_user_id}
                                                    label={member.admin_user?.name || member.admin_user_name}
                                                >
                                                    <Space>
                                                        <Avatar size="small" src={member.admin_user?.avatar}>
                                                            {member.admin_user?.name?.charAt(0) || member.admin_user_name?.charAt(0)}
                                                        </Avatar>
                                                        {member.admin_user?.name || member.admin_user_name}
                                                    </Space>
                                                </Select.Option>)
                                            })}
                                        </Select>
                                    </div>
                                    {item.assigned_to && item.assigned_user && (
                                        <div style={{ marginLeft: 32, marginTop: 8 }}>
                                            <Space>
                                                <Avatar size="small" src={item.assigned_user.avatar}>
                                                    {item.assigned_user.name?.charAt(0)}
                                                </Avatar>
                                            </Space>
                                        </div>
                                    )}
                                    {item.mo_ta && (
                                        <div
                                            style={{
                                                marginTop: 8,
                                                marginLeft: 32,
                                                fontSize: 12,
                                                color: '#8c8c8c',
                                                fontStyle: 'italic',
                                            }}
                                        >
                                            📝 {item.mo_ta}
                                        </div>
                                    )}
                                </div>
                                <Popconfirm
                                    title="Bạn có chắc chắn muốn xóa checklist này?"
                                    onConfirm={() => handleDeleteChecklist(item.id)}
                                >
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                    />
                                </Popconfirm>

                            </div>
                        ))}
                    </div>
                ) : (
                    <Empty description="Chưa có checklist" />
                )}
            </Card>
        );
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!project) {
        return (
            <div style={{ padding: 24 }}>
                <Empty description="Không tìm thấy dự án" />
            </div>
        );
    }

    const tabItems = [
        {
            key: 'tasks',
            label: `Nhiệm vụ (${project.tasks?.length || 0})`,
            children: (
                <Card
                    extra={
                        <Space>
                            {!isMobile && (
                                <Radio.Group
                                    value={taskViewMode}
                                    onChange={(e) => setTaskViewMode(e.target.value)}
                                    buttonStyle="solid"
                                >
                                    <Radio.Button value="table">
                                        <TableOutlined /> Bảng
                                    </Radio.Button>
                                    <Radio.Button value="kanban">
                                        <AppstoreOutlined /> Kanban
                                    </Radio.Button>
                                </Radio.Group>
                            )}
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: 'add-single',
                                            label: 'Thêm nhiệm vụ',
                                            icon: <PlusOutlined />,
                                            onClick: handleOpenAddTaskModal,
                                        },
                                        {
                                            key: 'add-multiple',
                                            label: 'Thêm nhanh nhiều nhiệm vụ',
                                            icon: <PlusOutlined />,
                                            onClick: () => setQuickAddModalVisible(true),
                                        },
                                    ],
                                }}
                            >
                                <Button type="primary" icon={<PlusOutlined />}>
                                    {isMobile ? 'Thêm' : 'Thêm nhiệm vụ'} <DownOutlined />
                                </Button>
                            </Dropdown>
                        </Space>
                    }
                >
                    {taskViewMode === 'table' ? (
                        // Table View - Modern Design
                        project.tasks && project.tasks.length > 0 ? (
                            <Table
                                dataSource={project.tasks}
                                rowKey="id"
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showTotal: (total) => `Tổng ${total} nhiệm vụ`,
                                }}
                                columns={[
                                    {
                                        title: 'Nhiệm vụ',
                                        key: 'task_info',
                                        render: (text: string, record: Task) => (
                                            <div
                                                onClick={() => {
                                                    setDetailTaskId(record.id);
                                                    setDetailVisible(true);
                                                }}
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '8px 0',
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 12,
                                                    marginBottom: 6,
                                                }}>
                                                    <Tag
                                                        color={record.uu_tien?.color}
                                                        style={{
                                                            margin: 0,
                                                            fontWeight: 500,
                                                            fontSize: 11,
                                                        }}
                                                    >
                                                        {record.ma_nhiem_vu}
                                                    </Tag>
                                                    {record.nguoi_thuc_hien && (
                                                        <Tooltip title={record.nguoi_thuc_hien.name}>
                                                            <Avatar
                                                                size="small"
                                                                style={{
                                                                    backgroundColor: '#1890ff',
                                                                    fontSize: 12,
                                                                }}
                                                            >
                                                                {record.nguoi_thuc_hien.name?.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 500,
                                                        color: '#262626',
                                                        lineHeight: 1.5,
                                                    }}
                                                >
                                                    {record.tieu_de}
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        title: 'Trạng thái',
                                        dataIndex: 'trang_thai',
                                        key: 'trang_thai',
                                        width: 140,
                                        render: (status: any) => (
                                            <Tag
                                                color={status?.color}
                                                style={{
                                                    fontSize: 13,
                                                    padding: '4px 12px',
                                                    borderRadius: 16,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {status?.name}
                                            </Tag>
                                        ),
                                    },
                                    {
                                        title: 'Ưu tiên',
                                        dataIndex: 'uu_tien',
                                        key: 'uu_tien',
                                        width: 130,
                                        render: (priority: any) => (
                                            <Tag
                                                color={priority?.color}
                                                style={{
                                                    fontSize: 13,
                                                    padding: '4px 12px',
                                                    borderRadius: 16,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {priority?.name}
                                            </Tag>
                                        ),
                                    },
                                    {
                                        title: 'Tiến độ',
                                        dataIndex: 'tien_do',
                                        key: 'tien_do',
                                        width: 180,
                                        render: (tien_do: number) => (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Progress
                                                    percent={tien_do || 0}
                                                    size="small"
                                                    strokeColor={{
                                                        '0%': '#108ee9',
                                                        '100%': '#87d068',
                                                    }}
                                                    style={{ flex: 1, margin: 0 }}
                                                />
                                                <span style={{ fontSize: 13, fontWeight: 500, color: '#595959', minWidth: 40 }}>
                                                    {tien_do || 0}%
                                                </span>
                                            </div>
                                        ),
                                    },
                                    {
                                        title: 'Deadline',
                                        dataIndex: 'ngay_ket_thuc_du_kien',
                                        key: 'ngay_ket_thuc_du_kien',
                                        width: 140,
                                        render: (date: string) => {
                                            if (!date) return <span style={{ color: '#bfbfbf' }}>-</span>;
                                            const isOverdue = dayjs(date).isBefore(dayjs(), 'day');
                                            const isToday = dayjs(date).isSame(dayjs(), 'day');
                                            const isTomorrow = dayjs(date).isSame(dayjs().add(1, 'day'), 'day');

                                            let color = '#595959';
                                            let bgColor = '#f5f5f5';
                                            if (isOverdue) {
                                                color = '#ff4d4f';
                                                bgColor = '#fff1f0';
                                            } else if (isToday) {
                                                color = '#fa8c16';
                                                bgColor = '#fff7e6';
                                            } else if (isTomorrow) {
                                                color = '#faad14';
                                                bgColor = '#fffbe6';
                                            }

                                            return (
                                                <div
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        padding: '4px 10px',
                                                        borderRadius: 12,
                                                        backgroundColor: bgColor,
                                                        color: color,
                                                        fontSize: 12,
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    <ClockCircleOutlined />
                                                    {dayjs(date).format('DD/MM/YYYY')}
                                                </div>
                                            );
                                        },
                                    },
                                ]}
                                rowClassName={(record) => {
                                    const isCompleted = record.trang_thai?.is_done;
                                    return isCompleted ? 'task-row-completed' : '';
                                }}
                            />
                        ) : (
                            <Empty
                                description="Chưa có nhiệm vụ nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )
                    ) : (
                        // Kanban View - Modern Design
                        <Spin spinning={kanbanLoading}>
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <div style={{
                                    display: 'flex',
                                    gap: 20,
                                    overflowX: 'auto',
                                    paddingBottom: 16,
                                    paddingTop: 8,
                                }}>
                                    {taskStatuses.map((status) => {
                                        const tasks = kanbanData[status.id] || [];
                                        return (
                                            <div
                                                key={status.id}
                                                style={{
                                                    flex: '0 0 320px',
                                                    backgroundColor: '#fafafa',
                                                    borderRadius: 12,
                                                    padding: 16,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                                    border: '1px solid #f0f0f0',
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
                                                                padding: 4,
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
                                                                tasks.map((task: Task, index: number) => (
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
                                                                                        borderLeft: `4px solid ${task.uu_tien?.color || '#1890ff'}`,
                                                                                        borderRadius: 8,
                                                                                        boxShadow: snapshot.isDragging
                                                                                            ? '0 8px 24px rgba(0,0,0,0.15)'
                                                                                            : '0 2px 4px rgba(0,0,0,0.08)',
                                                                                        transition: 'all 0.2s ease',
                                                                                        transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                                                                                    }}
                                                                                    bodyStyle={{ padding: 12 }}
                                                                                >
                                                                                    {/* Task Code & Priority */}
                                                                                    <div style={{
                                                                                        display: 'flex',
                                                                                        justifyContent: 'space-between',
                                                                                        alignItems: 'center',
                                                                                        marginBottom: 10,
                                                                                    }}>
                                                                                        <Tag
                                                                                            color={task.uu_tien?.color}
                                                                                            style={{
                                                                                                margin: 0,
                                                                                                fontSize: 11,
                                                                                                fontWeight: 600,
                                                                                                padding: '2px 8px',
                                                                                                borderRadius: 10,
                                                                                            }}
                                                                                        >
                                                                                            {task.ma_nhiem_vu}
                                                                                        </Tag>
                                                                                        <Tag
                                                                                            style={{
                                                                                                margin: 0,
                                                                                                fontSize: 10,
                                                                                                padding: '2px 6px',
                                                                                                borderRadius: 8,
                                                                                                backgroundColor: '#f0f0f0',
                                                                                                color: '#595959',
                                                                                                border: 'none',
                                                                                            }}
                                                                                        >
                                                                                            {task.uu_tien?.name}
                                                                                        </Tag>
                                                                                    </div>

                                                                                    {/* Task Title */}
                                                                                    <div style={{
                                                                                        marginBottom: 12,
                                                                                        fontSize: 14,
                                                                                        fontWeight: 500,
                                                                                        color: '#262626',
                                                                                        lineHeight: 1.5,
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis',
                                                                                        display: '-webkit-box',
                                                                                        WebkitLineClamp: 2,
                                                                                        WebkitBoxOrient: 'vertical',
                                                                                    }}>
                                                                                        {task.tieu_de}
                                                                                    </div>

                                                                                    {/* Progress Bar */}
                                                                                    {task.tien_do !== undefined && task.tien_do !== null && (
                                                                                        <div style={{ marginBottom: 12 }}>
                                                                                            <div style={{
                                                                                                display: 'flex',
                                                                                                justifyContent: 'space-between',
                                                                                                alignItems: 'center',
                                                                                                marginBottom: 4,
                                                                                            }}>
                                                                                                <span style={{ fontSize: 11, color: '#8c8c8c' }}>
                                                                                                    Tiến độ
                                                                                                </span>
                                                                                                <span style={{
                                                                                                    fontSize: 12,
                                                                                                    fontWeight: 600,
                                                                                                    color: '#262626',
                                                                                                }}>
                                                                                                    {task.tien_do}%
                                                                                                </span>
                                                                                            </div>
                                                                                            <Progress
                                                                                                percent={task.tien_do}
                                                                                                size="small"
                                                                                                showInfo={false}
                                                                                                strokeColor={{
                                                                                                    '0%': '#108ee9',
                                                                                                    '100%': '#87d068',
                                                                                                }}
                                                                                                trailColor="#f0f0f0"
                                                                                            />
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Footer: Assignee & Deadline */}
                                                                                    <div style={{
                                                                                        display: 'flex',
                                                                                        justifyContent: 'space-between',
                                                                                        alignItems: 'center',
                                                                                        paddingTop: 8,
                                                                                        borderTop: '1px solid #f0f0f0',
                                                                                    }}>
                                                                                        {task.nguoi_thuc_hien ? (
                                                                                            <Tooltip title={task.nguoi_thuc_hien.name}>
                                                                                                <Avatar
                                                                                                    size={28}
                                                                                                    style={{
                                                                                                        backgroundColor: '#1890ff',
                                                                                                        fontSize: 12,
                                                                                                        fontWeight: 600,
                                                                                                    }}
                                                                                                >
                                                                                                    {task.nguoi_thuc_hien.name?.charAt(0).toUpperCase()}
                                                                                                </Avatar>
                                                                                            </Tooltip>
                                                                                        ) : (
                                                                                            <div style={{ width: 28 }} />
                                                                                        )}

                                                                                        {task.ngay_ket_thuc_du_kien && (
                                                                                            <div style={{
                                                                                                fontSize: 11,
                                                                                                color: dayjs(task.ngay_ket_thuc_du_kien).isBefore(dayjs(), 'day')
                                                                                                    ? '#ff4d4f'
                                                                                                    : '#8c8c8c',
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                gap: 4,
                                                                                                fontWeight: 500,
                                                                                            }}>
                                                                                                <ClockCircleOutlined />
                                                                                                {dayjs(task.ngay_ket_thuc_du_kien).format('DD/MM')}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </Card>
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                ))
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
            ),
        },
        {
            key: 'members',
            label: (
                <span>
                    <TeamOutlined /> Thành viên ({project.members?.length || 0})
                </span>
            ),
            children: (
                <Card
                    extra={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setAddMemberModalVisible(true)}
                        >
                            Thêm thành viên
                        </Button>
                    }
                >
                    {project.members && project.members.length > 0 ? (
                        <Row gutter={[16, 16]}>
                            {project.members.map((member) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={member.id}>
                                    <Card
                                        size="small"
                                        extra={
                                            <Button
                                                type="text"
                                                size="small"
                                                danger
                                                onClick={() => {
                                                    Modal.confirm({
                                                        title: 'Xác nhận xóa',
                                                        content: `Bạn có chắc muốn xóa ${member.admin_user?.name} khỏi dự án?`,
                                                        okText: 'Xóa',
                                                        cancelText: 'Hủy',
                                                        okButtonProps: { danger: true },
                                                        onOk: () => handleRemoveMember(member.id),
                                                    });
                                                }}
                                            >
                                                Xóa
                                            </Button>
                                        }
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Space>
                                                <Avatar size="large" style={{ backgroundColor: '#1890ff' }}>
                                                    {member.admin_user?.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <div>
                                                    <div><strong>{member.admin_user?.name}</strong></div>
                                                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                        {member.admin_user?.email}
                                                    </div>
                                                </div>
                                            </Space>
                                            <Tag color={member.vai_tro === 'quan_ly' ? 'red' : 'blue'}>
                                                {member.vai_tro === 'quan_ly' ? 'Quản lý' :
                                                    member.vai_tro === 'thanh_vien' ? 'Thành viên' : 'Xem'}
                                            </Tag>
                                            {member.ngay_tham_gia && (
                                                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                    Tham gia: {dayjs(member.ngay_tham_gia).format('DD/MM/YYYY')}
                                                </div>
                                            )}
                                        </Space>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Empty description="Chưa có thành viên" />
                    )}
                </Card>
            ),
        },
        {
            key: 'attachments',
            label: (
                <span>
                    <FileOutlined /> Files ({project.attachments?.length || 0})
                </span>
            ),
            children: (
                <Card>
                    <ProjectAttachments
                        projectId={project.id}
                        attachments={project.attachments || []}
                        onUpdate={loadProject}
                    />
                </Card>
            ),
        },
        {
            key: 'checklists',
            label: (
                <span>
                    <CheckSquareOutlined /> Checklist ({project.checklists?.filter((c: ProjectChecklist) => c.is_completed).length || 0}/{project.checklists?.length || 0})
                </span>
            ),
            children: renderChecklistTab(),
        },
        {
            key: 'info',
            label: 'Thông tin',
            children: (
                <Card>
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Mã dự án" span={1}>
                            <strong>{project.ma_du_an}</strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên dự án" span={1}>
                            <strong>{project.ten_du_an}</strong>
                        </Descriptions.Item>

                        <Descriptions.Item label="Loại dự án" span={1}>
                            <Tag color={project.loai_du_an?.color}>
                                {project.loai_du_an?.name} {project.loai_du_an?.icon}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái" span={1}>
                            <Tag color={project.trang_thai?.color}>
                                {project.trang_thai?.name}
                            </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Ưu tiên" span={1}>
                            <Tag color={project.uu_tien?.color}>
                                {project.uu_tien?.name} (Cấp độ {project.uu_tien?.cap_do})
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tiến độ" span={1}>
                            <Progress percent={project.tien_do || 0} status={project.tien_do === 100 ? 'success' : 'active'} />
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày bắt đầu" span={1}>
                            {project.ngay_bat_dau ? dayjs(project.ngay_bat_dau).format('DD/MM/YYYY') : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày kết thúc dự kiến" span={1}>
                            {project.ngay_ket_thuc_du_kien ? dayjs(project.ngay_ket_thuc_du_kien).format('DD/MM/YYYY') : '-'}
                        </Descriptions.Item>

                        {project.ngay_ket_thuc_thuc_te && (
                            <Descriptions.Item label="Ngày kết thúc thực tế" span={1}>
                                {dayjs(project.ngay_ket_thuc_thuc_te).format('DD/MM/YYYY')}
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Khách hàng" span={project.ngay_ket_thuc_thuc_te ? 1 : 2}>
                            {project.ten_khach_hang || '-'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngân sách" span={1}>
                            {project.ngan_sach ? `${Number(project.ngan_sach).toLocaleString()} VNĐ` : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chi phí thực tế" span={1}>
                            {project.chi_phi_thuc_te ? `${Number(project.chi_phi_thuc_te).toLocaleString()} VNĐ` : '-'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Mô tả" span={2}>
                            {project.mo_ta || '-'}
                        </Descriptions.Item>

                        {project.tags && project.tags.length > 0 && (
                            <Descriptions.Item label="Tags" span={2}>
                                <Space wrap>
                                    {project.tags.map((tag, index) => (
                                        <Tag key={index} color="blue">{tag}</Tag>
                                    ))}
                                </Space>
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Người tạo" span={1}>
                            {project.nguoi_tao?.name || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo" span={1}>
                            {project.created_at ? dayjs(project.created_at).format('DD/MM/YYYY HH:mm') : '-'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            ),
        },
        {
            key: 'dashboard',
            label: (
                <span>
                    <DashboardOutlined /> Dashboard
                </span>
            ),
            children: <ProjectDetailDashboard projectId={Number(id)} />,
        },
        {
            key: 'activity',
            label: 'Lịch sử',
            children: (
                <Card>
                    {project.activity_logs && project.activity_logs.length > 0 ? (
                        <Timeline
                            items={project.activity_logs.map((log: ActivityLog) => {
                                // Format action with appropriate icon/color
                                const getActionColor = (action: string) => {
                                    if (action.includes('Tạo') || action.includes('created')) return 'green';
                                    if (action.includes('Cập nhật') || action.includes('updated')) return 'blue';
                                    if (action.includes('Xóa') || action.includes('deleted')) return 'red';
                                    if (action.includes('Thêm')) return 'cyan';
                                    return 'gray';
                                };

                                // Get changed fields with readable names
                                const getChangedFields = (oldData: any, newData: any) => {
                                    if (!oldData || !newData) return null;

                                    const fieldLabels: { [key: string]: string } = {
                                        ten_du_an: 'Tên dự án',
                                        mo_ta: 'Mô tả',
                                        trang_thai_id: 'Trạng thái',
                                        uu_tien_id: 'Ưu tiên',
                                        loai_du_an_id: 'Loại dự án',
                                        quan_ly_du_an_id: 'Quản lý dự án',
                                        ngay_bat_dau: 'Ngày bắt đầu',
                                        ngay_ket_thuc_du_kien: 'Ngày kết thúc dự kiến',
                                        ngan_sach_du_kien: 'Ngân sách dự kiến',
                                        chi_phi_thuc_te: 'Chi phí thực tế',
                                        tien_do: 'Tiến độ',
                                        mau_sac: 'Màu sắc',
                                        ghi_chu: 'Ghi chú',
                                        ten_khach_hang: 'Tên khách hàng',
                                    };

                                    const changes: Array<{ field: string; old: any; new: any }> = [];

                                    Object.keys(newData).forEach((key) => {
                                        // Skip technical fields
                                        if (['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at'].includes(key)) {
                                            return;
                                        }

                                        const oldValue = oldData[key];
                                        const newValue = newData[key];

                                        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                                            changes.push({
                                                field: fieldLabels[key] || key,
                                                old: oldValue,
                                                new: newValue,
                                            });
                                        }
                                    });

                                    return changes.length > 0 ? changes : null;
                                };

                                const formatValue = (value: any): string => {
                                    if (value === null || value === undefined) return '(Trống)';
                                    if (typeof value === 'boolean') return value ? 'Có' : 'Không';
                                    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                                        return dayjs(value).format('DD/MM/YYYY');
                                    }
                                    if (typeof value === 'number') return value.toLocaleString('vi-VN');
                                    return String(value);
                                };

                                const changedFields = getChangedFields(log.du_lieu_cu, log.du_lieu_moi);

                                return {
                                    color: getActionColor(log.hanh_dong),
                                    children: (
                                        <div>
                                            <div style={{ marginBottom: 4 }}>
                                                <Avatar size="small" src={log.user?.avatar} style={{ marginRight: 8 }}>
                                                    {log.user?.name?.charAt(0)}
                                                </Avatar>
                                                <strong>{log.user?.name || 'Hệ thống'}</strong>
                                                <span style={{ marginLeft: 8, color: '#666' }}>{log.mo_ta || log.hanh_dong}</span>
                                            </div>
                                            {changedFields && changedFields.length > 0 && (
                                                <div style={{ marginTop: 8, marginLeft: 32 }}>
                                                    {changedFields.map((change, index) => (
                                                        <div
                                                            key={index}
                                                            style={{
                                                                fontSize: 12,
                                                                marginBottom: 6,
                                                                padding: 8,
                                                                background: '#f5f5f5',
                                                                borderRadius: 4,
                                                                borderLeft: '3px solid #1890ff',
                                                            }}
                                                        >
                                                            <div style={{ fontWeight: 500, marginBottom: 4, color: '#333' }}>
                                                                {change.field}:
                                                            </div>
                                                            <div style={{ display: 'flex', gap: 16 }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <span style={{ color: '#999', fontSize: 11 }}>Cũ: </span>
                                                                    <span
                                                                        style={{
                                                                            color: '#ff4d4f',
                                                                            textDecoration: 'line-through',
                                                                        }}
                                                                    >
                                                                        {formatValue(change.old)}
                                                                    </span>
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <span style={{ color: '#999', fontSize: 11 }}>Mới: </span>
                                                                    <span style={{ color: '#52c41a', fontWeight: 500 }}>
                                                                        {formatValue(change.new)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div style={{ fontSize: 12, color: '#999', marginTop: 4, marginLeft: 32 }}>
                                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                                {dayjs(log.created_at).format('DD/MM/YYYY HH:mm')}
                                            </div>
                                        </div>
                                    ),
                                };
                            })}
                        />
                    ) : (
                        <Empty description="Chưa có hoạt động nào" />
                    )}
                </Card>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                    <h2 style={{ margin: 0 }}>{project.ten_du_an}</h2>
                </Space>
                <Space>
                    <Button
                        onClick={() => {
                            const p = searchParams.get('p') || 'projects';
                            navigate(ROUTE.project_gantt.replace(':id', String(project.id)) + `?p=${p}`);
                        }}
                    >
                        Gantt Chart
                    </Button>
                    <Button
                        icon={<CalendarOutlined />}
                        onClick={() => setAddToMeetingModalVisible(true)}
                    >
                        Thêm vào Meeting
                    </Button>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                            const p = searchParams.get('p') || 'projects';
                            navigate(ROUTE.project_list + `?p=${p}&edit=${project.id}`);
                        }}
                    >
                        Chỉnh sửa
                    </Button>
                </Space>
            </div>

            <Tabs
                items={tabItems}
                activeKey={activeTabKey}
                onChange={setActiveTabKey}
            />

            <TaskDetail
                taskId={detailTaskId}
                projectId={Number(id)}
                visible={detailVisible}
                onClose={() => {
                    setDetailVisible(false);
                    setDetailTaskId(null);
                }}
                onUpdate={loadProject}
            />

            {/* Add Task Modal */}
            <Modal
                title="Thêm nhiệm vụ mới"
                open={addTaskModalVisible}
                onCancel={() => {
                    setAddTaskModalVisible(false);
                    addTaskForm.resetFields();
                }}
                onOk={handleAddTask}
                okText="Tạo"
                cancelText="Hủy"
                width={700}
            >
                <Form
                    form={addTaskForm}
                    layout="vertical"
                    initialValues={{
                        trang_thai_id: taskStatuses.find(s => !s.is_done)?.id,
                        uu_tien_id: priorities.find(p => p.muc_uu_tien === 2)?.id,
                    }}
                >
                    <Form.Item
                        label="Tiêu đề"
                        name="tieu_de"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề nhiệm vụ' }]}
                    >
                        <Input placeholder="Nhập tiêu đề nhiệm vụ" />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="mo_ta"
                    >
                        <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Trạng thái"
                                name="trang_thai_id"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    {taskStatuses.map(status => (
                                        <Select.Option key={status.id} value={status.id}>
                                            <Tag color={status.color}>{status.name}</Tag>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Ưu tiên"
                                name="uu_tien_id"
                                rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
                            >
                                <Select placeholder="Chọn độ ưu tiên">
                                    {priorities.map(priority => (
                                        <Select.Option key={priority.id} value={priority.id}>
                                            <Tag color={priority.color}>{priority.name}</Tag>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Ngày bắt đầu"
                                name="ngay_bat_dau"
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Ngày kết thúc dự kiến"
                                name="ngay_ket_thuc_du_kien"
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Người thực hiện111"
                        name="nguoi_thuc_hien_id"
                    >
                        <Select
                            placeholder="Chọn người thực hiện"
                            allowClear
                            showSearch
                            optionFilterProp="children"
                        >
                            {projectMembers.map(member => (
                                <Select.Option key={member.admin_user_id} value={member.admin_user_id}>
                                    {member.admin_user?.name} ({member.admin_user?.email})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add Member Modal */}
            <Modal
                title="Thêm thành viên vào dự án"
                open={addMemberModalVisible}
                maskClosable={false}
                onCancel={() => {
                    setAddMemberModalVisible(false);
                    addMemberForm.resetFields();
                }}
                onOk={handleAddMember}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form
                    form={addMemberForm}
                    layout="vertical"
                >
                    <Form.Item
                        label="Nhân viên"
                        name="admin_user_ids"
                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một nhân viên' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn nhiều nhân viên"
                            showSearch
                            optionFilterProp="children"
                            maxTagCount="responsive"
                        >
                            {allAdminUsers
                                .filter(user => !projectMembers.find(m => m.admin_user_id === user.id))
                                .map(user => (
                                    <Select.Option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </Select.Option>
                                ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Vai trò"
                        name="vai_tro"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                        initialValue="thanh_vien"
                    >
                        <Select
                            placeholder="Chọn vai trò"
                            options={[
                                { value: 'quan_ly', label: 'Quản lý (PM)' },
                                { value: 'thanh_vien', label: 'Thành viên' },
                                { value: 'xem', label: 'Xem' }
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Ngày tham gia"
                        name="ngay_tham_gia"
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Quick Add Tasks Modal */}
            <Modal
                title="Thêm nhanh nhiệm vụ"
                open={quickAddModalVisible}
                onCancel={() => {
                    setQuickAddModalVisible(false);
                    setQuickAddTasks([
                        { tieu_de: '', trang_thai_id: null, nguoi_thuc_hien_id: null, uu_tien_id: null, mo_ta: '' },
                        { tieu_de: '', trang_thai_id: null, nguoi_thuc_hien_id: null, uu_tien_id: null, mo_ta: '' },
                        { tieu_de: '', trang_thai_id: null, nguoi_thuc_hien_id: null, uu_tien_id: null, mo_ta: '' },
                        { tieu_de: '', trang_thai_id: null, nguoi_thuc_hien_id: null, uu_tien_id: null, mo_ta: '' },
                    ]);
                    setApplyAllStatus(false);
                    setApplyAllAssignee(false);
                    setApplyAllPriority(false);
                }}
                onOk={handleQuickAddTasks}
                okText="Tạo tất cả"
                cancelText="Hủy"
                confirmLoading={quickAddLoading}
                width={1000}
            >
                <Table
                    dataSource={quickAddTasks.map((task, index) => ({ ...task, key: index }))}
                    pagination={false}
                    bordered
                    size="small"
                    scroll={{ x: 'max-content' }}
                >
                    <Table.Column
                        title="Tiêu đề"
                        dataIndex="tieu_de"
                        key="tieu_de"
                        width={200}
                        render={(text, record: any, index) => (
                            <Input
                                value={text}
                                onChange={(e) => updateQuickAddTask(index, 'tieu_de', e.target.value)}
                                placeholder={`Tiêu đề nhiệm vụ ${index + 1}`}
                            />
                        )}
                    />
                    <Table.Column
                        title={
                            <div>
                                <div>Trạng thái</div>
                                <Checkbox
                                    checked={applyAllStatus}
                                    onChange={(e) => setApplyAllStatus(e.target.checked)}
                                >
                                    <small>Áp dụng tất cả</small>
                                </Checkbox>
                            </div>
                        }
                        dataIndex="trang_thai_id"
                        key="trang_thai_id"
                        width={180}
                        render={(value, record: any, index) => (
                            <Select
                                value={value}
                                onChange={(val) => updateQuickAddTask(index, 'trang_thai_id', val)}
                                placeholder="Chọn trạng thái"
                                style={{ width: '100%' }}
                            >
                                {taskStatuses.map(status => (
                                    <Select.Option key={status.id} value={status.id}>
                                        <Tag color={status.color}>{status.name}</Tag>
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    />
                    <Table.Column
                        title={
                            <div>
                                <div>Người thực hiện</div>
                                <Checkbox
                                    checked={applyAllAssignee}
                                    onChange={(e) => setApplyAllAssignee(e.target.checked)}
                                >
                                    <small>Áp dụng tất cả</small>
                                </Checkbox>
                            </div>
                        }
                        dataIndex="nguoi_thuc_hien_id"
                        key="nguoi_thuc_hien_id"
                        width={180}
                        render={(value, record: any, index) => (
                            <Select
                                value={value}
                                onChange={(val) => updateQuickAddTask(index, 'nguoi_thuc_hien_id', val)}
                                placeholder="Chọn người thực hiện"
                                allowClear
                                style={{ width: '100%' }}
                            >
                                {projectMembers.map(member => (
                                    <Select.Option key={member.admin_user_id} value={member.admin_user_id}>
                                        {member.admin_user?.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    />
                    <Table.Column
                        title={
                            <div>
                                <div>Ưu tiên</div>
                                <Checkbox
                                    checked={applyAllPriority}
                                    onChange={(e) => setApplyAllPriority(e.target.checked)}
                                >
                                    <small>Áp dụng tất cả</small>
                                </Checkbox>
                            </div>
                        }
                        dataIndex="uu_tien_id"
                        key="uu_tien_id"
                        width={150}
                        render={(value, record: any, index) => (
                            <Select
                                value={value}
                                onChange={(val) => updateQuickAddTask(index, 'uu_tien_id', val)}
                                placeholder="Chọn ưu tiên"
                                style={{ width: '100%' }}
                            >
                                {priorities.map(priority => (
                                    <Select.Option key={priority.id} value={priority.id}>
                                        <Tag color={priority.color}>{priority.name}</Tag>
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    />
                    <Table.Column
                        title="Mô tả"
                        dataIndex="mo_ta"
                        key="mo_ta"
                        width={200}
                        render={(text, record: any, index) => (
                            <Input.TextArea
                                value={text}
                                onChange={(e) => updateQuickAddTask(index, 'mo_ta', e.target.value)}
                                placeholder="Mô tả ngắn"
                                rows={1}
                                autoSize={{ minRows: 1, maxRows: 3 }}
                            />
                        )}
                    />
                    <Table.Column
                        title="Thao tác"
                        key="action"
                        width={80}
                        fixed="right"
                        render={(text, record: any, index) => (
                            <Space>
                                {quickAddTasks.length > 1 && (
                                    <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeQuickAddTaskRow(index)}
                                    />
                                )}
                            </Space>
                        )}
                    />
                </Table>
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addQuickAddTaskRow}
                        block
                    >
                        Thêm dòng mới
                    </Button>
                </div>
            </Modal>

            {/* Add to Meeting Modal */}
            <Modal
                title="Thêm dự án vào Meeting"
                open={addToMeetingModalVisible}
                onCancel={() => {
                    setAddToMeetingModalVisible(false);
                    addToMeetingForm.resetFields();
                }}
                onOk={handleAddToMeeting}
                okText="Thêm"
                cancelText="Hủy"
                confirmLoading={addingToMeeting}
                width={500}
            >
                <Form form={addToMeetingForm} layout="vertical">
                    <Form.Item
                        name="meeting_type"
                        label="Loại Meeting"
                        rules={[{ required: true, message: 'Vui lòng chọn loại meeting' }]}
                    >
                        <Radio.Group>
                            <Radio value="daily">Daily</Radio>
                            <Radio value="weekly">Weekly</Radio>
                            <Radio value="monthly">Monthly</Radio>
                            <Radio value="yearly">Yearly</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        name="note"
                        label="Ghi chú"
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Nhập ghi chú cho dự án trong meeting này..."
                        />
                    </Form.Item>

                    <div style={{ padding: '12px', backgroundColor: '#f0f0f0', borderRadius: 4 }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
                            📌 <strong>Lưu ý:</strong> Nếu đã có meeting loại này trong ngày hôm nay, 
                            dự án sẽ được thêm vào meeting đó. Ngược lại, hệ thống sẽ tạo meeting mới.
                        </p>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ProjectDetail;
