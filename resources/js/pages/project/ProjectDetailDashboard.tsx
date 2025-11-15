import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Space, Spin, Empty } from 'antd';
import {
    ProjectOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import { projectApi } from '../../common/api/projectApi';
import { ProjectDashboardStats } from '../../types/project';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface ProjectDetailDashboardProps {
    projectId: number;
}

/**
 * ProjectDetailDashboard Component
 *
 * Displays comprehensive project statistics including:
 * - Overview metrics (total tasks, completion rate, time logged, team size)
 * - Task distribution by status (Pie chart)
 * - Task distribution by priority (Column chart)
 * - Time spent by team member (Column chart)
 *
 * Features:
 * - Date range filtering for time-based metrics
 * - Real-time data loading
 * - Responsive layout with Ant Design Grid
 *
 * @param projectId - The ID of the project to display dashboard for
 */
const ProjectDetailDashboard: React.FC<ProjectDetailDashboardProps> = ({ projectId }) => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<ProjectDashboardStats | null>(null);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

    useEffect(() => {
        loadDashboardStats();
    }, [projectId, dateRange]);

    /**
     * Load dashboard statistics from API
     * Applies date range filter if selected
     */
    const loadDashboardStats = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (dateRange) {
                params.tu_ngay = dateRange[0].format('YYYY-MM-DD');
                params.den_ngay = dateRange[1].format('YYYY-MM-DD');
            }

            console.log('[ProjectDetailDashboard] Loading stats for project:', projectId);
            const response = await projectApi.getDashboardStats(projectId, params);
            console.log('[ProjectDetailDashboard] Stats response:', response.data);
            if (response.data.success) {
                setStats(response.data.data);
            } else {
                console.error('[ProjectDetailDashboard] API returned success=false:', response.data);
            }
        } catch (error: any) {
            console.error('[ProjectDetailDashboard] Error loading dashboard stats:', error);
            console.error('[ProjectDetailDashboard] Error response:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (dates: any) => {
        setDateRange(dates);
    };

    if (loading && !stats) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!stats) {
        return <Empty description="Không có dữ liệu thống kê" />;
    }

    // Chart configs
    const statusChartConfig = {
        data: stats.tasks_by_status,
        angleField: 'count',
        colorField: 'status',
        radius: 0.8,
        label: {
            formatter: (datum: any) => {
                if (!datum) return '';
                return `${datum.status || ''}: ${datum.count || 0}`;
            },
        },
        interactions: [{ type: 'element-active' }],
        legend: {
            position: 'bottom' as const,
        },
        color: stats.tasks_by_status.map(item => item.color),
    };

    const priorityChartConfig = {
        data: stats.tasks_by_priority,
        xField: 'priority',
        yField: 'count',
        seriesField: 'priority',
        color: stats.tasks_by_priority.map(item => item.color),
        label: {
            position: 'top' as const,
            style: {
                fill: '#000000',
                opacity: 0.6,
            },
        },
        legend: false,
        xAxis: {
            label: {
                autoHide: false,
                autoRotate: false,
            },
        },
    };

    const timeMemberChartConfig = {
        data: stats.time_by_member,
        xField: 'member',
        yField: 'total_hours',
        label: {
            position: 'top' as const,
            style: {
                fill: '#000000',
                opacity: 0.6,
            },
            formatter: (datum: any) => `${datum.total_hours}h`,
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
            },
        },
        meta: {
            total_hours: {
                alias: 'Giờ làm việc',
            },
        },
    };

    return (
        <div>
            {/* Date Range Filter */}
            <Space style={{ marginBottom: 16 }}>
                <RangePicker
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    format="DD/MM/YYYY"
                    placeholder={['Từ ngày', 'Đến ngày']}
                />
            </Space>

            {/* Overview Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng số task"
                            value={stats.overview.total_tasks}
                            prefix={<ProjectOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đã hoàn thành"
                            value={stats.overview.completed_tasks}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đang thực hiện"
                            value={stats.overview.in_progress_tasks}
                            prefix={<SyncOutlined spin />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Chưa bắt đầu"
                            value={stats.overview.not_started_tasks}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#8c8c8c' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Tỷ lệ hoàn thành"
                            value={stats.overview.completion_rate}
                            suffix="%"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Tổng giờ làm"
                            value={stats.overview.total_hours_logged}
                            suffix="h"
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Quy mô team"
                            value={stats.overview.team_size}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#13c2c2' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Phân bố theo trạng thái" loading={loading}>
                        {stats.tasks_by_status.length > 0 ? (
                            <Pie {...statusChartConfig} />
                        ) : (
                            <Empty description="Chưa có dữ liệu" />
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Phân bố theo độ ưu tiên" loading={loading}>
                        {stats.tasks_by_priority.length > 0 ? (
                            <Column {...priorityChartConfig} />
                        ) : (
                            <Empty description="Chưa có dữ liệu" />
                        )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card title="Thời gian làm việc theo thành viên" loading={loading}>
                        {stats.time_by_member.length > 0 ? (
                            <Column {...timeMemberChartConfig} />
                        ) : (
                            <Empty description="Chưa có dữ liệu thời gian" />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProjectDetailDashboard;
