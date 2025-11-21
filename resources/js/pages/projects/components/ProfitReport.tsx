import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Statistic, message, Spin } from 'antd';
import { Column } from '@ant-design/plots';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import axios from 'axios';
import { numberFormat } from '../../../function/common';

const ProfitReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>({
        overview: {
            totalRevenue: 0,
            totalCost: 0,
            grossProfit: 0,
            netProfit: 0,
            profitMargin: 0
        },
        byProject: [],
        byMonth: [],
        expenses: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Mock data - thay bằng API thật
            const mockData = {
                overview: {
                    totalRevenue: 500000000, // 500 triệu
                    totalCost: 350000000,     // 350 triệu
                    grossProfit: 150000000,   // 150 triệu
                    netProfit: 120000000,     // 120 triệu
                    profitMargin: 24          // 24%
                },
                byProject: [
                    {
                        key: '1',
                        projectName: 'Căn hộ A101',
                        revenue: 150000000,
                        cost: 100000000,
                        profit: 50000000,
                        profitMargin: 33.3
                    },
                    {
                        key: '2',
                        projectName: 'Nhà phố B202',
                        revenue: 200000000,
                        cost: 150000000,
                        profit: 50000000,
                        profitMargin: 25
                    },
                    {
                        key: '3',
                        projectName: 'Đất nền C303',
                        revenue: 150000000,
                        cost: 100000000,
                        profit: 50000000,
                        profitMargin: 33.3
                    }
                ],
                byMonth: [
                    { month: '01/2025', revenue: 100000000, cost: 70000000, profit: 30000000 },
                    { month: '02/2025', revenue: 120000000, cost: 85000000, profit: 35000000 },
                    { month: '03/2025', revenue: 150000000, cost: 100000000, profit: 50000000 },
                    { month: '04/2025', revenue: 130000000, cost: 95000000, profit: 35000000 }
                ],
                expenses: [
                    { key: '1', category: 'Chi phí vật tư', amount: 150000000, percent: 42.9 },
                    { key: '2', category: 'Chi phí nhân công', amount: 100000000, percent: 28.6 },
                    { key: '3', category: 'Chi phí quản lý', amount: 50000000, percent: 14.3 },
                    { key: '4', category: 'Chi phí khác', amount: 50000000, percent: 14.3 }
                ]
            };

            setData(mockData);
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu báo cáo');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const projectColumns = [
        {
            title: 'Dự án',
            dataIndex: 'projectName',
            key: 'projectName',
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value: number) => <span>{numberFormat(value)} ₫</span>,
            align: 'right' as const
        },
        {
            title: 'Chi phí',
            dataIndex: 'cost',
            key: 'cost',
            render: (value: number) => <span>{numberFormat(value)} ₫</span>,
            align: 'right' as const
        },
        {
            title: 'Lợi nhuận',
            dataIndex: 'profit',
            key: 'profit',
            render: (value: number) => (
                <span style={{ color: value > 0 ? '#3f8600' : '#cf1322', fontWeight: 'bold' }}>
                    {numberFormat(value)} ₫
                </span>
            ),
            align: 'right' as const
        },
        {
            title: 'Tỷ suất LN (%)',
            dataIndex: 'profitMargin',
            key: 'profitMargin',
            render: (value: number) => (
                <span style={{ color: value > 20 ? '#3f8600' : '#faad14' }}>
                    {value.toFixed(1)}%
                </span>
            ),
            align: 'right' as const
        }
    ];

    const expenseColumns = [
        {
            title: 'Loại chi phí',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (value: number) => <span>{numberFormat(value)} ₫</span>,
            align: 'right' as const
        },
        {
            title: 'Tỷ lệ (%)',
            dataIndex: 'percent',
            key: 'percent',
            render: (value: number) => <span>{value.toFixed(1)}%</span>,
            align: 'right' as const
        }
    ];

    const chartConfig = {
        data: data.byMonth,
        xField: 'month',
        yField: 'profit',
        label: {
            position: 'top' as const,
            style: {
                fill: '#000000',
                opacity: 0.6,
            },
            formatter: (datum: any) => {
                return `${(datum.profit / 1000000).toFixed(0)}M`;
            }
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
            },
        },
        yAxis: {
            label: {
                formatter: (v: string) => `${(parseInt(v) / 1000000).toFixed(0)}M`,
            },
        },
        meta: {
            month: {
                alias: 'Tháng',
            },
            profit: {
                alias: 'Lợi nhuận',
            },
        },
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            {/* Tổng quan */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={data.overview.totalRevenue}
                            formatter={(value) => `${numberFormat(value as number)} ₫`}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng chi phí"
                            value={data.overview.totalCost}
                            formatter={(value) => `${numberFormat(value as number)} ₫`}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Lợi nhuận gộp"
                            value={data.overview.grossProfit}
                            formatter={(value) => `${numberFormat(value as number)} ₫`}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ArrowUpOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tỷ suất lợi nhuận"
                            value={data.overview.profitMargin}
                            suffix="%"
                            valueStyle={{ color: data.overview.profitMargin > 20 ? '#3f8600' : '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ lợi nhuận theo tháng */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={24}>
                    <Card title="Biểu đồ lợi nhuận theo tháng" bordered={false}>
                        <Column {...chartConfig} />
                    </Card>
                </Col>
            </Row>

            {/* Lợi nhuận theo dự án */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={16}>
                    <Card title="Lợi nhuận theo dự án" bordered={false}>
                        <Table
                            columns={projectColumns}
                            dataSource={data.byProject}
                            pagination={false}
                            summary={(pageData) => {
                                let totalRevenue = 0;
                                let totalCost = 0;
                                let totalProfit = 0;

                                pageData.forEach(({ revenue, cost, profit }) => {
                                    totalRevenue += revenue;
                                    totalCost += cost;
                                    totalProfit += profit;
                                });

                                const avgMargin = totalRevenue > 0
                                    ? ((totalProfit / totalRevenue) * 100).toFixed(1)
                                    : '0.0';

                                return (
                                    <Table.Summary.Row style={{ background: '#fafafa' }}>
                                        <Table.Summary.Cell index={0}>
                                            <strong>Tổng cộng</strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} align="right">
                                            <strong>{numberFormat(totalRevenue)} ₫</strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={2} align="right">
                                            <strong>{numberFormat(totalCost)} ₫</strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={3} align="right">
                                            <strong style={{ color: '#3f8600' }}>
                                                {numberFormat(totalProfit)} ₫
                                            </strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={4} align="right">
                                            <strong>{avgMargin}%</strong>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                );
                            }}
                        />
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title="Chi phí theo danh mục" bordered={false}>
                        <Table
                            columns={expenseColumns}
                            dataSource={data.expenses}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProfitReport;
