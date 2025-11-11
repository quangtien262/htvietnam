import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Switch, Popconfirm, Modal, Form, InputNumber, Select } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';

const { Option } = Select;

interface Affiliate {
    id: number;
    user_id: number;
    user_name: string;
    code: string;
    commission_rate: number;
    status: 'pending' | 'active' | 'suspended';
    total_referrals: number;
    total_commissions: number;
    total_paid: number;
    created_at: string;
}

const AffiliateList: React.FC = () => {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        fetchAffiliates();
    }, [pagination.current]);

    const fetchAffiliates = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/affiliates', {
                params: {
                    page: pagination.current,
                    per_page: pagination.pageSize,
                },
            });
            if (response.data.success) {
                setAffiliates(response.data.data);
                setPagination(prev => ({ ...prev, total: response.data.meta?.total || 0 }));
            }
        } catch {
            message.error('Không thể tải danh sách affiliates!');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await axios.post(`/aio/api/whmcs/affiliates/${id}/approve`);
            message.success('Duyệt affiliate thành công!');
            fetchAffiliates();
        } catch {
            message.error('Duyệt affiliate thất bại!');
        }
    };

    const handleSuspend = async (id: number) => {
        try {
            await axios.post(`/aio/api/whmcs/affiliates/${id}/suspend`);
            message.success('Tạm ngưng affiliate thành công!');
            fetchAffiliates();
        } catch {
            message.error('Tạm ngưng affiliate thất bại!');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/aio/api/whmcs/affiliates/${id}`);
            message.success('Xóa affiliate thành công!');
            fetchAffiliates();
        } catch {
            message.error('Xóa affiliate thất bại!');
        }
    };

    const handleCreateAffiliate = async (values: {
        user_id: number;
        commission_rate: number;
        commission_type: string;
    }) => {
        try {
            const response = await axios.post('/aio/api/whmcs/affiliates', values);
            if (response.data.success) {
                message.success('Tạo affiliate thành công!');
                setIsModalOpen(false);
                form.resetFields();
                fetchAffiliates();
            }
        } catch {
            message.error('Tạo affiliate thất bại!');
        }
    };

    const columns = [
        {
            title: 'Affiliate',
            dataIndex: 'user_name',
            key: 'user_name',
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            render: (code: string) => <Tag color="blue">{code}</Tag>,
        },
        {
            title: 'Hoa Hồng',
            dataIndex: 'commission_rate',
            key: 'commission_rate',
            render: (rate: number) => `${rate}%`,
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors = { pending: 'orange', active: 'green', suspended: 'red' };
                return <Tag color={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Referrals',
            dataIndex: 'total_referrals',
            key: 'total_referrals',
        },
        {
            title: 'Tổng Hoa Hồng',
            dataIndex: 'total_commissions',
            key: 'total_commissions',
            render: (value: number) => `${value.toLocaleString()} VND`,
        },
        {
            title: 'Đã Thanh Toán',
            dataIndex: 'total_paid',
            key: 'total_paid',
            render: (value: number) => `${value.toLocaleString()} VND`,
        },
        {
            title: 'Thao Tác',
            key: 'action',
            render: (_: unknown, record: Affiliate) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`${ROUTE.whmcsAffiliates}${record.id}`)}
                    >
                        Chi Tiết
                    </Button>
                    {record.status === 'pending' && (
                        <Button size="small" type="primary" onClick={() => handleApprove(record.id)}>
                            Duyệt
                        </Button>
                    )}
                    {record.status === 'active' && (
                        <Button size="small" danger onClick={() => handleSuspend(record.id)}>
                            Tạm Ngưng
                        </Button>
                    )}
                    <Popconfirm
                        title="Xác nhận xóa affiliate này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Quản Lý Affiliate"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Thêm Affiliate
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={affiliates}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    onChange={(newPagination) => setPagination(newPagination as typeof pagination)}
                />
            </Card>

            {/* Modal tạo affiliate */}
            <Modal
                title="Tạo Affiliate Mới"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText="Tạo Affiliate"
                cancelText="Hủy"
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateAffiliate}
                    initialValues={{ commission_rate: 10, commission_type: 'percentage' }}
                >
                    <Form.Item
                        label="User ID"
                        name="user_id"
                        rules={[{ required: true, message: 'Vui lòng nhập User ID' }]}
                        tooltip="ID của khách hàng muốn trở thành affiliate"
                    >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập User ID" />
                    </Form.Item>

                    <Form.Item
                        label="Loại Hoa Hồng"
                        name="commission_type"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Option value="percentage">Phần Trăm (%)</Option>
                            <Option value="fixed">Cố Định (VND)</Option>
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
                            placeholder="VD: 10 (cho 10%)"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AffiliateList;
