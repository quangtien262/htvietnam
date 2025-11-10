import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Select } from 'antd';
import { Column } from '@ant-design/plots';
import axios from 'axios';
import StatCard from '@/components/whmcs/StatCard';

interface ProductData {
    total_products: number;
    total_sales: number;
    best_seller: string;
    worst_seller: string;
    products: {
        name: string;
        total_sales: number;
        revenue: number;
        conversion_rate: number;
    }[];
    sales_by_product: { product: string; sales: number }[];
}

const ProductPerformance: React.FC = () => {
    const [data, setData] = useState<ProductData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('monthly');

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/analytics/products', {
                params: { period },
            });
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const chartConfig = {
        data: data?.sales_by_product || [],
        xField: 'product',
        yField: 'sales',
        color: '#f5222d',
        label: {
            position: 'top' as const,
        },
    };

    const columns = [
        {
            title: 'Sản Phẩm',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Số Lượng Bán',
            dataIndex: 'total_sales',
            key: 'total_sales',
        },
        {
            title: 'Doanh Thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value: number) => `${value.toLocaleString()} VND`,
        },
        {
            title: 'Tỷ Lệ Chuyển Đổi',
            dataIndex: 'conversion_rate',
            key: 'conversion_rate',
            render: (value: number) => `${value.toFixed(2)}%`,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Hiệu Suất Sản Phẩm"
                extra={
                    <Select value={period} onChange={setPeriod} style={{ width: 120 }}>
                        <Select.Option value="daily">Ngày</Select.Option>
                        <Select.Option value="weekly">Tuần</Select.Option>
                        <Select.Option value="monthly">Tháng</Select.Option>
                    </Select>
                }
            >
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                        <StatCard
                            title="Tổng Sản Phẩm"
                            value={data?.total_products || 0}
                            prefix=""
                            loading={loading}
                        />
                    </Col>
                    <Col span={6}>
                        <StatCard
                            title="Tổng Lượt Bán"
                            value={data?.total_sales || 0}
                            prefix=""
                            loading={loading}
                        />
                    </Col>
                    <Col span={6}>
                        <Card size="small">
                            <div style={{ fontSize: 14, color: '#666' }}>Bán Chạy Nhất</div>
                            <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>
                                {data?.best_seller || '-'}
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card size="small">
                            <div style={{ fontSize: 14, color: '#666' }}>Bán Kém Nhất</div>
                            <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>
                                {data?.worst_seller || '-'}
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Card title="Biểu Đồ Bán Hàng Theo Sản Phẩm" loading={loading} style={{ marginBottom: 24 }}>
                    <Column {...chartConfig} />
                </Card>

                <Table
                    columns={columns}
                    dataSource={data?.products || []}
                    rowKey="name"
                    loading={loading}
                />
            </Card>
        </div>
    );
};

export default ProductPerformance;
