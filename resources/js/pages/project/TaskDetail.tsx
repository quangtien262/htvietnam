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
    Statistic,
    Card,
    Row,
    Col,
    Table,
    Popover,
    Radio,
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
    PlayCircleOutlined,
    PauseCircleOutlined,
    ClockCircleOutlined,
    FieldTimeOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { taskApi, referenceApi, projectApi, meetingApi } from '../../common/api/projectApi';
import { Task, TaskStatusType, PriorityType, TaskChecklist, TaskComment as TaskCommentType, ProjectMember } from '../../types/project';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Option } = Select;
const { TextArea } = Input;

interface TaskDetailProps {
    taskId: number | null;
    projectId?: number | null;
    visible: boolean;
    onClose: () => void;
    onUpdate?: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ taskId, projectId, visible, onClose, onUpdate }) => {
    const [form] = Form.useForm();
    const [checklistForm] = Form.useForm();
    const [checklistEditForm] = Form.useForm();
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
    const [editingChecklist, setEditingChecklist] = useState<number | null>(null);
    const [checklistModalVisible, setChecklistModalVisible] = useState(false);
    const [quickAddChecklists, setQuickAddChecklists] = useState<any[]>([
        { noi_dung: '', assigned_to: null, mo_ta: '' },
        { noi_dung: '', assigned_to: null, mo_ta: '' },
        { noi_dung: '', assigned_to: null, mo_ta: '' },
        { noi_dung: '', assigned_to: null, mo_ta: '' },
    ]);
    const [applyAllChecklistAssignee, setApplyAllChecklistAssignee] = useState(false);
    const [checklistLoading, setChecklistLoading] = useState(false);

    // Comments
    const [replyTo, setReplyTo] = useState<number | null>(null);

    // Quick Edit
    const [editingField, setEditingField] = useState<string | null>(null);
    const [quickEditForm] = Form.useForm();

    // Attachments
    const [uploading, setUploading] = useState(false);
    const [editingAttachment, setEditingAttachment] = useState<any>(null);
    const [descriptionForm] = Form.useForm();

    // Time Tracking
    const [runningTimer, setRunningTimer] = useState<any>(null);
    const [currentDuration, setCurrentDuration] = useState(0);
    const [addManualTimeModal, setAddManualTimeModal] = useState(false);
    const [manualTimeForm] = Form.useForm();

    // Add to Meeting
    const [addToMeetingModalVisible, setAddToMeetingModalVisible] = useState(false);
    const [addToMeetingForm] = Form.useForm();
    const [addingToMeeting, setAddingToMeeting] = useState(false);

    useEffect(() => {
        if (visible) {
            loadReferenceData();
            if (projectId) loadProjectMembers();
        }
    }, [visible, projectId]);

    useEffect(() => {
        if (taskId && visible) {
            loadTask();
            checkRunningTimer();
        } else {
            // Reset timer state khi đóng drawer
            setRunningTimer(null);
            setCurrentDuration(0);
        }
    }, [taskId, visible]);

    // Timer update every second
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (runningTimer && runningTimer.is_running) {
            interval = setInterval(() => {
                const duration = Math.floor((Date.now() - new Date(runningTimer.started_at).getTime()) / 1000);
                setCurrentDuration(duration);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [runningTimer]);

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
                const members = response.data.data.members || [];
                console.log('👥 Project Members loaded:', members);
                console.log('👥 Total members:', members.length);
                setProjectMembers(members);
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
                console.log('Task Data:', taskData);
                console.log('Checklists with assigned_user:', taskData.checklists);
                console.log('Time Logs:', taskData.timeLogs);
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

    // Quick Edit single field
    const handleQuickEdit = async (field: string) => {
        if (!taskId) return;

        try {
            const values = await quickEditForm.validateFields();
            let payload: any = {};

            // Format date fields
            if (field === 'ngay_bat_dau' || field === 'ngay_ket_thuc_du_kien') {
                payload[field] = values[field]?.format('YYYY-MM-DD HH:mm:ss');
            } else {
                payload[field] = values[field];
            }

            const response = await taskApi.update(taskId, payload);

            if (response.data.success) {
                message.success('Cập nhật thành công');
                setEditingField(null);
                quickEditForm.resetFields();

                // Update task state directly without reloading
                if (response.data.data) {
                    setTask(response.data.data);
                } else {
                    // Update only the changed field
                    setTask(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            [field]: field === 'ngay_bat_dau' || field === 'ngay_ket_thuc_du_kien'
                                ? values[field]?.toISOString()
                                : values[field],
                            // Update related objects if needed
                            ...(field === 'trang_thai_id' && { trang_thai: taskStatuses.find(s => s.id === values[field]) }),
                            ...(field === 'uu_tien_id' && { uu_tien: priorities.find(p => p.id === values[field]) }),
                            ...(field === 'nguoi_thuc_hien_id' && {
                                nguoi_thuc_hien: projectMembers.find(m => m.admin_user_id === values[field])?.admin_user
                            }),
                        };
                    });
                }

                // Note: Không gọi onUpdate() để tránh reload toàn bộ danh sách tasks
                // Task state đã được update trực tiếp ở trên
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const openQuickEdit = (field: string, currentValue: any) => {
        setEditingField(field);

        // Set initial value based on field type
        if (field === 'ngay_bat_dau' || field === 'ngay_ket_thuc_du_kien') {
            quickEditForm.setFieldsValue({
                [field]: currentValue ? dayjs(currentValue) : null,
            });
        } else {
            quickEditForm.setFieldsValue({
                [field]: currentValue,
            });
        }
    };

    const renderQuickEditPopover = (field: string, label: string, currentValue: any, renderInput: () => React.ReactNode) => (
        <Popover
            content={
                <div style={{ width: 300 }}>
                    <Form form={quickEditForm} layout="vertical">
                        <Form.Item
                            name={field}
                            label={label}
                            rules={[{ required: field === 'tieu_de' || field === 'trang_thai_id' || field === 'uu_tien_id', message: 'Trường này là bắt buộc' }]}
                            style={{ marginBottom: 8 }}
                        >
                            {renderInput()}
                        </Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => handleQuickEdit(field)}
                            >
                                Lưu
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    setEditingField(null);
                                    quickEditForm.resetFields();
                                }}
                            >
                                Hủy
                            </Button>
                        </Space>
                    </Form>
                </div>
            }
            title={`Sửa ${label}`}
            trigger="click"
            open={editingField === field}
            onOpenChange={(open) => {
                if (open) {
                    openQuickEdit(field, currentValue);
                } else {
                    setEditingField(null);
                    quickEditForm.resetFields();
                }
            }}
        >
            <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                style={{ color: '#1890ff' }}
            />
        </Popover>
    );

    // Checklist functions
    const handleAddChecklist = async () => {
        try {
            const values = await checklistForm.validateFields();

            if (!task) return;

            // Filter out empty checklists
            const newChecklists = (values.checklists || []).filter((item: any) => item?.noi_dung?.trim());

            if (newChecklists.length === 0) {
                message.warning('Vui lòng nhập ít nhất 1 checklist');
                return;
            }

            // Map existing checklists to clean format (no id, task_id, timestamps)
            const existingChecklists = (task.checklists || []).map((item, index) => ({
                noi_dung: item.noi_dung,
                is_completed: item.is_completed,
                assigned_to: item.assigned_to,
                sort_order: index,
            }));

            // Add new checklists
            const updatedChecklists = [
                ...existingChecklists,
                ...newChecklists.map((item: any, index: number) => ({
                    noi_dung: item.noi_dung,
                    assigned_to: item.assigned_to || null,
                    is_completed: false,
                    sort_order: existingChecklists.length + index,
                }))
            ];

            console.log('📝 Sending checklist update:', updatedChecklists);

            const response = await taskApi.update(taskId!, {
                checklists: updatedChecklists,
            });

            console.log('✅ Update response:', response.data);

            if (response.data.success) {
                message.success(`Đã thêm ${newChecklists.length} checklist`);
                checklistForm.resetFields();
                setAddingChecklist(false);
                loadTask();
            }
        } catch (error: any) {
            console.error('❌ Checklist update error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleUpdateChecklist = async (checklistId: number) => {
        try {
            const values = await checklistEditForm.validateFields();

            if (!task) return;

            const updatedChecklists = (task.checklists || []).map((item, index) => {
                if (item.id === checklistId) {
                    return {
                        noi_dung: values.noi_dung,
                        is_completed: item.is_completed,
                        assigned_to: values.assigned_to || null,
                        mo_ta: values.mo_ta || null,
                        sort_order: index,
                    };
                }
                return {
                    noi_dung: item.noi_dung,
                    is_completed: item.is_completed,
                    assigned_to: item.assigned_to,
                    mo_ta: item.mo_ta,
                    sort_order: index,
                };
            });

            const response = await taskApi.update(taskId!, {
                checklists: updatedChecklists,
            });

            if (response.data.success) {
                message.success('Cập nhật checklist thành công');
                setEditingChecklist(null);
                loadTask();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleToggleChecklist = async (checklistId: number, isCompleted: boolean) => {
        if (!task) return;

        // Map to clean format with updated is_completed
        const updatedChecklists = (task.checklists || []).map((item, index) => ({
            noi_dung: item.noi_dung,
            is_completed: item.id === checklistId ? !isCompleted : item.is_completed,
            assigned_to: item.assigned_to,
            mo_ta: item.mo_ta,
            sort_order: index,
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
                assigned_to: item.assigned_to,
                mo_ta: item.mo_ta,
                sort_order: index,
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

    // Quick add checklist functions
    const updateQuickAddChecklist = (index: number, field: string, value: any) => {
        console.log(`🔄 Updating row ${index}, field: ${field}, value:`, value);

        const newChecklists = [...quickAddChecklists];
        newChecklists[index] = { ...newChecklists[index], [field]: value };

        // Apply to all if checkbox is checked
        if (applyAllChecklistAssignee && field === 'assigned_to') {
            console.log('✅ Applying assigned_to to all rows:', value);
            newChecklists.forEach((item, i) => {
                newChecklists[i] = { ...newChecklists[i], assigned_to: value };
            });
        }

        console.log('📋 Updated quickAddChecklists:', newChecklists);
        setQuickAddChecklists(newChecklists);
    };

    const addQuickAddChecklistRow = () => {
        setQuickAddChecklists([
            ...quickAddChecklists,
            { noi_dung: '', assigned_to: null, mo_ta: '' }
        ]);
    };

    const removeQuickAddChecklistRow = (index: number) => {
        if (quickAddChecklists.length > 1) {
            setQuickAddChecklists(quickAddChecklists.filter((_, i) => i !== index));
        }
    };

    const handleQuickAddChecklists = async () => {
        const validChecklists = quickAddChecklists.filter(item => item.noi_dung && item.noi_dung.trim() !== '');

        if (validChecklists.length === 0) {
            message.warning('Vui lòng nhập ít nhất 1 checklist');
            return;
        }

        setChecklistLoading(true);
        try {
            const existingChecklists = (task!.checklists || []).map((item, index) => ({
                noi_dung: item.noi_dung,
                is_completed: item.is_completed,
                assigned_to: item.assigned_to,
                sort_order: index,
            }));

            const updatedChecklists = [
                ...existingChecklists,
                ...validChecklists.map((item, index) => ({
                    noi_dung: item.noi_dung,
                    assigned_to: item.assigned_to || null,
                    // mo_ta: item.mo_ta, // TODO: Add to backend
                    is_completed: false,
                    sort_order: existingChecklists.length + index,
                }))
            ];

            console.log('📤 Sending checklists payload:', updatedChecklists);
            console.log('📤 Valid checklists with assigned_to:', validChecklists);

            const response = await taskApi.update(taskId!, { checklists: updatedChecklists });

            console.log('✅ Update response:', response.data);

            message.success(`Đã thêm ${validChecklists.length} checklist`);
            setChecklistModalVisible(false);
            resetChecklistForm();

            // Use response data if available, otherwise reload
            if (response.data.success && response.data.data) {
                console.log('📦 Updated task data from response:', response.data.data);
                console.log('📦 Checklists:', response.data.data.checklists);
                setTask(response.data.data);
            } else {
                await loadTask();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setChecklistLoading(false);
        }
    };

    const resetChecklistForm = () => {
        setQuickAddChecklists([
            { noi_dung: '', assigned_to: null, mo_ta: '' },
            { noi_dung: '', assigned_to: null, mo_ta: '' },
            { noi_dung: '', assigned_to: null, mo_ta: '' },
            { noi_dung: '', assigned_to: null, mo_ta: '' },
        ]);
        setApplyAllChecklistAssignee(false);
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

    // ============================================
    // TIME TRACKING HANDLERS
    // ============================================

    const checkRunningTimer = async () => {
        try {
            const response = await taskApi.getRunningTimer();
            if (response.data.success && response.data.data) {
                const timer = response.data.data;
                // Chỉ hiển thị timer nếu đúng task hiện tại
                if (timer.task_id === taskId) {
                    setRunningTimer(timer);
                    const duration = Math.floor((Date.now() - new Date(timer.started_at).getTime()) / 1000);
                    setCurrentDuration(duration);
                } else {
                    // Timer đang chạy ở task khác, clear state
                    setRunningTimer(null);
                    setCurrentDuration(0);
                }
            } else {
                // Không có timer nào đang chạy
                setRunningTimer(null);
                setCurrentDuration(0);
            }
        } catch (error) {
            // No running timer
            setRunningTimer(null);
            setCurrentDuration(0);
        }
    };

    const handleStartTimer = async () => {
        try {
            const response = await taskApi.startTimer(taskId!);
            if (response.data.success) {
                message.success('Bắt đầu đếm thời gian');
                setRunningTimer(response.data.data);
                setCurrentDuration(0);
                loadTask();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleStopTimer = async () => {
        if (!runningTimer) return;

        try {
            const response = await taskApi.stopTimer(runningTimer.id);
            if (response.data.success) {
                message.success('Dừng đếm thời gian');
                setRunningTimer(null);
                setCurrentDuration(0);
                loadTask();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleAddManualTime = async () => {
        try {
            const values = await manualTimeForm.validateFields();
            const response = await taskApi.addManualTimeLog(taskId!, {
                started_at: values.started_at.toISOString(),
                ended_at: values.ended_at.toISOString(),
                mo_ta: values.mo_ta,
            });

            if (response.data.success) {
                message.success('Thêm log thời gian thành công');
                setAddManualTimeModal(false);
                manualTimeForm.resetFields();
                loadTask();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteTimeLog = async (timeLogId: number) => {
        try {
            const response = await taskApi.deleteTimeLog(timeLogId);
            if (response.data.success) {
                message.success('Xóa log thời gian thành công');
                loadTask();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleAddToMeeting = async () => {
        if (!taskId) return;

        try {
            setAddingToMeeting(true);
            const values = await addToMeetingForm.validateFields();

            const response = await meetingApi.addTask(
                taskId,
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

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    const getTotalTimeLogged = () => {
        const logs = task?.time_logs || task?.timeLogs || [];
        return logs.reduce((total, log) => {
            return total + (log.duration || 0);
        }, 0);
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
                    renderItem={(item) => {
                        const isEditing = editingChecklist === item.id;

                        return (
                            <List.Item
                                actions={[
                                    isEditing ? (
                                        <>
                                            <Button
                                                type="link"
                                                size="small"
                                                icon={<CheckOutlined />}
                                                onClick={() => handleUpdateChecklist(item.id)}
                                            >
                                                Lưu
                                            </Button>
                                            <Button
                                                type="link"
                                                size="small"
                                                onClick={() => {
                                                    setEditingChecklist(null);
                                                    checklistEditForm.resetFields();
                                                }}
                                            >
                                                Hủy
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                type="link"
                                                size="small"
                                                icon={<EditOutlined />}
                                                onClick={() => {
                                                    setEditingChecklist(item.id);
                                                    checklistEditForm.setFieldsValue({
                                                        noi_dung: item.noi_dung,
                                                        assigned_to: item.assigned_to,
                                                        mo_ta: item.mo_ta,
                                                    });
                                                }}
                                            >
                                                Sửa
                                            </Button>
                                            <Popconfirm
                                                title="Xác nhận xóa?"
                                                onConfirm={() => handleDeleteChecklist(item.id)}
                                                okText="Xóa"
                                                cancelText="Hủy"
                                            >
                                                <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                                            </Popconfirm>
                                        </>
                                    )
                                ]}
                            >
                                {isEditing ? (
                                    <Form form={checklistEditForm} layout="vertical" style={{ flex: 1 }}>
                                        <Form.Item
                                            name="noi_dung"
                                            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                                            style={{ marginBottom: 8 }}
                                        >
                                            <Input placeholder="Nội dung checklist" />
                                        </Form.Item>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <Form.Item name="assigned_to" style={{ flex: 1, marginBottom: 0 }}>
                                                <Select
                                                    placeholder="Chọn người thực hiện"
                                                    allowClear
                                                    showSearch
                                                    optionFilterProp="label"
                                                    options={projectMembers.map(member => ({
                                                        value: member.admin_user_id,
                                                        label: member.admin_user?.name || member.user?.name || `User ${member.admin_user_id}`,
                                                    }))}
                                                />
                                            </Form.Item>
                                            <Form.Item name="mo_ta" style={{ flex: 1, marginBottom: 0 }}>
                                                <Input.TextArea
                                                    placeholder="Mô tả"
                                                    rows={1}
                                                    autoSize={{ minRows: 1, maxRows: 3 }}
                                                />
                                            </Form.Item>
                                        </div>
                                    </Form>
                                ) : (
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <Checkbox
                                                checked={item.is_completed}
                                                onChange={() => handleToggleChecklist(item.id, item.is_completed)}
                                            />
                                            <span style={{
                                                textDecoration: item.is_completed ? 'line-through' : 'none',
                                                color: item.is_completed ? '#8c8c8c' : 'inherit',
                                                flex: 1
                                            }}>
                                                {item.noi_dung}
                                            </span>
                                            {item.assigned_user ? (
                                                <Space size={8}>
                                                    <Tooltip title={item.assigned_user.name}>
                                                        <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                                                            {item.assigned_user.name?.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                    </Tooltip>
                                                    <span style={{ fontSize: 13, color: '#595959' }}>
                                                        {item.assigned_user.name}
                                                    </span>
                                                </Space>
                                            ) : (
                                                <span style={{ color: '#bfbfbf', fontSize: 12, fontStyle: 'italic' }}>
                                                    Chưa phân công
                                                </span>
                                            )}
                                        </div>
                                        {item.mo_ta && (
                                            <div style={{
                                                marginTop: 8,
                                                marginLeft: 32,
                                                fontSize: 12,
                                                color: '#8c8c8c',
                                                fontStyle: 'italic'
                                            }}>
                                                📝 {item.mo_ta}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </List.Item>
                        );
                    }}
                />

                <Divider />

                {addingChecklist ? (
                    <Form
                        form={checklistForm}
                        initialValues={{ checklists: [{}, {}, {}, {}] }}
                    >
                        <Form.List name="checklists">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <div key={field.key} style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'noi_dung']}
                                                style={{ flex: 1, marginBottom: 0 }}
                                            >
                                                <Input placeholder={`Nội dung checklist ${index + 1}`} />
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'assigned_to']}
                                                style={{ width: 200, marginBottom: 0 }}
                                            >
                                                <Select
                                                    placeholder="Người thực hiện"
                                                    allowClear
                                                    showSearch
                                                    optionFilterProp="label"
                                                    options={projectMembers.map(member => ({
                                                        value: member.admin_user_id,
                                                        label: member.admin_user?.name || member.user?.name || `User ${member.admin_user_id}`,
                                                    }))}
                                                />
                                            </Form.Item>
                                            {fields.length > 1 && (
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => remove(field.name)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    <Space style={{ marginBottom: 16 }}>
                                        <Button
                                            type="dashed"
                                            icon={<PlusOutlined />}
                                            onClick={() => add()}
                                        >
                                            Thêm checklist
                                        </Button>
                                    </Space>
                                </>
                            )}
                        </Form.List>
                        <Space>
                            <Button type="primary" icon={<CheckOutlined />} onClick={handleAddChecklist}>
                                Lưu tất cả
                            </Button>
                            <Button onClick={() => {
                                setAddingChecklist(false);
                                checklistForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form>
                ) : (
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => setChecklistModalVisible(true)} block>
                        Thêm checklist
                    </Button>
                )}
            </div>
        );
    };

    // Render quick add checklist modal
    const renderQuickAddChecklistModal = () => (
        <Modal
            title="Thêm nhanh checklist"
            open={checklistModalVisible}
            onCancel={() => {
                setChecklistModalVisible(false);
                resetChecklistForm();
            }}
            onOk={handleQuickAddChecklists}
            okText="Tạo tất cả"
            cancelText="Hủy"
            confirmLoading={checklistLoading}
            width={1000}
        >
            <Table
                dataSource={quickAddChecklists.map((item, index) => ({ ...item, key: index }))}
                pagination={false}
                bordered
                size="small"
                scroll={{ x: 'max-content' }}
            >
                <Table.Column
                    title="Nội dung"
                    dataIndex="noi_dung"
                    key="noi_dung"
                    width={250}
                    render={(text, record: any, index) => (
                        <Input
                            value={text}
                            onChange={(e) => updateQuickAddChecklist(index, 'noi_dung', e.target.value)}
                            placeholder={`Nội dung checklist ${index + 1}`}
                        />
                    )}
                />
                <Table.Column
                    title={
                        <div>
                            <div>Người thực hiện</div>
                            <Checkbox
                                checked={applyAllChecklistAssignee}
                                onChange={(e) => setApplyAllChecklistAssignee(e.target.checked)}
                            >
                                <small>Áp dụng tất cả</small>
                            </Checkbox>
                        </div>
                    }
                    dataIndex="assigned_to"
                    key="assigned_to"
                    width={180}
                    render={(value, record: any, index) => (
                        <Select
                            value={value}
                            onChange={(val) => updateQuickAddChecklist(index, 'assigned_to', val)}
                            placeholder="Chọn người"
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {projectMembers.map(member => (
                                <Select.Option key={member.admin_user_id} value={member.admin_user_id}>
                                    {member.admin_user?.name || member.user?.name}
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
                            onChange={(e) => updateQuickAddChecklist(index, 'mo_ta', e.target.value)}
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
                        quickAddChecklists.length > 1 && (
                            <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => removeQuickAddChecklistRow(index)}
                            />
                        )
                    )}
                />
            </Table>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addQuickAddChecklistRow}
                    block
                >
                    Thêm dòng mới
                </Button>
            </div>
        </Modal>
    );

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

    const renderTimeTrackingTab = () => (
        <div>
            {/* Timer Controls */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Statistic
                            title="Thời gian đang chạy"
                            value={runningTimer ? formatDuration(currentDuration) : 'Chưa bắt đầu'}
                            prefix={runningTimer ? <ClockCircleOutlined /> : null}
                        />
                    </Col>
                    <Col span={12}>
                        <Statistic
                            title="Tổng thời gian"
                            value={formatDuration(getTotalTimeLogged())}
                            prefix={<FieldTimeOutlined />}
                        />
                    </Col>
                </Row>

                <Space style={{ marginTop: 16 }}>
                    {!runningTimer ? (
                        <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={handleStartTimer}
                        >
                            Bắt đầu đếm giờ
                        </Button>
                    ) : (
                        <Button
                            danger
                            icon={<PauseCircleOutlined />}
                            onClick={handleStopTimer}
                        >
                            Dừng đếm giờ
                        </Button>
                    )}

                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setAddManualTimeModal(true);
                            manualTimeForm.resetFields();
                        }}
                    >
                        Thêm thủ công
                    </Button>
                </Space>
            </Card>

            {/* Time Logs List */}
            <List
                dataSource={task?.time_logs || task?.timeLogs || []}
                locale={{ emptyText: <Empty description="Chưa có log thời gian" /> }}
                renderItem={(log: any) => (
                    <List.Item
                        actions={[
                            <Popconfirm
                                title="Xác nhận xóa log này?"
                                onConfirm={() => handleDeleteTimeLog(log.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            </Popconfirm>,
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<ClockCircleOutlined style={{ fontSize: 24 }} />}
                            title={
                                <Space>
                                    <span>{log.user?.name || 'Unknown'}</span>
                                    <Tag color={log.is_running ? 'green' : 'blue'}>
                                        {log.is_running ? 'Đang chạy' : log.formatted_duration || formatDuration(log.duration)}
                                    </Tag>
                                </Space>
                            }
                            description={
                                <div>
                                    <div>
                                        <b>Bắt đầu:</b> {dayjs(log.started_at).format('DD/MM/YYYY HH:mm')}
                                        {log.ended_at && (
                                            <> - <b>Kết thúc:</b> {dayjs(log.ended_at).format('DD/MM/YYYY HH:mm')}</>
                                        )}
                                    </div>
                                    {log.mo_ta && <div style={{ marginTop: 4, color: '#595959' }}>{log.mo_ta}</div>}
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />

            {/* Add Manual Time Modal */}
            <Modal
                title="Thêm log thời gian thủ công"
                open={addManualTimeModal}
                onOk={handleAddManualTime}
                onCancel={() => {
                    setAddManualTimeModal(false);
                    manualTimeForm.resetFields();
                }}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form form={manualTimeForm} layout="vertical">
                    <Form.Item
                        name="started_at"
                        label="Thời gian bắt đầu"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
                    >
                        <DatePicker
                            showTime
                            format="DD/MM/YYYY HH:mm"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="ended_at"
                        label="Thời gian kết thúc"
                        rules={[
                            { required: true, message: 'Vui lòng chọn thời gian kết thúc' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || !getFieldValue('started_at')) {
                                        return Promise.resolve();
                                    }
                                    if (value.isAfter(getFieldValue('started_at'))) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Thời gian kết thúc phải sau thời gian bắt đầu'));
                                },
                            }),
                        ]}
                    >
                        <DatePicker
                            showTime
                            format="DD/MM/YYYY HH:mm"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item name="mo_ta" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Mô tả công việc đã làm..." />
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
                                    <Tag color={status.color}>{status.name}</Tag>
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
                                    <Tag color={priority.color}>{priority.name}</Tag>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span style={{ flex: 1 }}>{task?.tieu_de}</span>
                            {renderQuickEditPopover('tieu_de', 'Tiêu đề', task?.tieu_de, () => (
                                <Input placeholder="Nhập tiêu đề" />
                            ))}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <span style={{ flex: 1 }}>{task?.mo_ta || '-'}</span>
                            {renderQuickEditPopover('mo_ta', 'Mô tả', task?.mo_ta, () => (
                                <Input.TextArea rows={4} placeholder="Nhập mô tả" />
                            ))}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Tag color={task?.trang_thai?.color}>
                                {task?.trang_thai?.name}
                            </Tag>
                            {renderQuickEditPopover('trang_thai_id', 'Trạng thái', task?.trang_thai_id, () => (
                                <Select placeholder="Chọn trạng thái" style={{ width: '100%' }}>
                                    {taskStatuses.map(status => (
                                        <Option key={status.id} value={status.id}>
                                            <Tag color={status.color}>{status.name}</Tag>
                                        </Option>
                                    ))}
                                </Select>
                            ))}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ưu tiên">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Tag color={task?.uu_tien?.color}>
                                {task?.uu_tien?.name}
                            </Tag>
                            {renderQuickEditPopover('uu_tien_id', 'Ưu tiên', task?.uu_tien_id, () => (
                                <Select placeholder="Chọn độ ưu tiên" style={{ width: '100%' }}>
                                    {priorities.map(priority => (
                                        <Option key={priority.id} value={priority.id}>
                                            <Tag color={priority.color}>{priority.name}</Tag>
                                        </Option>
                                    ))}
                                </Select>
                            ))}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Người thực hiện">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span style={{ flex: 1 }}>{task?.nguoi_thuc_hien?.name || '-'}</span>
                            {renderQuickEditPopover('nguoi_thuc_hien_id', 'Người thực hiện', task?.nguoi_thuc_hien_id, () => (
                                <Select
                                    placeholder="Chọn người thực hiện"
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    style={{ width: '100%' }}
                                    options={projectMembers.map(member => ({
                                        value: member.admin_user_id,
                                        label: member.admin_user?.name || member.user?.name || `User ${member.admin_user_id}`,
                                    }))}
                                />
                            ))}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tiến độ">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                                <Progress percent={task?.tien_do || 0} />
                            </div>
                            {renderQuickEditPopover('tien_do', 'Tiến độ (%)', task?.tien_do, () => (
                                <Input type="number" min={0} max={100} placeholder="0-100" />
                            ))}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span style={{ flex: 1 }}>{task?.ngay_bat_dau ? dayjs(task.ngay_bat_dau).format('DD/MM/YYYY HH:mm') : '-'}</span>
                            {renderQuickEditPopover('ngay_bat_dau', 'Ngày bắt đầu', task?.ngay_bat_dau, () => (
                                <DatePicker
                                    showTime
                                    format="DD/MM/YYYY HH:mm"
                                    style={{ width: '100%' }}
                                    placeholder="Chọn ngày bắt đầu"
                                />
                            ))}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Deadline">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span style={{ flex: 1 }}>{task?.ngay_ket_thuc_du_kien ? dayjs(task.ngay_ket_thuc_du_kien).format('DD/MM/YYYY HH:mm') : '-'}</span>
                            {renderQuickEditPopover('ngay_ket_thuc_du_kien', 'Deadline', task?.ngay_ket_thuc_du_kien, () => (
                                <DatePicker
                                    showTime
                                    format="DD/MM/YYYY HH:mm"
                                    style={{ width: '100%' }}
                                    placeholder="Chọn deadline"
                                />
                            ))}
                        </div>
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
        {
            key: 'timeTracking',
            label: (
                <span>
                    <FieldTimeOutlined /> Time Tracking ({formatDuration(getTotalTimeLogged())})
                </span>
            ),
            children: renderTimeTrackingTab(),
        },
    ];

    return (
        <>
            <Drawer
                title={
                    <Space>
                        <span>{task?.ma_nhiem_vu}</span>
                        <Tag color={task?.trang_thai?.color}>{task?.trang_thai?.name}</Tag>
                    </Space>
                }
                width={720}
                open={visible}
                onClose={onClose}
                extra={
                    <Space>
                        <Button 
                            icon={<CalendarOutlined />} 
                            onClick={() => setAddToMeetingModalVisible(true)}
                        >
                            Thêm vào Meeting
                        </Button>
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

            {renderQuickAddChecklistModal()}

            {/* Add to Meeting Modal */}
            <Modal
                title="Thêm task vào Meeting"
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
                            placeholder="Nhập ghi chú cho task trong meeting này..."
                        />
                    </Form.Item>

                    <div style={{ padding: '12px', backgroundColor: '#f0f0f0', borderRadius: 4 }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
                            📌 <strong>Lưu ý:</strong> Nếu đã có meeting loại này trong ngày hôm nay, 
                            task sẽ được thêm vào meeting đó. Ngược lại, hệ thống sẽ tạo meeting mới.
                        </p>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default TaskDetail;
