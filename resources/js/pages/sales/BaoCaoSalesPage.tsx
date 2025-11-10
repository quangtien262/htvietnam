import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Form } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';

export default function BaoCaoSalesPage() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>({});
    const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());

    useEffect(() => {
        loadData();
    }, [selectedMonth]);

    const loadData = () => {
        setLoading(true);
        const thang = selectedMonth.month() + 1;
        const nam = selectedMonth.year();
        
        axios.get('/aio/api/sales/don-hang/bao-cao', {
            params: { thang, nam }
        })
        .then((res: any) => {
            if (res.data.message === 'success') {
                setData(res.data.data || {});
            }
        })
        .finally(() => setLoading(false));
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>Báo cáo Bán hàng</h2>
            
            <Card style={{ marginBottom: 24 }}>
                <Form layout="inline">
                    <Form.Item label="Chọn tháng/năm">
                        <DatePicker 
                            picker="month" 
                            value={selectedMonth}
                            onChange={(date) => date && setSelectedMonth(date)}
                            format="MM/YYYY"
                            style={{ width: 200 }}
                        />
                    </Form.Item>
                </Form>
            </Card>

            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic 
                            title="Tổng đơn hàng"
                            value={data.tong_don_hang || 0}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic 
                            title="Tổng doanh thu"
                            value={data.tong_doanh_thu || 0}
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic 
                            title="Đã thanh toán"
                            value={data.da_thanh_toan || 0}
                            valueStyle={{ color: '#3f8600' }}
                            suffix="VNĐ"
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic 
                            title="Công nợ"
                            value={data.cong_no || 0}
                            valueStyle={{ color: '#cf1322' }}
                            suffix="VNĐ"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
