import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space, Typography } from 'antd';
import {
    UserOutlined,
    ShoppingOutlined,
    FileTextOutlined,
    DollarOutlined,
    CloudServerOutlined,
    GlobalOutlined,
    CustomerServiceOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';
import { callApi } from '@/function/api';
import API from '@/common/api';

const { Title } = Typography;

const WhmcsDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>({});
    const [revenueData, setRevenueData] = useState([]);
    const [clientsGrowth, setClientsGrowth] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch dashboard statistics
            const statsRes = await callApi(API.whmcs_reportsDashboard, {});
            if (statsRes?.success) {
                setStats(statsRes.data);
            }

            // Fetch revenue data for last 6 months
            const revenueRes = await callApi(API.whmcs_reportsRevenue, {
                group_by: 'month'
            });
            if (revenueRes?.success) {
                setRevenueData(revenueRes.data);
            }

            // Fetch clients growth
            const growthRes = await callApi(API.whmcs_reportsClientsGrowth, {});
            if (growthRes?.success) {
                setClientsGrowth(growthRes.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
        setLoading(false);
    };

    const revenueConfig = {
        data: revenueData,
        xField: 'period',
        yField: 'total',
        smooth: true,
        label: {
            style: {
                fill: '#1890ff',
            },
        },
        point: {
            size: 5,
            shape: 'diamond',
        },
    };

    const clientsConfig = {
        data: clientsGrowth,
        xField: 'period',
        yField: 'count',
        columnStyle: {
            radius: [8, 8, 0, 0],
        },
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>WHMCS Dashboard</Title>

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Tổng khách hàng"
                            value={stats.total_clients || 0}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            <ArrowUpOutlined style={{ color: '#3f8600' }} /> Hoạt động: {stats.active_clients || 0}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Dịch vụ đang chạy"
                            value={stats.active_services || 0}
                            prefix={<CloudServerOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            Tổng: {stats.total_services || 0} dịch vụ
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Hóa đơn chưa thanh toán"
                            value={stats.unpaid_invoices || 0}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            <ArrowDownOutlined style={{ color: '#cf1322' }} /> Quá hạn: {stats.overdue_invoices || 0}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Doanh thu tháng này"
                            value={stats.revenue_this_month || 0}
                            prefix={<DollarOutlined />}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            suffix="VNĐ"
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            Tổng: {stats.total_revenue?.toLocaleString() || 0} VNĐ
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Secondary Stats */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card size="small">
                        <Statistic
                            title="Đơn hàng chờ xử lý"
                            value={stats.pending_orders || 0}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ fontSize: 20 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card size="small">
                        <Statistic
                            title="Tên miền đang quản lý"
                            value={stats.total_domains || 0}
                            prefix={<GlobalOutlined />}
                            valueStyle={{ fontSize: 20 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card size="small">
                        <Statistic
                            title="Tickets chưa đóng"
                            value={stats.open_tickets || 0}
                            prefix={<CustomerServiceOutlined />}
                            valueStyle={{ fontSize: 20 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Doanh thu 6 tháng gần đây" loading={loading}>
                        {revenueData.length > 0 && <Line {...revenueConfig} height={300} />}
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Khách hàng mới" loading={loading}>
                        {clientsGrowth.length > 0 && <Column {...clientsConfig} height={300} />}
                    </Card>
                </Col>
            </Row>

            {/* Recent Activities */}
            <Row gutter={16}>
                <Col xs={24} lg={12}>
                    <Card title="Hóa đơn gần đây" loading={loading}>
                        <RecentInvoices />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Đơn hàng mới" loading={loading}>
                        <RecentOrders />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

const RecentInvoices = () => {
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        const res = await callApi(API.whmcs_invoicesList, { perPage: 5 });
        if (res?.success) {
            setInvoices(res.data.data);
        }
    };

    const columns = [
        { title: 'Mã HĐ', dataIndex: 'invoice_number', width: 120 },
        { title: 'Khách hàng', dataIndex: ['client', 'firstname'], render: (_, r) => `${r.client?.firstname} ${r.client?.lastname}` },
        { title: 'Tổng tiền', dataIndex: 'total', render: (v) => v?.toLocaleString() + ' VNĐ', width: 120 },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 100,
            render: (s) => <Tag color={s === 'Paid' ? 'green' : 'red'}>{s}</Tag>
        },
    ];

    return <Table columns={columns} dataSource={invoices} pagination={false} size="small" rowKey="id" />;
};

const RecentOrders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const res = await callApi(API.whmcs_ordersList, { perPage: 5 });
        if (res?.success) {
            setOrders(res.data.data);
        }
    };

    const columns = [
        { title: 'Mã ĐH', dataIndex: 'order_number', width: 120 },
        { title: 'Khách hàng', dataIndex: ['client', 'firstname'], render: (_, r) => `${r.client?.firstname} ${r.client?.lastname}` },
        { title: 'Tổng tiền', dataIndex: 'total', render: (v) => v?.toLocaleString() + ' VNĐ', width: 120 },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 100,
            render: (s) => {
                const colors = { Pending: 'orange', Active: 'green', Cancelled: 'red', Fraud: 'volcano' };
                return <Tag color={colors[s]}>{s}</Tag>;
            }
        },
    ];

    return <Table columns={columns} dataSource={orders} pagination={false} size="small" rowKey="id" />;
};

export default WhmcsDashboard;
