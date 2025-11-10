import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Card, Input, Select } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';

const { Search } = Input;

interface KBArticle {
    id: number;
    title: string;
    category_name: string;
    author_name: string;
    views: number;
    votes: number;
    is_published: boolean;
    created_at: string;
}

const KBArticleList: React.FC = () => {
    const [articles, setArticles] = useState<KBArticle[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchArticles();
    }, [pagination.current, search, categoryFilter]);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/knowledgebase/articles', {
                params: {
                    page: pagination.current,
                    per_page: pagination.pageSize,
                    search,
                    category_id: categoryFilter,
                },
            });
            if (response.data.success) {
                setArticles(response.data.data);
                setPagination(prev => ({ ...prev, total: response.data.meta?.total || 0 }));
            }
        } catch {
            message.error('Không thể tải bài viết!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/aio/api/whmcs/knowledgebase/articles/${id}`);
            message.success('Xóa bài viết thành công!');
            fetchArticles();
        } catch {
            message.error('Xóa bài viết thất bại!');
        }
    };

    const columns = [
        {
            title: 'Tiêu Đề',
            dataIndex: 'title',
            key: 'title',
            width: '30%',
        },
        {
            title: 'Danh Mục',
            dataIndex: 'category_name',
            key: 'category_name',
            render: (cat: string) => <Tag color="blue">{cat}</Tag>,
        },
        {
            title: 'Tác Giả',
            dataIndex: 'author_name',
            key: 'author_name',
        },
        {
            title: 'Lượt Xem',
            dataIndex: 'views',
            key: 'views',
        },
        {
            title: 'Votes',
            dataIndex: 'votes',
            key: 'votes',
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'is_published',
            key: 'is_published',
            render: (published: boolean) => (
                <Tag color={published ? 'green' : 'orange'}>
                    {published ? 'Published' : 'Draft'}
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
            render: (_: unknown, record: KBArticle) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`${ROUTE.whmcsKnowledgeBase}/articles/${record.id}`)}
                    >
                        Xem
                    </Button>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`${ROUTE.whmcsKnowledgeBase}/articles/edit/${record.id}`)}
                    >
                        Sửa
                    </Button>
                    <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Danh Sách Bài Viết"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`${ROUTE.whmcsKnowledgeBase}/articles/create`)}
                    >
                        Tạo Bài Viết
                    </Button>
                }
            >
                <Space style={{ marginBottom: 16 }}>
                    <Search
                        placeholder="Tìm kiếm bài viết..."
                        onSearch={setSearch}
                        style={{ width: 300 }}
                    />
                    <Select
                        placeholder="Danh mục"
                        style={{ width: 200 }}
                        onChange={setCategoryFilter}
                        allowClear
                    >
                        <Select.Option value="">Tất cả</Select.Option>
                    </Select>
                </Space>

                <Table
                    columns={columns}
                    dataSource={articles}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    onChange={(newPagination) => setPagination(newPagination as typeof pagination)}
                />
            </Card>
        </div>
    );
};

export default KBArticleList;
