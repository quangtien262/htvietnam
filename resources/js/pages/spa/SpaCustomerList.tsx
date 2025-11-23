import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, DatePicker, Modal, Form, Select, message, Drawer, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, PhoneOutlined, MailOutlined, ShoppingOutlined, GiftOutlined, HistoryOutlined, DollarCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import API from '../../common/api';

const { Search } = Input;
const { RangePicker } = DatePicker;

interface Customer {
    id: number;
    name?: string;
    ho_ten?: string;
    phone?: string;
    sdt?: string;
    so_dien_thoai?: string;
    email?: string;
    ngay_sinh?: string;
    gioi_tinh?: string | number;
    gioi_tinh_id?: number;
    dia_chi?: string;
    address?: string;
    nguon_khach?: string;
    loai_khach?: string;
    trang_thai?: string;
    tong_chi_tieu?: number;
    diem_tich_luy?: number;
    points?: number;
    lan_mua_cuoi?: string;
    ghi_chu?: string;
    note?: string;
    created_at?: string;
    wallet?: {
        so_du: number;
        tong_nap: number;
        tong_rut: number;
    };
}

interface WalletTransaction {
    id: number;
    ma_giao_dich: string;
    loai_giao_dich: 'NAP' | 'RUT' | 'HOAN';
    so_tien: number;
    so_du_truoc: number;
    so_du_sau: number;
    the_gia_tri?: any;
    hoa_don?: any;
    ghi_chu?: string;
    created_at: string;
}

interface PurchaseHistory {
    id: number;
    ma_hoa_don: string;
    ngay_ban: string;
    tong_tien: number;
    trang_thai: string;
    chi_tiet: any[];
}

interface ServiceHistory {
    id: number;
    ma_hoa_don: string;
    ten_item: string;
    loai: 'dich_vu' | 'san_pham';
    so_luong: number;
    don_gia: number;
    thanh_tien: number;
    ngay_su_dung: string;
    nhan_vien?: string;
    ghi_chu?: string;
}

interface ServicePackageHistory {
    id: number;
    ma_goi: string;
    ten_goi: string;
    gia_mua: number;
    so_luong_tong: number;
    so_luong_da_dung: number;
    so_luong_con_lai: number;
    ngay_mua: string;
    ngay_het_han?: string;
    trang_thai: string;
}

interface PackageUsageHistory {
    id: number;
    ten_goi: string;
    ten_dich_vu: string;
    ngay_su_dung: string;
    nhan_vien: string;
    ghi_chu?: string;
}

interface DebtHistory {
    id: number;
    ma_cong_no: string;
    so_tien: number;
    so_tien_da_tra: number;
    so_tien_con_lai: number;
    ngay_tao: string;
    han_thanh_toan?: string;
    trang_thai: string;
}

