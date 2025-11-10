import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Table, Spin, Button, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, ShoppingOutlined, DownloadOutlined } from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import API from '@/common/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface OverviewData {
    revenue: {
        current_revenue: number;
        previous_revenue: number;
        growth_percentage: number;
        outstanding_revenue: number;
        mrr: number;
        arr: number;
    };
    services: {
        total: number;
        active: number;
        active_percentage: number;
    };
    average_order_value: number;
    customer_lifetime_value: {
        average_ltv: number;
    };
}

const AnalyticsDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [overview, setOverview] = useState<OverviewData | null>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [topCustomers, setTopCustomers] = useState<any[]>([]);
    const [churnData, setChurnData] = useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [customerGrowth, setCustomerGrowth] = useState<any[]>([]);
    const [productPerformance, setProductPerformance] = useState<any[]>([]);
    
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf('month'), dayjs().endOf('month')]);
    const [period, setPeriod] = useState('daily');
    const [days, setDays] = useState(30);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    const fetchOverview = useCallback(async () => {
        const params: Record<string, string> = {};
        if (dateRange && dateRange[0] && dateRange[1]) {
            params.start_date = dateRange[0].format('YYYY-MM-DD');
            params.end_date = dateRange[1].format('YYYY-MM-DD');
        }

        const result = await axios.get(API.whmcsAnalyticsOverview, { params });
        if (result.data.success) {
            setOverview(result.data.data);
        }
    }, [dateRange]);

    const fetchRevenueData = useCallback(async () => {
        const result = await axios.get(API.whmcsAnalyticsRevenue, { params: { period, days } });
        if (result.data.success) {
            setRevenueData(result.data.data);
        }
    }, [period, days]);

    const fetchTopCustomers = useCallback(async () => {
        const result = await axios.get(API.whmcsAnalyticsTopCustomers, { params: { limit: 10 } });
        if (result.data.success) {
            setTopCustomers(result.data.data);
        }
    }, []);

    const fetchChurnRate = useCallback(async () => {
        const result = await axios.get(API.whmcsAnalyticsChurnRate, { params: { months: 6 } });
        if (result.data.success) {
            setChurnData(result.data.data);
        }
    }, []);

    const fetchPaymentMethods = useCallback(async () => {
        const result = await axios.get(API.whmcsAnalyticsPaymentMethods);
        if (result.data.success) {
            setPaymentMethods(result.data.data);
        }
    }, []);

    const fetchCustomerGrowth = useCallback(async () => {
        const result = await axios.get(API.whmcsAnalyticsCustomerGrowth, { params: { months: 12 } });
        if (result.data.success) {
            setCustomerGrowth(result.data.data);
        }
    }, []);

    const fetchProductPerformance = useCallback(async () => {
        const result = await axios.get(API.whmcsAnalyticsProductPerformance);
        if (result.data.success) {
            setProductPerformance(result.data.data);
        }
    }, []);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchOverview(),
                fetchRevenueData(),
                fetchTopCustomers(),
                fetchChurnRate(),
                fetchPaymentMethods(),
                fetchCustomerGrowth(),
                fetchProductPerformance(),
            ]);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            message.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    }, [fetchOverview, fetchRevenueData, fetchTopCustomers, fetchChurnRate, fetchPaymentMethods, fetchCustomerGrowth, fetchProductPerformance]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleExport = async (type: string) => {
        try {
            window.open(API.whmcsAnalyticsExport + `?type=${type}&period=${period}&days=${days}`, '_blank');
            message.success('Export started');
        } catch {
            message.error('Export failed');
        }
    };

    const customerColumns = [
        {
            title: 'Customer',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Revenue',
            dataIndex: 'total_revenue',
            key: 'total_revenue',
            render: (val: number) => `$${val?.toFixed(2) || 0}`,
            sorter: (a: any, b: any) => a.total_revenue - b.total_revenue,
        },
        {
            title: 'Invoices',
            dataIndex: 'invoice_count',
            key: 'invoice_count',
        },
    ];

    const productColumns = [
        {
            title: 'Product',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Services',
            dataIndex: 'service_count',
            key: 'service_count',
        },
        {
            title: 'Revenue',
            dataIndex: 'total_revenue',
            key: 'total_revenue',
            render: (val: number) => `$${val?.toFixed(2) || 0}`,
            sorter: (a: any, b: any) => a.total_revenue - b.total_revenue,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Analytics Dashboard</h1>
                <div>
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                        style={{ marginRight: 8 }}
                    />
                    <Select value={period} onChange={setPeriod} style={{ width: 120, marginRight: 8 }}>
                        <Option value="daily">Daily</Option>
                        <Option value="weekly">Weekly</Option>
                        <Option value="monthly">Monthly</Option>
                    </Select>
                    <Select value={days} onChange={setDays} style={{ width: 120 }}>
                        <Option value={7}>7 days</Option>
                        <Option value={30}>30 days</Option>
                        <Option value={90}>90 days</Option>
                        <Option value={365}>1 year</Option>
                    </Select>
                </div>
            </div>

            <Spin spinning={loading}>
                {/* KPI Cards */}
                {overview && (
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Current Revenue"
                                    value={overview.revenue?.current_revenue || 0}
                                    precision={2}
                                    prefix={<DollarOutlined />}
                                    valueStyle={{ color: '#3f8600' }}
                                    suffix={
                                        overview.revenue?.growth_percentage >= 0 ? (
                                            <ArrowUpOutlined style={{ fontSize: 14 }} />
                                        ) : (
                                            <ArrowDownOutlined style={{ fontSize: 14 }} />
                                        )
                                    }
                                />
                                <div style={{ marginTop: 8, fontSize: 12 }}>
                                    Growth: {overview.revenue?.growth_percentage || 0}%
                                </div>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="MRR (Monthly Recurring)"
                                    value={overview.revenue?.mrr || 0}
                                    precision={2}
                                    prefix={<DollarOutlined />}
                                />
                                <div style={{ marginTop: 8, fontSize: 12 }}>
                                    ARR: ${overview.revenue?.arr?.toFixed(2) || 0}
                                </div>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Active Services"
                                    value={overview.services?.active || 0}
                                    prefix={<ShoppingOutlined />}
                                />
                                <div style={{ marginTop: 8, fontSize: 12 }}>
                                    Active Rate: {overview.services?.active_percentage || 0}%
                                </div>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Avg Order Value"
                                    value={overview.average_order_value || 0}
                                    precision={2}
                                    prefix={<DollarOutlined />}
                                />
                                <div style={{ marginTop: 8, fontSize: 12 }}>
                                    LTV: ${overview.customer_lifetime_value?.average_ltv?.toFixed(2) || 0}
                                </div>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Revenue Chart */}
                <Card title="Revenue Trend" style={{ marginBottom: 24 }} extra={
                    <Button icon={<DownloadOutlined />} onClick={() => handleExport('revenue')}>
                        Export
                    </Button>
                }>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Customer Growth & Churn Rate */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={12}>
                        <Card title="Customer Growth">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={customerGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="new_customers" fill="#82ca9d" />
                                    <Bar dataKey="total_customers" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Churn Rate">
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={churnData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="churn_rate" stroke="#ff7300" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                {/* Payment Methods Distribution */}
                <Card title="Payment Methods Distribution" style={{ marginBottom: 24 }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={paymentMethods}
                                dataKey="total_amount"
                                nameKey="gateway"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {paymentMethods.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                {/* Top Customers */}
                <Card
                    title="Top Customers by Revenue"
                    style={{ marginBottom: 24 }}
                    extra={
                        <Button icon={<DownloadOutlined />} onClick={() => handleExport('customers')}>
                            Export
                        </Button>
                    }
                >
                    <Table
                        columns={customerColumns}
                        dataSource={topCustomers}
                        rowKey="id"
                        pagination={false}
                    />
                </Card>

                {/* Product Performance */}
                <Card title="Product Performance" extra={
                    <Button icon={<DownloadOutlined />} onClick={() => handleExport('services')}>
                        Export
                    </Button>
                }>
                    <Table
                        columns={productColumns}
                        dataSource={productPerformance}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </Card>
            </Spin>
        </div>
    );
};

export default AnalyticsDashboard;
