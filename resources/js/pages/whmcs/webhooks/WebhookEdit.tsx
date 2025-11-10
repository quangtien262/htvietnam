import React, { useState, useEffect } from 'react';
import { Form, Input, Checkbox, Button, Card, message, Space, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
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

const WebhookEdit: React.FC = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [secretKey, setSecretKey] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchWebhook();
    }, [id]);

    const fetchWebhook = async () => {
        try {
            const response = await axios.get(`/aio/api/whmcs/webhooks/${id}`);
            if (response.data.success) {
                const webhook = response.data.data;
                form.setFieldsValue({
                    name: webhook.name,
                    url: webhook.url,
                    events: webhook.events,
                    is_active: webhook.is_active,
                });
                setSecretKey(webhook.secret_key);
            }
        } catch {
            message.error('Không thể tải webhook!');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const response = await axios.put(`/aio/api/whmcs/webhooks/${id}`, values);
            if (response.data.success) {
                message.success('Cập nhật webhook thành công!');
                navigate(ROUTE.whmcsWebhooks);
            }
        } catch {
            message.error('Cập nhật webhook thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateSecret = async () => {
        try {
            const response = await axios.post(`/aio/api/whmcs/webhooks/${id}/regenerate-secret`);
            if (response.data.success) {
                setSecretKey(response.data.data.secret_key);
                message.success('Tạo lại secret key thành công!');
            }
        } catch {
            message.error('Tạo lại secret key thất bại!');
        }
    };

    if (fetching) {
        return <div style={{ padding: 24, textAlign: 'center' }}><Spin /></div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <Card title="Chỉnh Sửa Webhook">
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleSubmit}
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

                    <Form.Item label="Secret Key">
                        <Space.Compact style={{ width: '100%' }}>
                            <Input value={secretKey} disabled />
                            <Button onClick={handleRegenerateSecret}>Tạo Lại</Button>
                        </Space.Compact>
                    </Form.Item>

                    <Form.Item
                        label="Events"
                        name="events"
                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 event' }]}
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
                        <Checkbox>Kích hoạt</Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Cập Nhật
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

export default WebhookEdit;
