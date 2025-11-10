import React, { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Select, Button, message, Space } from 'antd';
import axios from 'axios';

const WebhookSettings: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/aio/api/whmcs/webhooks/settings');
            if (response.data.success) {
                form.setFieldsValue(response.data.data);
            }
        } catch {
            message.error('Không thể tải cài đặt!');
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async (values: any) => {
        setLoading(true);
        try {
            const response = await axios.put('/aio/api/whmcs/webhooks/settings', values);
            if (response.data.success) {
                message.success('Lưu cài đặt thành công!');
            }
        } catch {
            message.error('Lưu cài đặt thất bại!');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div style={{ padding: 24 }}>Loading...</div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <Card title="Cài Đặt Webhook Chung">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{
                        timeout: 30,
                        max_retries: 3,
                        retry_delay: 60,
                        signature_algorithm: 'sha256',
                    }}
                >
                    <Form.Item
                        label="Timeout (giây)"
                        name="timeout"
                        tooltip="Thời gian chờ tối đa khi gọi webhook"
                        rules={[{ required: true, message: 'Vui lòng nhập timeout' }]}
                    >
                        <InputNumber min={1} max={300} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Số lần retry tối đa"
                        name="max_retries"
                        tooltip="Số lần thử lại khi webhook thất bại"
                        rules={[{ required: true, message: 'Vui lòng nhập số lần retry' }]}
                    >
                        <InputNumber min={0} max={10} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Khoảng thời gian retry (giây)"
                        name="retry_delay"
                        tooltip="Khoảng cách giữa các lần retry"
                        rules={[{ required: true, message: 'Vui lòng nhập retry delay' }]}
                    >
                        <InputNumber min={1} max={3600} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Signature Algorithm"
                        name="signature_algorithm"
                        tooltip="Thuật toán mã hóa signature"
                        rules={[{ required: true, message: 'Vui lòng chọn algorithm' }]}
                    >
                        <Select>
                            <Select.Option value="sha256">SHA-256</Select.Option>
                            <Select.Option value="sha512">SHA-512</Select.Option>
                            <Select.Option value="md5">MD5</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Lưu Cài Đặt
                            </Button>
                            <Button onClick={() => form.resetFields()}>
                                Reset
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default WebhookSettings;
