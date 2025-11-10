import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Switch, Button, Card, message, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';

const TaxRuleForm: React.FC = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const navigate = useNavigate();
    const isEdit = !!id;

    useEffect(() => {
        if (isEdit) {
            fetchTaxRule();
        }
    }, [id, isEdit]);

    const fetchTaxRule = async () => {
        setFetching(true);
        try {
            const response = await axios.get(`/aio/api/whmcs/taxes/${id}`);
            if (response.data.success) {
                form.setFieldsValue(response.data.data);
            }
        } catch {
            message.error('Không thể tải tax rule!');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            if (isEdit) {
                await axios.put(`/aio/api/whmcs/taxes/${id}`, values);
                message.success('Cập nhật tax rule thành công!');
            } else {
                await axios.post('/aio/api/whmcs/taxes', values);
                message.success('Tạo tax rule thành công!');
            }
            navigate(ROUTE.whmcsTax);
        } catch {
            message.error(`${isEdit ? 'Cập nhật' : 'Tạo'} tax rule thất bại!`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div style={{ padding: 24 }}>Loading...</div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <Card title={isEdit ? 'Chỉnh Sửa Tax Rule' : 'Tạo Tax Rule Mới'}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ is_active: true, is_compound: false }}
                >
                    <Form.Item
                        label="Tên Tax Rule"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên tax rule' }]}
                    >
                        <Input placeholder="VD: Vietnam VAT" />
                    </Form.Item>

                    <Form.Item
                        label="Quốc Gia"
                        name="country"
                        rules={[{ required: true, message: 'Vui lòng nhập quốc gia' }]}
                    >
                        <Select>
                            <Select.Option value="VN">Vietnam</Select.Option>
                            <Select.Option value="US">United States</Select.Option>
                            <Select.Option value="SG">Singapore</Select.Option>
                            <Select.Option value="TH">Thailand</Select.Option>
                            <Select.Option value="GB">United Kingdom</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Tỉnh/Bang (Tùy chọn)"
                        name="state"
                    >
                        <Input placeholder="VD: Hanoi, California" />
                    </Form.Item>

                    <Form.Item
                        label="Thuế Suất (%)"
                        name="tax_rate"
                        rules={[{ required: true, message: 'Vui lòng nhập thuế suất' }]}
                    >
                        <InputNumber
                            min={0}
                            max={100}
                            step={0.01}
                            precision={2}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="is_compound"
                        valuePropName="checked"
                        tooltip="Compound tax được tính trên tổng (giá + tax đơn giản)"
                    >
                        <Switch /> <span style={{ marginLeft: 8 }}>Compound Tax</span>
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        valuePropName="checked"
                    >
                        <Switch /> <span style={{ marginLeft: 8 }}>Kích hoạt</span>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {isEdit ? 'Cập Nhật' : 'Tạo Tax Rule'}
                            </Button>
                            <Button onClick={() => navigate(ROUTE.whmcsTax)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default TaxRuleForm;
