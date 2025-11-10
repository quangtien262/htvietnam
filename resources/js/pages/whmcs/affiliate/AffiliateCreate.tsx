import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, message, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';

const AffiliateCreate: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (values: {
        user_id: number;
        commission_rate: number;
        commission_type: string;
    }) => {
        setLoading(true);
        try {
            const response = await axios.post('/aio/api/whmcs/affiliates', values);
            if (response.data.success) {
                message.success('Tạo affiliate thành công!');
                navigate(ROUTE.whmcsAffiliate);
            }
        } catch {
            message.error('Tạo affiliate thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Card title="Tạo Affiliate Mới">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ commission_rate: 10, commission_type: 'percentage' }}
                >
                    <Form.Item
                        label="User ID"
                        name="user_id"
                        rules={[{ required: true, message: 'Vui lòng nhập User ID' }]}
                        tooltip="ID của khách hàng muốn trở thành affiliate"
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Loại Hoa Hồng"
                        name="commission_type"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Select.Option value="percentage">Phần Trăm (%)</Select.Option>
                            <Select.Option value="fixed">Cố Định (VND)</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Tỷ Lệ Hoa Hồng"
                        name="commission_rate"
                        rules={[{ required: true, message: 'Vui lòng nhập tỷ lệ hoa hồng' }]}
                        tooltip="Nhập % hoặc số tiền cố định tùy theo loại hoa hồng"
                    >
                        <InputNumber
                            min={0}
                            max={100}
                            step={0.1}
                            precision={2}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Tạo Affiliate
                            </Button>
                            <Button onClick={() => navigate(ROUTE.whmcsAffiliate)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AffiliateCreate;
