import React, { useEffect, useState } from 'react';
import {
    Card, Button, Space, Tag, Avatar, Tooltip, message, Modal,
    Form, Input, Select, DatePicker, Empty, Spin
} from 'antd';
import { PlusOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { taskApi, referenceApi } from '../../common/api/projectApi';
import { Task, TaskStatusType, PriorityType, TaskFormData } from '../../types/project';
import { useParams } from 'react-router-dom';
import TaskDetail from './TaskDetail';
import dayjs from 'dayjs';

const { Option } = Select;

const TaskKanban: React.FC = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [taskStatuses, setTaskStatuses] = useState<TaskStatusType[]>([]);
    const [priorities, setPriorities] = useState<PriorityType[]>([]);
    const [kanbanData, setKanbanData] = useState<{ [key: number]: Task[] }>({});

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);

    const [detailVisible, setDetailVisible] = useState(false);
    const [detailTaskId, setDetailTaskId] = useState<number | null>(null);

    useEffect(() => {
        loadReferenceData();
    }, []);

    useEffect(() => {
        if (projectId && taskStatuses.length > 0) {
            loadKanbanData();
        }
    }, [projectId, taskStatuses]);

    const loadReferenceData = async () => {
        try {
            const [statusesRes, prioritiesRes] = await Promise.all([
                referenceApi.getTaskStatuses(),
                referenceApi.getPriorities(),
            ]);

            if (statusesRes.data.success) setTaskStatuses(statusesRes.data.data);
            if (prioritiesRes.data.success) setPriorities(prioritiesRes.data.data);
        } catch (error) {
            console.error('Error loading reference data:', error);
        }
    };

    const loadKanbanData = async () => {
        if (!projectId) return;

        setLoading(true);
        try {
            const response = await taskApi.getKanban(Number(projectId));

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
            message.error(error.response?.data?.message || 'Không thể tải dữ liệu Kanban');
        } finally {
            setLoading(false);
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
        } catch (error: any) {
            message.error('Không thể cập nhật trạng thái');
            // Revert on error
            loadKanbanData();
        }
    };

    const handleQuickAdd = (statusId: number) => {
        setSelectedStatusId(statusId);
        form.resetFields();
        form.setFieldsValue({
            project_id: Number(projectId),
            trang_thai_id: statusId,
            uu_tien_id: 2, // Medium priority
        });
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload: TaskFormData = {
                ...values,
                project_id: Number(projectId),
                ngay_bat_dau: values.ngay_bat_dau?.format('YYYY-MM-DD HH:mm:ss'),
                ngay_ket_thuc_du_kien: values.ngay_ket_thuc_du_kien?.format('YYYY-MM-DD HH:mm:ss'),
            };

            const response = await taskApi.create(payload);

            if (response.data.success) {
                message.success('Tạo nhiệm vụ thành công');
                setModalVisible(false);
                loadKanbanData();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const renderTaskCard = (task: Task, index: number) => (
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
                            borderLeft: `3px solid ${task.uu_tien?.color || '#1890ff'}`,
                            backgroundColor: snapshot.isDragging ? '#f0f0f0' : '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>{task.tieu_de}</Text>
                        </div>

                        {task.mo_ta && (
                            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                                {task.mo_ta.substring(0, 50)}{task.mo_ta.length > 50 ? '...' : ''}
                            </div>
                        )}

                        <Space size="small" wrap>
                            <Tag color={task.uu_tien?.color} style={{ fontSize: 11 }}>
                                {task.uu_tien?.name}
                            </Tag>

                            {task.ngay_ket_thuc_du_kien && (
                                <Tooltip title="Deadline">
                                    <Tag icon={<ClockCircleOutlined />} color="default" style={{ fontSize: 11 }}>
                                        {dayjs(task.ngay_ket_thuc_du_kien).format('DD/MM')}
                                    </Tag>
                                </Tooltip>
                            )}

                            {task.nguoi_thuc_hien && (
                                <Tooltip title={task.nguoi_thuc_hien.name}>
                                    <Avatar size="small" icon={<UserOutlined />} />
                                </Tooltip>
                            )}

                            {task.checklists && task.checklists.length > 0 && (
                                <Tag color="cyan" style={{ fontSize: 11 }}>
                                    ✓ {task.checklists.filter(c => c.is_completed).length}/{task.checklists.length}
                                </Tag>
                            )}
                        </Space>
                    </Card>
                </div>
            )}
        </Draggable>
    );

    const renderColumn = (status: TaskStatusType) => {
        const tasks = kanbanData[status.id] || [];

        return (
            <div
                key={status.id}
                style={{
                    minWidth: 300,
                    maxWidth: 350,
                    marginRight: 16,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Card
                    title={
                        <Space>
                            <span style={{ color: status.color }}>●</span>
                            <span>{status.name}</span>
                            <Tag>{tasks.length}</Tag>
                        </Space>
                    }
                    extra={
                        <Button
                            type="text"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => handleQuickAdd(status.id)}
                        />
                    }
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                    <Droppable droppableId={String(status.id)}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{
                                    minHeight: 200,
                                    backgroundColor: snapshot.isDraggingOver ? '#f0f5ff' : 'transparent',
                                    borderRadius: 4,
                                    padding: 4,
                                }}
                            >
                                {tasks.length === 0 ? (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="Không có nhiệm vụ"
                                        style={{ margin: '20px 0' }}
                                    />
                                ) : (
                                    tasks.map((task, index) => renderTaskCard(task, index))
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </Card>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 16 }}>Kanban Board</h2>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: 16 }}>
                    {taskStatuses.map(status => renderColumn(status))}
                </div>
            </DragDropContext>

            {/* Quick Add Task Modal */}
            <Modal
                title="Thêm nhiệm vụ nhanh"
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                okText="Tạo nhiệm vụ"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="tieu_de"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input placeholder="Nhập tiêu đề nhiệm vụ" />
                    </Form.Item>

                    <Form.Item name="mo_ta" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Mô tả chi tiết" />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            name="uu_tien_id"
                            label="Ưu tiên"
                            rules={[{ required: true }]}
                        >
                            <Select placeholder="Chọn mức ưu tiên" style={{ width: 150 }}>
                                {priorities.map(priority => (
                                    <Option key={priority.id} value={priority.id}>
                                        <Tag color={priority.color}>{priority.name}</Tag>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="ngay_ket_thuc_du_kien" label="Deadline">
                            <DatePicker
                                showTime
                                format="DD/MM/YYYY HH:mm"
                                style={{ width: 200 }}
                            />
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>

            <TaskDetail
                taskId={detailTaskId}
                projectId={Number(projectId)}
                visible={detailVisible}
                onClose={() => {
                    setDetailVisible(false);
                    setDetailTaskId(null);
                }}
                onUpdate={loadKanbanData}
            />
        </div>
    );
};

// Import Typography
import { Typography } from 'antd';
const { Text } = Typography;

export default TaskKanban;
