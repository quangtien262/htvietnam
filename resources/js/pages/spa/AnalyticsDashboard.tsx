import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, DatePicker, Select, Space, Statistic, Table, Tag, Typography,
    Segmented, message, Button
} from 'antd';
import {
    DollarOutlined, UserOutlined, ShoppingOutlined, RiseOutlined,
    FallOutlined, TeamOutlined, CalendarOutlined, TrophyOutlined,
    CrownOutlined, StarOutlined, FireOutlined, DownloadOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, DualAxes } from '@ant-design/plots';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import axios from 'axios';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

interface DashboardStats {
    totalRevenue: number;
    revenueGrowth: number;
    totalCustomers: number;
    customerGrowth: number;
    totalBookings: number;
    bookingGrowth: number;
    avgOrderValue: number;
    avgOrderGrowth: number;
}

interface RevenueData {
    date: string;
    revenue: number;
    target?: number;
}

interface CategoryData {
    category: string;
    value: number;
    percentage: number;
}

interface StaffPerformance {
    id: number;
    ten_nhan_vien: string;
    doanh_thu: number;
    so_khach: number;
    diem_trung_binh: number;
    rank: number;
}

interface ServiceRanking {
    id: number;
    ten_dich_vu: string;
    so_luot: number;
    doanh_thu: number;
}

interface CustomerSegment {
    segment: string;
    count: number;
    revenue: number;
    percentage: number;
}

