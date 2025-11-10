import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Button, Card, message, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';

const CurrencyForm: React.FC = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const navigate = useNavigate();
    const isEdit = !!id;

    useEffect(() => {
        if (isEdit) {
            fetchCurrency();
        }
    }, [id, isEdit]);

    const fetchCurrency = async () => {
        setFetching(true);
        try {
            const response = await axios.get(`/aio/api/whmcs/currencies/${id}`);
            if (response.data.success) {
                form.setFieldsValue(response.data.data);
            }
        } catch {
            message.error('Không thể tải currency!');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            if (isEdit) {
                await axios.put(`/aio/api/whmcs/currencies/${id}`, values);
                message.success('Cập nhật currency thành công!');
            } else {
                await axios.post('/aio/api/whmcs/currencies', values);
                message.success('Tạo currency thành công!');
            }
            navigate(ROUTE.whmcsCurrencies);
        } catch {
            message.error(`${isEdit ? 'Cập nhật' : 'Tạo'} currency thất bại!`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div style={{ padding: 24 }}>Loading...</div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <Card title={isEdit ? 'Chỉnh Sửa Currency' : 'Tạo Currency Mới'}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ is_enabled: true, exchange_rate: 1 }}
                >
                    <Form.Item
                        label="Currency Code"
                        name="code"
                        rules={[
                            { required: true, message: 'Vui lòng nhập currency code' },
                            { len: 3, message: 'Currency code phải có 3 ký tự' }
                        ]}
                    >
                        <Input placeholder="VD: USD, EUR, VND" maxLength={3} disabled={isEdit} />
                    </Form.Item>

                    <Form.Item
                        label="Tên Currency"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên currency' }]}
                    >
                        <Input placeholder="VD: US Dollar" />
                    </Form.Item>

                    <Form.Item
                        label="Ký Hiệu"
                        name="symbol"
                        rules={[{ required: true, message: 'Vui lòng nhập ký hiệu' }]}
                    >
                        <Input placeholder="VD: $, €, ₫" />
                    </Form.Item>

                    <Form.Item
                        label="Tỷ Giá (so với currency mặc định)"
                        name="exchange_rate"
                        rules={[{ required: true, message: 'Vui lòng nhập tỷ giá' }]}
                        tooltip="VD: 1 USD = 23,500 VND thì nhập 23500"
                    >
                        <InputNumber
                            min={0}
                            step={0.0001}
                            precision={4}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="is_enabled"
                        valuePropName="checked"
                    >
                        <Switch /> <span style={{ marginLeft: 8 }}>Kích hoạt currency</span>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {isEdit ? 'Cập Nhật' : 'Tạo Currency'}
                            </Button>
                            <Button onClick={() => navigate(ROUTE.whmcsCurrencies)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CurrencyForm;
