import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Space, Table, Select, Tabs, message } from 'antd';
import { DollarOutlined, RiseOutlined, FallOutlined, LineChartOutlined } from '@ant-design/icons';
import { Column, Line, DualAxes } from '@ant-design/charts';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_SPA } from '@/common/api_spa';

const { RangePicker } = DatePicker;
const { Option } = Select;

const RevenueReport: React.FC = () => {
    const [period, setPeriod] = useState('month');
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [period, dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_SPA.spaAnalyticsRevenue, {
                params: {
                    period,
                    tu_ngay: dateRange[0].format('YYYY-MM-DD'),
                    den_ngay: dateRange[1].format('YYYY-MM-DD'),
                }
            });
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Mock data
    const summary = data?.summary || {
        doanhThu: 320000000,
        chiPhiNguyenLieu: 85000000,
        loiNhuanGop: 235000000,
        bienLoiNhuan: 73.4,
        tangTruong: 15.2,
    };

    const revenueByCategory = [
        { category: 'Massage', revenue: 145000000, cost: 38000000, profit: 107000000 },
        { category: 'Chăm sóc da', revenue: 95000000, cost: 28000000, profit: 67000000 },
        { category: 'Nail', revenue: 48000000, cost: 12000000, profit: 36000000 },
        { category: 'Gội đầu', revenue: 32000000, cost: 7000000, profit: 25000000 },
    ];

    const revenueTrend = [
        { month: 'T1', revenue: 280000000, profit: 195000000 },
        { month: 'T2', revenue: 295000000, profit: 205000000 },
        { month: 'T3', revenue: 310000000, profit: 218000000 },
        { month: 'T4', revenue: 285000000, profit: 198000000 },
        { month: 'T5', revenue: 305000000, profit: 213000000 },
        { month: 'T6', revenue: 320000000, profit: 235000000 },
    ];

    const topServices = [
        { service: 'Massage toàn thân 90 phút', count: 145, revenue: 72500000, profit: 58000000, margin: 80 },
        { service: 'Chăm sóc da mặt cao cấp', count: 98, revenue: 49000000, profit: 35000000, margin: 71.4 },
        { service: 'Massage chân Thái', count: 132, revenue: 39600000, profit: 31000000, margin: 78.3 },
        { service: 'Nail gel', count: 156, revenue: 31200000, profit: 23000000, margin: 73.7 },
        { service: 'Gội đầu dưỡng sinh', count: 98, revenue: 19600000, profit: 15000000, margin: 76.5 },
    ];

    const categoryConfig = {
        data: revenueByCategory,
        xField: 'category',
        yField: 'revenue',
        seriesField: 'type',
        isGroup: true,
        columnStyle: {
            radius: [8, 8, 0, 0],
        },
    };

    const trendConfig = {
        data: [revenueTrend, revenueTrend],
        xField: 'month',
        yField: ['revenue', 'profit'],
        geometryOptions: [
            {
                geometry: 'column',
                color: '#5B8FF9',
            },
            {
                geometry: 'line',
                color: '#5AD8A6',
                lineStyle: {
                    lineWidth: 2,
                },
            },
        ],
    };

    const columns = [
        {
            title: 'Dịch vụ',
            dataIndex: 'service',
            key: 'service',
        },
        {
            title: 'Số lần',
            dataIndex: 'count',
            key: 'count',
            align: 'center' as const,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right' as const,
            render: (val: number) => `${(val / 1000000).toFixed(1)}M`,
        },
        {
            title: 'Lợi nhuận',
            dataIndex: 'profit',
            key: 'profit',
            align: 'right' as const,
            render: (val: number) => `${(val / 1000000).toFixed(1)}M`,
        },
        {
            title: 'Biên LN (%)',
            dataIndex: 'margin',
            key: 'margin',
            align: 'center' as const,
            render: (val: number) => `${val.toFixed(1)}%`,
        },
    ];

    return (
        <div>
            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Space>
                    <Select value={period} onChange={setPeriod} style={{ width: 120 }}>
                        <Option value="day">Theo ngày</Option>
                        <Option value="week">Theo tuần</Option>
                        <Option value="month">Theo tháng</Option>
                        <Option value="quarter">Theo quý</Option>
                        <Option value="year">Theo năm</Option>
                    </Select>
                    <RangePicker
                        value={dateRange as any}
                        onChange={(dates) => setDateRange(dates as any)}
                        format="DD/MM/YYYY"
                    />
                </Space>
            </Card>

            {/* Summary Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng Doanh thu"
                            value={summary.doanhThu}
                            precision={0}
                            valueStyle={{ color: '#3f8600', fontSize: 24 }}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chi phí Nguyên liệu"
                            value={summary.chiPhiNguyenLieu}
                            precision={0}
                            valueStyle={{ color: '#cf1322', fontSize: 24 }}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Lợi nhuận Gộp"
                            value={summary.loiNhuanGop}
                            precision={0}
                            valueStyle={{ color: '#1890ff', fontSize: 24 }}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Biên Lợi nhuận"
                            value={summary.bienLoiNhuan}
                            precision={1}
                            valueStyle={{ color: '#722ed1', fontSize: 24 }}
                            prefix={<LineChartOutlined />}
                            suffix="%"
                        />
                        <div style={{ marginTop: 8, color: '#52c41a' }}>
                            <RiseOutlined /> +{summary.tangTruong}% so với kỳ trước
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card title="Xu hướng Doanh thu & Lợi nhuận">
                        <DualAxes {...trendConfig} height={350} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title="Doanh thu theo Danh mục">
                        <Column
                            data={revenueByCategory}
                            xField="category"
                            yField="revenue"
                            height={300}
                            label={{
                                position: 'top',
                                style: {
                                    fill: '#000',
                                },
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Top 5 Dịch vụ Có Lợi nhuận Cao">
                        <Table
                            dataSource={topServices}
                            columns={columns}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default RevenueReport;
