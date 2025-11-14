import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, InputNumber, Select, Space, Divider, Statistic, message, Modal, Form, Input, Tabs, Badge, Tag, Empty, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined, DollarOutlined, UserOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API } from '../../common/api';

const { Search } = Input;
const { TabPane } = Tabs;

interface CartItem {
    key: string;
    type: 'service' | 'product';
    id: number;
    name: string;
    price: number;
    quantity: number;
    ktv_id?: number;
    ktv_name?: string;
}

interface ServiceProduct {
    id: number;
    ma_dich_vu?: string;
    ma_san_pham?: string;
    ten_dich_vu?: string;
    ten_san_pham?: string;
    gia_ban: number;
    gia_thanh_vien?: number;
    danh_muc_id?: number;
    danh_muc_ten?: string;
    trang_thai?: string;
}

const SpaPOSScreen: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [discount, setDiscount] = useState(0);
    const [pointsUsed, setPointsUsed] = useState(0);
    const [tip, setTip] = useState(0);
    const [loading, setLoading] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [form] = Form.useForm();

    // New states for product/service listing
    const [services, setServices] = useState<ServiceProduct[]>([]);
    const [products, setProducts] = useState<ServiceProduct[]>([]);
    const [filteredServices, setFilteredServices] = useState<ServiceProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ServiceProduct[]>([]);
    const [serviceSearch, setServiceSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [serviceCategory, setServiceCategory] = useState<number | null>(null);
    const [productCategory, setProductCategory] = useState<number | null>(null);
    const [serviceCategories, setServiceCategories] = useState<any[]>([]);
    const [productCategories, setProductCategories] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // Customer states
    const [customers, setCustomers] = useState<any[]>([]);
    const [customerSearch, setCustomerSearch] = useState('');

    // Fetch services and products on mount
    useEffect(() => {
        fetchServices();
        fetchProducts();
        fetchCategories();
        fetchCustomers();
    }, []);

    // Filter services when search or category changes
    useEffect(() => {
        // Ensure services is always an array
        const serviceList = Array.isArray(services) ? services : [];
        let filtered = serviceList;

        if (serviceSearch) {
            filtered = filtered.filter(s =>
                s.ten_dich_vu?.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                s.ma_dich_vu?.toLowerCase().includes(serviceSearch.toLowerCase())
            );
        }

        if (serviceCategory) {
            filtered = filtered.filter(s => s.danh_muc_id === serviceCategory);
        }

        setFilteredServices(filtered);
    }, [serviceSearch, serviceCategory, services]);

    // Filter products when search or category changes
    useEffect(() => {
        // Ensure products is always an array
        const productList = Array.isArray(products) ? products : [];
        let filtered = productList;

        if (productSearch) {
            filtered = filtered.filter(p =>
                p.ten_san_pham?.toLowerCase().includes(productSearch.toLowerCase()) ||
                p.ma_san_pham?.toLowerCase().includes(productSearch.toLowerCase())
            );
        }

        if (productCategory) {
            filtered = filtered.filter(p => p.danh_muc_id === productCategory);
        }

        setFilteredProducts(filtered);
    }, [productSearch, productCategory, products]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Prevent shortcuts when typing in input fields
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                // Only allow ESC when in input
                if (event.key !== 'Escape') {
                    return;
                }
            }

            switch (event.key) {
                case 'F1':
                    event.preventDefault();
                    handleSelectCustomer();
                    break;
                case 'F2':
                    event.preventDefault();
                    handleScanBarcode();
                    break;
                case 'F3':
                    event.preventDefault();
                    handleHoldInvoice();
                    break;
                case 'F4':
                    event.preventDefault();
                    handleRecallInvoice();
                    break;
                case 'F9':
                    event.preventDefault();
                    if (cart.length > 0) {
                        handlePayment();
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    handleCancelInvoice();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [cart]); // Re-bind when cart changes

    const fetchServices = async () => {
        setLoadingData(true);
        try {
            const response = await axios.get(API.spaServiceList, {
                params: { per_page: 1000, trang_thai: 'active' }
            });

            // Handle pagination response - response.data.data is pagination object
            const serviceData = response.data.data?.data || response.data.data || [];
            setServices(Array.isArray(serviceData) ? serviceData : []);
            setFilteredServices(Array.isArray(serviceData) ? serviceData : []);
        } catch (error) {
            console.error('Error fetching services:', error);
            message.error('Không thể tải danh sách dịch vụ');
            setServices([]);
            setFilteredServices([]);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchProducts = async () => {
        setLoadingData(true);
        try {
            const response = await axios.get(API.spaProductList, {
                params: { per_page: 1000, trang_thai: 'active' }
            });

            console.log('Product API Response:', response.data);

            // Handle pagination response - response.data.data is pagination object
            const productData = response.data.data?.data || response.data.data || [];
            console.log('Extracted product data:', productData);

            setProducts(Array.isArray(productData) ? productData : []);
            setFilteredProducts(Array.isArray(productData) ? productData : []);
        } catch (error) {
            console.error('Error fetching products:', error);
            message.error('Không thể tải danh sách sản phẩm');
            setProducts([]);
            setFilteredProducts([]);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const [serviceRes, productRes] = await Promise.all([
                axios.get(API.spaServiceCategoryList),
                axios.get(API.spaProductCategoryList)
            ]);
            setServiceCategories(serviceRes.data.data || []);
            setProductCategories(productRes.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Fetch customers from users table using API.userSelect
    const fetchCustomers = async (keyword: string = '') => {
        try {
            const response = await axios.post(API.userSelect);
            console.log('Customers response:', response.data);

            if (response.data.status_code === 200) {
                const data = response.data.data || [];
                setCustomers(Array.isArray(data) ? data : []);
                console.log('Customers loaded:', data.length);
            } else {
                console.error('Failed to fetch customers:', response.data);
                message.error('Không thể tải danh sách khách hàng');
                setCustomers([]);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            message.error('Lỗi khi tải danh sách khách hàng');
            setCustomers([]);
        }
    };

    const addToCart = (item: ServiceProduct, type: 'service' | 'product') => {
        const name = type === 'service' ? item.ten_dich_vu : item.ten_san_pham;
        const price = selectedCustomer && item.gia_thanh_vien ? item.gia_thanh_vien : item.gia_ban;

        const newItem: CartItem = {
            key: `${type}-${item.id}-${Date.now()}`,
            type: type,
            id: item.id,
            name: name || 'Unknown',
            price: price,
            quantity: 1,
        };
        setCart([...cart, newItem]);
        message.success(`Đã thêm ${name} vào giỏ hàng`);
    };

    const updateQuantity = (key: string, quantity: number) => {
        setCart(cart.map(item => item.key === key ? { ...item, quantity } : item));
    };

    const removeFromCart = (key: string) => {
        setCart(cart.filter(item => item.key !== key));
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const pointDiscount = pointsUsed * 10000; // 1 point = 10,000 VND
        return subtotal - discount - pointDiscount + tip;
    };

    const handlePayment = async () => {
        if (cart.length === 0) {
            message.error('Giỏ hàng trống');
            return;
        }

        setPaymentModalVisible(true);
    };

    // Keyboard shortcut handlers
    const handleSelectCustomer = () => {
        const customerSelectElement = document.querySelector('input[placeholder*="khách hàng"]') as HTMLInputElement;
        if (customerSelectElement) {
            customerSelectElement.focus();
            customerSelectElement.click();
        }
    };

    const handleScanBarcode = () => {
        Modal.info({
            title: 'Quét mã vạch',
            content: (
                <div>
                    <Input
                        autoFocus
                        placeholder="Quét hoặc nhập mã vạch sản phẩm"
                        onPressEnter={(e) => {
                            const barcode = (e.target as HTMLInputElement).value;
                            // TODO: Search product/service by barcode
                            message.info(`Tìm kiếm mã: ${barcode}`);
                            Modal.destroyAll();
                        }}
                    />
                </div>
            ),
        });
    };

    const handleHoldInvoice = () => {
        if (cart.length === 0) {
            message.warning('Giỏ hàng trống, không thể hold');
            return;
        }

        const invoiceData = {
            cart,
            customer: selectedCustomer,
            discount,
            pointsUsed,
            tip,
            timestamp: new Date().toISOString(),
        };

        const heldInvoices = JSON.parse(localStorage.getItem('heldInvoices') || '[]');
        heldInvoices.push(invoiceData);
        localStorage.setItem('heldInvoices', JSON.stringify(heldInvoices));

        message.success('Đã hold hóa đơn');

        // Reset cart
        setCart([]);
        setSelectedCustomer(null);
        setDiscount(0);
        setPointsUsed(0);
        setTip(0);
    };

    const handleRecallInvoice = () => {
        const heldInvoices = JSON.parse(localStorage.getItem('heldInvoices') || '[]');

        if (heldInvoices.length === 0) {
            message.info('Không có hóa đơn đang hold');
            return;
        }

        Modal.confirm({
            title: 'Chọn hóa đơn cần recall',
            width: 600,
            content: (
                <div style={{ maxHeight: 400, overflow: 'auto' }}>
                    {heldInvoices.map((invoice: any, index: number) => (
                        <Card
                            key={index}
                            size="small"
                            style={{ marginBottom: 8, cursor: 'pointer' }}
                            onClick={() => {
                                setCart(invoice.cart);
                                setSelectedCustomer(invoice.customer);
                                setDiscount(invoice.discount);
                                setPointsUsed(invoice.pointsUsed);
                                setTip(invoice.tip);

                                // Remove from held invoices
                                heldInvoices.splice(index, 1);
                                localStorage.setItem('heldInvoices', JSON.stringify(heldInvoices));

                                message.success('Đã recall hóa đơn');
                                Modal.destroyAll();
                            }}
                        >
                            <div>
                                <strong>Hóa đơn #{index + 1}</strong> - {new Date(invoice.timestamp).toLocaleString()}
                            </div>
                            <div>Khách hàng: {invoice.customer?.label || 'Khách lẻ'}</div>
                            <div>Số lượng: {invoice.cart.length} item</div>
                        </Card>
                    ))}
                </div>
            ),
            okButtonProps: { style: { display: 'none' } },
            cancelText: 'Đóng',
        });
    };

    const handleCancelInvoice = () => {
        if (cart.length === 0) {
            message.info('Giỏ hàng đã trống');
            return;
        }

        Modal.confirm({
            title: 'Xác nhận hủy hóa đơn',
            content: 'Bạn có chắc chắn muốn hủy hóa đơn này không?',
            okText: 'Hủy hóa đơn',
            okType: 'danger',
            cancelText: 'Không',
            onOk: () => {
                setCart([]);
                setSelectedCustomer(null);
                setDiscount(0);
                setPointsUsed(0);
                setTip(0);
                message.success('Đã hủy hóa đơn');
            },
        });
    };

    const handleConfirmPayment = async () => {
        try {
            const values = await form.validateFields();

            const invoiceData = {
                khach_hang_id: selectedCustomer?.value,
                chi_nhanh_id: 1, // Default branch
                chi_tiets: cart.map(item => ({
                    dich_vu_id: item.type === 'service' ? item.id : null,
                    san_pham_id: item.type === 'product' ? item.id : null,
                    ktv_id: item.ktv_id,
                    so_luong: item.quantity,
                    don_gia: item.price, // Add price to each item
                })),
                thanh_toan: true,
                phuong_thuc_thanh_toan: values.payment_methods,
                giam_gia: discount,
                diem_su_dung: pointsUsed,
                tien_tip: tip,
                nguoi_ban: 'Admin', // TODO: Get from auth
            };

            const response = await axios.post(API.spaPOSCreateInvoice, invoiceData);

            if (response.data.success) {
                message.success('Thanh toán thành công!');
                // Reset form
                setCart([]);
                setSelectedCustomer(null);
                setDiscount(0);
                setPointsUsed(0);
                setTip(0);
                setPaymentModalVisible(false);
                form.resetFields();
            }
        } catch (error) {
            console.error('Payment error:', error);
            message.error('Lỗi khi thanh toán');
        }
    };

    const cartColumns = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' đ',
        },
        {
            title: 'SL',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (qty: number, record: CartItem) => (
                <InputNumber
                    min={1}
                    value={qty}
                    onChange={(value) => updateQuantity(record.key, value || 1)}
                    style={{ width: 60 }}
                />
            ),
        },
        {
            title: 'Thành tiền',
            key: 'total',
            render: (_: any, record: CartItem) =>
                new Intl.NumberFormat('vi-VN').format(record.price * record.quantity) + ' đ',
        },
        {
            title: '',
            key: 'action',
            render: (_: any, record: CartItem) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeFromCart(record.key)}
                />
            ),
        },
    ];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div style={{ padding: '24px' }}>
            <h1>POS Bán hàng</h1>
            <Row gutter={16}>
                {/* Products & Services List */}
                <Col span={12}>
                    <Tabs defaultActiveKey="services">
                        <TabPane tab={<span><Badge count={filteredServices.length} showZero>Dịch vụ</Badge></span>} key="services">
                            <Card
                                size="small"
                                title={
                                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                        <Search
                                            placeholder="Tìm kiếm dịch vụ theo tên hoặc mã..."
                                            allowClear
                                            style={{ width: 300 }}
                                            value={serviceSearch}
                                            onChange={(e) => setServiceSearch(e.target.value)}
                                            prefix={<SearchOutlined />}
                                        />
                                        <Select
                                            placeholder="Lọc theo danh mục"
                                            allowClear
                                            style={{ width: 200 }}
                                            value={serviceCategory}
                                            onChange={setServiceCategory}
                                        >
                                            {serviceCategories.map(cat => (
                                                <Select.Option key={cat.id} value={cat.id}>
                                                    {cat.ten_danh_muc}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Space>
                                }
                            >
                                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    {loadingData ? (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>
                                    ) : filteredServices.length === 0 ? (
                                        <Empty description="Không tìm thấy dịch vụ" />
                                    ) : (
                                        <Row gutter={[8, 8]}>
                                            {filteredServices.map(service => (
                                                <Col span={8} key={service.id}>
                                                    <Card
                                                        hoverable
                                                        size="small"
                                                        onClick={() => addToCart(service, 'service')}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <Card.Meta
                                                            title={
                                                                <div style={{ fontSize: '13px' }}>
                                                                    {service.ten_dich_vu}
                                                                    {service.danh_muc_ten && (
                                                                        <Tag color="blue" style={{ marginLeft: 8, fontSize: '11px' }}>
                                                                            {service.danh_muc_ten}
                                                                        </Tag>
                                                                    )}
                                                                </div>
                                                            }
                                                            description={
                                                                <div>
                                                                    <div style={{ fontSize: '12px', color: '#888' }}>
                                                                        {service.ma_dich_vu}
                                                                    </div>
                                                                    <div style={{ fontWeight: 'bold', color: '#1890ff', marginTop: 4 }}>
                                                                        {new Intl.NumberFormat('vi-VN').format(service.gia_ban)} đ
                                                                    </div>
                                                                    {service.gia_thanh_vien && (
                                                                        <div style={{ fontSize: '12px', color: '#52c41a' }}>
                                                                            TV: {new Intl.NumberFormat('vi-VN').format(service.gia_thanh_vien)} đ
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            }
                                                        />
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    )}
                                </div>
                            </Card>
                        </TabPane>

                        <TabPane tab={<span><Badge count={filteredProducts.length} showZero>Sản phẩm</Badge></span>} key="products">
                            <Card
                                size="small"
                                title={
                                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                        <Search
                                            placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
                                            allowClear
                                            style={{ width: 300 }}
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            prefix={<SearchOutlined />}
                                        />
                                        <Select
                                            placeholder="Lọc theo danh mục"
                                            allowClear
                                            style={{ width: 200 }}
                                            value={productCategory}
                                            onChange={setProductCategory}
                                        >
                                            {productCategories.map(cat => (
                                                <Select.Option key={cat.id} value={cat.id}>
                                                    {cat.ten_danh_muc}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Space>
                                }
                            >
                                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    {loadingData ? (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>
                                    ) : filteredProducts.length === 0 ? (
                                        <Empty description="Không tìm thấy sản phẩm" />
                                    ) : (
                                        <Row gutter={[8, 8]}>
                                            {filteredProducts.map(product => (
                                                <Col span={8} key={product.id}>
                                                    <Card
                                                        hoverable
                                                        size="small"
                                                        onClick={() => addToCart(product, 'product')}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <Card.Meta
                                                            title={
                                                                <div style={{ fontSize: '13px' }}>
                                                                    {product.ten_san_pham}
                                                                    {product.danh_muc_ten && (
                                                                        <Tag color="green" style={{ marginLeft: 8, fontSize: '11px' }}>
                                                                            {product.danh_muc_ten}
                                                                        </Tag>
                                                                    )}
                                                                </div>
                                                            }
                                                            description={
                                                                <div>
                                                                    <div style={{ fontSize: '12px', color: '#888' }}>
                                                                        {product.ma_san_pham}
                                                                    </div>
                                                                    <div style={{ fontWeight: 'bold', color: '#1890ff', marginTop: 4 }}>
                                                                        {new Intl.NumberFormat('vi-VN').format(product.gia_ban)} đ
                                                                    </div>
                                                                    {product.gia_thanh_vien && (
                                                                        <div style={{ fontSize: '12px', color: '#52c41a' }}>
                                                                            TV: {new Intl.NumberFormat('vi-VN').format(product.gia_thanh_vien)} đ
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            }
                                                        />
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    )}
                                </div>
                            </Card>
                        </TabPane>
                    </Tabs>
                </Col>

                {/* Cart & Payment */}
                <Col span={12}>
                    <Card title="Hóa đơn" style={{ marginBottom: 16 }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Select
                                placeholder="Chọn khách hàng"
                                style={{ width: '100%' }}
                                value={selectedCustomer?.value}
                                onChange={(value: any) => {
                                    const user = customers.find(u => u.value === value);
                                    setSelectedCustomer(user || null);
                                }}
                                showSearch
                                allowClear
                                filterOption={(input, option: any) => {
                                    const label = option?.children?.toString() || '';
                                    return label.toLowerCase().includes(input.toLowerCase());
                                }}
                            >
                                {customers.map(user => (
                                    <Select.Option key={user.value} value={user.value}>
                                        {user.code} - {user.label} {user.phone ? `- ${user.phone}` : ''}
                                    </Select.Option>
                                ))}
                            </Select>

                            <Table
                                dataSource={cart}
                                columns={cartColumns}
                                pagination={false}
                                size="small"
                            />

                            <Divider />

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span>Tạm tính:</span>
                                    <strong>{formatCurrency(calculateSubtotal())}</strong>
                                </div>

                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Giảm giá:</span>
                                        <InputNumber
                                            value={discount}
                                            onChange={(value) => setDiscount(value || 0)}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                                            style={{ width: 150 }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Dùng điểm ({selectedCustomer?.points ?? 0}):</span>
                                        <InputNumber
                                            value={pointsUsed}
                                            onChange={(value) => setPointsUsed(value || 0)}
                                            max={selectedCustomer?.points ?? 0}
                                            disabled={!selectedCustomer || (selectedCustomer?.points ?? 0) === 0}
                                            style={{ width: 150 }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Tiền tip:</span>
                                        <InputNumber
                                            value={tip}
                                            onChange={(value) => setTip(value || 0)}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                                            style={{ width: 150 }}
                                        />
                                    </div>
                                </Space>

                                <Divider />

                                <Statistic
                                    title="Tổng cộng"
                                    value={calculateTotal()}
                                    valueStyle={{ color: '#3f8600', fontSize: 24 }}
                                    prefix={<DollarOutlined />}
                                    formatter={(value) => formatCurrency(Number(value))}
                                />

                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    style={{ marginTop: 16 }}
                                    onClick={handlePayment}
                                    disabled={cart.length === 0}
                                >
                                    Thanh toán
                                </Button>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Modal
                title="Xác nhận thanh toán"
                visible={paymentModalVisible}
                onOk={handleConfirmPayment}
                onCancel={() => setPaymentModalVisible(false)}
                width={500}
            >
                <Form form={form} layout="vertical">
                    <Statistic
                        title="Tổng tiền thanh toán"
                        value={calculateTotal()}
                        valueStyle={{ color: '#3f8600', fontSize: 28 }}
                        formatter={(value) => formatCurrency(Number(value))}
                        style={{ marginBottom: 24 }}
                    />

                    <Form.Item
                        name="payment_methods"
                        label="Phương thức thanh toán"
                        rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}
                    >
                        <Checkbox.Group>
                            <Space direction="vertical">
                                <Checkbox value="tien_mat">Tiền mặt</Checkbox>
                                <Checkbox value="chuyen_khoan">Chuyển khoản</Checkbox>
                                <Checkbox value="the">Thẻ</Checkbox>
                            </Space>
                        </Checkbox.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SpaPOSScreen;
