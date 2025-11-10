import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, Input, InputNumber, message, Tag, Space, DatePicker, Card, Row, Col } from 'antd';
import { PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';

export default function DonHangPage() {
    const [loading, setLoading] = useState(false);
    const [donHangs, setDonHangs] = useState([]);
    const [khachHangs, setKhachHangs] = useState([]);
    const [hangHoas, setHangHoas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadData();
        loadKhachHang();
        loadHangHoa();
    }, []);

    const loadData = () => {
        setLoading(true);
        axios.get('/aio/api/sales/don-hang')
            .then((res: any) => {
                if (res.data.message === 'success') {
                    setDonHangs(res.data.data || []);
                }
            })
            .finally(() => setLoading(false));
    };

    const loadKhachHang = () => {
        axios.get('/aio/api/sales/khach-hang').then((res: any) => {
            if (res.data.message === 'success') setKhachHangs(res.data.data || []);
        });
    };

    const loadHangHoa = () => {
        axios.get('/aio/api/purchase/hang-hoa/list').then((res: any) => {
            if (res.data.message === 'success') setHangHoas(res.data.data || []);
        });
    };

    const onFinish = (values: any) => {
        const data = {
            ...values,
            ngay_dat_hang: values.ngay_dat_hang.format('YYYY-MM-DD'),
        };
        
        setLoading(true);
        axios.post('/aio/api/sales/don-hang/store', data)
            .then(() => {
                message.success('Tạo đơn hàng thành công');
                setIsModalOpen(false);
                form.resetFields();
                loadData();
            })
            .catch(() => message.error('Lỗi'))
            .finally(() => setLoading(false));
    };

    const updateStatus = (id: number, trang_thai: string) => {
        axios.post(`/aio/api/sales/don-hang/update-status/${id}`, { trang_thai })
            .then(() => {
                message.success('Cập nhật trạng thái thành công');
                loadData();
            })
            .catch(() => message.error('Lỗi'));
    };

    const columns = [
        { title: 'Mã ĐH', dataIndex: 'ma_don_hang', width: 100 },
        { title: 'Khách hàng', dataIndex: ['khach_hang', 'ten_khach_hang'] },
        { title: 'Ngày đặt', dataIndex: 'ngay_dat_hang', width: 110, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
        { 
            title: 'Trạng thái', 
            dataIndex: 'trang_thai', 
            width: 120,
            render: (v: string) => {
                const colors: any = { draft: 'default', pending: 'orange', confirmed: 'blue', completed: 'green', cancelled: 'red' };
                return <Tag color={colors[v]}>{v}</Tag>;
            }
        },
        { title: 'Tổng cộng', dataIndex: 'tong_cong', width: 120, render: (v: number) => <strong>{v?.toLocaleString()}</strong> },
        { title: 'Còn nợ', dataIndex: 'con_no', width: 100, render: (v: number) => v?.toLocaleString() },
        {
            title: 'Thao tác',
            width: 200,
            render: (_: any, record: any) => (
                <Space>
                    {record.trang_thai === 'pending' && (
                        <Button size="small" type="primary" onClick={() => updateStatus(record.id, 'confirmed')}>Xác nhận</Button>
                    )}
                    {record.trang_thai === 'confirmed' && (
                        <Button size="small" onClick={() => updateStatus(record.id, 'completed')}>Hoàn tất</Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2><ShoppingCartOutlined /> Quản lý Đơn hàng</h2>
            
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ marginBottom: 16 }}>
                Tạo đơn hàng
            </Button>

            <Table columns={columns} dataSource={donHangs} rowKey="id" loading={loading} />

            <Modal
                title="Tạo đơn hàng"
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
                footer={null}
                width={800}
            >
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item name="user_id" label="Khách hàng" rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}>
                        <Select showSearch optionFilterProp="children" placeholder="Chọn khách hàng">
                            {khachHangs.map((kh: any) => (
                                <Select.Option key={kh.id} value={kh.id}>{kh.name} - {kh.phone}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="ngay_dat_hang" label="Ngày đặt" initialValue={dayjs()} rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="dia_chi_giao_hang" label="Địa chỉ giao hàng">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="ghi_chu" label="Ghi chú">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>Tạo đơn</Button>
                            <Button onClick={() => { setIsModalOpen(false); form.resetFields(); }}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
