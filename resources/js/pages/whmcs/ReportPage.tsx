import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Space } from 'antd';
import { Line, Column, Pie } from '@ant-design/plots';
import { callApi } from '@/function/api';
import API from '@/common/api';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportPage = () => {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<any>([dayjs().startOf('month'), dayjs()]);
    const [reportType, setReportType] = useState('revenue');

    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [clientGrowthData, setClientGrowthData] = useState<any[]>([]);
    const [productStatsData, setProductStatsData] = useState<any[]>([]);
    const [ticketStatsData, setTicketStatsData] = useState<any[]>([]);

    const [summary, setSummary] = useState({
        total_revenue: 0,
        total_orders: 0,
        total_clients: 0,
        total_tickets: 0,
        avg_ticket_response_time: 0
    });

    useEffect(() => {
        fetchReport();
    }, [dateRange, reportType]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {
                start_date: dateRange[0]?.format('YYYY-MM-DD'),
                end_date: dateRange[1]?.format('YYYY-MM-DD')
            };

            // Fetch dashboard stats
            const dashboardRes = await callApi(API.whmcs_reportsDashboard, {});
            if (dashboardRes?.success) {
                setSummary({
                    total_revenue: dashboardRes.data.total_revenue || 0,
                    total_orders: dashboardRes.data.total_invoices || 0,
                    total_clients: dashboardRes.data.total_clients || 0,
                    total_tickets: 0,
                    avg_ticket_response_time: 0
                });
            }

            // Fetch revenue chart
            const revenueRes = await callApi(API.whmcs_reportsRevenue, params);
            if (revenueRes?.success) {
                setRevenueData(revenueRes.data);
            }

            // Fetch client growth
            const clientRes = await callApi(API.whmcs_reportsClientsGrowth, params);
            if (clientRes?.success) {
                setClientGrowthData(clientRes.data);
            }

            // Fetch services statistics
            const servicesRes = await callApi(API.whmcs_reportsServicesStatistics, {});
            if (servicesRes?.success) {
                // Transform data for charts
                if (servicesRes.data.by_product) {
                    setProductStatsData(servicesRes.data.by_product.map((item: any) => ({
                        name: item.name,
                        count: item.count
                    })));
                }
                if (servicesRes.data.by_status) {
                    setTicketStatsData(servicesRes.data.by_status.map((item: any) => ({
                        status: item.status,
                        count: item.count
                    })));
                }
            }



        } catch (error) {
            console.error('Error fetching report:', error);
        }
        setLoading(false);
    };

    const revenueConfig = {
        data: revenueData,
        xField: 'period',
        yField: 'total',
        point: { size: 5, shape: 'diamond' },
        label: {
            style: { fill: '#aaa' },
            formatter: (v: any) => Number(v.total).toLocaleString()
        },
    };

    const clientGrowthConfig = {
        data: clientGrowthData,
        xField: 'period',
        yField: 'count',
        columnStyle: { fill: '#1890ff' },
    };

    const productStatsConfig = {
        data: productStatsData,
        angleField: 'count',
        colorField: 'name',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name} {percentage}',
        },
        interactions: [{ type: 'element-active' }],
    };

    const ticketStatsConfig = {
        data: ticketStatsData,
        xField: 'status',
        yField: 'count',
        seriesField: 'status',
        color: ({ status }: any) => {
            const colors: any = {
                Open: '#1890ff',
                Answered: '#52c41a',
                'Customer-Reply': '#faad14',
                Closed: '#d9d9d9'
            };
            return colors[status] || '#1890ff';
        },
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>Báo cáo & Thống kê WHMCS</h2>

            <Space style={{ marginBottom: 16 }}>
                <RangePicker
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates)}
                    format="DD/MM/YYYY"
                />
                <Select
                    style={{ width: 200 }}
                    value={reportType}
                    onChange={setReportType}
                >
                    <Option value="revenue">Báo cáo doanh thu</Option>
                    <Option value="client">Báo cáo khách hàng</Option>
                    <Option value="product">Báo cáo sản phẩm</Option>
                    <Option value="ticket">Báo cáo hỗ trợ</Option>
                </Select>
            </Space>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={summary.total_revenue}
                            precision={2}
                            suffix="VNĐ"
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng đơn hàng"
                            value={summary.total_orders}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng khách hàng"
                            value={summary.total_clients}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng tickets"
                            value={summary.total_tickets}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Biểu đồ doanh thu" loading={loading}>
                        <Line {...revenueConfig} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Tăng trưởng khách hàng" loading={loading}>
                        <Column {...clientGrowthConfig} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                    <Card title="Phân bố sản phẩm" loading={loading}>
                        <Pie {...productStatsConfig} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Thống kê tickets" loading={loading}>
                        <Column {...ticketStatsConfig} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ReportPage;
