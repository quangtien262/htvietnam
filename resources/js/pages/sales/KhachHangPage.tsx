import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function KhachHangPage() {
    const [loading, setLoading] = useState(false);
    const [khachHangs, setKhachHangs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        axios.get('/aio/api/sales/khach-hang')
            .then((res: any) => {
                if (res.data.message === 'success') {
                    setKhachHangs(res.data.data || []);
                }
            })
            .finally(() => setLoading(false));
    };

    const onFinish = (values: any) => {
        setLoading(true);
        const url = editingId ? `/aio/api/sales/khach-hang/update/${editingId}` : '/aio/api/sales/khach-hang/store';
        axios.post(url, values)
            .then(() => {
                message.success(editingId ? 'Cập nhật thành công' : 'Thêm mới thành công');
                setIsModalOpen(false);
                form.resetFields();
                setEditingId(null);
                loadData();
            })
            .catch(() => message.error('Lỗi'))
            .finally(() => setLoading(false));
    };

    const handleEdit = (record: any) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Xóa khách hàng?',
            onOk: () => {
                axios.post(`/aio/api/sales/khach-hang/delete/${id}`)
                    .then(() => {
                        message.success('Đã xóa');
                        loadData();
                    })
                    .catch(() => message.error('Lỗi'));
            }
        });
    };

    const columns = [
        { title: 'Mã KH', dataIndex: 'ma_khach_hang', width: 100 },
        { title: 'Tên khách hàng', dataIndex: 'name' },
        { title: 'Điện thoại', dataIndex: 'phone', width: 120 },
        { title: 'Email', dataIndex: 'email', width: 180 },
        { 
            title: 'Nhóm', 
            dataIndex: 'nhom_khach_hang', 
            width: 100,
            render: (v: string) => {
                if (!v) return null;
                const colors: any = { vip: 'gold', thuong: 'blue', moi: 'green', tiem_nang: 'orange' };
                return <Tag color={colors[v]}>{v.toUpperCase()}</Tag>;
            }
        },
        { title: 'Tổng mua', dataIndex: 'tong_mua', width: 120, render: (v: number) => v?.toLocaleString() || 0 },
        { title: 'Công nợ', dataIndex: 'cong_no_hien_tai', width: 120, render: (v: number) => v?.toLocaleString() || 0 },
        {
            title: 'Thao tác',
            width: 150,
            render: (_: any, record: any) => (
                <Space>
                    <Button size="small" onClick={() => handleEdit(record)}>Sửa</Button>
                    <Button size="small" danger onClick={() => handleDelete(record.id)}>Xóa</Button>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2><UserOutlined /> Quản lý Khách hàng</h2>
            
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ marginBottom: 16 }}>
                Thêm khách hàng
            </Button>

            <Table
                columns={columns}
                dataSource={khachHangs}
                rowKey="id"
                loading={loading}
            />

            <Modal
                title={editingId ? 'Sửa khách hàng' : 'Thêm khách hàng'}
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); setEditingId(null); form.resetFields(); }}
                footer={null}
                width={700}
            >
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item name="name" label="Tên khách hàng" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                    <Form.Item name="loai_khach_hang" label="Loại KH" initialValue="ca_nhan">
                        <Select>
                            <Select.Option value="ca_nhan">Cá nhân</Select.Option>
                            <Select.Option value="doanh_nghiep">Doanh nghiệp</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="phone" label="Điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
                        <Input placeholder="0987654321" />
                    </Form.Item>
                    <Form.Item name="email" label="Email">
                        <Input placeholder="email@example.com" />
                    </Form.Item>
                    <Form.Item name="username" label="Tên đăng nhập">
                        <Input placeholder="Để trống = dùng số điện thoại" />
                    </Form.Item>
                    <Form.Item name="password" label={editingId ? "Mật khẩu mới (để trống = giữ nguyên)" : "Mật khẩu (để trống = 123456)"}>
                        <Input.Password placeholder="******" />
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input.TextArea rows={2} placeholder="Địa chỉ chi tiết" />
                    </Form.Item>
                    <Form.Item name="nhom_khach_hang" label="Nhóm KH" initialValue="moi">
                        <Select>
                            <Select.Option value="vip">VIP</Select.Option>
                            <Select.Option value="thuong">Thường</Select.Option>
                            <Select.Option value="moi">Mới</Select.Option>
                            <Select.Option value="tiem_nang">Tiềm năng</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>Lưu</Button>
                            <Button onClick={() => { setIsModalOpen(false); form.resetFields(); }}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
