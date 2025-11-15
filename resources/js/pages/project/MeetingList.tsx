import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Input,
    Select,
    DatePicker,
    message,
    Drawer,
    Form,
    Popconfirm,
    Descriptions,
    Divider,
    List,
    Empty,
    Modal,
    Tooltip,
    Row,
    Col,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    ProjectOutlined,
    CheckSquareOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { meetingApi, taskApi, projectApi, referenceApi } from '@/common/api/projectApi';
import TaskDetail from './TaskDetail';
import ProjectDetail from './ProjectDetail';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface Meeting {
    id: number;
    name: string;
    meeting_status_id: number;
    content: string;
    meeting_type: string;
    scheduled_at: string;
    started_at: string;
    ended_at: string;
    created_by: number;
    status: {
        id: number;
        name: string;
        color: string;
    };
    creator: {
        id: number;
        name: string;
    };
    tasks: any[];
    projects: any[];
}

const MeetingList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    // Filters
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState<number | undefined>();
    const [filterType, setFilterType] = useState<string | undefined>();
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    // Reference data
    const [meetingStatuses, setMeetingStatuses] = useState<any[]>([]);
    const [taskStatuses, setTaskStatuses] = useState<any[]>([]);
    const [priorities, setPriorities] = useState<any[]>([]);
    const [projectStatuses, setProjectStatuses] = useState<any[]>([]);
    const [projectMembers, setProjectMembers] = useState<any[]>([]);
    const [allProjects, setAllProjects] = useState<any[]>([]);
    const [allTasks, setAllTasks] = useState<any[]>([]);

    // Drawers & Modals
    const [meetingDetailVisible, setMeetingDetailVisible] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);

    // Task/Project detail drawers
    const [taskDetailVisible, setTaskDetailVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [projectDetailVisible, setProjectDetailVisible] = useState(false);
    const [projectDetailData, setProjectDetailData] = useState<any>(null);

    // Content editor modal
    const [contentEditorVisible, setContentEditorVisible] = useState(false);
    const [editingMeetingId, setEditingMeetingId] = useState<number | null>(null);
    const [editorContent, setEditorContent] = useState('');
    const editorRef = useRef<any>(null);

    // Selected items for adding to meeting
    const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
    const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);

    const [form] = Form.useForm();
    const [quickEditForm] = Form.useForm();

    useEffect(() => {
        loadMeetings();
        loadReferenceData();
    }, [pagination.current, pagination.pageSize, searchText, filterStatus, filterType, dateRange]);

    const loadReferenceData = async () => {
        try {
            const [statusesRes, taskStatusesRes, prioritiesRes, projectsRes, tasksRes, projectStatusesRes] = await Promise.all([
                meetingApi.getStatuses(),
                referenceApi.getTaskStatuses(),
                referenceApi.getPriorities(),
                projectApi.getList({ per_page: 1000 }), // Load all projects
                taskApi.getList({ per_page: 1000 }), // Load all tasks
                referenceApi.getProjectStatuses(),
            ]);

            if (statusesRes.data.success) setMeetingStatuses(statusesRes.data.data);
            if (taskStatusesRes.data.success) setTaskStatuses(taskStatusesRes.data.data);
            if (prioritiesRes.data.success) setPriorities(prioritiesRes.data.data);
            if (projectStatusesRes.data.success) setProjectStatuses(projectStatusesRes.data.data);

            // Handle projects data (could be paginated)
            if (projectsRes.data.success) {
                const projectData = projectsRes.data.data;
                setAllProjects(Array.isArray(projectData) ? projectData : projectData.data || []);
            }

            // Handle tasks data (could be paginated)
            if (tasksRes.data.success) {
                const taskData = tasksRes.data.data;
                setAllTasks(Array.isArray(taskData) ? taskData : taskData.data || []);
            }
        } catch (error) {
            console.error('Error loading reference data:', error);
        }
    };

    const loadMeetings = async () => {
        setLoading(true);
        try {
            const params: any = {
                page: pagination.current,
                per_page: pagination.pageSize,
            };

            if (searchText) params.search = searchText;
            if (filterStatus) params.meeting_status_id = filterStatus;
            if (filterType) params.meeting_type = filterType;
            if (dateRange) {
                params.from_date = dateRange[0].format('YYYY-MM-DD');
                params.to_date = dateRange[1].format('YYYY-MM-DD');
            }

            const response = await meetingApi.getList(params);

            if (response.data.success) {
                setMeetings(response.data.data);
                setPagination({
                    ...pagination,
                    total: response.data.total,
                });
            }
        } catch (error: any) {
            message.error('Không thể tải danh sách meeting');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMeeting = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                scheduled_at: values.scheduled_at?.format('YYYY-MM-DD HH:mm:ss'),
            };

            const response = await meetingApi.create(payload);

            if (response.data.success) {
                message.success('Tạo meeting thành công');
                setAddModalVisible(false);
                form.resetFields();
                loadMeetings();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleQuickUpdate = async (meetingId: number, field: string, value: any) => {
        try {
            const response = await meetingApi.quickUpdate(meetingId, field, value);

            if (response.data.success) {
                message.success('Cập nhật thành công');

                // Update meeting in list
                setMeetings(prev => prev.map(m =>
                    m.id === meetingId ? response.data.data : m
                ));

                // Update selected meeting if open
                if (selectedMeeting && selectedMeeting.id === meetingId) {
                    setSelectedMeeting(response.data.data);
                }
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleUpdateProjectStatus = async (projectId: number, value: any) => {
        try {
            const response = await projectApi.update(projectId, { trang_thai_id: value });
            if (response.data.success) {
                message.success('Cập nhật trạng thái project thành công');

                // Update selectedMeeting.projects if open
                if (selectedMeeting) {
                    setSelectedMeeting(prev => {
                        if (!prev) return prev;
                        const updated = { ...prev } as any;
                        updated.projects = updated.projects.map((p: any) => p.id === projectId ? response.data.data : p);
                        return updated;
                    });
                }

                // Update meetings list project entries if present
                setMeetings(prev => prev.map(m => ({
                    ...m,
                    projects: m.projects?.map((p: any) => p.id === projectId ? response.data.data : p)
                })));
            }
        } catch (error: any) {
            message.error('Không thể cập nhật trạng thái project');
        }
    };

    const handleQuickUpdateProject = async (projectId: number, field: string, value: any) => {
        try {
            const payload: any = {};

            // Format date fields
            if (field === 'ngay_bat_dau' || field === 'ngay_ket_thuc_du_kien') {
                payload[field] = value?.format('YYYY-MM-DD');
            } else {
                payload[field] = value;
            }

            const response = await projectApi.update(projectId, payload);

            if (response.data.success) {
                message.success('Cập nhật project thành công');

                // Update projectDetailData if it's the current project
                if (projectDetailData && projectDetailData.id === projectId) {
                    setProjectDetailData(response.data.data);
                }

                // Update selectedMeeting.projects if open
                if (selectedMeeting) {
                    setSelectedMeeting(prev => {
                        if (!prev) return prev;
                        const updated = { ...prev } as any;
                        updated.projects = updated.projects.map((p: any) =>
                            p.id === projectId ? response.data.data : p
                        );
                        return updated;
                    });
                }

                // Update meetings list project entries if present
                setMeetings(prev => prev.map(m => ({
                    ...m,
                    projects: m.projects?.map((p: any) => p.id === projectId ? response.data.data : p)
                })));
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteMeeting = async () => {
        if (!selectedMeeting) return;

        try {
            const response = await meetingApi.delete(selectedMeeting.id);

            if (response.data.success) {
                message.success('Xóa meeting thành công');
                setMeetingDetailVisible(false);
                setSelectedMeeting(null);
                loadMeetings();
            }
        } catch (error: any) {
            message.error('Có lỗi xảy ra khi xóa meeting');
        }
    };

    const openContentEditor = (meeting: Meeting) => {
        setEditingMeetingId(meeting.id);
        setEditorContent(meeting.content || '');
        setContentEditorVisible(true);
    };

    const handleSaveContent = async () => {
        if (!editingMeetingId) return;

        try {
            const content = editorRef.current ? editorRef.current.getContents(false) : editorContent;

            const response = await meetingApi.quickUpdate(editingMeetingId, 'content', content);

            if (response.data.success) {
                message.success('Cập nhật nội dung thành công');

                // Update meeting in list
                setMeetings(prev => prev.map(m =>
                    m.id === editingMeetingId ? response.data.data : m
                ));

                // Update selected meeting if open
                if (selectedMeeting && selectedMeeting.id === editingMeetingId) {
                    setSelectedMeeting(response.data.data);
                }

                setContentEditorVisible(false);
                setEditingMeetingId(null);
                setEditorContent('');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleAddTasksToMeeting = async () => {
        if (!selectedMeeting || selectedTaskIds.length === 0) {
            message.warning('Vui lòng chọn ít nhất 1 task');
            return;
        }

        try {
            const response = await meetingApi.update(selectedMeeting.id, {
                task_ids: [...(selectedMeeting.tasks?.map((t: any) => t.id) || []), ...selectedTaskIds]
            });

            if (response.data.success) {
                message.success(`Đã thêm ${selectedTaskIds.length} task vào meeting`);
                setSelectedTaskIds([]);
                
                // Reload meeting detail
                const detailRes = await meetingApi.getById(selectedMeeting.id);
                if (detailRes.data.success) {
                    setSelectedMeeting(detailRes.data.data);
                }
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleRemoveTaskFromMeeting = async (taskId: number) => {
        if (!selectedMeeting) return;

        try {
            const updatedTaskIds = selectedMeeting.tasks
                ?.filter((t: any) => t.id !== taskId)
                .map((t: any) => t.id) || [];

            const response = await meetingApi.update(selectedMeeting.id, {
                task_ids: updatedTaskIds
            });

            if (response.data.success) {
                message.success('Đã xóa task khỏi meeting');
                
                // Reload meeting detail
                const detailRes = await meetingApi.getById(selectedMeeting.id);
                if (detailRes.data.success) {
                    setSelectedMeeting(detailRes.data.data);
                }
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleAddProjectsToMeeting = async () => {
        if (!selectedMeeting || selectedProjectIds.length === 0) {
            message.warning('Vui lòng chọn ít nhất 1 project');
            return;
        }

        try {
            const response = await meetingApi.update(selectedMeeting.id, {
                project_ids: [...(selectedMeeting.projects?.map((p: any) => p.id) || []), ...selectedProjectIds]
            });

            if (response.data.success) {
                message.success(`Đã thêm ${selectedProjectIds.length} project vào meeting`);
                setSelectedProjectIds([]);
                
                // Reload meeting detail
                const detailRes = await meetingApi.getById(selectedMeeting.id);
                if (detailRes.data.success) {
                    setSelectedMeeting(detailRes.data.data);
                }
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleRemoveProjectFromMeeting = async (projectId: number) => {
        if (!selectedMeeting) return;

        try {
            const updatedProjectIds = selectedMeeting.projects
                ?.filter((p: any) => p.id !== projectId)
                .map((p: any) => p.id) || [];

            const response = await meetingApi.update(selectedMeeting.id, {
                project_ids: updatedProjectIds
            });

            if (response.data.success) {
                message.success('Đã xóa project khỏi meeting');
                
                // Reload meeting detail
                const detailRes = await meetingApi.getById(selectedMeeting.id);
                if (detailRes.data.success) {
                    setSelectedMeeting(detailRes.data.data);
                }
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const showMeetingDetail = async (meeting: Meeting) => {
        try {
            const response = await meetingApi.getById(meeting.id);
            if (response.data.success) {
                setSelectedMeeting(response.data.data);
                setMeetingDetailVisible(true);
            }
        } catch (error: any) {
            message.error('Không thể tải chi tiết meeting');
        }
    };

    const showTaskDetail = (taskId: number, projectId: number) => {
        // If projectId is not provided, fetch task details to determine project
        const openTask = async () => {
            try {
                if (!projectId) {
                    const resp = await taskApi.getById(taskId);
                    if (resp.data.success) {
                        const task = resp.data.data;
                        setSelectedTaskId(taskId);
                        setSelectedProjectId(task.project?.id || null);
                        setTaskDetailVisible(true);
                        return;
                    }
                }

                setSelectedTaskId(taskId);
                setSelectedProjectId(projectId || null);
                setTaskDetailVisible(true);
            } catch (error) {
                message.error('Không thể tải chi tiết task');
            }
        };

        void openTask();
    };

    const showProjectDetail = async (projectId: number) => {
        try {
            const response = await projectApi.getById(projectId);
            if (response.data.success) {
                setProjectDetailData(response.data.data);
                setProjectDetailVisible(true);
            }
        } catch (error: any) {
            message.error('Không thể tải chi tiết project');
        }
    };

    const renderQuickEdit = (meeting: Meeting, field: string, label: string, currentValue: any, renderInput: () => React.ReactNode) => (
        <Popconfirm
            title={`Sửa ${label}`}
            description={
                <div style={{ width: 300 }}>
                    <Form form={quickEditForm} layout="vertical">
                        <Form.Item name={field} label={label} style={{ marginBottom: 0 }}>
                            {renderInput()}
                        </Form.Item>
                    </Form>
                </div>
            }
            onConfirm={async () => {
                const values = await quickEditForm.validateFields();
                let value = values[field];

                if (field === 'scheduled_at' && value) {
                    value = value.format('YYYY-MM-DD HH:mm:ss');
                }

                await handleQuickUpdate(meeting.id, field, value);
                quickEditForm.resetFields();
            }}
            onCancel={() => quickEditForm.resetFields()}
            okText="Lưu"
            cancelText="Hủy"
            icon={<EditOutlined />}
        >
            <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                    if (field === 'scheduled_at' && currentValue) {
                        quickEditForm.setFieldsValue({ [field]: dayjs(currentValue) });
                    } else {
                        quickEditForm.setFieldsValue({ [field]: currentValue });
                    }
                }}
                style={{ color: '#1890ff' }}
            />
        </Popconfirm>
    );

    const renderQuickEditProject = (field: string, label: string, currentValue: any, renderInput: () => React.ReactNode) => (
        <Popconfirm
            title={`Sửa ${label}`}
            description={
                <div style={{ width: 300 }}>
                    <Form form={quickEditForm} layout="vertical">
                        <Form.Item name={field} label={label} style={{ marginBottom: 0 }}>
                            {renderInput()}
                        </Form.Item>
                    </Form>
                </div>
            }
            onConfirm={async () => {
                if (!projectDetailData) return;

                const values = await quickEditForm.validateFields();
                let value = values[field];

                await handleQuickUpdateProject(projectDetailData.id, field, value);
                quickEditForm.resetFields();
            }}
            onCancel={() => quickEditForm.resetFields()}
            okText="Lưu"
            cancelText="Hủy"
            icon={<EditOutlined />}
        >
            <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                    if ((field === 'ngay_bat_dau' || field === 'ngay_ket_thuc_du_kien') && currentValue) {
                        quickEditForm.setFieldsValue({ [field]: dayjs(currentValue) });
                    } else {
                        quickEditForm.setFieldsValue({ [field]: currentValue });
                    }
                }}
                style={{ color: '#1890ff' }}
            />
        </Popconfirm>
    );

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            render: (text: string, record: Meeting) => (
                <a onClick={() => showMeetingDetail(record)}>{text}</a>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'meeting_type',
            key: 'meeting_type',
            width: 120,
            render: (type: string) => {
                const typeMap: any = {
                    daily: { text: 'Daily', color: 'blue' },
                    weekly: { text: 'Weekly', color: 'green' },
                    monthly: { text: 'Monthly', color: 'orange' },
                    yearly: { text: 'Yearly', color: 'purple' },
                };
                return <Tag color={typeMap[type]?.color}>{typeMap[type]?.text}</Tag>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status: any) => (
                <Tag color={status?.color}>{status?.name}</Tag>
            ),
        },
        {
            title: 'Thời gian',
            dataIndex: 'scheduled_at',
            key: 'scheduled_at',
            width: 180,
            render: (date: string) => (
                <span>{date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'}</span>
            ),
        },
        {
            title: 'Tasks',
            dataIndex: 'tasks',
            key: 'tasks',
            width: 100,
            render: (tasks: any[]) => (
                <Tag color="blue">{tasks?.length || 0} tasks</Tag>
            ),
        },
        {
            title: 'Projects',
            dataIndex: 'projects',
            key: 'projects',
            width: 100,
            render: (projects: any[]) => (
                <Tag color="green">{projects?.length || 0} projects</Tag>
            ),
        },
        {
            title: 'Người tạo',
            dataIndex: 'creator',
            key: 'creator',
            width: 150,
            render: (creator: any) => creator?.name || '-',
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Quản lý Meeting"
                extra={
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadMeetings}
                        >
                            Làm mới
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setAddModalVisible(true)}
                        >
                            Tạo meeting
                        </Button>
                    </Space>
                }
            >
                {/* Filters */}
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Input
                            placeholder="Tìm kiếm..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Select
                            placeholder="Trạng thái"
                            value={filterStatus}
                            onChange={setFilterStatus}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {meetingStatuses.map(s => (
                                <Select.Option key={s.id} value={s.id}>
                                    <Tag color={s.color}>{s.name}</Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Select
                            placeholder="Loại meeting"
                            value={filterType}
                            onChange={setFilterType}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="daily">Daily</Select.Option>
                            <Select.Option value="weekly">Weekly</Select.Option>
                            <Select.Option value="monthly">Monthly</Select.Option>
                            <Select.Option value="yearly">Yearly</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                            format="DD/MM/YYYY"
                            style={{ width: '100%' }}
                        />
                    </Col>
                </Row>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={meetings}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} meeting`,
                        onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize });
                        },
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Meeting Detail Drawer */}
            <Drawer
                title="Chi tiết cuộc họp"
                placement="right"
                width={'90%'}
                onClose={() => {
                    setMeetingDetailVisible(false);
                    setSelectedMeeting(null);
                }}
                open={meetingDetailVisible}
                extra={
                    <Popconfirm
                        title="Xác nhận xóa meeting này?"
                        description="Hành động này không thể hoàn tác!"
                        onConfirm={handleDeleteMeeting}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa Meeting
                        </Button>
                    </Popconfirm>
                }
            >
                {selectedMeeting && (
                    <div>
                        <Row>
                            <Col span={12}>

                                {/* Tasks trong meeting */}
                                <Divider>
                                    Tasks trong meeting
                                    <span> | </span>
                                    <Popconfirm
                                        title="Thêm tasks vào meeting"
                                        description={
                                            <div style={{ width: 400 }}>
                                                <Select
                                                    mode="multiple"
                                                    placeholder="Chọn tasks"
                                                    style={{ width: '100%' }}
                                                    value={selectedTaskIds}
                                                    onChange={setSelectedTaskIds}
                                                    showSearch
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                    options={allTasks
                                                        .filter(task => !selectedMeeting?.tasks?.some((t: any) => t.id === task.id))
                                                        .map(task => ({
                                                            value: task.id,
                                                            label: `${task.ma_nhiem_vu || task.id} - ${task.tieu_de}`,
                                                        }))}
                                                />
                                            </div>
                                        }
                                        onConfirm={handleAddTasksToMeeting}
                                        onCancel={() => setSelectedTaskIds([])}
                                        okText="Thêm"
                                        cancelText="Hủy"
                                        icon={<PlusOutlined />}
                                    >
                                        <Button 
                                            type="text" 
                                            size="small" 
                                            icon={<PlusOutlined />} 
                                            style={{ color: '#52c41a' }}
                                        />
                                    </Popconfirm>
                                </Divider>

                                {selectedMeeting.tasks && selectedMeeting.tasks.length > 0 ? (
                                    <List
                                        dataSource={selectedMeeting.tasks}
                                        renderItem={(task: any) => (
                                            <List.Item
                                                actions={[
                                                    <Button
                                                        type="link"
                                                        size="small"
                                                        icon={<CheckSquareOutlined />}
                                                        onClick={() => showTaskDetail(task.id, task.project?.id)}
                                                    >
                                                        Chi tiết
                                                    </Button>,
                                                    <Popconfirm
                                                        title="Xóa task khỏi meeting?"
                                                        description="Task sẽ bị xóa khỏi meeting này"
                                                        onConfirm={() => handleRemoveTaskFromMeeting(task.id)}
                                                        okText="Xóa"
                                                        cancelText="Hủy"
                                                        okButtonProps={{ danger: true }}
                                                    >
                                                        <Button
                                                            type="link"
                                                            size="small"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                        >
                                                            Xóa
                                                        </Button>
                                                    </Popconfirm>
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    title={
                                                        <div>
                                                            {task.trang_thai && (
                                                                <Tag color={task.trang_thai.color}>{task.trang_thai.name}</Tag>
                                                            )}
                                                            <span>{task.tieu_de}</span>
                                                        </div>
                                                    }
                                                    description={
                                                        <div>
                                                            <div>Project: {task.project?.ten_du_an}</div>
                                                            {task.nguoi_thuc_hien && <div>Người làm: {task.nguoi_thuc_hien.name}</div>}
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Empty 
                                        description="Chưa có task"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    >
                                        <Popconfirm
                                            title="Thêm tasks vào meeting"
                                            description={
                                                <div style={{ width: 400 }}>
                                                    <Select
                                                        mode="multiple"
                                                        placeholder="Chọn tasks"
                                                        style={{ width: '100%' }}
                                                        value={selectedTaskIds}
                                                        onChange={setSelectedTaskIds}
                                                        showSearch
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) =>
                                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                        }
                                                        options={allTasks.map(task => ({
                                                            value: task.id,
                                                            label: `${task.ma_nhiem_vu || task.id} - ${task.tieu_de}`,
                                                        }))}
                                                    />
                                                </div>
                                            }
                                            onConfirm={handleAddTasksToMeeting}
                                            onCancel={() => setSelectedTaskIds([])}
                                            okText="Thêm"
                                            cancelText="Hủy"
                                            icon={<PlusOutlined />}
                                        >
                                            <Button 
                                                type="primary" 
                                                icon={<PlusOutlined />}
                                            >
                                                Thêm Task
                                            </Button>
                                        </Popconfirm>
                                    </Empty>
                                )}

                                {/* Projects trong meeting */}
                                <Divider>
                                    Projects trong meeting
                                    <span> | </span>
                                    <Popconfirm
                                        title="Thêm projects vào meeting"
                                        description={
                                            <div style={{ width: 400 }}>
                                                <Select
                                                    mode="multiple"
                                                    placeholder="Chọn projects"
                                                    style={{ width: '100%' }}
                                                    value={selectedProjectIds}
                                                    onChange={setSelectedProjectIds}
                                                    showSearch
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                    options={allProjects
                                                        .filter(project => !selectedMeeting?.projects?.some((p: any) => p.id === project.id))
                                                        .map(project => ({
                                                            value: project.id,
                                                            label: `${project.ma_du_an} - ${project.ten_du_an}`,
                                                        }))}
                                                />
                                            </div>
                                        }
                                        onConfirm={handleAddProjectsToMeeting}
                                        onCancel={() => setSelectedProjectIds([])}
                                        okText="Thêm"
                                        cancelText="Hủy"
                                        icon={<PlusOutlined />}
                                    >
                                        <Button 
                                            type="text" 
                                            size="small" 
                                            icon={<PlusOutlined />} 
                                            style={{ color: '#52c41a' }}
                                        />
                                    </Popconfirm>
                                </Divider>

                                {selectedMeeting.projects && selectedMeeting.projects.length > 0 ? (
                                    <List
                                        dataSource={selectedMeeting.projects}
                                        renderItem={(project: any) => (
                                            <List.Item
                                                actions={[
                                                    <Button
                                                        type="link"
                                                        size="small"
                                                        icon={<ProjectOutlined />}
                                                        onClick={() => showProjectDetail(project.id)}
                                                    >
                                                        Chi tiết
                                                    </Button>,
                                                    <Popconfirm
                                                        title="Xóa project khỏi meeting?"
                                                        description="Project sẽ bị xóa khỏi meeting này"
                                                        onConfirm={() => handleRemoveProjectFromMeeting(project.id)}
                                                        okText="Xóa"
                                                        cancelText="Hủy"
                                                        okButtonProps={{ danger: true }}
                                                    >
                                                        <Button
                                                            type="link"
                                                            size="small"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                        >
                                                            Xóa
                                                        </Button>
                                                    </Popconfirm>
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    title={
                                                        <div>

                                                            <Popconfirm
                                                                title="Sửa trạng thái project"
                                                                description={
                                                                    <div style={{ width: 200 }}>
                                                                        <Form form={quickEditForm} layout="vertical">
                                                                            <Form.Item
                                                                                name="project_status"
                                                                                label="Trạng thái"
                                                                                style={{ marginBottom: 0 }}
                                                                            >
                                                                                <Select placeholder="Chọn trạng thái" style={{ width: '100%' }}>
                                                                                    {projectStatuses.map((s: any) => (
                                                                                        <Select.Option key={s.id} value={s.id}>
                                                                                            <Tag color={s.color}>{s.name}</Tag>
                                                                                        </Select.Option>
                                                                                    ))}
                                                                                </Select>
                                                                            </Form.Item>
                                                                        </Form>
                                                                    </div>
                                                                }
                                                                onConfirm={async () => {
                                                                    const values = await quickEditForm.validateFields();
                                                                    await handleUpdateProjectStatus(project.id, values.project_status);
                                                                    quickEditForm.resetFields();
                                                                }}
                                                                onCancel={() => quickEditForm.resetFields()}
                                                                okText="Lưu"
                                                                cancelText="Hủy"
                                                                icon={<EditOutlined />}
                                                            >
                                                                {project.trang_thai && (
                                                                    <Tag className="_cursor" color={project.trang_thai.color}>{project.trang_thai.name}</Tag>
                                                                )}
                                                            </Popconfirm>

                                                            {/* Tên dự án */}
                                                            <span>{project.ten_du_an}</span>

                                                        </div>
                                                    }
                                                    description={project.mo_ta}
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Empty 
                                        description="Chưa có project"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    >
                                        <Popconfirm
                                            title="Thêm projects vào meeting"
                                            description={
                                                <div style={{ width: 400 }}>
                                                    <Select
                                                        mode="multiple"
                                                        placeholder="Chọn projects"
                                                        style={{ width: '100%' }}
                                                        value={selectedProjectIds}
                                                        onChange={setSelectedProjectIds}
                                                        showSearch
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) =>
                                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                        }
                                                        options={allProjects.map(project => ({
                                                            value: project.id,
                                                            label: `${project.ma_du_an} - ${project.ten_du_an}`,
                                                        }))}
                                                    />
                                                </div>
                                            }
                                            onConfirm={handleAddProjectsToMeeting}
                                            onCancel={() => setSelectedProjectIds([])}
                                            okText="Thêm"
                                            cancelText="Hủy"
                                            icon={<PlusOutlined />}
                                        >
                                            <Button 
                                                type="primary" 
                                                icon={<PlusOutlined />}
                                            >
                                                Thêm Project
                                            </Button>
                                        </Popconfirm>
                                    </Empty>
                                )}

                            </Col>
                            <Col span={12} style={{ paddingLeft: 24, borderLeft: '1px solid #f0f0f0' }}>
                                {/* Thông tin cơ bản */}
                                <Divider>Thông tin cuộc họp</Divider>
                                <Descriptions bordered column={1}>
                                    <Descriptions.Item label="Tiêu đề">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ flex: 1 }}>{selectedMeeting.name}</span>
                                            {renderQuickEdit(
                                                selectedMeeting,
                                                'name',
                                                'Tiêu đề',
                                                selectedMeeting.name,
                                                () => <Input placeholder="Nhập tiêu đề" />
                                            )}
                                        </div>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Tag color={selectedMeeting.status?.color} style={{ flex: 1 }}>
                                                {selectedMeeting.status?.name}
                                            </Tag>
                                            {renderQuickEdit(
                                                selectedMeeting,
                                                'meeting_status_id',
                                                'Trạng thái',
                                                selectedMeeting.meeting_status_id,
                                                () => (
                                                    <Select placeholder="Chọn trạng thái" style={{ width: '100%' }}>
                                                        {meetingStatuses.map(s => (
                                                            <Select.Option key={s.id} value={s.id}>
                                                                <Tag color={s.color}>{s.name}</Tag>
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                )
                                            )}
                                        </div>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Loại">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ flex: 1 }}>{selectedMeeting.meeting_type}</span>
                                            {renderQuickEdit(
                                                selectedMeeting,
                                                'meeting_type',
                                                'Loại meeting',
                                                selectedMeeting.meeting_type,
                                                () => (
                                                    <Select placeholder="Chọn loại" style={{ width: '100%' }}>
                                                        <Select.Option value="daily">Daily</Select.Option>
                                                        <Select.Option value="weekly">Weekly</Select.Option>
                                                        <Select.Option value="monthly">Monthly</Select.Option>
                                                        <Select.Option value="yearly">Yearly</Select.Option>
                                                    </Select>
                                                )
                                            )}
                                        </div>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Thời gian dự kiến">
                                        {selectedMeeting.scheduled_at ? dayjs(selectedMeeting.scheduled_at).format('DD/MM/YYYY HH:mm') : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Người tạo">
                                        {selectedMeeting.creator?.name || '-'}
                                    </Descriptions.Item>
                                </Descriptions>

                                {/* Nội dung chi tiết */}
                                <div>
                                    <br />
                                    <Divider>
                                        Nội dung chi tiết
                                        <span> | </span>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={() => openContentEditor(selectedMeeting)}
                                            style={{ color: '#1890ff' }}
                                        />
                                    </Divider>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div
                                            style={{ flex: 1, whiteSpace: 'pre-wrap' }}
                                            dangerouslySetInnerHTML={{ __html: selectedMeeting.content || '-' }}
                                        />
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
            </Drawer>

            {/* Content Editor Modal */}
            <Modal
                title="Chỉnh sửa nội dung Meeting"
                open={contentEditorVisible}
                onOk={handleSaveContent}
                onCancel={() => {
                    setContentEditorVisible(false);
                    setEditingMeetingId(null);
                    setEditorContent('');
                }}
                width={900}
                okText="Lưu"
                cancelText="Hủy"
            >
                <SunEditor
                    getSunEditorInstance={(sunEditor) => {
                        editorRef.current = sunEditor;
                    }}
                    setContents={editorContent}
                    setOptions={{
                        buttonList: [
                            ['undo', 'redo'],
                            ['font', 'fontSize', 'formatBlock'],
                            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                            ['fontColor', 'hiliteColor'],
                            ['removeFormat'],
                            ['outdent', 'indent'],
                            ['align', 'horizontalRule', 'list', 'lineHeight'],
                            ['table', 'link', 'image'],
                            ['fullScreen', 'showBlocks', 'codeView'],
                        ],
                        defaultTag: 'div',
                        minHeight: '300px',
                        showPathLabel: false,
                    }}
                    height="400px"
                />
            </Modal>

            {/* Add Meeting Modal */}
            <Modal
                title="Tạo meeting mới"
                open={addModalVisible}
                onOk={handleAddMeeting}
                onCancel={() => {
                    setAddModalVisible(false);
                    form.resetFields();
                }}
                okText="Tạo"
                cancelText="Hủy"
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input placeholder="Nhập tiêu đề meeting" />
                    </Form.Item>

                    <Form.Item
                        name="meeting_type"
                        label="Loại meeting"
                        rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
                    >
                        <Select placeholder="Chọn loại meeting">
                            <Select.Option value="daily">Daily</Select.Option>
                            <Select.Option value="weekly">Weekly</Select.Option>
                            <Select.Option value="monthly">Monthly</Select.Option>
                            <Select.Option value="yearly">Yearly</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="meeting_status_id"
                        label="Trạng thái"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            {meetingStatuses.map(s => (
                                <Select.Option key={s.id} value={s.id}>
                                    <Tag color={s.color}>{s.name}</Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="scheduled_at" label="Thời gian dự kiến">
                        <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="content" label="Nội dung">
                        <TextArea rows={4} placeholder="Nhập nội dung meeting" />
                    </Form.Item>

                    <Form.Item name="project_ids" label="Chọn Projects">
                        <Select
                            mode="multiple"
                            placeholder="Chọn các projects cần thêm vào meeting"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={allProjects.map(project => ({
                                value: project.id,
                                label: `${project.ma_du_an} - ${project.ten_du_an}`,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item name="task_ids" label="Chọn Tasks">
                        <Select
                            mode="multiple"
                            placeholder="Chọn các tasks cần thêm vào meeting"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={allTasks.map(task => ({
                                value: task.id,
                                label: `${task.ma_nhiem_vu || task.id} - ${task.tieu_de}`,
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Task Detail Drawer */}
            {selectedTaskId && (
                <TaskDetail
                    taskId={selectedTaskId}
                    projectId={selectedProjectId}
                    visible={taskDetailVisible}
                    onClose={() => {
                        setTaskDetailVisible(false);
                        setSelectedTaskId(null);
                        setSelectedProjectId(null);
                    }}
                />
            )}

            {/* Project Detail Drawer */}
            <Drawer
                title="Chi tiết Project"
                placement="right"
                width={720}
                onClose={() => {
                    setProjectDetailVisible(false);
                    setProjectDetailData(null);
                }}
                open={projectDetailVisible}
            >
                {projectDetailData && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Tên dự án">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ flex: 1 }}>{projectDetailData.ten_du_an}</span>
                                {renderQuickEditProject(
                                    'ten_du_an',
                                    'Tên dự án',
                                    projectDetailData.ten_du_an,
                                    () => <Input placeholder="Nhập tên dự án" />
                                )}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mã dự án">{projectDetailData.ma_du_an}</Descriptions.Item>
                        <Descriptions.Item label="Mô tả">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ flex: 1, whiteSpace: 'pre-wrap' }}>{projectDetailData.mo_ta || '-'}</span>
                                {renderQuickEditProject(
                                    'mo_ta',
                                    'Mô tả',
                                    projectDetailData.mo_ta,
                                    () => <TextArea rows={4} placeholder="Nhập mô tả" />
                                )}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {projectDetailData.trang_thai && (
                                    <Tag color={projectDetailData.trang_thai.color} style={{ flex: 1 }}>
                                        {projectDetailData.trang_thai.name}
                                    </Tag>
                                )}
                                {renderQuickEditProject(
                                    'trang_thai_id',
                                    'Trạng thái',
                                    projectDetailData.trang_thai?.id,
                                    () => (
                                        <Select placeholder="Chọn trạng thái" style={{ width: '100%' }}>
                                            {projectStatuses.map((s: any) => (
                                                <Select.Option key={s.id} value={s.id}>
                                                    <Tag color={s.color}>{s.name}</Tag>
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    )
                                )}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày bắt đầu">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ flex: 1 }}>
                                    {projectDetailData.ngay_bat_dau ? dayjs(projectDetailData.ngay_bat_dau).format('DD/MM/YYYY') : '-'}
                                </span>
                                {renderQuickEditProject(
                                    'ngay_bat_dau',
                                    'Ngày bắt đầu',
                                    projectDetailData.ngay_bat_dau,
                                    () => <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày bắt đầu" />
                                )}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày kết thúc">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ flex: 1 }}>
                                    {projectDetailData.ngay_ket_thuc_du_kien ? dayjs(projectDetailData.ngay_ket_thuc_du_kien).format('DD/MM/YYYY') : '-'}
                                </span>
                                {renderQuickEditProject(
                                    'ngay_ket_thuc_du_kien',
                                    'Ngày kết thúc',
                                    projectDetailData.ngay_ket_thuc_du_kien,
                                    () => <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày kết thúc" />
                                )}
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    );
};

export default MeetingList;
