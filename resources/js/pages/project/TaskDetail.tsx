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
    Image,
    Modal,
    Upload,
} from 'antd';
import {
    CloseOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    UserOutlined,
    CheckOutlined,
    SendOutlined,
    UploadOutlined,
    DownloadOutlined,
    FileOutlined,
    FilePdfOutlined,
    FileImageOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { taskApi, referenceApi, projectApi } from '../../common/api/projectApi';
import { Task, TaskStatusType, PriorityType, TaskChecklist, TaskComment as TaskCommentType, ProjectMember } from '../../types/project';
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

    // Attachments
    const [uploading, setUploading] = useState(false);
    const [editingAttachment, setEditingAttachment] = useState<any>(null);
    const [descriptionForm] = Form.useForm();

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
            const response = await taskApi.getById(taskId);
            if (response.data.success) {
                const taskData = response.data.data;
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

            // Map existing checklists to clean format (no id, task_id, timestamps)
            const existingChecklists = (task.checklists || []).map((item, index) => ({
                noi_dung: item.noi_dung,
                is_completed: item.is_completed,
                thu_tu: index + 1,
            }));

            // Add new checklist
            const updatedChecklists = [
                ...existingChecklists,
                {
                    noi_dung: values.noi_dung,
                    is_completed: false,
                    thu_tu: existingChecklists.length + 1,
                }
            ];

            console.log('📝 Sending checklist update:', updatedChecklists);

            const response = await taskApi.update(taskId!, {
                checklists: updatedChecklists,
            });

            console.log('✅ Update response:', response.data);

            if (response.data.success) {
                message.success('Thêm checklist thành công');
                checklistForm.resetFields();
                setAddingChecklist(false);
                loadTask();
            }
        } catch (error: any) {
            console.error('❌ Checklist update error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleToggleChecklist = async (checklistId: number, isCompleted: boolean) => {
        if (!task) return;

        // Map to clean format with updated is_completed
        const updatedChecklists = (task.checklists || []).map((item, index) => ({
            noi_dung: item.noi_dung,
            is_completed: item.id === checklistId ? !isCompleted : item.is_completed,
            thu_tu: index + 1,
        }));

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

        // Filter out deleted item and remap to clean format
        const updatedChecklists = (task.checklists || [])
            .filter(item => item.id !== checklistId)
            .map((item, index) => ({
                noi_dung: item.noi_dung,
                is_completed: item.is_completed,
                thu_tu: index + 1,
            }));

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

    const handleFileUpload = async (file: File, description?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        if (description) {
            formData.append('mo_ta', description);
        }

        setUploading(true);
        try {
            const response = await taskApi.uploadAttachment(taskId!, formData);

            if (response.data.success) {
                message.success('Tải file thành công');
                loadTask();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setUploading(false);
        }

        return false;
    };

    const handleEditDescription = async () => {
        try {
            const values = await descriptionForm.validateFields();
            const response = await taskApi.updateAttachment(editingAttachment.id, values.mo_ta);

            if (response.data.success) {
                message.success('Cập nhật mô tả thành công');
                setEditingAttachment(null);
                descriptionForm.resetFields();
                loadTask();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDownloadAttachment = async (attachmentId: number, filename: string) => {
        try {
            const response = await taskApi.downloadAttachment(attachmentId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: any) {
            message.error('Không thể tải file');
        }
    };

    const handleDeleteAttachment = async (attachmentId: number) => {
        try {
            const response = await taskApi.deleteAttachment(attachmentId);

            if (response.data.success) {
                message.success('Xóa file thành công');
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

    const renderCommentItem = (comment: TaskCommentType, isReply = false) => (
        <div
            key={comment.id}
            style={{
                marginBottom: isReply ? 12 : 24,
                padding: 16,
                backgroundColor: isReply ? '#fafafa' : '#fff',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
            }}
        >
            <div style={{ display: 'flex', gap: 12 }}>
                <Avatar icon={<UserOutlined />} />
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 8 }}>
                        <strong>{comment.admin_user?.name || 'Unknown'}</strong>
                        <span style={{ marginLeft: 12, color: '#8c8c8c', fontSize: 12 }}>
                            {dayjs(comment.created_at).fromNow()}
                        </span>
                    </div>
                    <div style={{ marginBottom: 8, color: '#262626' }}>
                        {comment.noi_dung}
                    </div>
                    {!isReply && (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => setReplyTo(comment.id)}
                            style={{ padding: 0 }}
                        >
                            Trả lời
                        </Button>
                    )}
                </div>
            </div>
            {comment.replies && comment.replies.length > 0 && (
                <div style={{ marginTop: 16, marginLeft: 48 }}>
                    {comment.replies.map((reply: TaskCommentType) => renderCommentItem(reply, true))}
                </div>
            )}
        </div>
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

    const getFileIcon = (extension: string) => {
        const ext = extension?.toLowerCase();
        if (ext === 'pdf') return <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />;
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return <FileImageOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
        if (['doc', 'docx'].includes(ext)) return <FileWordOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
        if (['xls', 'xlsx'].includes(ext)) return <FileExcelOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
        return <FileOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />;
    };

    const isImageFile = (extension: string) => {
        const ext = extension?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
    };

    const getImageUrl = (attachment: any) => {
        return `/storage/${attachment.duong_dan}`;
    };

    const renderAttachmentsTab = () => (
        <div>
            <Upload
                beforeUpload={(file) => {
                    Modal.confirm({
                        title: 'Thêm mô tả cho file (tùy chọn)',
                        content: (
                            <Input.TextArea
                                id="upload-description"
                                placeholder="Nhập mô tả cho file..."
                                rows={3}
                            />
                        ),
                        onOk: () => {
                            const description = (document.getElementById('upload-description') as HTMLTextAreaElement)?.value;
                            handleFileUpload(file, description);
                        },
                        okText: 'Upload',
                        cancelText: 'Hủy',
                    });
                    return false;
                }}
                showUploadList={false}
            >
                <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    loading={uploading}
                    style={{ marginBottom: 16 }}
                >
                    Tải file lên
                </Button>
            </Upload>

            <List
                dataSource={task?.attachments || []}
                locale={{ emptyText: <Empty description="Chưa có file đính kèm" /> }}
                renderItem={(attachment: any) => (
                    <List.Item
                        actions={[
                            isImageFile(attachment.extension) && (
                                <Tooltip title="Xem ảnh">
                                    <Button
                                        type="text"
                                        icon={<EyeOutlined />}
                                        onClick={() => {
                                            Modal.info({
                                                title: attachment.ten_file,
                                                content: (
                                                    <Image
                                                        src={getImageUrl(attachment)}
                                                        alt={attachment.ten_file}
                                                        style={{ width: '100%' }}
                                                    />
                                                ),
                                                width: 800,
                                                okText: 'Đóng',
                                            });
                                        }}
                                    />
                                </Tooltip>
                            ),
                            <Tooltip title="Sửa mô tả">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        setEditingAttachment(attachment);
                                        descriptionForm.setFieldsValue({ mo_ta: attachment.mo_ta || '' });
                                    }}
                                />
                            </Tooltip>,
                            <Tooltip title="Tải xuống">
                                <Button
                                    type="text"
                                    icon={<DownloadOutlined />}
                                    onClick={() => handleDownloadAttachment(attachment.id, attachment.ten_file)}
                                />
                            </Tooltip>,
                            <Popconfirm
                                title="Xác nhận xóa file này?"
                                onConfirm={() => handleDeleteAttachment(attachment.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Tooltip title="Xóa">
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                </Tooltip>
                            </Popconfirm>,
                        ].filter(Boolean)}
                    >
                        <List.Item.Meta
                            avatar={
                                isImageFile(attachment.extension) ? (
                                    <Image
                                        src={getImageUrl(attachment)}
                                        alt={attachment.ten_file}
                                        width={50}
                                        height={50}
                                        style={{ objectFit: 'cover', borderRadius: 4 }}
                                        preview={false}
                                    />
                                ) : (
                                    getFileIcon(attachment.extension)
                                )
                            }
                            title={attachment.ten_file}
                            description={
                                <div>
                                    {attachment.mo_ta && (
                                        <div style={{ marginBottom: 4, color: '#595959' }}>
                                            {attachment.mo_ta}
                                        </div>
                                    )}
                                    <Space size="small">
                                        <span>{attachment.formatted_size}</span>
                                        <span>•</span>
                                        <span>{attachment.uploader?.name || 'Unknown'}</span>
                                        <span>•</span>
                                        <span>{dayjs(attachment.created_at).fromNow()}</span>
                                    </Space>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />

            {/* Edit Description Modal */}
            <Modal
                title="Sửa mô tả file"
                open={!!editingAttachment}
                onOk={handleEditDescription}
                onCancel={() => {
                    setEditingAttachment(null);
                    descriptionForm.resetFields();
                }}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={descriptionForm} layout="vertical">
                    <Form.Item name="mo_ta" label="Mô tả">
                        <Input.TextArea rows={4} placeholder="Nhập mô tả cho file..." />
                    </Form.Item>
                </Form>
            </Modal>
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
        {
            key: 'attachments',
            label: `Files (${task?.attachments?.length || 0})`,
            children: renderAttachmentsTab(),
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
