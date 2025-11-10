import React, { useState, useEffect } from 'react';
import { Table, Button, Switch, Tag, Space, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';

interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
    exchange_rate: number;
    is_default: boolean;
    is_enabled: boolean;
}

const CurrencyList: React.FC = () => {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const fetchCurrencies = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/currencies');
            if (response.data.success) {
                setCurrencies(response.data.data);
            }
        } catch {
            message.error('Không thể tải danh sách currency!');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: number, enabled: boolean) => {
        try {
            await axios.put(`/aio/api/whmcs/currencies/${id}`, { is_enabled: enabled });
            message.success('Cập nhật thành công!');
            fetchCurrencies();
        } catch {
            message.error('Cập nhật thất bại!');
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await axios.post(`/aio/api/whmcs/currencies/${id}/set-default`);
            message.success('Đã đặt làm currency mặc định!');
            fetchCurrencies();
        } catch {
            message.error('Không thể đặt currency mặc định!');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/aio/api/whmcs/currencies/${id}`);
            message.success('Xóa currency thành công!');
            fetchCurrencies();
        } catch {
            message.error('Xóa currency thất bại!');
        }
    };

    const columns = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            render: (code: string, record: Currency) => (
                <Space>
                    <strong>{code}</strong>
                    {record.is_default && <Tag color="gold">Mặc Định</Tag>}
                </Space>
            ),
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Ký Hiệu',
            dataIndex: 'symbol',
            key: 'symbol',
        },
        {
            title: 'Tỷ Giá',
            dataIndex: 'exchange_rate',
            key: 'exchange_rate',
            render: (rate: number) => rate.toFixed(4),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'is_enabled',
            key: 'is_enabled',
            render: (enabled: boolean, record: Currency) => (
                <Switch
                    checked={enabled}
                    onChange={(checked) => handleToggle(record.id, checked)}
                />
            ),
        },
        {
            title: 'Thao Tác',
            key: 'action',
            render: (_: unknown, record: Currency) => (
                <Space>
                    {!record.is_default && (
                        <Button
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleSetDefault(record.id)}
                        >
                            Đặt Mặc Định
                        </Button>
                    )}
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`${ROUTE.whmcsCurrencies}/edit/${record.id}`)}
                    >
                        Sửa
                    </Button>
                    {!record.is_default && (
                        <Popconfirm
                            title="Xác nhận xóa currency này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button size="small" danger icon={<DeleteOutlined />}>
                                Xóa
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Quản Lý Currency"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`${ROUTE.whmcsCurrencies}/create`)}
                    >
                        Thêm Currency
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={currencies}
                    rowKey="id"
                    loading={loading}
                />
            </Card>
        </div>
    );
};

export default CurrencyList;
