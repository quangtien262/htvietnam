import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Space, Table, Tag, Progress, Alert, Badge, message } from 'antd';
import {
    DollarOutlined,
    CalendarOutlined,
    TeamOutlined,
    HomeOutlined,
    RiseOutlined,
    FallOutlined,
    ClockCircleOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Line, Bar, Pie } from '@ant-design/charts';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_SPA } from '@/common/api_spa';

const { RangePicker } = DatePicker;

const DashboardOverview: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_SPA.spaAnalyticsDashboard, {
                params: {
                    tu_ngay: dateRange[0].format('YYYY-MM-DD'),
                    den_ngay: dateRange[1].format('YYYY-MM-DD'),
                }
            });
            if (response.data.success) {
                console.log('Dashboard API response:', response.data.data);
                setData(response.data.data);
            }
        } catch (error: any) {
            console.error('Dashboard API error:', error);
            message.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const kpiData = {
        doanhThuHomNay: data?.doanhThuHomNay ?? 0,
        tangTruongDoanhThu: data?.tangTruongDoanhThu ?? 0,
        soLichHenHomNay: data?.soLichHenHomNay ?? 0,
        soLichHenDangCho: data?.soLichHenDangCho ?? 0,
        soPhongDangSuDung: data?.soPhongDangSuDung ?? 0,
        tongSoPhong: data?.tongSoPhong ?? 1, // Default to 1 to avoid division by zero
        soNhanVienLamViec: data?.soNhanVienLamViec ?? 0,
        tongSoNhanVien: data?.tongSoNhanVien ?? 1, // Default to 1 to avoid division by zero
    };

    const upcomingAppointments = [
        { id: 1, time: '09:00', customer: 'Nguyễn Thị A', service: 'Massage body', room: 'Phòng 1', status: 'Đang chờ' },
        { id: 2, time: '09:30', customer: 'Trần Văn B', service: 'Chăm sóc da mặt', room: 'Phòng 3', status: 'Đang thực hiện' },
        { id: 3, time: '10:00', customer: 'Lê Thị C', service: 'Gội đầu dưỡng sinh', room: 'Phòng 2', status: 'Đang chờ' },
        { id: 4, time: '10:30', customer: 'Phạm Văn D', service: 'Massage chân', room: 'Phòng 4', status: 'Đang chờ' },
    ];

    const revenueChartData = [
        { date: '1/11', value: 8500000 },
        { date: '2/11', value: 12000000 },
        { date: '3/11', value: 9500000 },
        { date: '4/11', value: 15000000 },
        { date: '5/11', value: 11000000 },
        { date: '6/11', value: 13500000 },
        { date: '7/11', value: 16000000 },
    ];

    const serviceDistribution = [
        { type: 'Massage', value: 45 },
        { type: 'Chăm sóc da', value: 30 },
        { type: 'Nail', value: 15 },
        { type: 'Khác', value: 10 },
    ];

    const revenueConfig = {
        data: revenueChartData,
        xField: 'date',
        yField: 'value',
        smooth: true,
        color: '#1890ff',
        point: {
            size: 5,
            shape: 'diamond',
        },
        label: {
            style: {
                fill: '#aaa',
            },
        },
    };

    const pieConfig = {
        data: serviceDistribution,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            text: 'type',
            style: {
                fontWeight: 'bold',
            },
        },
        legend: {
            color: {
                title: false,
                position: 'right',
                rowPadding: 5,
            },
        },
    };

    const appointmentColumns = [
        {
            title: 'Giờ',
            dataIndex: 'time',
            key: 'time',
            width: 80,
            render: (text: string) => (
                <Space>
                    <ClockCircleOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer',
            key: 'customer',
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'service',
            key: 'service',
        },
        {
            title: 'Phòng',
            dataIndex: 'room',
            key: 'room',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'Đang thực hiện' ? 'green' : 'blue'}>{status}</Tag>
            ),
        },
    ];

    return (
        <div>
            {/* Date Range Filter */}
            <Card style={{ marginBottom: 16 }}>
                <Space>
                    <span>Thời gian:</span>
                    <RangePicker
                        value={dateRange as any}
                        onChange={(dates) => setDateRange(dates as any)}
                        format="DD/MM/YYYY"
                    />
                </Space>
            </Card>

            {/* KPI Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu hôm nay"
                            value={kpiData.doanhThuHomNay}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                        />
                        <div style={{ marginTop: 8 }}>
                            <Tag color={kpiData.tangTruongDoanhThu > 0 ? 'green' : 'red'}>
                                {kpiData.tangTruongDoanhThu > 0 ? <RiseOutlined /> : <FallOutlined />}
                                {Math.abs(kpiData.tangTruongDoanhThu)}% so với hôm qua
                            </Tag>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Lịch hẹn hôm nay"
                            value={kpiData.soLichHenHomNay}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<CalendarOutlined />}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Badge status="processing" text={`${kpiData.soLichHenDangCho} đang chờ`} />
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Phòng đang sử dụng"
                            value={kpiData.soPhongDangSuDung}
                            suffix={`/ ${kpiData.tongSoPhong}`}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<HomeOutlined />}
                        />
                        <Progress
                            percent={kpiData.tongSoPhong > 0 ? Math.round((kpiData.soPhongDangSuDung / kpiData.tongSoPhong) * 100) : 0}
                            size="small"
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Nhân viên làm việc"
                            value={kpiData.soNhanVienLamViec}
                            suffix={`/ ${kpiData.tongSoNhanVien}`}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<TeamOutlined />}
                        />
                        <Progress
                            percent={kpiData.tongSoNhanVien > 0 ? Math.round((kpiData.soNhanVienLamViec / kpiData.tongSoNhanVien) * 100) : 0}
                            size="small"
                            strokeColor="#722ed1"
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Revenue & Service Distribution */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={16}>
                    <Card title="Xu hướng Doanh thu 7 ngày qua">
                        <Line {...revenueConfig} height={300} />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Phân bố Dịch vụ">
                        <Pie {...pieConfig} height={300} />
                    </Card>
                </Col>
            </Row>

            {/* Upcoming Appointments & Alerts */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={16}>
                    <Card title="Lịch hẹn sắp tới" extra={<Badge count={kpiData.soLichHenDangCho} />}>
                        <Table
                            dataSource={upcomingAppointments}
                            columns={appointmentColumns}
                            pagination={false}
                            size="small"
                            rowKey="id"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Cảnh báo">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Alert
                                message="Phòng 2 sắp rảnh"
                                description="Dự kiến rảnh lúc 10:45"
                                type="info"
                                showIcon
                            />
                            <Alert
                                message="Nguyên liệu sắp hết"
                                description="Tinh dầu massage còn 2 chai"
                                type="warning"
                                showIcon
                            />
                            <Alert
                                message="Công suất cao"
                                description="Tỷ lệ sử dụng: 67%"
                                type="success"
                                showIcon
                            />
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardOverview;
