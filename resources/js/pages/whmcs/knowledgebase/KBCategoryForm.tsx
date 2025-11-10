import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Button, Card, message, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';

const { TextArea } = Input;

const KBCategoryForm: React.FC = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const navigate = useNavigate();
    const isEdit = !!id;

    useEffect(() => {
        if (isEdit) {
            fetchCategory();
        }
    }, [id, isEdit]);

    const fetchCategory = async () => {
        setFetching(true);
        try {
            const response = await axios.get(`/aio/api/whmcs/knowledgebase/categories/${id}`);
            if (response.data.success) {
                form.setFieldsValue(response.data.data);
            }
        } catch {
            message.error('Không thể tải danh mục!');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (values: {
        name: string;
        slug: string;
        description: string;
        order: number;
        is_public: boolean;
    }) => {
        setLoading(true);
        try {
            if (isEdit) {
                await axios.put(`/aio/api/whmcs/knowledgebase/categories/${id}`, values);
                message.success('Cập nhật danh mục thành công!');
            } else {
                await axios.post('/aio/api/whmcs/knowledgebase/categories', values);
                message.success('Tạo danh mục thành công!');
            }
            navigate(ROUTE.whmcsKnowledgeBase);
        } catch {
            message.error(`${isEdit ? 'Cập nhật' : 'Tạo'} danh mục thất bại!`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div style={{ padding: 24 }}>Loading...</div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <Card title={isEdit ? 'Chỉnh Sửa Danh Mục' : 'Tạo Danh Mục Mới'}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ is_public: true, order: 0 }}
                >
                    <Form.Item
                        label="Tên Danh Mục"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                    >
                        <Input placeholder="VD: Hướng Dẫn Sử Dụng" />
                    </Form.Item>

                    <Form.Item
                        label="Slug"
                        name="slug"
                        rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
                        tooltip="URL-friendly identifier (VD: huong-dan-su-dung)"
                    >
                        <Input placeholder="huong-dan-su-dung" />
                    </Form.Item>

                    <Form.Item
                        label="Mô Tả"
                        name="description"
                    >
                        <TextArea rows={4} placeholder="Mô tả ngắn về danh mục" />
                    </Form.Item>

                    <Form.Item
                        label="Thứ Tự Hiển Thị"
                        name="order"
                        tooltip="Số nhỏ hơn sẽ hiển thị trước"
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="is_public"
                        valuePropName="checked"
                    >
                        <Switch /> <span style={{ marginLeft: 8 }}>Hiển thị công khai</span>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {isEdit ? 'Cập Nhật' : 'Tạo Danh Mục'}
                            </Button>
                            <Button onClick={() => navigate(ROUTE.whmcsKnowledgeBase)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default KBCategoryForm;
