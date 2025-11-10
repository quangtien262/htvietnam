import React, { useState } from 'react';
import { Form, Input, Checkbox, Button, Card, message, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';

const AVAILABLE_EVENTS = [
    { label: 'Invoice Created', value: 'invoice_created' },
    { label: 'Invoice Paid', value: 'invoice_paid' },
    { label: 'Invoice Cancelled', value: 'invoice_cancelled' },
    { label: 'Invoice Refunded', value: 'invoice_refunded' },
    { label: 'Service Created', value: 'service_created' },
    { label: 'Service Provisioned', value: 'service_provisioned' },
    { label: 'Service Suspended', value: 'service_suspended' },
    { label: 'Service Terminated', value: 'service_terminated' },
    { label: 'Client Created', value: 'client_created' },
    { label: 'Ticket Created', value: 'ticket_created' },
    { label: 'Ticket Replied', value: 'ticket_replied' },
];

const WebhookCreate: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const response = await axios.post('/aio/api/whmcs/webhooks', values);
            if (response.data.success) {
                message.success('Tạo webhook thành công!');
                navigate(ROUTE.whmcsWebhooks);
            }
        } catch (error) {
            message.error('Tạo webhook thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Card title="Tạo Webhook Mới">
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleSubmit}
                    initialValues={{ is_active: true }}
                >
                    <Form.Item
                        label="Tên Webhook"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên webhook' }]}
                    >
                        <Input placeholder="VD: Invoice Payment Notification" />
                    </Form.Item>

                    <Form.Item
                        label="URL"
                        name="url"
                        rules={[
                            { required: true, message: 'Vui lòng nhập URL' },
                            { type: 'url', message: 'URL không hợp lệ' }
                        ]}
                    >
                        <Input placeholder="https://your-domain.com/webhook" />
                    </Form.Item>

                    <Form.Item
                        label="Events (Chọn ít nhất 1 event)"
                        name="events"
                        rules={[{ 
                            required: true, 
                            message: 'Vui lòng chọn ít nhất 1 event',
                            type: 'array',
                            min: 1
                        }]}
                    >
                        <Checkbox.Group 
                            options={AVAILABLE_EVENTS}
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        valuePropName="checked"
                    >
                        <Checkbox>Kích hoạt ngay sau khi tạo</Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Tạo Webhook
                            </Button>
                            <Button onClick={() => navigate(ROUTE.whmcsWebhooks)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default WebhookCreate;
