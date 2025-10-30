import React, { useState } from 'react';
import AitilenLayout from '@/layouts/AitilenLayout';
import { Card, Select, Row, Col, Descriptions } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const { Option } = Select;

// Demo data
const demoData = [
    { month: '01/2024', amount: 1200000 },
    { month: '02/2024', amount: 1350000 },
    { month: '03/2024', amount: 1100000 },
    { month: '04/2024', amount: 1450000 },
    { month: '05/2024', amount: 1500000 },
    { month: '06/2024', amount: 1300000 },
    { month: '07/2024', amount: 1550000 },
    { month: '08/2024', amount: 1400000 },
    { month: '09/2024', amount: 1600000 },
    { month: '10/2024', amount: 1700000 },
    { month: '11/2024', amount: 1650000 },
    { month: '12/2024', amount: 1750000 },
];

// Hàm format tiền
function formatMoney(value: number) {
    return value.toLocaleString('vi-VN') + ' VNĐ';
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#fff', border: '1px solid #eee', padding: 10 }}>
                <strong>Tháng: {label}</strong>
                <br />
                <span>Tiền phòng: <b style={{ color: '#1890ff' }}>{formatMoney(payload[0].value)}</b></span>
            </div>
        );
    }
    return null;
};



export default function Dashboard(props) {
    const [year, setYear] = useState('2024');
    const filteredData = demoData.filter(item => item.month.endsWith(year));

    // Demo thông tin khách hàng
    const customerInfo = {
        name: props.user.name,
        phone: props.user.phone,
        email: props.user.email,
        address: props.user.hktt
    };

    // Demo thông tin hợp đồng
    const contractInfo = {
        code: 'HD2024-001',
        room: 'A101',
        start: '01/01/2024',
        end: '31/12/2024',
        price: '1.500.000 VNĐ/tháng'
    };

    return (
        <div>
            <AitilenLayout
                content={
                    <>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col xs={24} md={12}>
                                <Card title="Thông tin khách hàng" size="small">
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Họ tên">{customerInfo.name}</Descriptions.Item>
                                        <Descriptions.Item label="Điện thoại">{customerInfo.phone}</Descriptions.Item>
                                        <Descriptions.Item label="Email">{customerInfo.email}</Descriptions.Item>
                                        <Descriptions.Item label="Địa chỉ">{customerInfo.address}</Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>
                            <Col xs={24} md={12}>
                                <Card title="Thông tin hợp đồng" size="small">
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Mã hợp đồng">{contractInfo.code}</Descriptions.Item>
                                        <Descriptions.Item label="Phòng">{contractInfo.room}</Descriptions.Item>
                                        <Descriptions.Item label="Thời gian">{contractInfo.start} - {contractInfo.end}</Descriptions.Item>
                                        <Descriptions.Item label="Giá phòng">{contractInfo.price}</Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>
                        </Row>
                        <Card title="Hóa đơn gần đây" style={{ marginBottom: 24 }}>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={filteredData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="amount" name="Tiền phòng (VNĐ)" fill="#1890ff" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </>
                }
            />
        </div>
    );
}
