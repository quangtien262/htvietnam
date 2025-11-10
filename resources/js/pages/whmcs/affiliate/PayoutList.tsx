import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Tag, Space, message, Modal, Form, InputNumber, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Payout {
    id: number;
    affiliate_name: string;
    amount: number;
    method: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    reference_number: string | null;
    notes: string | null;
    created_at: string;
    paid_at: string | null;
}

const PayoutList: React.FC = () => {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/affiliates/payouts');
            if (response.data.success) {
                setPayouts(response.data.data);
            }
        } catch {
            message.error('Không thể tải danh sách payouts!');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePayout = async (values: {
        affiliate_id: number;
        amount: number;
        method: string;
    }) => {
        try {
            const response = await axios.post('/aio/api/whmcs/affiliates/payouts', values);
            if (response.data.success) {
                message.success('Tạo payout thành công!');
                setModalVisible(false);
                form.resetFields();
                fetchPayouts();
            }
        } catch {
            message.error('Tạo payout thất bại!');
        }
    };

    const handleMarkPaid = async (id: number) => {
        try {
            await axios.post(`/aio/api/whmcs/affiliates/payouts/${id}/mark-paid`);
            message.success('Đánh dấu đã thanh toán!');
            fetchPayouts();
        } catch {
            message.error('Thao tác thất bại!');
        }
    };

    const columns = [
        {
            title: 'Affiliate',
            dataIndex: 'affiliate_name',
            key: 'affiliate_name',
        },
        {
            title: 'Số Tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (value: number) => <strong>{value.toLocaleString()} VND</strong>,
        },
        {
            title: 'Phương Thức',
            dataIndex: 'method',
            key: 'method',
            render: (method: string) => <Tag>{method}</Tag>,
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors = {
                    pending: 'orange',
                    processing: 'blue',
                    completed: 'green',
                    failed: 'red',
                };
                return <Tag color={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Mã Tham Chiếu',
            dataIndex: 'reference_number',
            key: 'reference_number',
            render: (ref: string | null) => ref || '-',
        },
        {
            title: 'Ngày Tạo',
            dataIndex: 'created_at',
            key: 'created_at',
        },
        {
            title: 'Thao Tác',
            key: 'action',
            render: (_: unknown, record: Payout) => (
                record.status === 'pending' && (
                    <Button size="small" type="primary" onClick={() => handleMarkPaid(record.id)}>
                        Đánh Dấu Đã Trả
                    </Button>
                )
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Danh Sách Payouts"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setModalVisible(true)}
                    >
                        Tạo Payout
                    </Button>
                }
            >
                <Table columns={columns} dataSource={payouts} rowKey="id" loading={loading} />
            </Card>

            <Modal
                title="Tạo Payout Mới"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleCreatePayout}>
                    <Form.Item
                        label="Affiliate ID"
                        name="affiliate_id"
                        rules={[{ required: true, message: 'Vui lòng nhập Affiliate ID' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Số Tiền"
                        name="amount"
                        rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Phương Thức"
                        name="method"
                        rules={[{ required: true, message: 'Vui lòng nhập phương thức' }]}
                    >
                        <Input placeholder="VD: Bank Transfer, PayPal" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Tạo Payout
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PayoutList;
