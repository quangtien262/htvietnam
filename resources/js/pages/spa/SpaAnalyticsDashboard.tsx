import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Space } from 'antd';
import { DollarOutlined, UserOutlined, ShoppingOutlined, RiseOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const SpaAnalyticsDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<any>([
        dayjs().startOf('month'),
        dayjs().endOf('month'),
    ]);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/spa/analytics/dashboard', {
                params: {
                    tu_ngay: dateRange[0].format('YYYY-MM-DD'),
                    den_ngay: dateRange[1].format('YYYY-MM-DD'),
                },
            });
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Báo cáo & Thống kê</h1>
                <RangePicker
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates)}
                    format="DD/MM/YYYY"
                />
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={data?.revenue?.total || 0}
                            prefix={<DollarOutlined />}
                            formatter={(value) => formatCurrency(Number(value))}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Số hóa đơn"
                            value={data?.revenue?.invoice_count || 0}
                            prefix={<ShoppingOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Khách hàng"
                            value={data?.customers?.active || 0}
                            prefix={<UserOutlined />}
                            suffix={`/ ${data?.customers?.total || 0}`}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="TB hóa đơn"
                            value={data?.revenue?.average_invoice || 0}
                            prefix={<RiseOutlined />}
                            formatter={(value) => formatCurrency(Number(value))}
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Card title="Biểu đồ doanh thu" loading={loading}>
                        <p>Chart placeholder - Integrate with chart library</p>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SpaAnalyticsDashboard;
