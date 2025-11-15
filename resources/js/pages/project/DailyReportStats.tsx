import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Button,
    Space,
    Spin,
    Select,
    message,
} from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    LeftOutlined,
    CalendarOutlined,
    BarChartOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import { Column, Line } from '@ant-design/charts';
import { reportApi } from '../../common/api/projectApi';
import { useNavigate } from 'react-router-dom';
import ROUTE from '../../common/route';

const { Option } = Select;

interface StatsData {
    period: string;
    total_hours: number;
    total_hours_formatted: string;
    tasks_completed: number;
    daily_hours: Array<{
        date: string;
        hours: number;
    }>;
    top_projects: Array<{
        project_name: string;
        hours: number;
    }>;
}

const DailyReportStats: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [statsData, setStatsData] = useState<StatsData | null>(null);
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

    useEffect(() => {
        loadStats();
    }, [period]);

    const loadStats = async () => {
        setLoading(true);
        try {
            const response = await reportApi.getMyStats(period);
            if (response.data.success) {
                setStatsData(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tải thống kê');
        } finally {
            setLoading(false);
        }
    };

    const getPeriodLabel = () => {
        switch (period) {
            case 'week':
                return 'Tuần này';
            case 'month':
                return 'Tháng này';
            case 'year':
                return 'Năm này';
            default:
                return 'Tuần này';
        }
    };

    if (loading && !statsData) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    // Config for Daily Hours Chart
    const dailyHoursConfig = {
        data: statsData?.daily_hours || [],
        xField: 'date',
        yField: 'hours',
        smooth: true,
        label: {
            style: {
                fill: '#1890ff',
                fontSize: 12,
            },
        },
        point: {
            size: 5,
            shape: 'circle',
            style: {
                fill: '#1890ff',
                stroke: '#fff',
                lineWidth: 2,
            },
        },
        tooltip: {
            showMarkers: true,
            formatter: (datum: any) => {
                return { name: 'Giờ làm việc', value: `${datum.hours}h` };
            },
        },
        color: '#1890ff',
    };

    // Config for Top Projects Chart
    const topProjectsConfig = {
        data: statsData?.top_projects || [],
        xField: 'hours',
        yField: 'project_name',
        seriesField: 'project_name',
        legend: false,
        label: {
            position: 'right' as const,
            formatter: (datum: any) => `${datum.hours}h`,
        },
        color: ({ project_name }: any) => {
            const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];
            const index = (statsData?.top_projects || []).findIndex(
                (p) => p.project_name === project_name
            );
            return colors[index % colors.length];
        },
        tooltip: {
            formatter: (datum: any) => {
                return { name: datum.project_name, value: `${datum.hours} giờ` };
            },
        },
    };

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: '16px 24px' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space size="large">
                            <Button
                                icon={<LeftOutlined />}
                                onClick={() => navigate(ROUTE.daily_report + '?p=projects')}
                            >
                                Quay lại
                            </Button>
                            <div>
                                <BarChartOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 8 }} />
                                <span style={{ fontSize: 24, fontWeight: 600 }}>Thống kê</span>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Select
                                value={period}
                                onChange={(value) => setPeriod(value)}
                                style={{ width: 150 }}
                            >
                                <Option value="week">Tuần này</Option>
                                <Option value="month">Tháng này</Option>
                                <Option value="year">Năm này</Option>
                            </Select>
                            <Button
                                icon={<CalendarOutlined />}
                                onClick={() => navigate(ROUTE.daily_report_history + '?p=projects')}
                            >
                                Lịch sử
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Summary Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title={`Tổng giờ làm việc - ${getPeriodLabel()}`}
                            value={statsData?.total_hours || 0}
                            precision={2}
                            suffix="giờ"
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                            {statsData?.total_hours_formatted || '0h'}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Tasks hoàn thành"
                            value={statsData?.tasks_completed || 0}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Trung bình giờ/ngày"
                            value={
                                statsData?.daily_hours && statsData.daily_hours.length > 0
                                    ? (
                                          statsData.daily_hours.reduce((sum, d) => sum + d.hours, 0) /
                                          statsData.daily_hours.length
                                      ).toFixed(2)
                                    : 0
                            }
                            suffix="giờ"
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Daily Hours Trend */}
            <Card title="📈 Xu hướng giờ làm việc hàng ngày" style={{ marginBottom: 24 }}>
                {statsData?.daily_hours && statsData.daily_hours.length > 0 ? (
                    <Line {...dailyHoursConfig} />
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#8c8c8c' }}>
                        Chưa có dữ liệu trong khoảng thời gian này
                    </div>
                )}
            </Card>

            {/* Top Projects */}
            <Card title="🏆 Top 5 Dự án (Theo giờ làm)" style={{ marginBottom: 24 }}>
                {statsData?.top_projects && statsData.top_projects.length > 0 ? (
                    <Column {...topProjectsConfig} />
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#8c8c8c' }}>
                        Chưa có dữ liệu trong khoảng thời gian này
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DailyReportStats;
