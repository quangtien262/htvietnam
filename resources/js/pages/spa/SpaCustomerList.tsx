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
    ma_khach_hang: string;
    ho_ten: string;
    so_dien_thoai: string;
    email?: string;
    ngay_sinh?: string;
    gioi_tinh?: string;
    dia_chi?: string;
    nguon_khach?: string;
    loai_khach?: string;
    trang_thai?: string;
    tong_chi_tieu?: number;
    diem_tich_luy?: number;
    lan_mua_cuoi?: string;
    ghi_chu?: string;
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
            
            console.log('API Response:', response.data);
            
            if (response.data.success) {
                // Backend trả về: { success: true, data: {pagination data} }
                const customerData = response.data.data;
                setCustomers(customerData.data || []);
                setPagination({
                    ...pagination,
                    total: customerData.total || 0,
                    current: customerData.current_page || 1,
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
            // Map dữ liệu từ backend sang form
            form.setFieldsValue({
                ho_ten: customer.ho_ten,
                so_dien_thoai: customer.so_dien_thoai,
                email: customer.email,
                ngay_sinh: customer.ngay_sinh ? dayjs(customer.ngay_sinh) : undefined,
                gioi_tinh: customer.gioi_tinh,
                dia_chi: customer.dia_chi,
                nguon_khach: customer.nguon_khach,
                ghi_chu: customer.ghi_chu,
            });
        } else {
            setEditingCustomer(null);
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            
            // Format ngày sinh nếu có
            const formData = {
                ...values,
                ngay_sinh: values.ngay_sinh ? values.ngay_sinh.format('YYYY-MM-DD') : null,
            };

            const url = editingCustomer
                ? API.spaCustomerUpdate(editingCustomer.id)
                : API.spaCustomerCreate;
            const method = editingCustomer ? 'put' : 'post';

            console.log('Sending data:', formData);

            const response = await axios[method](url, formData);
            
            console.log('Response:', response.data);
            
            if (response.data.success) {
                message.success(editingCustomer ? 'Cập nhật thành công' : 'Thêm mới thành công');
                setIsModalVisible(false);
                form.resetFields();
                fetchCustomers();
            } else {
                message.error(response.data.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            console.error('Error saving customer:', error);
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                message.error(errors[0] as string);
            } else {
                message.error('Có lỗi xảy ra');
            }
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
            title: 'Loại khách',
            dataIndex: 'loai_khach',
            key: 'loai_khach',
            width: 100,
            render: (type: string) => {
                const colors: any = { 'vip': 'gold', 'thuong': 'blue', 'moi': 'green' };
                const labels: any = { 'vip': 'VIP', 'thuong': 'Thường', 'moi': 'Mới' };
                return <Tag color={colors[type] || 'default'}>{labels[type] || type || 'N/A'}</Tag>;
            },
        },
        {
            title: 'Tổng chi tiêu',
            dataIndex: 'tong_chi_tieu',
            key: 'tong_chi_tieu',
            width: 150,
            render: (value: number) => formatCurrency(value || 0),
        },
        {
            title: 'Điểm tích lũy',
            dataIndex: 'diem_tich_luy',
            key: 'diem_tich_luy',
            width: 120,
            render: (value: number) => (
                <Tag color="purple">{value || 0} điểm</Tag>
            ),
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
                    <Select.Option value="vip">VIP</Select.Option>
                    <Select.Option value="thuong">Thường</Select.Option>
                    <Select.Option value="moi">Mới</Select.Option>
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
                width={1000}
            >
                <Form 
                    form={form} 
                    layout="vertical"
                    style={{
                        maxWidth: '100%',
                    }}
                >
                    {/* Họ tên và SĐT - 2 cột */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
                        gap: '0 16px'
                    }}>
                        <Form.Item name="ho_ten" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                            <Input placeholder="Nhập họ tên khách hàng" />
                        </Form.Item>
                        <Form.Item name="so_dien_thoai" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>
                    </div>

                    {/* Email và Ngày sinh - 2 cột */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
                        gap: '0 16px'
                    }}>
                        <Form.Item name="email" label="Email">
                            <Input type="email" placeholder="Nhập email" />
                        </Form.Item>
                        <Form.Item name="ngay_sinh" label="Ngày sinh">
                            <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày sinh" format="DD/MM/YYYY" />
                        </Form.Item>
                    </div>

                    {/* Giới tính, Loại khách, Nguồn khách - 3 cột */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                        gap: '0 16px'
                    }}>
                        <Form.Item name="gioi_tinh" label="Giới tính">
                            <Select placeholder="Chọn giới tính">
                                <Select.Option value="Nam">Nam</Select.Option>
                                <Select.Option value="Nữ">Nữ</Select.Option>
                                <Select.Option value="Khác">Khác</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="loai_khach" label="Loại khách hàng">
                            <Select placeholder="Chọn loại khách hàng">
                                <Select.Option value="vip">VIP</Select.Option>
                                <Select.Option value="thuong">Thường</Select.Option>
                                <Select.Option value="moi">Mới</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="nguon_khach" label="Nguồn khách">
                            <Select placeholder="Chọn nguồn khách">
                                <Select.Option value="facebook">Facebook</Select.Option>
                                <Select.Option value="zalo">Zalo</Select.Option>
                                <Select.Option value="gioi_thieu">Giới thiệu</Select.Option>
                                <Select.Option value="walk_in">Walk-in</Select.Option>
                                <Select.Option value="website">Website</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    {/* Địa chỉ và Ghi chú - 2 cột */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
                        gap: '0 16px'
                    }}>
                        <Form.Item name="dia_chi" label="Địa chỉ">
                            <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
                        </Form.Item>
                        <Form.Item name="ghi_chu" label="Ghi chú">
                            <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default SpaCustomerList;
