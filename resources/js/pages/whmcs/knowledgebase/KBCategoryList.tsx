import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Card, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';

interface KBCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    article_count: number;
    order: number;
    is_public: boolean;
}

const KBCategoryList: React.FC = () => {
    const [categories, setCategories] = useState<KBCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/knowledgebase/categories');
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch {
            message.error('Không thể tải danh mục!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/aio/api/whmcs/knowledgebase/categories/${id}`);
            message.success('Xóa danh mục thành công!');
            fetchCategories();
        } catch {
            message.error('Xóa danh mục thất bại!');
        }
    };

    const columns = [
        {
            title: 'Tên Danh Mục',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
        },
        {
            title: 'Mô Tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Số Bài Viết',
            dataIndex: 'article_count',
            key: 'article_count',
        },
        {
            title: 'Thứ Tự',
            dataIndex: 'order',
            key: 'order',
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'is_public',
            key: 'is_public',
            render: (isPublic: boolean) => (
                <Tag color={isPublic ? 'green' : 'orange'}>
                    {isPublic ? 'Public' : 'Private'}
                </Tag>
            ),
        },
        {
            title: 'Thao Tác',
            key: 'action',
            render: (_: unknown, record: KBCategory) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`${ROUTE.whmcsKnowledgeBase}/categories/edit/${record.id}`)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa danh mục này?"
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
                title="Danh Mục Knowledge Base"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`${ROUTE.whmcsKnowledgeBase}/categories/create`)}
                    >
                        Thêm Danh Mục
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={categories}
                    rowKey="id"
                    loading={loading}
                />
            </Card>
        </div>
    );
};

export default KBCategoryList;
