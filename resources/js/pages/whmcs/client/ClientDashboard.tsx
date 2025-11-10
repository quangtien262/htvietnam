import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space } from 'antd';
import {
    DollarOutlined,
    CloudServerOutlined,
    FileTextOutlined,
    CustomerServiceOutlined,
    GlobalOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import axios from 'axios';

const ClientDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>({});
    const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
    const [recentServices, setRecentServices] = useState<any[]>([]);
    const [openTickets, setOpenTickets] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/client/dashboard');
            setStats(response.data.stats);
            setRecentInvoices(response.data.recent_invoices);
            setRecentServices(response.data.recent_services);
            setOpenTickets(response.data.open_tickets);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const invoiceColumns = [
        {
            title: 'Invoice #',
            dataIndex: 'invoice_number',
            key: 'invoice_number',
        },
        {
            title: 'Due Date',
            dataIndex: 'due_date',
            key: 'due_date',
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (total: number) => `$${total.toFixed(2)}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: Record<string, string> = {
                    paid: 'green',
                    unpaid: 'red',
                    pending: 'orange',
                    cancelled: 'gray',
                };
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button type="link" size="small">View</Button>
                    {record.status === 'unpaid' && (
                        <Button type="primary" size="small">Pay Now</Button>
                    )}
                </Space>
            ),
        },
    ];

    const serviceColumns = [
        {
            title: 'Domain/Service',
            dataIndex: 'domain',
            key: 'domain',
        },
        {
            title: 'Product',
            dataIndex: ['product', 'name'],
            key: 'product',
        },
        {
            title: 'Next Due',
            dataIndex: 'next_due_date',
            key: 'next_due_date',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: Record<string, string> = {
                    active: 'green',
                    suspended: 'orange',
                    terminated: 'red',
                    pending: 'blue',
                };
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Button type="link" size="small">Manage</Button>
            ),
        },
    ];

    const ticketColumns = [
        {
            title: 'Ticket #',
            dataIndex: 'ticket_number',
            key: 'ticket_number',
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            render: (dept: string) => <Tag>{dept.toUpperCase()}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: Record<string, string> = {
                    open: 'blue',
                    awaiting_reply: 'orange',
                    in_progress: 'cyan',
                    answered: 'green',
                    closed: 'gray',
                };
                return <Tag color={colors[status]}>{status.replace('_', ' ').toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Button type="link" size="small">View</Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h1>Client Portal Dashboard</h1>
            
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card>
                        <Statistic
                            title="Active Services"
                            value={stats.active_services || 0}
                            prefix={<CloudServerOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card>
                        <Statistic
                            title="Pending Invoices"
                            value={stats.pending_invoices || 0}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card>
                        <Statistic
                            title="Total Due"
                            value={stats.total_due || 0}
                            prefix={<DollarOutlined />}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card>
                        <Statistic
                            title="Credit Balance"
                            value={stats.credit_balance || 0}
                            prefix={<CreditCardOutlined />}
                            precision={2}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card>
                        <Statistic
                            title="Open Tickets"
                            value={stats.open_tickets || 0}
                            prefix={<CustomerServiceOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card>
                        <Statistic
                            title="Active Domains"
                            value={stats.active_domains || 0}
                            prefix={<GlobalOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Recent Invoices */}
            <Card 
                title="Recent Invoices" 
                style={{ marginBottom: '24px' }}
                extra={<Button type="link">View All</Button>}
            >
                <Table
                    columns={invoiceColumns}
                    dataSource={recentInvoices}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                />
            </Card>

            {/* Recent Services */}
            <Card 
                title="Recent Services" 
                style={{ marginBottom: '24px' }}
                extra={<Button type="link">View All</Button>}
            >
                <Table
                    columns={serviceColumns}
                    dataSource={recentServices}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                />
            </Card>

            {/* Open Tickets */}
            <Card 
                title="Open Support Tickets"
                extra={<Button type="primary">New Ticket</Button>}
            >
                <Table
                    columns={ticketColumns}
                    dataSource={openTickets}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                />
            </Card>
        </div>
    );
};

export default ClientDashboard;
