import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Select, DatePicker, Drawer, Form, message, Popconfirm, Avatar, Tooltip, Progress } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { taskApi, referenceApi, projectApi } from '../../common/api/projectApi';
import { Task, TaskStatusType, PriorityType, TaskFormData, ProjectMember } from '../../types/project';
import TaskDetail from './TaskDetail';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const TaskList: React.FC = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const [taskStatuses, setTaskStatuses] = useState<TaskStatusType[]>([]);
    const [priorities, setPriorities] = useState<PriorityType[]>([]);
    const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const [detailVisible, setDetailVisible] = useState(false);
    const [detailTaskId, setDetailTaskId] = useState<number | null>(null);

    const [filters, setFilters] = useState<{
        search?: string;
        trang_thai_id?: number[];
        uu_tien_id?: number[];
        nguoi_thuc_hien_id?: number;
        ngay_bat_dau?: [string, string];
    }>({});

    useEffect(() => {
        loadReferenceData();
    }, []);

    useEffect(() => {
        if (projectId) {
            loadTasks();
            loadProjectMembers();
        }
    }, [projectId, current, pageSize, filters]);

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
        if (!projectId) return;

        try {
            const response = await projectApi.getById(Number(projectId));
            if (response.data.success) {
                setProjectMembers(response.data.data.members || []);
            }
        } catch (error) {
            console.error('Error loading project members:', error);
        }
    };

    const loadTasks = async () => {
        if (!projectId) return;

        setLoading(true);
        try {
            const params: any = {
                project_id: Number(projectId),
                page: current,
                per_page: pageSize,
                ...filters,
            };

            if (filters.ngay_bat_dau) {
                params.ngay_bat_dau_tu = filters.ngay_bat_dau[0];
                params.ngay_bat_dau_den = filters.ngay_bat_dau[1];
            }

            const response = await taskApi.getList(params);

            if (response.data.success) {
                setTasks(response.data.data.data);
                setTotal(response.data.data.total);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tải danh sách nhiệm vụ');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrent(1);
    };

    const handleCreate = () => {
        setSelectedTask(null);
        form.resetFields();
        form.setFieldsValue({
            project_id: Number(projectId),
            uu_tien_id: 2,
        });
        setDrawerVisible(true);
    };

    const handleEdit = (task: Task) => {
        setSelectedTask(task);
        form.setFieldsValue({
            ...task,
            ngay_bat_dau: task.ngay_bat_dau ? dayjs(task.ngay_bat_dau) : null,
            ngay_ket_thuc_du_kien: task.ngay_ket_thuc_du_kien ? dayjs(task.ngay_ket_thuc_du_kien) : null,
            ngay_ket_thuc_thuc_te: task.ngay_ket_thuc_thuc_te ? dayjs(task.ngay_ket_thuc_thuc_te) : null,
        });
        setDrawerVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await taskApi.delete(id);

            if (response.data.success) {
                message.success('Xóa nhiệm vụ thành công');
                loadTasks();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload: TaskFormData = {
                ...values,
                project_id: Number(projectId),
                ngay_bat_dau: values.ngay_bat_dau?.format('YYYY-MM-DD HH:mm:ss'),
                ngay_ket_thuc_du_kien: values.ngay_ket_thuc_du_kien?.format('YYYY-MM-DD HH:mm:ss'),
                ngay_ket_thuc_thuc_te: values.ngay_ket_thuc_thuc_te?.format('YYYY-MM-DD HH:mm:ss'),
            };

            let response;
            if (selectedTask) {
                response = await taskApi.update(selectedTask.id, payload);
            } else {
                response = await taskApi.create(payload);
            }

            if (response.data.success) {
                message.success(selectedTask ? 'Cập nhật thành công' : 'Tạo nhiệm vụ thành công');
                setDrawerVisible(false);
                loadTasks();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const columns = [
        {
            title: 'Mã',
            dataIndex: 'ma_nhiem_vu',
            key: 'ma_nhiem_vu',
            width: 120,
            fixed: 'left' as const,
            render: (text: string, record: Task) => (
                <a onClick={() => {
                    setDetailTaskId(record.id);
                    setDetailVisible(true);
                }}>
                    <strong>{text}</strong>
                </a>
            ),
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'tieu_de',
            key: 'tieu_de',
            width: 250,
            fixed: 'left' as const,
            ellipsis: true,
            render: (text: string, record: Task) => (
                <a onClick={() => {
                    setDetailTaskId(record.id);
                    setDetailVisible(true);
                }}>
                    {text}
                </a>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 130,
            render: (status: TaskStatusType) => (
                <Tag color={status?.ma_mau}>{status?.ten_trang_thai}</Tag>
            ),
        },
        {
            title: 'Ưu tiên',
            dataIndex: 'uu_tien',
            key: 'uu_tien',
            width: 120,
            render: (priority: PriorityType) => (
                <Tag color={priority?.ma_mau}>{priority?.ten_uu_tien}</Tag>
            ),
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'nguoi_thuc_hien',
            key: 'nguoi_thuc_hien',
            width: 150,
            render: (user: any) => user ? (
                <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <span>{user.name}</span>
                </Space>
            ) : '-',
        },
        {
            title: 'Tiến độ',
            dataIndex: 'tien_do',
            key: 'tien_do',
            width: 150,
            render: (tien_do: number) => (
                <Progress
                    percent={tien_do || 0}
                    size="small"
                    status={tien_do === 100 ? 'success' : 'active'}
                />
            ),
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'ngay_bat_dau',
            key: 'ngay_bat_dau',
            width: 120,
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Deadline',
            dataIndex: 'ngay_ket_thuc_du_kien',
            key: 'ngay_ket_thuc_du_kien',
            width: 120,
            render: (date: string, record: Task) => {
                if (!date) return '-';
                const isOverdue = dayjs(date).isBefore(dayjs()) && !record.trang_thai?.is_done;
                return (
                    <Tag color={isOverdue ? 'red' : 'default'}>
                        {dayjs(date).format('DD/MM/YYYY')}
                    </Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right' as const,
            width: 120,
            render: (_: any, record: Task) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xác nhận xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="link"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Danh sách nhiệm vụ</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Thêm nhiệm vụ
                </Button>
            </div>

            <Space style={{ marginBottom: 16 }} wrap>
                <Input
                    placeholder="Tìm kiếm theo tiêu đề, mã..."
                    prefix={<SearchOutlined />}
                    style={{ width: 250 }}
                    allowClear
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                />

                <Select
                    mode="multiple"
                    placeholder="Trạng thái"
                    style={{ minWidth: 200 }}
                    allowClear
                    onChange={(value) => handleFilterChange('trang_thai_id', value)}
                >
                    {taskStatuses.map(status => (
                        <Option key={status.id} value={status.id}>
                            <Tag color={status.ma_mau}>{status.ten_trang_thai}</Tag>
                        </Option>
                    ))}
                </Select>

                <Select
                    mode="multiple"
                    placeholder="Ưu tiên"
                    style={{ minWidth: 180 }}
                    allowClear
                    onChange={(value) => handleFilterChange('uu_tien_id', value)}
                >
                    {priorities.map(priority => (
                        <Option key={priority.id} value={priority.id}>
                            <Tag color={priority.ma_mau}>{priority.ten_uu_tien}</Tag>
                        </Option>
                    ))}
                </Select>

                <Select
                    placeholder="Người thực hiện"
                    style={{ minWidth: 180 }}
                    allowClear
                    onChange={(value) => handleFilterChange('nguoi_thuc_hien_id', value)}
                >
                    {projectMembers.map(member => (
                        <Option key={member.user_id} value={member.user_id}>
                            {member.user?.name}
                        </Option>
                    ))}
                </Select>

                <RangePicker
                    placeholder={['Từ ngày', 'Đến ngày']}
                    format="DD/MM/YYYY"
                    onChange={(dates) => {
                        if (dates) {
                            handleFilterChange('ngay_bat_dau', [
                                dates[0]!.format('YYYY-MM-DD'),
                                dates[1]!.format('YYYY-MM-DD'),
                            ]);
                        } else {
                            handleFilterChange('ngay_bat_dau', undefined);
                        }
                    }}
                />
            </Space>

            <Table
                columns={columns}
                dataSource={tasks}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1500 }}
                pagination={{
                    current,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} nhiệm vụ`,
                    onChange: (page, size) => {
                        setCurrent(page);
                        setPageSize(size);
                    },
                }}
            />

            <Drawer
                title={selectedTask ? 'Sửa nhiệm vụ' : 'Thêm nhiệm vụ'}
                width={600}
                open={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                extra={
                    <Space>
                        <Button onClick={() => setDrawerVisible(false)}>Hủy</Button>
                        <Button type="primary" onClick={handleSubmit}>
                            {selectedTask ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </Space>
                }
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
                        <Input.TextArea rows={4} placeholder="Mô tả chi tiết" />
                    </Form.Item>

                    <Form.Item
                        name="trang_thai_id"
                        label="Trạng thái"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                        <Select placeholder="Chọn trạng thái">
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
                        rules={[{ required: true, message: 'Vui lòng chọn mức ưu tiên' }]}
                    >
                        <Select placeholder="Chọn mức ưu tiên">
                            {priorities.map(priority => (
                                <Option key={priority.id} value={priority.id}>
                                    <Tag color={priority.ma_mau}>{priority.ten_uu_tien}</Tag>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="nguoi_thuc_hien_id" label="Người thực hiện">
                        <Select placeholder="Chọn người thực hiện" allowClear>
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

                    <Form.Item name="gio_uoc_tinh" label="Số giờ ước tính">
                        <Input type="number" placeholder="Nhập số giờ" />
                    </Form.Item>
                </Form>
            </Drawer>

            <TaskDetail
                taskId={detailTaskId}
                projectId={Number(projectId)}
                visible={detailVisible}
                onClose={() => {
                    setDetailVisible(false);
                    setDetailTaskId(null);
                }}
                onUpdate={loadTasks}
            />
        </div>
    );
};

export default TaskList;
