import React, { useState, useEffect } from 'react';
import { Table, Button, Card, message, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

interface TaxExemption {
    id: number;
    user_id: number;
    user_name: string;
    reason: string;
    is_active: boolean;
    created_at: string;
}

const TaxExemptions: React.FC = () => {
    const [exemptions, setExemptions] = useState<TaxExemption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchExemptions();
    }, []);

    const fetchExemptions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/taxes/exemptions');
            if (response.data.success) {
                setExemptions(response.data.data);
            }
        } catch {
            message.error('Không thể tải danh sách miễn thuế!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/aio/api/whmcs/taxes/exemptions/${id}`);
            message.success('Xóa miễn thuế thành công!');
            fetchExemptions();
        } catch {
            message.error('Xóa miễn thuế thất bại!');
        }
    };

    const columns = [
        {
            title: 'Khách Hàng',
            dataIndex: 'user_name',
            key: 'user_name',
        },
        {
            title: 'Lý Do',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active: boolean) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Ngày Tạo',
            dataIndex: 'created_at',
            key: 'created_at',
        },
        {
            title: 'Thao Tác',
            key: 'action',
            render: (_: unknown, record: TaxExemption) => (
                <Popconfirm
                    title="Xác nhận xóa miễn thuế này?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    <Button size="small" danger icon={<DeleteOutlined />}>
                        Xóa
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Danh Sách Miễn Thuế"
                extra={
                    <Button type="primary" icon={<PlusOutlined />}>
                        Thêm Miễn Thuế
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={exemptions}
                    rowKey="id"
                    loading={loading}
                />
            </Card>
        </div>
    );
};

export default TaxExemptions;
