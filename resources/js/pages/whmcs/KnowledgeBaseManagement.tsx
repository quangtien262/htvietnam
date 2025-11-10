import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Card, Statistic, Row, Col, Tag, Space, Tabs, Tree, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, FolderOutlined, EyeOutlined, LikeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    parent_id?: number;
    sort_order: number;
    is_public: boolean;
    children?: Category[];
    article_count?: number;
}

interface Article {
    id: number;
    category_id: number;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    is_published: boolean;
    published_at?: string;
    view_count: number;
    helpful_count: number;
    unhelpful_count: number;
    tags?: string[];
    created_at: string;
    category?: Category;
    author?: {
        id: number;
        name: string;
    };
}

interface Statistics {
    total_categories: number;
    public_categories: number;
    total_articles: number;
    published_articles: number;
    draft_articles: number;
    total_views: number;
    total_votes: number;
    recent_articles_30_days: number;
}

const KnowledgeBaseManagement: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [articleModalVisible, setArticleModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [categoryForm] = Form.useForm();
    const [articleForm] = Form.useForm();

    useEffect(() => {
        loadCategories();
        loadArticles();
        loadStatistics();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await axios.get('/aio/api/whmcs/kb/categories');
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            message.error('Failed to load categories');
        }
    };

    const loadArticles = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/kb/articles');
            if (response.data.success) {
                setArticles(response.data.data.data);
            }
        } catch (error) {
            message.error('Failed to load articles');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const response = await axios.get('/aio/api/whmcs/kb/statistics');
            if (response.data.success) {
                setStatistics(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load statistics', error);
        }
    };

    const handleAddCategory = () => {
        setEditingCategory(null);
        categoryForm.resetFields();
        setCategoryModalVisible(true);
    };

    const handleEditCategory = (record: Category) => {
        setEditingCategory(record);
        categoryForm.setFieldsValue(record);
        setCategoryModalVisible(true);
    };

    const handleDeleteCategory = async (id: number) => {
        Modal.confirm({
            title: 'Delete Category',
            content: 'Are you sure you want to delete this category?',
            onOk: async () => {
                try {
                    await axios.delete(`/aio/api/whmcs/kb/categories/${id}`);
                    message.success('Category deleted successfully');
                    loadCategories();
                    loadStatistics();
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Failed to delete category');
                }
            },
        });
    };

    const handleCategorySubmit = async (values: any) => {
        try {
            if (editingCategory) {
                await axios.put(`/aio/api/whmcs/kb/categories/${editingCategory.id}`, values);
                message.success('Category updated successfully');
            } else {
                await axios.post('/aio/api/whmcs/kb/categories', values);
                message.success('Category created successfully');
            }
            setCategoryModalVisible(false);
            loadCategories();
            loadStatistics();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to save category');
        }
    };

    const handleAddArticle = () => {
        setEditingArticle(null);
        articleForm.resetFields();
        setArticleModalVisible(true);
    };

    const handleEditArticle = (record: Article) => {
        setEditingArticle(record);
        articleForm.setFieldsValue(record);
        setArticleModalVisible(true);
    };

    const handleDeleteArticle = async (id: number) => {
        Modal.confirm({
            title: 'Delete Article',
            content: 'Are you sure you want to delete this article?',
            onOk: async () => {
                try {
                    await axios.delete(`/aio/api/whmcs/kb/articles/${id}`);
                    message.success('Article deleted successfully');
                    loadArticles();
                    loadStatistics();
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Failed to delete article');
                }
            },
        });
    };

    const handleArticleSubmit = async (values: any) => {
        try {
            if (editingArticle) {
                await axios.put(`/aio/api/whmcs/kb/articles/${editingArticle.id}`, values);
                message.success('Article updated successfully');
            } else {
                await axios.post('/aio/api/whmcs/kb/articles', values);
                message.success('Article created successfully');
            }
            setArticleModalVisible(false);
            loadArticles();
            loadStatistics();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to save article');
        }
    };

    const categoryColumns: ColumnsType<Category> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <FolderOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
        },
        {
            title: 'Articles',
            dataIndex: 'article_count',
            key: 'article_count',
            render: (count) => count || 0,
        },
        {
            title: 'Status',
            dataIndex: 'is_public',
            key: 'is_public',
            render: (is_public) => (
                <Tag color={is_public ? 'green' : 'orange'}>
                    {is_public ? 'Public' : 'Private'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditCategory(record)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        onClick={() => handleDeleteCategory(record.id)}
                    />
                </Space>
            ),
        },
    ];

    const articleColumns: ColumnsType<Article> = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text) => (
                <Space>
                    <FileTextOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: 'Category',
            key: 'category',
            render: (_, record) => record.category?.name || '-',
        },
        {
            title: 'Author',
            key: 'author',
            render: (_, record) => record.author?.name || '-',
        },
        {
            title: 'Views',
            dataIndex: 'view_count',
            key: 'view_count',
            sorter: (a, b) => a.view_count - b.view_count,
        },
        {
            title: 'Helpful',
            key: 'helpful',
            render: (_, record) => (
                <span>
                    <LikeOutlined /> {record.helpful_count} / {record.helpful_count + record.unhelpful_count}
                </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'is_published',
            key: 'is_published',
            render: (is_published) => (
                <Tag color={is_published ? 'green' : 'orange'}>
                    {is_published ? 'Published' : 'Draft'}
                </Tag>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => window.open(`/kb/article/${record.slug}`, '_blank')}
                    />
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditArticle(record)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        onClick={() => handleDeleteArticle(record.id)}
                    />
                </Space>
            ),
        },
    ];

    const flattenCategories = (cats: Category[], parentName = ''): Array<{value: number, label: string}> => {
        let result: Array<{value: number, label: string}> = [];
        cats.forEach(cat => {
            const displayName = parentName ? `${parentName} > ${cat.name}` : cat.name;
            result.push({ value: cat.id, label: displayName });
            if (cat.children && cat.children.length > 0) {
                result = result.concat(flattenCategories(cat.children, displayName));
            }
        });
        return result;
    };

    return (
        <div style={{ padding: '24px' }}>
            <h2>Knowledge Base Management</h2>

            {statistics && (
                <Row gutter={16} style={{ marginBottom: '24px' }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Categories"
                                value={statistics.total_categories}
                                prefix={<FolderOutlined />}
                            />
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                                Public: {statistics.public_categories}
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Articles"
                                value={statistics.total_articles}
                                prefix={<FileTextOutlined />}
                            />
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                                Published: {statistics.published_articles} | Draft: {statistics.draft_articles}
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Views"
                                value={statistics.total_views}
                                prefix={<EyeOutlined />}
                            />
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                                Votes: {statistics.total_votes}
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Recent Articles"
                                value={statistics.recent_articles_30_days}
                                suffix="(30 days)"
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            <Tabs defaultActiveKey="1">
                <TabPane tab="Categories" key="1">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddCategory}
                        style={{ marginBottom: '16px' }}
                    >
                        Add Category
                    </Button>

                    <Table
                        columns={categoryColumns}
                        dataSource={categories}
                        rowKey="id"
                        pagination={false}
                    />
                </TabPane>

                <TabPane tab="Articles" key="2">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddArticle}
                        style={{ marginBottom: '16px' }}
                    >
                        Add Article
                    </Button>

                    <Table
                        columns={articleColumns}
                        dataSource={articles}
                        loading={loading}
                        rowKey="id"
                        pagination={{ pageSize: 20 }}
                    />
                </TabPane>
            </Tabs>

            {/* Category Modal */}
            <Modal
                title={editingCategory ? 'Edit Category' : 'Add Category'}
                open={categoryModalVisible}
                onCancel={() => setCategoryModalVisible(false)}
                onOk={() => categoryForm.submit()}
                width={600}
            >
                <Form
                    form={categoryForm}
                    layout="vertical"
                    onFinish={handleCategorySubmit}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter category name' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item name="slug" label="Slug">
                        <Input placeholder="Leave empty to auto-generate" />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <TextArea rows={3} />
                    </Form.Item>

                    <Form.Item name="parent_id" label="Parent Category">
                        <Select allowClear placeholder="Select parent category">
                            {flattenCategories(categories).map(cat => (
                                <Option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="sort_order" label="Sort Order" initialValue={0}>
                        <Input type="number" />
                    </Form.Item>

                    <Form.Item name="is_public" label="Public" valuePropName="checked" initialValue={true}>
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Article Modal */}
            <Modal
                title={editingArticle ? 'Edit Article' : 'Add Article'}
                open={articleModalVisible}
                onCancel={() => setArticleModalVisible(false)}
                onOk={() => articleForm.submit()}
                width={800}
            >
                <Form
                    form={articleForm}
                    layout="vertical"
                    onFinish={handleArticleSubmit}
                >
                    <Form.Item
                        name="category_id"
                        label="Category"
                        rules={[{ required: true, message: 'Please select category' }]}
                    >
                        <Select placeholder="Select category">
                            {flattenCategories(categories).map(cat => (
                                <Option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter title' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item name="slug" label="Slug">
                        <Input placeholder="Leave empty to auto-generate" />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Content"
                        rules={[{ required: true, message: 'Please enter content' }]}
                    >
                        <TextArea rows={10} />
                    </Form.Item>

                    <Form.Item name="excerpt" label="Excerpt">
                        <TextArea rows={3} placeholder="Leave empty to auto-generate from content" />
                    </Form.Item>

                    <Form.Item name="is_published" label="Published" valuePropName="checked" initialValue={false}>
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default KnowledgeBaseManagement;
