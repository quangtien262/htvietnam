import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, DatePicker, Modal, Form, Select, message, Drawer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Search } = Input;
const { RangePicker } = DatePicker;

interface Customer {
    id: number;
    ma_khach_hang: string;
    ho_ten: string;
    so_dien_thoai: string;
    email?: string;
    ngay_sinh?: string;
    gioi_tinh?: string;
    loai_khach: string;
    tong_chi_tieu: number;
    diem_tich_luy: number;
    trang_thai: string;
}

const SpaCustomerList: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [filters, setFilters] = useState<any>({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCustomers();
    }, [pagination.current, filters]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/spa/customers', {
                params: {
                    page: pagination.current,
                    per_page: pagination.pageSize,
                    ...filters,
                },
            });
            if (response.data.success) {
                setCustomers(response.data.data.data);
                setPagination({
                    ...pagination,
                    total: response.data.data.total,
                });
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            message.error('Lỗi khi tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination: any) => {
        setPagination(newPagination);
    };

    const handleSearch = (value: string) => {
        setFilters({ ...filters, search: value });
        setPagination({ ...pagination, current: 1 });
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters({ ...filters, [key]: value });
        setPagination({ ...pagination, current: 1 });
    };

    const showModal = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            form.setFieldsValue(customer);
        } else {
            setEditingCustomer(null);
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const url = editingCustomer
                ? `/api/admin/spa/customers/${editingCustomer.id}`
                : '/api/admin/spa/customers';
            const method = editingCustomer ? 'put' : 'post';

            const response = await axios[method](url, values);
            if (response.data.success) {
                message.success(editingCustomer ? 'Cập nhật thành công' : 'Thêm mới thành công');
                setIsModalVisible(false);
                fetchCustomers();
            }
        } catch (error) {
            console.error('Error saving customer:', error);
            message.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa khách hàng này?',
            onOk: async () => {
                try {
                    const response = await axios.delete(`/api/admin/spa/customers/${id}`);
                    if (response.data.success) {
                        message.success('Xóa thành công');
                        fetchCustomers();
                    }
                } catch (error) {
                    message.error('Lỗi khi xóa khách hàng');
                }
            },
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const columns = [
        {
            title: 'Mã KH',
            dataIndex: 'ma_khach_hang',
            key: 'ma_khach_hang',
            width: 120,
        },
        {
            title: 'Họ tên',
            dataIndex: 'ho_ten',
            key: 'ho_ten',
            width: 200,
        },
        {
            title: 'SĐT',
            dataIndex: 'so_dien_thoai',
            key: 'so_dien_thoai',
            width: 120,
            render: (text: string) => (
                <Space>
                    <PhoneOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 200,
            render: (text: string) => text && (
                <Space>
                    <MailOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'loai_khach',
            key: 'loai_khach',
            width: 100,
            render: (type: string) => {
                const colors: any = { VIP: 'gold', Thuong: 'blue', Moi: 'green' };
                return <Tag color={colors[type] || 'default'}>{type}</Tag>;
            },
        },
        {
            title: 'Tổng chi tiêu',
            dataIndex: 'tong_chi_tieu',
            key: 'tong_chi_tieu',
            width: 150,
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Điểm',
            dataIndex: 'diem_tich_luy',
            key: 'diem_tich_luy',
            width: 100,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 120,
            render: (status: string) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? 'Hoạt động' : 'Ngừng'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right' as const,
            width: 150,
            render: (_: any, record: Customer) => (
                <Space>
                    <Button type="link" size="small" icon={<EyeOutlined />} />
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => showModal(record)} />
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
                </Space>
            ),
        },
    ];

    return (
        <div className="spa-customer-list" style={{ padding: '24px' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Danh sách khách hàng</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Thêm khách hàng
                </Button>
            </div>

            <Space style={{ marginBottom: 16 }} wrap>
                <Search
                    placeholder="Tìm kiếm tên, SĐT, email..."
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                    allowClear
                />
                <Select
                    placeholder="Loại khách hàng"
                    style={{ width: 150 }}
                    onChange={(value) => handleFilterChange('loai_khach', value)}
                    allowClear
                >
                    <Select.Option value="VIP">VIP</Select.Option>
                    <Select.Option value="Thuong">Thường</Select.Option>
                    <Select.Option value="Moi">Mới</Select.Option>
                </Select>
                <Select
                    placeholder="Trạng thái"
                    style={{ width: 150 }}
                    onChange={(value) => handleFilterChange('trang_thai', value)}
                    allowClear
                >
                    <Select.Option value="active">Hoạt động</Select.Option>
                    <Select.Option value="inactive">Ngừng</Select.Option>
                </Select>
            </Space>

            <Table
                columns={columns}
                dataSource={customers}
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                scroll={{ x: 1200 }}
                rowKey="id"
            />

            <Modal
                title={editingCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="ho_ten" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="so_dien_thoai" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email">
                        <Input type="email" />
                    </Form.Item>
                    <Form.Item name="ngay_sinh" label="Ngày sinh">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="gioi_tinh" label="Giới tính">
                        <Select>
                            <Select.Option value="Nam">Nam</Select.Option>
                            <Select.Option value="Nữ">Nữ</Select.Option>
                            <Select.Option value="Khác">Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="dia_chi" label="Địa chỉ">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="nguon_khach" label="Nguồn khách">
                        <Select>
                            <Select.Option value="facebook">Facebook</Select.Option>
                            <Select.Option value="zalo">Zalo</Select.Option>
                            <Select.Option value="gioi_thieu">Giới thiệu</Select.Option>
                            <Select.Option value="walk_in">Walk-in</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SpaCustomerList;
