import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, Input, DatePicker, Button, Space, message, Avatar, Tooltip, Progress } from 'antd';
import { SearchOutlined, ReloadOutlined, CalendarOutlined, ProjectOutlined, FlagOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { taskApi, referenceApi } from '@/common/api/projectApi';
import { Link, useNavigate } from 'react-router-dom';
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
}

interface Filters {
    project_id?: number;
    status_id?: number;
    priority_id?: number;
    search?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

const MyTasks: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    // Filters
    const [filters, setFilters] = useState<Filters>({
        sort_by: 'ngay_ket_thuc',
        sort_order: 'asc',
    });

    // Reference data
    const [projects, setProjects] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [priorities, setPriorities] = useState<any[]>([]);

    useEffect(() => {
        loadReferenceData();
        loadTasks();
    }, []);

    const loadReferenceData = async () => {
        try {
            const [projectsRes, statusesRes, prioritiesRes] = await Promise.all([
                referenceApi.getProjects(),
                referenceApi.getTaskStatuses(),
                referenceApi.getPriorities(),
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

            const response = await taskApi.getMyTasks(params);

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
            sort_by: 'ngay_ket_thuc',
            sort_order: 'asc',
        });
        setPagination({ ...pagination, current: 1 });
        loadTasks(1);
    };

    const handleSearch = () => {
        setPagination({ ...pagination, current: 1 });
        loadTasks(1);
    };

    const handleRowClick = (record: Task) => {
        // Navigate to project detail page with task highlighted
        navigate(`${ROUTE.project_detail.replace(':id', String(record.project.id))}?p=projects&task=${record.id}`);
    };

    const columns: ColumnsType<Task> = [
        {
            title: 'Task',
            dataIndex: 'name',
            key: 'name',
            width: 300,
            render: (text: string, record: Task) => (
                <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        <Link to={`${ROUTE.project_detail.replace(':id', String(record.project.id))}?p=projects&task=${record.id}`}>
                            {text}
                        </Link>
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
                <div>
                    <div style={{ fontWeight: 500 }}>{project.name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{project.code}</div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: Task['status']) => (
                <Tag color={status.color}>{status.name}</Tag>
            ),
        },
        {
            title: 'Ưu tiên',
            dataIndex: 'priority',
            key: 'priority',
            width: 100,
            render: (priority: Task['priority']) => (
                <Tag color={priority.color}>
                    <FlagOutlined /> {priority.name}
                </Tag>
            ),
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

    return (
        <div style={{ padding: 24 }}>
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ProjectOutlined style={{ fontSize: 20 }} />
                        <span style={{ fontSize: 18, fontWeight: 600 }}>Công việc của tôi</span>
                    </div>
                }
            >
                {/* Statistics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                    <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>
                                {stats.total}
                            </div>
                            <div style={{ fontSize: 13, color: '#999' }}>Tổng số task</div>
                        </div>
                    </Card>
                    <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>
                                {stats.inProgress}
                            </div>
                            <div style={{ fontSize: 13, color: '#999' }}>Đang thực hiện</div>
                        </div>
                    </Card>
                    <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 600, color: '#faad14' }}>
                                {stats.today}
                            </div>
                            <div style={{ fontSize: 13, color: '#999' }}>Deadline hôm nay</div>
                        </div>
                    </Card>
                    <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 600, color: '#ff4d4f' }}>
                                {stats.overdue}
                            </div>
                            <div style={{ fontSize: 13, color: '#999' }}>Quá hạn</div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Space wrap style={{ marginBottom: 16, width: '100%' }}>
                    <Input
                        placeholder="Tìm kiếm task..."
                        prefix={<SearchOutlined />}
                        style={{ width: 250 }}
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        onPressEnter={handleSearch}
                    />

                    <Select
                        placeholder="Chọn dự án"
                        style={{ width: 200 }}
                        allowClear
                        value={filters.project_id}
                        onChange={(value) => handleFilterChange('project_id', value)}
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

                {/* Table */}
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
            </Card>
        </div>
    );
};

export default MyTasks;
