import React, { useEffect, useState } from 'react';
import {
    Drawer,
    Tabs,
    Descriptions,
    Tag,
    Button,
    Space,
    Progress,
    Form,
    Input,
    Select,
    DatePicker,
    Checkbox,
    List,
    Avatar,
    Tooltip,
    Popconfirm,
    message,
    Divider,
    Empty,
} from 'antd';
import {
    CloseOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    UserOutlined,
    CheckOutlined,
    SendOutlined,
} from '@ant-design/icons';
import { taskApi, referenceApi, projectApi } from '../../common/api/projectApi';
import { Task, TaskStatusType, PriorityType, TaskChecklist, TaskComment, ProjectMember } from '../../types/project';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Option } = Select;
const { TextArea } = Input;

interface TaskDetailProps {
    taskId: number | null;
    projectId: number;
    visible: boolean;
    onClose: () => void;
    onUpdate?: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ taskId, projectId, visible, onClose, onUpdate }) => {
    const [form] = Form.useForm();
    const [checklistForm] = Form.useForm();
    const [commentForm] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [task, setTask] = useState<Task | null>(null);
    const [editing, setEditing] = useState(false);

    // Reference data
    const [taskStatuses, setTaskStatuses] = useState<TaskStatusType[]>([]);
    const [priorities, setPriorities] = useState<PriorityType[]>([]);
    const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

    // Checklist
    const [addingChecklist, setAddingChecklist] = useState(false);

    // Comments
    const [replyTo, setReplyTo] = useState<number | null>(null);

    useEffect(() => {
        if (visible) {
            loadReferenceData();
            loadProjectMembers();
        }
    }, [visible]);

    useEffect(() => {
        if (taskId && visible) {
            loadTask();
        }
    }, [taskId, visible]);

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

    const loadProjectMembers = async () => {
        try {
            const response = await projectApi.getById(projectId);
            if (response.data.success) {
                setProjectMembers(response.data.data.members || []);
            }
        } catch (error) {
            console.error('Error loading project members:', error);
        }
    };

    const loadTask = async () => {
        if (!taskId) return;

        setLoading(true);
        try {
            // Assuming we have a getById endpoint
            const response = await taskApi.getList({ id: taskId });
            if (response.data.success && response.data.data.data.length > 0) {
                const taskData = response.data.data.data[0];
                setTask(taskData);
                form.setFieldsValue({
                    ...taskData,
                    ngay_bat_dau: taskData.ngay_bat_dau ? dayjs(taskData.ngay_bat_dau) : null,
                    ngay_ket_thuc_du_kien: taskData.ngay_ket_thuc_du_kien ? dayjs(taskData.ngay_ket_thuc_du_kien) : null,
                });
            }
        } catch (error: any) {
            message.error('Không thể tải thông tin nhiệm vụ');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!taskId) return;

        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                ngay_bat_dau: values.ngay_bat_dau?.format('YYYY-MM-DD HH:mm:ss'),
                ngay_ket_thuc_du_kien: values.ngay_ket_thuc_du_kien?.format('YYYY-MM-DD HH:mm:ss'),
            };

            const response = await taskApi.update(taskId, payload);

            if (response.data.success) {
                message.success('Cập nhật thành công');
                setEditing(false);
                loadTask();
                onUpdate?.();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    // Checklist functions
    const handleAddChecklist = async () => {
        try {
            const values = await checklistForm.validateFields();

            if (!task) return;

            const updatedChecklists = [
                ...(task.checklists || []),
                {
                    noi_dung: values.noi_dung,
                    is_completed: false,
                    thu_tu: (task.checklists?.length || 0) + 1,
                }
            ];

            const response = await taskApi.update(taskId!, {
                checklists: updatedChecklists,
            });

            if (response.data.success) {
                message.success('Thêm checklist thành công');
                checklistForm.resetFields();
                setAddingChecklist(false);
                loadTask();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleToggleChecklist = async (checklistId: number, isCompleted: boolean) => {
        if (!task) return;

        const updatedChecklists = task.checklists?.map(item =>
            item.id === checklistId ? { ...item, is_completed: !isCompleted } : item
        );

        try {
            const response = await taskApi.update(taskId!, {
                checklists: updatedChecklists,
            });

            if (response.data.success) {
                loadTask();
            }
        } catch (error: any) {
            message.error('Có lỗi xảy ra');
        }
    };

    const handleDeleteChecklist = async (checklistId: number) => {
        if (!task) return;

        const updatedChecklists = task.checklists?.filter(item => item.id !== checklistId);

        try {
            const response = await taskApi.update(taskId!, {
                checklists: updatedChecklists,
            });

            if (response.data.success) {
                message.success('Xóa thành công');
                loadTask();
            }
        } catch (error: any) {
            message.error('Có lỗi xảy ra');
        }
    };

    // Comment functions
    const handleAddComment = async () => {
        try {
            const values = await commentForm.validateFields();

            const response = await taskApi.addComment(taskId!, values.content, replyTo || undefined);

            if (response.data.success) {
                message.success('Thêm bình luận thành công');
                commentForm.resetFields();
                setReplyTo(null);
                loadTask();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const renderChecklistTab = () => {
        const completedCount = task?.checklists?.filter(item => item.is_completed).length || 0;
        const totalCount = task?.checklists?.length || 0;
        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return (
            <div>
                {totalCount > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <Progress percent={progress} status={progress === 100 ? 'success' : 'active'} />
                        <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
                            {completedCount}/{totalCount} hoàn thành
                        </div>
                    </div>
                )}

                <List
                    dataSource={task?.checklists || []}
                    locale={{ emptyText: <Empty description="Chưa có checklist" /> }}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Popconfirm
                                    title="Xác nhận xóa?"
                                    onConfirm={() => handleDeleteChecklist(item.id)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                >
                                    <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            ]}
                        >
                            <Checkbox
                                checked={item.is_completed}
                                onChange={() => handleToggleChecklist(item.id, item.is_completed)}
                                style={{
                                    textDecoration: item.is_completed ? 'line-through' : 'none',
                                    color: item.is_completed ? '#8c8c8c' : 'inherit'
                                }}
                            >
                                {item.noi_dung}
                            </Checkbox>
                        </List.Item>
                    )}
                />

                <Divider />

                {addingChecklist ? (
                    <Form form={checklistForm} layout="inline">
                        <Form.Item
                            name="noi_dung"
                            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Nhập nội dung checklist" />
                        </Form.Item>
                        <Form.Item>
                            <Space>
                                <Button type="primary" icon={<CheckOutlined />} onClick={handleAddChecklist}>
                                    Thêm
                                </Button>
                                <Button onClick={() => {
                                    setAddingChecklist(false);
                                    checklistForm.resetFields();
                                }}>
                                    Hủy
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                ) : (
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => setAddingChecklist(true)} block>
                        Thêm checklist
                    </Button>
                )}
            </div>
        );
    };

    const renderCommentItem = (comment: TaskComment, isReply = false) => (
        <Comment
            key={comment.id}
            author={comment.admin_user?.name || 'Unknown'}
            avatar={<Avatar icon={<UserOutlined />} />}
            content={<p>{comment.noi_dung}</p>}
            datetime={
                <Tooltip title={dayjs(comment.created_at).format('DD/MM/YYYY HH:mm')}>
                    <span>{dayjs(comment.created_at).fromNow()}</span>
                </Tooltip>
            }
            actions={[
                <span key="reply" onClick={() => setReplyTo(comment.id)}>Trả lời</span>
            ]}
        >
            {comment.replies && comment.replies.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    {comment.replies.map(reply => renderCommentItem(reply, true))}
                </div>
            )}
        </Comment>
    );

    const renderCommentsTab = () => (
        <div>
            <Form form={commentForm} onFinish={handleAddComment}>
                <Form.Item
                    name="content"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                >
                    <TextArea
                        rows={3}
                        placeholder={replyTo ? "Nhập câu trả lời..." : "Nhập bình luận..."}
                    />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                            {replyTo ? 'Trả lời' : 'Gửi'}
                        </Button>
                        {replyTo && (
                            <Button onClick={() => setReplyTo(null)}>
                                Hủy trả lời
                            </Button>
                        )}
                    </Space>
                </Form.Item>
            </Form>

            <Divider />

            {task?.comments && task.comments.length > 0 ? (
                task.comments
                    .filter(comment => !comment.parent_id)
                    .map(comment => renderCommentItem(comment))
            ) : (
                <Empty description="Chưa có bình luận" />
            )}
        </div>
    );

    const renderInfoTab = () => (
        <div>
            {editing ? (
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="tieu_de"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item name="mo_ta" label="Mô tả">
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="trang_thai_id"
                        label="Trạng thái"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            {taskStatuses.map(status => (
                                <Option key={status.id} value={status.id}>
                                    <Tag color={status.ma_mau}>{status.ten_trang_thai}</Tag>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="uu_tien_id"
                        label="Ưu tiên"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            {priorities.map(priority => (
                                <Option key={priority.id} value={priority.id}>
                                    <Tag color={priority.ma_mau}>{priority.ten_uu_tien}</Tag>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="nguoi_thuc_hien_id" label="Người thực hiện">
                        <Select allowClear>
                            {projectMembers.map(member => (
                                <Option key={member.user_id} value={member.user_id}>
                                    {member.user?.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="ngay_bat_dau" label="Ngày bắt đầu">
                        <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="ngay_ket_thuc_du_kien" label="Deadline">
                        <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" onClick={handleUpdate}>
                                Lưu
                            </Button>
                            <Button onClick={() => setEditing(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            ) : (
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Mã nhiệm vụ">
                        <strong>{task?.ma_nhiem_vu}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tiêu đề">
                        {task?.tieu_de}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                        {task?.mo_ta || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={task?.trang_thai?.ma_mau}>
                            {task?.trang_thai?.ten_trang_thai}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ưu tiên">
                        <Tag color={task?.uu_tien?.ma_mau}>
                            {task?.uu_tien?.ten_uu_tien}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Người thực hiện">
                        {task?.nguoi_thuc_hien?.name || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tiến độ">
                        <Progress percent={task?.tien_do || 0} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">
                        {task?.ngay_bat_dau ? dayjs(task.ngay_bat_dau).format('DD/MM/YYYY HH:mm') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Deadline">
                        {task?.ngay_ket_thuc_du_kien ? dayjs(task.ngay_ket_thuc_du_kien).format('DD/MM/YYYY HH:mm') : '-'}
                    </Descriptions.Item>
                </Descriptions>
            )}
        </div>
    );

    const tabItems = [
        {
            key: 'info',
            label: 'Thông tin',
            children: renderInfoTab(),
        },
        {
            key: 'checklist',
            label: `Checklist (${task?.checklists?.length || 0})`,
            children: renderChecklistTab(),
        },
        {
            key: 'comments',
            label: `Bình luận (${task?.comments?.length || 0})`,
            children: renderCommentsTab(),
        },
    ];

    return (
        <Drawer
            title={
                <Space>
                    <span>{task?.ma_nhiem_vu}</span>
                    <Tag color={task?.trang_thai?.ma_mau}>{task?.trang_thai?.ten_trang_thai}</Tag>
                </Space>
            }
            width={720}
            open={visible}
            onClose={onClose}
            extra={
                <Space>
                    {!editing && (
                        <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
                            Sửa
                        </Button>
                    )}
                    <Button icon={<CloseOutlined />} onClick={onClose}>
                        Đóng
                    </Button>
                </Space>
            }
        >
            <Tabs items={tabItems} />
        </Drawer>
    );
};

export default TaskDetail;
