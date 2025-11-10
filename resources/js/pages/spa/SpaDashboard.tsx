import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    DollarOutlined,
    ShopOutlined,
    RiseOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { Column } from '@ant-design/plots';
import axios from 'axios';

const SpaDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/spa/analytics/dashboard', {
                params: {
                    tu_ngay: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                    den_ngay: new Date().toISOString().split('T')[0],
                },
            });
            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    // Top services columns
    const serviceColumns = [
        {
            title: 'Dịch vụ',
            dataIndex: 'ten_dich_vu',
            key: 'ten_dich_vu',
        },
        {
            title: 'SL',
            dataIndex: 'total_quantity',
            key: 'total_quantity',
        },
        {
            title: 'Doanh thu',
            dataIndex: 'total_revenue',
            key: 'total_revenue',
            render: (value: number) => formatCurrency(value),
        },
    ];

    // Revenue chart config
    const chartConfig = {
        data: dashboardData?.revenue?.daily_revenue || [],
        xField: 'date',
        yField: 'total',
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        meta: {
            date: { alias: 'Ngày' },
            total: { alias: 'Doanh thu' },
        },
    };

    return (
        <div className="spa-dashboard" style={{ padding: '24px' }}>
            <h1>Dashboard SPA</h1>
            
            {/* Overview Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu tháng"
                            value={dashboardData?.revenue?.total || 0}
                            prefix={<DollarOutlined />}
                            formatter={(value) => formatCurrency(Number(value))}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Số lịch hẹn"
                            value={dashboardData?.bookings?.total || 0}
                            prefix={<CalendarOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Khách hàng mới"
                            value={dashboardData?.customers?.new || 0}
                            prefix={<UserOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Số hóa đơn"
                            value={dashboardData?.revenue?.invoice_count || 0}
                            prefix={<ShopOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Revenue Chart */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <Card title="Biểu đồ doanh thu" loading={loading}>
                        {dashboardData?.revenue?.daily_revenue && (
                            <Column {...chartConfig} />
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Thống kê khách hàng" loading={loading}>
                        <Statistic
                            title="Tổng khách hàng"
                            value={dashboardData?.customers?.total || 0}
                            suffix="KH"
                        />
                        <Statistic
                            title="Khách VIP"
                            value={dashboardData?.customers?.vip || 0}
                            suffix="KH"
                            valueStyle={{ color: '#cf1322' }}
                        />
                        <Statistic
                            title="Tỷ lệ giữ chân"
                            value={dashboardData?.customers?.retention_rate || 0}
                            suffix="%"
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Top Lists */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Top dịch vụ" loading={loading}>
                        <Table
                            dataSource={dashboardData?.top_services || []}
                            columns={serviceColumns}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Top nhân viên" loading={loading}>
                        <Table
                            dataSource={dashboardData?.top_staff || []}
                            columns={[
                                { title: 'Nhân viên', dataIndex: 'ho_ten', key: 'ho_ten' },
                                { title: 'Đơn hàng', dataIndex: 'total_orders', key: 'total_orders' },
                                {
                                    title: 'Doanh thu',
                                    dataIndex: 'total_revenue',
                                    key: 'total_revenue',
                                    render: (value: number) => formatCurrency(value),
                                },
                            ]}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SpaDashboard;