const SpaCustomerList: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [filters, setFilters] = useState<any>({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [form] = Form.useForm();
    const [walletHistoryModalVisible, setWalletHistoryModalVisible] = useState(false);
    const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
    const [loadingWalletHistory, setLoadingWalletHistory] = useState(false);
    const [promoCodeModalVisible, setPromoCodeModalVisible] = useState(false);
    const [selectedCustomerForPromo, setSelectedCustomerForPromo] = useState<Customer | null>(null);
    const [promoCodeForm] = Form.useForm();

    // New states for history tabs
    const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
    const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
    const [servicePackageHistory, setServicePackageHistory] = useState<ServicePackageHistory[]>([]);
    const [packageUsageHistory, setPackageUsageHistory] = useState<PackageUsageHistory[]>([]);
    const [debtHistory, setDebtHistory] = useState<DebtHistory[]>([]);
    const [loadingPurchase, setLoadingPurchase] = useState(false);
    const [loadingService, setLoadingService] = useState(false);
    const [loadingServicePackage, setLoadingServicePackage] = useState(false);
    const [loadingPackageUsage, setLoadingPackageUsage] = useState(false);
    const [loadingDebt, setLoadingDebt] = useState(false);

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

            if (response.data.success || response.data.status_code === 200) {
                // Backend có thể trả về: { success: true, data: {pagination data} } hoặc { status_code: 200, data: {...} }
                const customerData = response.data.data;
                const customersData = customerData.data || customerData || [];

                // Fetch wallet for each customer
                const customersWithWallet = await Promise.all(
                    customersData.map(async (customer: Customer) => {
                        try {
                            const walletRes = await axios.get(`/spa/wallet/${customer.id}`);
                            if (walletRes.data.success) {
                                return { ...customer, wallet: walletRes.data.data };
                            }
                        } catch (err) {
                            console.log('No wallet for customer', customer.id);
                        }
                        return customer;
                    })
                );

                setCustomers(customersWithWallet);
                setPagination({
                    ...pagination,
                    total: customerData.total || customersWithWallet.length,
                    current: customerData.current_page || pagination.current,
                });
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            message.error('Lỗi khi tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const fetchWalletHistory = async (customerId: number) => {
        setLoadingWalletHistory(true);
        try {
            const response = await axios.get(`/spa/wallet/${customerId}/history`);
            if (response.data.success) {
                setWalletTransactions(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching wallet history:', error);
            message.error('Lỗi khi tải lịch sử giao dịch');
        } finally {
            setLoadingWalletHistory(false);
        }
    };

    const showWalletHistory = (customer: Customer) => {
        setSelectedCustomer(customer);
        fetchWalletHistory(customer.id);
        setWalletHistoryModalVisible(true);
    };

    const showPromoCodeModal = (customer: Customer) => {
        setSelectedCustomerForPromo(customer);
        setPromoCodeModalVisible(true);
    };

    const handleApplyPromoCode = async () => {
        try {
            const values = await promoCodeForm.validateFields();
            if (!selectedCustomerForPromo) return;

            const response = await axios.post('/spa/wallet/apply-code', {
                khach_hang_id: selectedCustomerForPromo.id,
                ma_code: values.promo_code.toUpperCase(),
            });

            if (response.data.success) {
                message.success(response.data.message || 'Nạp thẻ thành công!');
                setPromoCodeModalVisible(false);
                promoCodeForm.resetFields();
                fetchCustomers(); // Refresh to show updated wallet
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi áp dụng mã thẻ');
        }
    };

    // Fetch purchase history
    const fetchPurchaseHistory = async (customerId: number) => {
        setLoadingPurchase(true);
        try {
            const response = await axios.get(`/spa/customers/${customerId}/purchase-history`);
            if (response.data.success) {
                setPurchaseHistory(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching purchase history:', error);
            message.error('Lỗi khi tải lịch sử mua hàng');
        } finally {
            setLoadingPurchase(false);
        }
    };

    // Fetch service history (both services and products)
    const fetchServiceHistory = async (customerId: number) => {
        setLoadingService(true);
        try {
            const response = await axios.get(`/spa/customers/${customerId}/services`);
            if (response.data.success) {
                setServiceHistory(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching service history:', error);
            message.error('Lỗi khi tải lịch sử dịch vụ & sản phẩm');
        } finally {
            setLoadingService(false);
        }
    };

    // Fetch service package history
    const fetchServicePackageHistory = async (customerId: number) => {
        setLoadingServicePackage(true);
        try {
            const response = await axios.get(`/spa/customers/${customerId}/service-packages`);
            if (response.data.success) {
                setServicePackageHistory(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching service package history:', error);
            message.error('Lỗi khi tải lịch sử gói dịch vụ');
        } finally {
            setLoadingServicePackage(false);
        }
    };

    // Fetch package usage history
    const fetchPackageUsageHistory = async (customerId: number) => {
        setLoadingPackageUsage(true);
        try {
            const response = await axios.get(`/spa/customers/${customerId}/package-usage`);
            if (response.data.success) {
                setPackageUsageHistory(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching package usage:', error);
            message.error('Lỗi khi tải lịch sử sử dụng gói');
        } finally {
            setLoadingPackageUsage(false);
        }
    };

    // Fetch debt history
    const fetchDebtHistory = async (customerId: number) => {
        setLoadingDebt(true);
        try {
            const response = await axios.get(`/spa/customers/${customerId}/debts`);
            if (response.data.success) {
                setDebtHistory(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching debt history:', error);
            message.error('Lỗi khi tải lịch sử công nợ');
        } finally {
            setLoadingDebt(false);
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

    const showDetailDrawer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDetailDrawerVisible(true);
        // Load all history data
        fetchPurchaseHistory(customer.id);
        fetchServiceHistory(customer.id);
        fetchServicePackageHistory(customer.id);
        fetchPackageUsageHistory(customer.id);
        fetchDebtHistory(customer.id);
    };

    const closeDetailDrawer = () => {
        setIsDetailDrawerVisible(false);
        setSelectedCustomer(null);
        // Clear history data
        setPurchaseHistory([]);
        setServiceHistory([]);
        setServicePackageHistory([]);
        setPackageUsageHistory([]);
        setDebtHistory([]);
    };

    const showModal = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            // Map dữ liệu từ backend sang form
            const gioiTinhValue = customer.gioi_tinh_id || customer.gioi_tinh;
            const loaiKhachValue = customer.loai_khach?.toLowerCase();

            form.setFieldsValue({
                ho_ten: customer.ho_ten || customer.name,
                so_dien_thoai: customer.so_dien_thoai || customer.sdt || customer.phone,
                email: customer.email,
                ngay_sinh: customer.ngay_sinh ? dayjs(customer.ngay_sinh) : undefined,
                gioi_tinh: gioiTinhValue,
                dia_chi: customer.dia_chi || customer.address,
                loai_khach: loaiKhachValue,
                nguon_khach: customer.nguon_khach,
                ghi_chu: customer.ghi_chu || customer.note,
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

            // Nếu đang edit, thêm id để backend loại trừ unique check
            if (editingCustomer) {
                formData.id = editingCustomer.id;
            }

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
            title: 'Họ tên',
            dataIndex: 'ho_ten',
            key: 'ho_ten',
            width: 200,
            render: (text: string, record: Customer) => text || record.name || 'N/A',
        },
        {
            title: 'SĐT',
            dataIndex: 'sdt',
            key: 'sdt',
            width: 120,
            render: (text: string, record: Customer) => {
                const phone = text || record.phone || record.so_dien_thoai;
                return phone && (
                    <Space>
                        <PhoneOutlined />
                        {phone}
                    </Space>
                );
            },
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
                const colors: any = { 'VIP': 'gold', 'Thuong': 'blue', 'Moi': 'green' };
                const labels: any = { 'VIP': 'VIP', 'Thuong': 'Thường', 'Moi': 'Mới' };
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
            title: 'Số dư ví',
            dataIndex: 'wallet',
            key: 'wallet',
            width: 180,
            render: (wallet: any, record: Customer) => (
                <Space direction="vertical" size={0}>
                    <Tag color="green" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        {formatCurrency(wallet?.so_du || 0)}
                    </Tag>
                    <div style={{ fontSize: '11px', color: '#888' }}>
                        <Button type="link" size="small" style={{ padding: 0, height: 'auto' }} onClick={() => showWalletHistory(record)}>
                            Xem lịch sử
                        </Button>
                        {' | '}
                        <Button type="link" size="small" style={{ padding: 0, height: 'auto' }} onClick={() => showPromoCodeModal(record)}>
                            Nạp code
                        </Button>
                    </div>
                </Space>
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
                    <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => showDetailDrawer(record)} />
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
                                <Select.Option value={1}>Nam</Select.Option>
                                <Select.Option value={2}>Nữ</Select.Option>
                                <Select.Option value={3}>Khác</Select.Option>
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

            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: selectedCustomer?.loai_khach === 'VIP' ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' :
                                selectedCustomer?.loai_khach === 'Thuong' ? 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)' :
                                'linear-gradient(135deg, #52c41a 0%, #95de64 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#fff',
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }}>
                            {(selectedCustomer?.ho_ten || selectedCustomer?.name || 'K')?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 600 }}>
                                {selectedCustomer?.ho_ten || selectedCustomer?.name || 'Khách hàng'}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 400, color: '#8c8c8c', marginTop: '2px' }}>
                                <PhoneOutlined style={{ marginRight: '6px' }} />
                                {selectedCustomer?.sdt || selectedCustomer?.phone || 'N/A'}
                            </div>
                        </div>
                    </div>
                }
                placement="right"
                width={1200}
                onClose={closeDetailDrawer}
                open={isDetailDrawerVisible}
                styles={{
                    header: { borderBottom: '2px solid #f0f0f0', paddingBottom: '20px' }
                }}
            >
                {selectedCustomer && (
                    <div style={{ fontSize: '14px' }}>
                        {/* Header Stats Cards */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '12px',
                            marginBottom: '24px'
                        }}>
                            <div style={{
                                padding: '16px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '8px',
                                color: '#fff',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                            }}>
                                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>Tổng chi tiêu</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                    {(selectedCustomer.tong_chi_tieu || 0).toLocaleString('vi-VN')} đ
                                </div>
                            </div>
                            <div style={{
                                padding: '16px',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                borderRadius: '8px',
                                color: '#fff',
                                boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)'
                            }}>
                                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>Điểm tích lũy</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                    {selectedCustomer.diem_tich_luy || selectedCustomer.points || 0} điểm
                                </div>
                            </div>
                            <div style={{
                                padding: '16px',
                                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                borderRadius: '8px',
                                color: '#fff',
                                boxShadow: '0 4px 12px rgba(56, 239, 125, 0.3)'
                            }}>
                                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>💰 Số dư ví</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                    {(selectedCustomer.wallet?.so_du || 0).toLocaleString('vi-VN')} đ
                                </div>
                            </div>
                            <div style={{
                                padding: '16px',
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                borderRadius: '8px',
                                color: '#fff',
                                boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)'
                            }}>
                                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>Lần mua cuối</div>
                                <div style={{ fontSize: '13px', fontWeight: 600 }}>
                                    {selectedCustomer.lan_mua_cuoi ? dayjs(selectedCustomer.lan_mua_cuoi).format('DD/MM/YYYY') : 'Chưa mua'}
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultActiveKey="info" type="card">
                            <Tabs.TabPane tab={<span><EyeOutlined /> Thông tin cơ bản</span>} key="info">
                        <div style={{
                            marginBottom: '20px',
                            padding: '20px',
                            background: '#fafafa',
                            borderRadius: '8px',
                            border: '1px solid #f0f0f0'
                        }}>
                            <h3 style={{
                                marginBottom: '16px',
                                fontSize: '15px',
                                fontWeight: 600,
                                color: '#262626',
                                borderLeft: '3px solid #1890ff',
                                paddingLeft: '12px'
                            }}>
                                Thông tin cơ bản
                            </h3>
                            <div style={{ display: 'grid', gap: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ width: '120px', fontWeight: 500, color: '#595959' }}>Email:</span>
                                    <span style={{ color: '#262626' }}>
                                        <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                        {selectedCustomer.email || 'Chưa có'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ width: '120px', fontWeight: 500, color: '#595959' }}>Ngày sinh:</span>
                                    <span style={{ color: '#262626' }}>
                                        {selectedCustomer.ngay_sinh ? dayjs(selectedCustomer.ngay_sinh).format('DD/MM/YYYY') : 'Chưa có'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ width: '120px', fontWeight: 500, color: '#595959' }}>Giới tính:</span>
                                    <Tag color={
                                        (selectedCustomer.gioi_tinh_id === 1 || selectedCustomer.gioi_tinh === '1' || selectedCustomer.gioi_tinh === 1) ? 'blue' :
                                        (selectedCustomer.gioi_tinh_id === 2 || selectedCustomer.gioi_tinh === '2' || selectedCustomer.gioi_tinh === 2) ? 'pink' : 'default'
                                    }>
                                        {(selectedCustomer.gioi_tinh_id === 1 || selectedCustomer.gioi_tinh === '1' || selectedCustomer.gioi_tinh === 1) ? 'Nam' :
                                         (selectedCustomer.gioi_tinh_id === 2 || selectedCustomer.gioi_tinh === '2' || selectedCustomer.gioi_tinh === 2) ? 'Nữ' : 'Khác'}
                                    </Tag>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <span style={{ width: '120px', fontWeight: 500, color: '#595959', flexShrink: 0 }}>Địa chỉ:</span>
                                    <span style={{ color: '#262626', flex: 1 }}>
                                        {selectedCustomer.dia_chi || selectedCustomer.address || 'Chưa có'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Phân loại khách hàng */}
                        <div style={{
                            marginBottom: '20px',
                            padding: '20px',
                            background: '#fafafa',
                            borderRadius: '8px',
                            border: '1px solid #f0f0f0'
                        }}>
                            <h3 style={{
                                marginBottom: '16px',
                                fontSize: '15px',
                                fontWeight: 600,
                                color: '#262626',
                                borderLeft: '3px solid #52c41a',
                                paddingLeft: '12px'
                            }}>
                                Phân loại
                            </h3>
                            <div style={{ display: 'grid', gap: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ width: '120px', fontWeight: 500, color: '#595959' }}>Loại khách:</span>
                                    <Tag color={
                                        selectedCustomer.loai_khach === 'VIP' ? 'gold' :
                                        selectedCustomer.loai_khach === 'Thuong' ? 'blue' : 'green'
                                    } style={{ fontSize: '13px', padding: '4px 12px' }}>
                                        {selectedCustomer.loai_khach === 'VIP' ? '⭐ VIP' :
                                         selectedCustomer.loai_khach === 'Thuong' ? '👤 Thường' : '🆕 Mới'}
                                    </Tag>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ width: '120px', fontWeight: 500, color: '#595959' }}>Nguồn khách:</span>
                                    <span style={{ color: '#262626' }}>{selectedCustomer.nguon_khach || 'Chưa xác định'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ width: '120px', fontWeight: 500, color: '#595959' }}>Trạng thái:</span>
                                    <Tag color={selectedCustomer.trang_thai === 'active' ? 'success' : 'error'}>
                                        {selectedCustomer.trang_thai === 'active' ? '✓ Đang hoạt động' : '✕ Ngừng hoạt động'}
                                    </Tag>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin ví */}
                        {selectedCustomer.wallet && (
                            <div style={{
                                marginBottom: '20px',
                                padding: '20px',
                                background: 'linear-gradient(135deg, #f0fff4 0%, #e6f7ff 100%)',
                                borderRadius: '8px',
                                border: '2px solid #52c41a'
                            }}>
                                <h3 style={{
                                    marginBottom: '16px',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    color: '#262626',
                                    borderLeft: '3px solid #52c41a',
                                    paddingLeft: '12px'
                                }}>
                                    💰 Thông tin ví
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                                    <div style={{
                                        padding: '12px',
                                        background: '#fff',
                                        borderRadius: '6px',
                                        border: '1px solid #d9f7be'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>Số dư hiện tại</div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                                            {(selectedCustomer.wallet.so_du || 0).toLocaleString('vi-VN')} đ
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '12px',
                                        background: '#fff',
                                        borderRadius: '6px',
                                        border: '1px solid #d9f7be'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>Tổng đã nạp</div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                                            {(selectedCustomer.wallet.tong_nap || 0).toLocaleString('vi-VN')} đ
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '12px',
                                        background: '#fff',
                                        borderRadius: '6px',
                                        border: '1px solid #d9f7be'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>Tổng đã tiêu</div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4d4f' }}>
                                            {(selectedCustomer.wallet.tong_tieu || 0).toLocaleString('vi-VN')} đ
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '12px',
                                        background: '#fff',
                                        borderRadius: '6px',
                                        border: '1px solid #d9f7be'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>Tổng đã hoàn</div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#faad14' }}>
                                            {(selectedCustomer.wallet.tong_hoan || 0).toLocaleString('vi-VN')} đ
                                        </div>
                                    </div>
                                </div>
                                {selectedCustomer.wallet.han_muc_nap_ngay || selectedCustomer.wallet.han_muc_rut_ngay ? (
                                    <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '6px', border: '1px solid #d9f7be' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '8px', color: '#595959' }}>Hạn mức giao dịch:</div>
                                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                                            {selectedCustomer.wallet.han_muc_nap_ngay && (
                                                <div>
                                                    <span style={{ color: '#8c8c8c' }}>Nạp/ngày: </span>
                                                    <strong style={{ color: '#52c41a' }}>
                                                        {(selectedCustomer.wallet.han_muc_nap_ngay || 0).toLocaleString('vi-VN')} đ
                                                    </strong>
                                                </div>
                                            )}
                                            {selectedCustomer.wallet.han_muc_rut_ngay && (
                                                <div>
                                                    <span style={{ color: '#8c8c8c' }}>Rút/ngày: </span>
                                                    <strong style={{ color: '#ff4d4f' }}>
                                                        {(selectedCustomer.wallet.han_muc_rut_ngay || 0).toLocaleString('vi-VN')} đ
                                                    </strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                    <Space>
                                        <Button type="primary" size="small" onClick={() => showWalletHistory(selectedCustomer)}>
                                            Xem lịch sử giao dịch
                                        </Button>
                                        <Button size="small" onClick={() => showPromoCodeModal(selectedCustomer)}>
                                            Nạp thẻ code
                                        </Button>
                                    </Space>
                                </div>
                            </div>
                        )}

                        {/* Ghi chú */}
                        {(selectedCustomer.ghi_chu || selectedCustomer.note) && (
                            <div style={{
                                marginBottom: '20px',
                                padding: '20px',
                                background: '#fafafa',
                                borderRadius: '8px',
                                border: '1px solid #f0f0f0'
                            }}>
                                <h3 style={{
                                    marginBottom: '16px',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    color: '#262626',
                                    borderLeft: '3px solid #faad14',
                                    paddingLeft: '12px'
                                }}>
                                    📝 Ghi chú
                                </h3>
                                <div style={{
                                    padding: '14px',
                                    background: '#fff',
                                    borderRadius: '6px',
                                    border: '1px solid #e8e8e8',
                                    whiteSpace: 'pre-wrap',
                                    color: '#595959',
                                    lineHeight: '1.6'
                                }}>
                                    {selectedCustomer.ghi_chu || selectedCustomer.note}
                                </div>
                            </div>
                        )}

                        {/* Ngày tạo */}
                        <div style={{
                            marginTop: '24px',
                            paddingTop: '16px',
                            borderTop: '1px solid #e8e8e8',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                Ngày tạo: {selectedCustomer.created_at ? dayjs(selectedCustomer.created_at).format('DD/MM/YYYY HH:mm') : 'N/A'}
                            </div>
                        </div>
                            </Tabs.TabPane>

                            {/* Tab Lịch sử mua hàng */}
                            <Tabs.TabPane tab={<span><ShoppingOutlined /> Lịch sử mua hàng</span>} key="purchase">
                                <Table
                                    dataSource={purchaseHistory}
                                    loading={loadingPurchase}
                                    pagination={{ pageSize: 10 }}
                                    rowKey="id"
                                    size="small"
                                    columns={[
                                        {
                                            title: 'Mã hóa đơn',
                                            dataIndex: 'ma_hoa_don',
                                            key: 'ma_hoa_don',
                                            width: 150,
                                        },
                                        {
                                            title: 'Ngày mua',
                                            dataIndex: 'ngay_ban',
                                            key: 'ngay_ban',
                                            width: 150,
                                            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                                        },
                                        {
                                            title: 'Tổng tiền',
                                            dataIndex: 'tong_tien',
                                            key: 'tong_tien',
                                            width: 130,
                                            render: (val: number) => <span style={{ fontWeight: 600, color: '#52c41a' }}>{val?.toLocaleString('vi-VN')} đ</span>,
                                        },
                                        {
                                            title: 'Trạng thái',
                                            dataIndex: 'trang_thai',
                                            key: 'trang_thai',
                                            width: 120,
                                            render: (status: string) => (
                                                <Tag color={status === 'hoan_thanh' ? 'success' : status === 'huy' ? 'error' : 'processing'}>
                                                    {status === 'hoan_thanh' ? 'Hoàn thành' : status === 'huy' ? 'Đã hủy' : 'Chờ xử lý'}
                                                </Tag>
                                            ),
                                        },
                                        {
                                            title: 'Chi tiết',
                                            key: 'action',
                                            width: 100,
                                            render: (_: any, record: any) => (
                                                <Button type="link" size="small" onClick={() => message.info('Chi tiết hóa đơn: ' + record.ma_hoa_don)}>
                                                    Xem
                                                </Button>
                                            ),
                                        },
                                    ]}
                                />
                            </Tabs.TabPane>

                            {/* Tab Sản phẩm & Dịch vụ */}
                            <Tabs.TabPane tab={<span><GiftOutlined /> Sản phẩm & Dịch vụ</span>} key="service">
                                <Table
                                    dataSource={serviceHistory}
                                    loading={loadingService}
                                    pagination={{ pageSize: 10 }}
                                    rowKey="id"
                                    size="small"
                                    columns={[
                                        {
                                            title: 'Mã hóa đơn',
                                            dataIndex: 'ma_hoa_don',
                                            key: 'ma_hoa_don',
                                            width: 130,
                                        },
                                        {
                                            title: 'Loại',
                                            dataIndex: 'loai',
                                            key: 'loai',
                                            width: 100,
                                            render: (loai: string) => (
                                                <Tag color={loai === 'dich_vu' ? 'blue' : 'green'}>
                                                    {loai === 'dich_vu' ? 'Dịch vụ' : 'Sản phẩm'}
                                                </Tag>
                                            ),
                                        },
                                        {
                                            title: 'Tên',
                                            dataIndex: 'ten_item',
                                            key: 'ten_item',
                                        },
                                        {
                                            title: 'Số lượng',
                                            dataIndex: 'so_luong',
                                            key: 'so_luong',
                                            width: 100,
                                            align: 'center',
                                        },
                                        {
                                            title: 'Đơn giá',
                                            dataIndex: 'don_gia',
                                            key: 'don_gia',
                                            width: 130,
                                            render: (val: number) => <span>{val?.toLocaleString('vi-VN')} đ</span>,
                                        },
                                        {
                                            title: 'Thành tiền',
                                            dataIndex: 'thanh_tien',
                                            key: 'thanh_tien',
                                            width: 130,
                                            render: (val: number) => <span style={{ fontWeight: 600, color: '#52c41a' }}>{val?.toLocaleString('vi-VN')} đ</span>,
                                        },
                                        {
                                            title: 'Ngày mua',
                                            dataIndex: 'ngay_su_dung',
                                            key: 'ngay_su_dung',
                                            width: 130,
                                            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                                        },
                                        {
                                            title: 'Nhân viên',
                                            dataIndex: 'nhan_vien',
                                            key: 'nhan_vien',
                                            width: 130,
                                        },
                                    ]}
                                />
                            </Tabs.TabPane>

                            {/* Tab Gói dịch vụ */}
                            <Tabs.TabPane tab={<span><GiftOutlined /> Gói dịch vụ</span>} key="service_package">
                                <Table
                                    dataSource={servicePackageHistory}
                                    loading={loadingServicePackage}
                                    pagination={{ pageSize: 10 }}
                                    rowKey="id"
                                    size="small"
                                    columns={[
                                        {
                                            title: 'Mã gói',
                                            dataIndex: 'ma_goi',
                                            key: 'ma_goi',
                                            width: 120,
                                        },
                                        {
                                            title: 'Tên gói',
                                            dataIndex: 'ten_goi',
                                            key: 'ten_goi',
                                        },
                                        {
                                            title: 'Giá mua',
                                            dataIndex: 'gia_mua',
                                            key: 'gia_mua',
                                            width: 130,
                                            render: (val: number) => <span style={{ fontWeight: 600 }}>{val?.toLocaleString('vi-VN')} đ</span>,
                                        },
                                        {
                                            title: 'Tổng lượt',
                                            dataIndex: 'so_luong_tong',
                                            key: 'so_luong_tong',
                                            width: 100,
                                            align: 'center',
                                        },
                                        {
                                            title: 'Đã dùng',
                                            dataIndex: 'so_luong_da_dung',
                                            key: 'so_luong_da_dung',
                                            width: 100,
                                            align: 'center',
                                        },
                                        {
                                            title: 'Còn lại',
                                            dataIndex: 'so_luong_con_lai',
                                            key: 'so_luong_con_lai',
                                            width: 100,
                                            align: 'center',
                                            render: (val: number) => <span style={{ fontWeight: 600, color: '#1890ff' }}>{val}</span>,
                                        },
                                        {
                                            title: 'Ngày mua',
                                            dataIndex: 'ngay_mua',
                                            key: 'ngay_mua',
                                            width: 120,
                                            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
                                        },
                                        {
                                            title: 'Hạn sử dụng',
                                            dataIndex: 'ngay_het_han',
                                            key: 'ngay_het_han',
                                            width: 120,
                                            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : 'Không giới hạn',
                                        },
                                        {
                                            title: 'Trạng thái',
                                            dataIndex: 'trang_thai',
                                            key: 'trang_thai',
                                            width: 120,
                                            render: (status: string) => (
                                                <Tag color={status === 'dang_dung' ? 'success' : status === 'het_han' ? 'error' : 'warning'}>
                                                    {status === 'dang_dung' ? 'Đang dùng' : status === 'het_han' ? 'Hết hạn' : 'Đã hết'}
                                                </Tag>
                                            ),
                                        },
                                    ]}
                                />
                            </Tabs.TabPane>

                            {/* Tab Lịch sử sử dụng gói */}
                            <Tabs.TabPane tab={<span><HistoryOutlined /> Lịch sử sử dụng gói</span>} key="package_usage">
                                <Table
                                    dataSource={packageUsageHistory}
                                    loading={loadingPackageUsage}
                                    pagination={{ pageSize: 10 }}
                                    rowKey="id"
                                    size="small"
                                    columns={[
                                        {
                                            title: 'Tên gói',
                                            dataIndex: 'ten_goi',
                                            key: 'ten_goi',
                                            width: 200,
                                        },
                                        {
                                            title: 'Dịch vụ sử dụng',
                                            dataIndex: 'ten_dich_vu',
                                            key: 'ten_dich_vu',
                                        },
                                        {
                                            title: 'Ngày sử dụng',
                                            dataIndex: 'ngay_su_dung',
                                            key: 'ngay_su_dung',
                                            width: 150,
                                            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                                        },
                                        {
                                            title: 'Nhân viên',
                                            dataIndex: 'nhan_vien',
                                            key: 'nhan_vien',
                                            width: 150,
                                        },
                                        {
                                            title: 'Ghi chú',
                                            dataIndex: 'ghi_chu',
                                            key: 'ghi_chu',
                                            ellipsis: true,
                                        },
                                    ]}
                                />
                            </Tabs.TabPane>

                            {/* Tab Công nợ */}
                            <Tabs.TabPane tab={<span><DollarCircleOutlined /> Công nợ</span>} key="debt">
                                <Table
                                    dataSource={debtHistory}
                                    loading={loadingDebt}
                                    pagination={{ pageSize: 10 }}
                                    rowKey="id"
                                    size="small"
                                    columns={[
                                        {
                                            title: 'Mã công nợ',
                                            dataIndex: 'ma_cong_no',
                                            key: 'ma_cong_no',
                                            width: 150,
                                        },
                                        {
                                            title: 'Số tiền',
                                            dataIndex: 'so_tien',
                                            key: 'so_tien',
                                            width: 130,
                                            render: (val: number) => <span style={{ fontWeight: 600, color: '#ff4d4f' }}>{val?.toLocaleString('vi-VN')} đ</span>,
                                        },
                                        {
                                            title: 'Đã trả',
                                            dataIndex: 'so_tien_da_tra',
                                            key: 'so_tien_da_tra',
                                            width: 130,
                                            render: (val: number) => <span style={{ fontWeight: 600, color: '#52c41a' }}>{val?.toLocaleString('vi-VN')} đ</span>,
                                        },
                                        {
                                            title: 'Còn lại',
                                            dataIndex: 'so_tien_con_lai',
                                            key: 'so_tien_con_lai',
                                            width: 130,
                                            render: (val: number) => <span style={{ fontWeight: 600, color: '#faad14' }}>{val?.toLocaleString('vi-VN')} đ</span>,
                                        },
                                        {
                                            title: 'Ngày tạo',
                                            dataIndex: 'ngay_tao',
                                            key: 'ngay_tao',
                                            width: 120,
                                            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
                                        },
                                        {
                                            title: 'Hạn thanh toán',
                                            dataIndex: 'han_thanh_toan',
                                            key: 'han_thanh_toan',
                                            width: 120,
                                            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
                                        },
                                        {
                                            title: 'Trạng thái',
                                            dataIndex: 'trang_thai',
                                            key: 'trang_thai',
                                            width: 120,
                                            render: (status: string) => (
                                                <Tag color={status === 'da_thanh_toan' ? 'success' : status === 'qua_han' ? 'error' : 'warning'}>
                                                    {status === 'da_thanh_toan' ? 'Đã thanh toán' : status === 'qua_han' ? 'Quá hạn' : 'Chưa thanh toán'}
                                                </Tag>
                                            ),
                                        },
                                    ]}
                                />
                            </Tabs.TabPane>
                        </Tabs>
                    </div>
                )}
            </Drawer>

            {/* Wallet History Modal */}
            <Modal
                title={`Lịch sử giao dịch ví - ${selectedCustomer?.ho_ten || selectedCustomer?.name || ''}`}
                visible={walletHistoryModalVisible}
                onCancel={() => setWalletHistoryModalVisible(false)}
                footer={null}
                width={900}
            >
                <Table
                    dataSource={walletTransactions}
                    loading={loadingWalletHistory}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                    columns={[
                        {
                            title: 'Mã GD',
                            dataIndex: 'ma_giao_dich',
                            key: 'ma_giao_dich',
                            width: 160,
                        },
                        {
                            title: 'Loại',
                            dataIndex: 'loai_giao_dich',
                            key: 'loai_giao_dich',
                            width: 100,
                            render: (type: string) => {
                                const config: any = {
                                    NAP: { color: 'green', text: 'Nạp tiền' },
                                    RUT: { color: 'red', text: 'Rút tiền' },
                                    HOAN: { color: 'blue', text: 'Hoàn tiền' },
                                };
                                const c = config[type] || { color: 'default', text: type };
                                return <Tag color={c.color}>{c.text}</Tag>;
                            },
                        },
                        {
                            title: 'Số tiền',
                            dataIndex: 'so_tien',
                            key: 'so_tien',
                            width: 130,
                            render: (amount: number, record: WalletTransaction) => (
                                <span style={{ color: record.loai_giao_dich === 'NAP' || record.loai_giao_dich === 'HOAN' ? 'green' : 'red', fontWeight: 'bold' }}>
                                    {record.loai_giao_dich === 'NAP' || record.loai_giao_dich === 'HOAN' ? '+' : '-'}{formatCurrency(amount)}
                                </span>
                            ),
                        },
                        {
                            title: 'Số dư trước',
                            dataIndex: 'so_du_truoc',
                            key: 'so_du_truoc',
                            width: 130,
                            render: (val: number) => formatCurrency(val),
                        },
                        {
                            title: 'Số dư sau',
                            dataIndex: 'so_du_sau',
                            key: 'so_du_sau',
                            width: 130,
                            render: (val: number) => formatCurrency(val),
                        },
                        {
                            title: 'Ghi chú',
                            dataIndex: 'ghi_chu',
                            key: 'ghi_chu',
                            ellipsis: true,
                        },
                        {
                            title: 'Ngày tạo',
                            dataIndex: 'created_at',
                            key: 'created_at',
                            width: 150,
                            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                        },
                    ]}
                />
            </Modal>

            {/* Promo Code Modal */}
            <Modal
                title="Nạp thẻ tặng bằng mã code"
                visible={promoCodeModalVisible}
                onOk={handleApplyPromoCode}
                onCancel={() => {
                    setPromoCodeModalVisible(false);
                    promoCodeForm.resetFields();
                }}
                okText="Áp dụng"
                cancelText="Hủy"
            >
                <Form form={promoCodeForm} layout="vertical">
                    <div style={{ marginBottom: 16, padding: '12px', background: '#f0f5ff', borderRadius: '4px' }}>
                        <strong>Khách hàng:</strong> {selectedCustomerForPromo?.ho_ten || selectedCustomerForPromo?.name}
                        <br />
                        <strong>Số dư hiện tại:</strong> {formatCurrency(selectedCustomerForPromo?.wallet?.so_du || 0)}
                    </div>
                    <Form.Item
                        name="promo_code"
                        label="Mã thẻ tặng"
                        rules={[{ required: true, message: 'Vui lòng nhập mã thẻ' }]}
                    >
                        <Input
                            placeholder="VD: NEWCUSTOMER, SALE50"
                            autoFocus
                            style={{ textTransform: 'uppercase' }}
                        />
                    </Form.Item>
                    <div style={{ fontSize: '13px', color: '#888' }}>
                        Nhập mã thẻ tặng để nạp tiền vào ví khách hàng. Mã sẽ được kiểm tra tính hợp lệ và số dư sẽ được cập nhật ngay lập tức.
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default SpaCustomerList;
