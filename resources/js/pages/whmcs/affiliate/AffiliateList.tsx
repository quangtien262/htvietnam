import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Switch, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';

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
                        onClick={() => navigate(`${ROUTE.whmcsAffiliate}/${record.id}`)}
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
                        onClick={() => navigate(`${ROUTE.whmcsAffiliate}/create`)}
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
        </div>
    );
};

export default AffiliateList;
