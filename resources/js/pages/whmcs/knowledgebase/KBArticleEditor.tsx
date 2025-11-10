import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Switch, Button, Card, message, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';

const { TextArea } = Input;

const KBArticleEditor: React.FC = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const navigate = useNavigate();
    const isEdit = !!id;

    useEffect(() => {
        fetchCategories();
        if (isEdit) {
            fetchArticle();
        }
    }, [id, isEdit]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/aio/api/whmcs/knowledgebase/categories');
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch {
            message.error('Không thể tải danh mục!');
        }
    };

    const fetchArticle = async () => {
        setFetching(true);
        try {
            const response = await axios.get(`/aio/api/whmcs/knowledgebase/articles/${id}`);
            if (response.data.success) {
                form.setFieldsValue(response.data.data);
            }
        } catch {
            message.error('Không thể tải bài viết!');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (values: {
        category_id: number;
        title: string;
        slug: string;
        content: string;
        is_published: boolean;
    }) => {
        setLoading(true);
        try {
            if (isEdit) {
                await axios.put(`/aio/api/whmcs/knowledgebase/articles/${id}`, values);
                message.success('Cập nhật bài viết thành công!');
            } else {
                await axios.post('/aio/api/whmcs/knowledgebase/articles', values);
                message.success('Tạo bài viết thành công!');
            }
            navigate(`${ROUTE.whmcsKnowledgeBase}/articles`);
        } catch {
            message.error(`${isEdit ? 'Cập nhật' : 'Tạo'} bài viết thất bại!`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div style={{ padding: 24 }}>Loading...</div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <Card title={isEdit ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ is_published: false }}
                >
                    <Form.Item
                        label="Danh Mục"
                        name="category_id"
                        rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                    >
                        <Select placeholder="Chọn danh mục">
                            {categories.map(cat => (
                                <Select.Option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Tiêu Đề"
                        name="title"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input placeholder="Tiêu đề bài viết" />
                    </Form.Item>

                    <Form.Item
                        label="Slug"
                        name="slug"
                        rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
                        tooltip="URL-friendly identifier"
                    >
                        <Input placeholder="tieu-de-bai-viet" />
                    </Form.Item>

                    <Form.Item
                        label="Nội Dung"
                        name="content"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                    >
                        <TextArea
                            rows={15}
                            placeholder="Nội dung bài viết (hỗ trợ HTML hoặc Markdown)"
                        />
                    </Form.Item>

                    <Form.Item
                        name="is_published"
                        valuePropName="checked"
                    >
                        <Switch /> <span style={{ marginLeft: 8 }}>Xuất bản ngay</span>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {isEdit ? 'Cập Nhật' : 'Tạo Bài Viết'}
                            </Button>
                            <Button onClick={() => navigate(`${ROUTE.whmcsKnowledgeBase}/articles`)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default KBArticleEditor;
