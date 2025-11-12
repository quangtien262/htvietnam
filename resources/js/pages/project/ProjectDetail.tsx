import React, { useEffect, useState } from 'react';
import { Card, Tabs, Descriptions, Tag, Button, Space, Progress, Statistic, Row, Col, Timeline, Avatar, Empty, Spin, message, Table, Tooltip, Modal, Form, Input, Select, DatePicker, Radio, Badge } from 'antd';
import { ArrowLeftOutlined, EditOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, PlusOutlined, TableOutlined, AppstoreOutlined, FileOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { projectApi, taskApi, referenceApi } from '../../common/api/projectApi';
import { Project, ActivityLog, Task } from '../../types/project';
import ROUTE from '../../common/route';
import TaskDetail from './TaskDetail';
import ProjectAttachments from '../../components/project/ProjectAttachments';
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

            const response = await projectApi.addMember(Number(id), values);

            if (response.data.success) {
                message.success('Thêm thành viên thành công');
                setAddMemberModalVisible(false);
                addMemberForm.resetFields();
                loadProject(); // Reload to show new member
            }
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
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleOpenAddTaskModal}
                            >
                                {isMobile ? 'Thêm' : 'Thêm nhiệm vụ'}
                            </Button>
                        </Space>
                    }
                >
                    {taskViewMode === 'table' ? (
                        // Table View
                        project.tasks && project.tasks.length > 0 ? (
                            <Table
                                dataSource={project.tasks}
                                rowKey="id"
                                pagination={false}
                                columns={[
                                    {
                                        title: 'Nhiệm vụ',
                                        key: 'task_info',
                                        render: (text: string, record: Task) => (
                                            <a onClick={() => {
                                                setDetailTaskId(record.id);
                                                setDetailVisible(true);
                                            }}>
                                                <div>
                                                    <strong>{record.ma_nhiem_vu}</strong>
                                                </div>
                                                <div>{record.tieu_de}</div>
                                            </a>
                                        ),
                                    },
                                    {
                                        title: 'Trạng thái',
                                        dataIndex: 'trang_thai',
                                        key: 'trang_thai',
                                        width: 130,
                                        render: (status: any) => (
                                            <Tag color={status?.ma_mau}>{status?.ten_trang_thai}</Tag>
                                        ),
                                    },
                                    {
                                        title: 'Ưu tiên',
                                        dataIndex: 'uu_tien',
                                        key: 'uu_tien',
                                        width: 120,
                                        render: (priority: any) => (
                                            <Tag color={priority?.ma_mau}>{priority?.ten_uu_tien}</Tag>
                                        ),
                                    },
                                    {
                                        title: 'Tiến độ',
                                        dataIndex: 'tien_do',
                                        key: 'tien_do',
                                        width: 150,
                                        render: (tien_do: number) => (
                                            <Progress percent={tien_do || 0} size="small" />
                                        ),
                                    },
                                    {
                                        title: 'Deadline',
                                        dataIndex: 'ngay_ket_thuc_du_kien',
                                        key: 'ngay_ket_thuc_du_kien',
                                        width: 120,
                                        render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
                                    },
                                ]}
                            />
                        ) : (
                            <Empty description="Chưa có nhiệm vụ" />
                        )
                    ) : (
                        // Kanban View
                        <Spin spinning={kanbanLoading}>
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
                                    {taskStatuses.map((status) => {
                                        const tasks = kanbanData[status.id] || [];
                                        return (
                                            <div
                                                key={status.id}
                                                style={{
                                                    flex: '0 0 300px',
                                                    backgroundColor: '#f5f5f5',
                                                    borderRadius: 8,
                                                    padding: 16,
                                                }}
                                            >
                                                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Space>
                                                        <Tag color={status.ma_mau}>{status.ten_trang_thai}</Tag>
                                                        <Badge count={tasks.length} showZero style={{ backgroundColor: '#999' }} />
                                                    </Space>
                                                </div>

                                                <Droppable droppableId={String(status.id)}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            style={{
                                                                minHeight: 200,
                                                                backgroundColor: snapshot.isDraggingOver ? '#e6f7ff' : 'transparent',
                                                                borderRadius: 4,
                                                                padding: 4,
                                                            }}
                                                        >
                                                            {tasks.length === 0 ? (
                                                                <Empty
                                                                    description="Không có nhiệm vụ"
                                                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                                    style={{ margin: '20px 0' }}
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
                                                                                    marginBottom: 8,
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
                                                                                        backgroundColor: snapshot.isDragging ? '#f0f0f0' : '#fff',
                                                                                        borderLeft: `3px solid ${task.uu_tien?.ma_mau || '#1890ff'}`,
                                                                                    }}
                                                                                >
                                                                                    <div style={{ marginBottom: 8 }}>
                                                                                        <strong>{task.ma_nhiem_vu}</strong>
                                                                                    </div>
                                                                                    <div style={{ marginBottom: 8 }}>{task.tieu_de}</div>
                                                                                    <Space wrap style={{ marginBottom: 8 }}>
                                                                                        <Tag color={task.uu_tien?.ma_mau} style={{ margin: 0 }}>
                                                                                            {task.uu_tien?.ten_uu_tien}
                                                                                        </Tag>
                                                                                        {task.nguoi_thuc_hien && (
                                                                                            <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                                                                                                {task.nguoi_thuc_hien.name?.charAt(0).toUpperCase()}
                                                                                            </Avatar>
                                                                                        )}
                                                                                    </Space>
                                                                                    {task.tien_do !== undefined && task.tien_do !== null && (
                                                                                        <Progress percent={task.tien_do} size="small" showInfo={false} />
                                                                                    )}
                                                                                    {task.ngay_ket_thuc_du_kien && (
                                                                                        <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                                                                                            <ClockCircleOutlined /> {dayjs(task.ngay_ket_thuc_du_kien).format('DD/MM/YYYY')}
                                                                                        </div>
                                                                                    )}
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
                            <Tag color={project.loai_du_an?.ma_mau}>
                                {project.loai_du_an?.ten_loai} {project.loai_du_an?.icon}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái" span={1}>
                            <Tag color={project.trang_thai?.ma_mau}>
                                {project.trang_thai?.ten_trang_thai}
                            </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Ưu tiên" span={1}>
                            <Tag color={project.uu_tien?.ma_mau}>
                                {project.uu_tien?.ten_uu_tien} (Mức {project.uu_tien?.muc_uu_tien})
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
            key: 'stats',
            label: 'Thống kê',
            children: (
                <Card>
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Tổng nhiệm vụ"
                                    value={project.tasks?.length || 0}
                                    prefix={<CheckCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Hoàn thành"
                                    value={project.tasks?.filter(t => t.trang_thai?.is_done).length || 0}
                                    valueStyle={{ color: '#52c41a' }}
                                    prefix={<CheckCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Đang làm"
                                    value={project.tasks?.filter(t => !t.trang_thai?.is_done).length || 0}
                                    valueStyle={{ color: '#1890ff' }}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Tiến độ"
                                    value={project.tien_do || 0}
                                    suffix="%"
                                    valueStyle={{ color: project.tien_do === 100 ? '#52c41a' : '#1890ff' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Card>
            ),
        },
        {
            key: 'activity',
            label: 'Lịch sử',
            children: (
                <Card>
                    {project.activity_logs && project.activity_logs.length > 0 ? (
                        <Timeline
                            items={project.activity_logs.map((log: ActivityLog) => ({
                                children: (
                                    <div>
                                        <div><strong>{log.user?.name}</strong> {log.hanh_dong}</div>
                                        {log.du_lieu_cu && log.du_lieu_moi && (
                                            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                                                <div>Cũ: {JSON.stringify(log.du_lieu_cu)}</div>
                                                <div>Mới: {JSON.stringify(log.du_lieu_moi)}</div>
                                            </div>
                                        )}
                                        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                                            {dayjs(log.created_at).format('DD/MM/YYYY HH:mm')}
                                        </div>
                                    </div>
                                ),
                            }))}
                        />
                    ) : (
                        <Empty description="Chưa có hoạt động" />
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
                    <Tag color={project.ma_mau}>{project.ma_du_an}</Tag>
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

            <Tabs items={tabItems} />

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
                                            <Tag color={status.ma_mau}>{status.ten_trang_thai}</Tag>
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
                                            <Tag color={priority.ma_mau}>{priority.ten_uu_tien}</Tag>
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
                        label="Người thực hiện"
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
                        name="admin_user_id"
                        rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
                    >
                        <Select
                            placeholder="Chọn nhân viên"
                            showSearch
                            optionFilterProp="children"
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
                        <Select placeholder="Chọn vai trò">
                            <Select.Option value="quan_ly">
                                <Tag color="red">Quản lý (PM)</Tag>
                            </Select.Option>
                            <Select.Option value="thanh_vien">
                                <Tag color="blue">Thành viên</Tag>
                            </Select.Option>
                            <Select.Option value="xem">
                                <Tag color="default">Xem</Tag>
                            </Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Ngày tham gia"
                        name="ngay_tham_gia"
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProjectDetail;