const AnalyticsDashboard: React.FC = () => {
    // State
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);
    const [compareType, setCompareType] = useState<'previous' | 'lastYear'>('previous');
    const [branchId, setBranchId] = useState<number | null>(null);

    // Stats
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        revenueGrowth: 0,
        totalCustomers: 0,
        customerGrowth: 0,
        totalBookings: 0,
        bookingGrowth: 0,
        avgOrderValue: 0,
        avgOrderGrowth: 0,
    });

    // Chart Data
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
    const [serviceRanking, setServiceRanking] = useState<ServiceRanking[]>([]);
    const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
    const [hourlyData, setHourlyData] = useState<any[]>([]);

    // View Mode
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

    useEffect(() => {
        loadDashboardData();
    }, [dateRange, compareType, branchId, viewMode]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/aio/api/admin/spa/analytics/dashboard', {
                start_date: dateRange[0].format('YYYY-MM-DD'),
                end_date: dateRange[1].format('YYYY-MM-DD'),
                compare_type: compareType,
                branch_id: branchId,
                view_mode: viewMode,
            });

            if (response.data.success) {
                const data = response.data.data;
                setStats(data.stats || {});
                setRevenueData(data.revenue_chart || []);
                setCategoryData(data.category_chart || []);
                setStaffPerformance(data.staff_performance || []);
                setServiceRanking(data.service_ranking || []);
                setCustomerSegments(data.customer_segments || []);
                setHourlyData(data.hourly_data || []);
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu thống kê');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            message.loading('Đang xuất báo cáo...', 0);
            const response = await axios.post('/aio/api/admin/spa/analytics/export', {
                start_date: dateRange[0].format('YYYY-MM-DD'),
                end_date: dateRange[1].format('YYYY-MM-DD'),
                branch_id: branchId,
            }, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics_${dayjs().format('YYYYMMDD')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.destroy();
            message.success('Xuất báo cáo thành công');
        } catch (error) {
            message.destroy();
            message.error('Không thể xuất báo cáo');
        }
    };

    // Revenue Line Chart Config
    const revenueChartConfig = {
        data: revenueData,
        xField: 'date',
        yField: 'revenue',
        seriesField: 'type',
        smooth: true,
        animation: {
            appear: {
                animation: 'path-in',
                duration: 1000,
            },
        },
        point: {
            size: 4,
            shape: 'circle',
        },
        tooltip: {
            formatter: (datum: any) => {
                return {
                    name: 'Doanh thu',
                    value: `${datum.revenue.toLocaleString()} VNĐ`,
                };
            },
        },
        yAxis: {
            label: {
                formatter: (v: string) => `${(parseInt(v) / 1000000).toFixed(0)}M`,
            },
        },
        color: ['#1890ff', '#52c41a'],
    };

    // Category Pie Chart Config
    const categoryChartConfig = {
        appendPadding: 10,
        data: categoryData,
        angleField: 'value',
        colorField: 'category',
        radius: 0.8,
        innerRadius: 0.6,
        label: {
            type: 'inner',
            offset: '-30%',
            content: '{percentage}',
            style: {
                fontSize: 14,
                textAlign: 'center',
            },
        },
        statistic: {
            title: false,
            content: {
                style: {
                    fontSize: '18px',
                },
                content: 'Doanh thu',
            },
        },
        interactions: [
            {
                type: 'element-selected',
            },
            {
                type: 'element-active',
            },
        ],
        legend: {
            position: 'bottom' as const,
        },
        tooltip: {
            formatter: (datum: any) => {
                return {
                    name: datum.category,
                    value: `${datum.value.toLocaleString()} VNĐ (${datum.percentage}%)`,
                };
            },
        },
    };

    // Service Ranking Column Chart Config
    const serviceRankingConfig = {
        data: serviceRanking.slice(0, 10),
        xField: 'ten_dich_vu',
        yField: 'doanh_thu',
        seriesField: 'ten_dich_vu',
        color: ({ ten_dich_vu }: any) => {
            const colors = ['#f5222d', '#fa541c', '#fa8c16', '#faad14', '#fadb14', '#a0d911', '#52c41a', '#13c2c2', '#1890ff', '#2f54eb'];
            const index = serviceRanking.findIndex(s => s.ten_dich_vu === ten_dich_vu);
            return colors[index] || '#1890ff';
        },
        label: {
            position: 'top' as const,
            formatter: (datum: any) => `${(datum.doanh_thu / 1000000).toFixed(1)}M`,
        },
        xAxis: {
            label: {
                autoRotate: true,
                autoHide: true,
            },
        },
        yAxis: {
            label: {
                formatter: (v: string) => `${(parseInt(v) / 1000000).toFixed(0)}M`,
            },
        },
        tooltip: {
            formatter: (datum: any) => {
                return {
                    name: datum.ten_dich_vu,
                    value: `${datum.doanh_thu.toLocaleString()} VNĐ (${datum.so_luot} lượt)`,
                };
            },
        },
        legend: false,
    };

    // Customer Segment Column Chart Config
    const customerSegmentConfig = {
        data: customerSegments,
        isGroup: true,
        xField: 'segment',
        yField: 'revenue',
        seriesField: 'type',
        color: ['#1890ff', '#52c41a'],
        label: {
            position: 'top' as const,
            formatter: (datum: any) => `${(datum.revenue / 1000000).toFixed(1)}M`,
        },
        yAxis: {
            label: {
                formatter: (v: string) => `${(parseInt(v) / 1000000).toFixed(0)}M`,
            },
        },
        legend: {
            position: 'top' as const,
        },
    };

    // Hourly DualAxes Chart Config
    const hourlyChartConfig = {
        data: [hourlyData, hourlyData],
        xField: 'hour',
        yField: ['revenue', 'count'],
        geometryOptions: [
            {
                geometry: 'column',
                color: '#5B8FF9',
                label: {
                    position: 'top' as const,
                },
            },
            {
                geometry: 'line',
                color: '#5AD8A6',
                lineStyle: {
                    lineWidth: 2,
                },
                point: {
                    size: 4,
                    shape: 'circle',
                },
            },
        ],
        yAxis: {
            revenue: {
                label: {
                    formatter: (v: string) => `${(parseInt(v) / 1000000).toFixed(1)}M`,
                },
            },
        },
        legend: {
            position: 'top' as const,
            custom: true,
            items: [
                {
                    name: 'Doanh thu',
                    value: 'revenue',
                    marker: { symbol: 'square', style: { fill: '#5B8FF9' } },
                },
                {
                    name: 'Số booking',
                    value: 'count',
                    marker: { symbol: 'line', style: { stroke: '#5AD8A6' } },
                },
            ],
        },
        tooltip: {
            formatter: (datum: any) => {
                if (datum.revenue !== undefined) {
                    return {
                        name: 'Doanh thu',
                        value: `${datum.revenue.toLocaleString()} VNĐ`,
                    };
                }
                return {
                    name: 'Số booking',
                    value: datum.count,
                };
            },
        },
    };

    // Staff Performance Columns
    const staffColumns = [
        {
            title: '#',
            dataIndex: 'rank',
            key: 'rank',
            width: 60,
            render: (rank: number) => {
                let icon = <UserOutlined />;
                let color = 'default';
                if (rank === 1) {
                    icon = <CrownOutlined />;
                    color = '#faad14';
                } else if (rank === 2) {
                    icon = <TrophyOutlined />;
                    color = '#d3d3d3';
                } else if (rank === 3) {
                    icon = <StarOutlined />;
                    color = '#cd7f32';
                }
                return (
                    <Tag color={color} icon={icon}>
                        {rank}
                    </Tag>
                );
            },
        },
        {
            title: 'Nhân viên',
            dataIndex: 'ten_nhan_vien',
            key: 'ten_nhan_vien',
        },
        {
            title: 'Doanh thu',
            dataIndex: 'doanh_thu',
            key: 'doanh_thu',
            align: 'right' as const,
            render: (value: number) => (
                <Text strong style={{ color: '#f5222d' }}>
                    {value.toLocaleString()} VNĐ
                </Text>
            ),
        },
        {
            title: 'Số khách',
            dataIndex: 'so_khach',
            key: 'so_khach',
            align: 'center' as const,
            render: (value: number) => <Tag color="blue">{value}</Tag>,
        },
        {
            title: 'Điểm TB',
            dataIndex: 'diem_trung_binh',
            key: 'diem_trung_binh',
            align: 'center' as const,
            render: (value: number) => (
                <Tag color={value >= 4.5 ? 'green' : value >= 4 ? 'blue' : 'orange'}>
                    {value.toFixed(1)} ⭐
                </Tag>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            {/* Header Controls */}
            <Card style={{ marginBottom: 24 }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
                                format="DD/MM/YYYY"
                            />
                            <Select
                                placeholder="Tất cả chi nhánh"
                                allowClear
                                style={{ width: 200 }}
                                value={branchId}
                                onChange={setBranchId}
                            >
                                <Option value={1}>Chi nhánh 1</Option>
                                <Option value={2}>Chi nhánh 2</Option>
                            </Select>
                            <Segmented
                                options={[
                                    { label: 'Theo ngày', value: 'day' },
                                    { label: 'Theo tuần', value: 'week' },
                                    { label: 'Theo tháng', value: 'month' },
                                ]}
                                value={viewMode}
                                onChange={(value) => setViewMode(value as any)}
                            />
                        </Space>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleExport}
                        >
                            Xuất báo cáo
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Stats Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={stats.totalRevenue}
                            precision={0}
                            valueStyle={{ color: '#f5222d' }}
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                        />
                        <div style={{ marginTop: 8 }}>
                            {stats.revenueGrowth >= 0 ? (
                                <Text type="success">
                                    <RiseOutlined /> {stats.revenueGrowth.toFixed(1)}%
                                </Text>
                            ) : (
                                <Text type="danger">
                                    <FallOutlined /> {Math.abs(stats.revenueGrowth).toFixed(1)}%
                                </Text>
                            )}
                            <Text type="secondary" style={{ marginLeft: 8 }}>so với kỳ trước</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Số khách hàng"
                            value={stats.totalCustomers}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<UserOutlined />}
                        />
                        <div style={{ marginTop: 8 }}>
                            {stats.customerGrowth >= 0 ? (
                                <Text type="success">
                                    <RiseOutlined /> {stats.customerGrowth.toFixed(1)}%
                                </Text>
                            ) : (
                                <Text type="danger">
                                    <FallOutlined /> {Math.abs(stats.customerGrowth).toFixed(1)}%
                                </Text>
                            )}
                            <Text type="secondary" style={{ marginLeft: 8 }}>so với kỳ trước</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Số booking"
                            value={stats.totalBookings}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CalendarOutlined />}
                        />
                        <div style={{ marginTop: 8 }}>
                            {stats.bookingGrowth >= 0 ? (
                                <Text type="success">
                                    <RiseOutlined /> {stats.bookingGrowth.toFixed(1)}%
                                </Text>
                            ) : (
                                <Text type="danger">
                                    <FallOutlined /> {Math.abs(stats.bookingGrowth).toFixed(1)}%
                                </Text>
                            )}
                            <Text type="secondary" style={{ marginLeft: 8 }}>so với kỳ trước</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Giá trị TB / đơn"
                            value={stats.avgOrderValue}
                            precision={0}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<ShoppingOutlined />}
                            suffix="VNĐ"
                        />
                        <div style={{ marginTop: 8 }}>
                            {stats.avgOrderGrowth >= 0 ? (
                                <Text type="success">
                                    <RiseOutlined /> {stats.avgOrderGrowth.toFixed(1)}%
                                </Text>
                            ) : (
                                <Text type="danger">
                                    <FallOutlined /> {Math.abs(stats.avgOrderGrowth).toFixed(1)}%
                                </Text>
                            )}
                            <Text type="secondary" style={{ marginLeft: 8 }}>so với kỳ trước</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Revenue Trend Chart */}
            <Card
                title={
                    <Space>
                        <FireOutlined />
                        <span>Biểu đồ doanh thu</span>
                    </Space>
                }
                style={{ marginBottom: 24 }}
                loading={loading}
            >
                <Line {...revenueChartConfig} height={350} />
            </Card>

            {/* Category & Service Charts */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} md={12}>
                    <Card
                        title="Doanh thu theo danh mục"
                        loading={loading}
                    >
                        <Pie {...categoryChartConfig} height={300} />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card
                        title="Top 10 dịch vụ bán chạy"
                        loading={loading}
                    >
                        <Column {...serviceRankingConfig} height={300} />
                    </Card>
                </Col>
            </Row>

            {/* Hourly Performance */}
            <Card
                title="Phân bố theo giờ"
                style={{ marginBottom: 24 }}
                loading={loading}
            >
                <DualAxes {...hourlyChartConfig} height={300} />
            </Card>

            {/* Staff Performance & Customer Segments */}
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Card
                        title={
                            <Space>
                                <TeamOutlined />
                                <span>Hiệu suất nhân viên</span>
                            </Space>
                        }
                        loading={loading}
                    >
                        <Table
                            columns={staffColumns}
                            dataSource={staffPerformance}
                            rowKey="id"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card
                        title="Phân khúc khách hàng"
                        loading={loading}
                    >
                        <Column {...customerSegmentConfig} height={400} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AnalyticsDashboard;
