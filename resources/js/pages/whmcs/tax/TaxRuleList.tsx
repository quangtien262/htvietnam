import React, { useState, useEffect } from 'react';
import { Table, Button, Switch, Tag, Space, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';

interface TaxRule {
    id: number;
    name: string;
    country: string;
    state: string | null;
    tax_rate: number;
    is_compound: boolean;
    is_active: boolean;
}

const TaxRuleList: React.FC = () => {
    const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTaxRules();
    }, []);

    const fetchTaxRules = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/taxes');
            if (response.data.success) {
                setTaxRules(response.data.data);
            }
        } catch {
            message.error('Không thể tải danh sách tax rules!');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: number, active: boolean) => {
        try {
            await axios.put(`/aio/api/whmcs/taxes/${id}`, { is_active: active });
            message.success('Cập nhật thành công!');
            fetchTaxRules();
        } catch {
            message.error('Cập nhật thất bại!');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/aio/api/whmcs/taxes/${id}`);
            message.success('Xóa tax rule thành công!');
            fetchTaxRules();
        } catch {
            message.error('Xóa tax rule thất bại!');
        }
    };

    const columns = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Quốc Gia',
            dataIndex: 'country',
            key: 'country',
        },
        {
            title: 'Tỉnh/Bang',
            dataIndex: 'state',
            key: 'state',
            render: (state: string | null) => state || '-',
        },
        {
            title: 'Thuế Suất',
            dataIndex: 'tax_rate',
            key: 'tax_rate',
            render: (rate: number) => `${rate}%`,
        },
        {
            title: 'Loại',
            dataIndex: 'is_compound',
            key: 'is_compound',
            render: (compound: boolean) => (
                <Tag color={compound ? 'orange' : 'blue'}>
                    {compound ? 'Compound' : 'Simple'}
                </Tag>
            ),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active: boolean, record: TaxRule) => (
                <Switch
                    checked={active}
                    onChange={(checked) => handleToggle(record.id, checked)}
                />
            ),
        },
        {
            title: 'Thao Tác',
            key: 'action',
            render: (_: unknown, record: TaxRule) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`${ROUTE.whmcsTaxes}/edit/${record.id}`)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa tax rule này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button size="small" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Danh Sách Tax Rules"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`${ROUTE.whmcsTaxes}/create`)}
                    >
                        Thêm Tax Rule
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={taxRules}
                    rowKey="id"
                    loading={loading}
                />
            </Card>
        </div>
    );
};

export default TaxRuleList;
