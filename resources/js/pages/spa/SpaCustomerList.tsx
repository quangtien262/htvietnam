import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, DatePicker, Modal, Form, Select, message, Drawer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { API } from '../../common/api';

const { Search } = Input;
const { RangePicker } = DatePicker;

interface Customer {
    id: number;
    code: string;
    name: string;
    phone: string;
    email?: string;
    ngay_sinh?: string;
    gioi_tinh_id?: number;
    customer_group_id?: number;
    customer_status_id?: number;
    tong_tien_da_nap?: number;
    tien_con_lai?: number;
    cong_no_hien_tai?: number;
    address?: string;
    note?: string;
    created_at?: string;
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
            const response = await axios.get(API.spaCustomerList, {
                params: {
                    page: pagination.current,
                    per_page: pagination.pageSize,
                    ...filters,
                },
            });
            
            console.log('API Response:', response.data); // Debug log
            
            if (response.data.success) {
                // Backend trả về structure: { success: true, data: { users: {...}, ... } }
                const usersData = response.data.data.users;
                setCustomers(usersData.data || []);
                setPagination({
                    ...pagination,
                    total: usersData.total || 0,
                    current: usersData.current_page || 1,
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
        setFilters({ ...filters, keyword: value }); // Backend expect 'keyword' not 'search'
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
                ? API.spaCustomerUpdate(editingCustomer.id)
                : API.spaCustomerCreate;
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
                    const response = await axios.delete(API.spaCustomerDelete(id));
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
            dataIndex: 'code',
            key: 'code',
            width: 120,
        },
        {
            title: 'Họ tên',
            dataIndex: 'name',
            key: 'name',
            width: 200,
        },
        {
            title: 'SĐT',
            dataIndex: 'phone',
            key: 'phone',
            width: 120,
            render: (text: string) => text && (
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
            title: 'Nhóm KH',
            dataIndex: 'customer_group_id',
            key: 'customer_group_id',
            width: 100,
            render: (id: number) => {
                const groups: any = { 1: 'VIP', 2: 'Thường', 3: 'Mới' };
                const colors: any = { 1: 'gold', 2: 'blue', 3: 'green' };
                return <Tag color={colors[id] || 'default'}>{groups[id] || 'N/A'}</Tag>;
            },
        },
        {
            title: 'Số dư thẻ',
            dataIndex: 'tien_con_lai',
            key: 'tien_con_lai',
            width: 150,
            render: (value: number) => formatCurrency(value || 0),
        },
        {
            title: 'Công nợ',
            dataIndex: 'cong_no_hien_tai',
            key: 'cong_no_hien_tai',
            width: 150,
            render: (value: number) => (
                <span style={{ color: value > 0 ? 'red' : 'green' }}>
                    {formatCurrency(value || 0)}
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'customer_status_id',
            key: 'customer_status_id',
            width: 120,
            render: (status: number) => (
                <Tag color={status === 1 ? 'green' : 'red'}>
                    {status === 1 ? 'Hoạt động' : 'Ngừng'}
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
                    placeholder="Nhóm khách hàng"
                    style={{ width: 150 }}
                    onChange={(value) => handleFilterChange('customer_group_id', value)}
                    allowClear
                >
                    <Select.Option value={1}>VIP</Select.Option>
                    <Select.Option value={2}>Thường</Select.Option>
                    <Select.Option value={3}>Mới</Select.Option>
                </Select>
                <Select
                    placeholder="Trạng thái"
                    style={{ width: 150 }}
                    onChange={(value) => handleFilterChange('customer_status_id', value)}
                    allowClear
                >
                    <Select.Option value={1}>Hoạt động</Select.Option>
                    <Select.Option value={0}>Ngừng</Select.Option>
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
                    <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email">
                        <Input type="email" />
                    </Form.Item>
                    <Form.Item name="ngay_sinh" label="Ngày sinh">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="gioi_tinh_id" label="Giới tính">
                        <Select>
                            <Select.Option value={1}>Nam</Select.Option>
                            <Select.Option value={2}>Nữ</Select.Option>
                            <Select.Option value={3}>Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="customer_group_id" label="Nhóm khách hàng">
                        <Select>
                            <Select.Option value={1}>VIP</Select.Option>
                            <Select.Option value={2}>Thường</Select.Option>
                            <Select.Option value={3}>Mới</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="user_source_id" label="Nguồn khách">
                        <Select>
                            <Select.Option value={1}>Facebook</Select.Option>
                            <Select.Option value={2}>Zalo</Select.Option>
                            <Select.Option value={3}>Giới thiệu</Select.Option>
                            <Select.Option value={4}>Walk-in</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="note" label="Ghi chú">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SpaCustomerList;
