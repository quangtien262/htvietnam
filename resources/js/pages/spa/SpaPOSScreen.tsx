import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, InputNumber, Select, Space, Divider, Statistic, message, Modal, Form, Input, Tabs, Badge, Tag, Empty, Checkbox, Tooltip, DatePicker, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined, DollarOutlined, UserOutlined, SearchOutlined, FilterOutlined, CloseOutlined, ExclamationCircleOutlined, UserAddOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API } from '../../common/api';
import ShiftWidget from '../../components/spa/ShiftWidget';
import { filterSelectOption } from '../../utils/stringUtils';
import { safeSetItem, logStorageInfo, getLocalStorageSizeFormatted } from '../../utils/storageUtils';

const { Search } = Input;
const { TabPane } = Tabs;

interface CartItem {
    key: string;
    type: 'service' | 'product' | 'package' | 'gift_card';
    id: number;
    name: string;
    price: number;
    quantity: number;
    ktv_id?: number;
    ktv_name?: string;
}

interface Order {
    id: string;
    label: string;
    cart: CartItem[];
    customer: any | null;
    discount: number;
    pointsUsed: number;
    tip: number;
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
    console.log('=== SpaPOSScreen Component Rendered ===');

    // Load orders from localStorage
    const loadOrdersFromStorage = (): Order[] => {
        try {
            const saved = localStorage.getItem('pos_orders');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validate structure
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error('Error loading orders from localStorage:', error);
        }
        // Default order
        return [{
            id: '1',
            label: 'Đơn hàng 1',
            cart: [],
            customer: null,
            discount: 0,
            pointsUsed: 0,
            tip: 0,
        }];
    };

    const loadActiveOrderIdFromStorage = (): string => {
        try {
            const saved = localStorage.getItem('pos_active_order_id');
            if (saved) {
                return saved;
            }
        } catch (error) {
            console.error('Error loading active order ID:', error);
        }
        return '1';
    };

    // Multiple orders state
    const [orders, setOrders] = useState<Order[]>(loadOrdersFromStorage());
    const [activeOrderId, setActiveOrderId] = useState<string>(loadActiveOrderIdFromStorage());

    // Get current active order
    const currentOrder = orders.find(o => o.id === activeOrderId) || orders[0];

    // Legacy states (will use from currentOrder)
    const cart = currentOrder.cart;
    const setCart = (newCart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
        setOrders(prev => prev.map(order => {
            if (order.id === activeOrderId) {
                return {
                    ...order,
                    cart: typeof newCart === 'function' ? newCart(order.cart) : newCart
                };
            }
            return order;
        }));
    };

    const selectedCustomer = currentOrder.customer;
    const setSelectedCustomer = (customer: any) => {
        setOrders(prev => prev.map(order =>
            order.id === activeOrderId ? { ...order, customer } : order
        ));
    };

    const discount = currentOrder.discount;
    const setDiscount = (value: number) => {
        setOrders(prev => prev.map(order =>
            order.id === activeOrderId ? { ...order, discount: value } : order
        ));
    };

    const pointsUsed = currentOrder.pointsUsed;
    const setPointsUsed = (value: number) => {
        setOrders(prev => prev.map(order =>
            order.id === activeOrderId ? { ...order, pointsUsed: value } : order
        ));
    };

    const tip = currentOrder.tip;
    const setTip = (value: number) => {
        setOrders(prev => prev.map(order =>
            order.id === activeOrderId ? { ...order, tip: value } : order
        ));
    };

    const [loading, setLoading] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Payment method amounts
    const [walletAmount, setWalletAmount] = useState(0);
    const [cashAmount, setCashAmount] = useState(0);
    const [transferAmount, setTransferAmount] = useState(0);
    const [cardAmount, setCardAmount] = useState(0);

    // Payment method selection
    const [useWallet, setUseWallet] = useState(false);
    const [useCash, setUseCash] = useState(false);
    const [useTransfer, setUseTransfer] = useState(false);
    const [useCard, setUseCard] = useState(false);

    // Debt (công nợ) state
    const [showDebtForm, setShowDebtForm] = useState(false);
    const [debtAmount, setDebtAmount] = useState(0);
    const [debtDueDate, setDebtDueDate] = useState<any>(null);

    // New states for product/service listing
    const [services, setServices] = useState<ServiceProduct[]>([]);
    const [products, setProducts] = useState<ServiceProduct[]>([]);
    const [servicePackages, setServicePackages] = useState<any[]>([]);
    const [filteredServices, setFilteredServices] = useState<ServiceProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ServiceProduct[]>([]);
    const [filteredServicePackages, setFilteredServicePackages] = useState<any[]>([]);
    const [serviceSearch, setServiceSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [packageSearch, setPackageSearch] = useState('');
    const [serviceCategory, setServiceCategory] = useState<number | null>(null);
    const [productCategory, setProductCategory] = useState<number | null>(null);
    const [serviceCategories, setServiceCategories] = useState<any[]>([]);
    const [productCategories, setProductCategories] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // Customer states
    const [customers, setCustomers] = useState<any[]>([]);
    const [customerSearch, setCustomerSearch] = useState('');

    // Staff and Branch states
    const [staff, setStaff] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

    // Shift state
    const [currentShift, setCurrentShift] = useState<any>(null);
    const [shiftRefreshTrigger, setShiftRefreshTrigger] = useState(0);

    // Gift Card states
    const [giftCards, setGiftCards] = useState<any[]>([]);
    const [filteredGiftCards, setFilteredGiftCards] = useState<any[]>([]);
    const [giftCardSearch, setGiftCardSearch] = useState('');

    // Wallet states
    const [customerWallet, setCustomerWallet] = useState<any>(null);
    const [loadingWallet, setLoadingWallet] = useState(false);

    // Promo code modal
    const [promoCodeModalVisible, setPromoCodeModalVisible] = useState(false);
    const [promoCodeForm] = Form.useForm();

    // Customer modal states
    const [addCustomerModalVisible, setAddCustomerModalVisible] = useState(false);
    const [viewCustomerModalVisible, setViewCustomerModalVisible] = useState(false);
    const [customerForm] = Form.useForm();
    const [viewingCustomer, setViewingCustomer] = useState<any>(null);

    // Fetch services and products on mount
    useEffect(() => {
        console.log('=== POS useEffect: Component Mounted ===');
        fetchServices();
        fetchProducts();
        fetchServicePackages();
        fetchCategories();
        fetchCustomers();
        fetchStaff();
        fetchBranches();
        fetchGiftCards();
        loadCurrentShift();

        // Log storage info in development
        if (process.env.NODE_ENV === 'development') {
            logStorageInfo();
        }
    }, []);

    // Load wallet when customer changes
    useEffect(() => {
        if (selectedCustomer?.id) {
            fetchCustomerWallet(selectedCustomer.id);
        } else {
            setCustomerWallet(null);
        }
    }, [selectedCustomer]);

    // Save orders to localStorage whenever they change
    useEffect(() => {
        try {
            const success = safeSetItem('pos_orders', JSON.stringify(orders));
            if (!success) {
                message.warning('Không thể lưu đơn hàng. Bộ nhớ đầy (' + getLocalStorageSizeFormatted() + ')');
            }
        } catch (error) {
            console.error('Error saving orders to localStorage:', error);
        }
    }, [orders]);

    // Save active order ID to localStorage
    useEffect(() => {
        try {
            safeSetItem('pos_active_order_id', activeOrderId);
        } catch (error) {
            console.error('Error saving active order ID:', error);
        }
    }, [activeOrderId]);

    // Load current shift
    const loadCurrentShift = async () => {
        try {
            console.log('POS: Loading current shift...');
            const response = await axios.get(API.spaShiftCurrent);
            console.log('POS: Shift response:', response.data);
            if (response.data.success && response.data.data) {
                setCurrentShift(response.data.data);
                console.log('POS: Current shift set:', response.data.data);
                // Auto-select branch from current shift
                if (response.data.data.chi_nhanh_id) {
                    setSelectedBranch(response.data.data.chi_nhanh_id);
                    console.log('POS: Auto-selected branch:', response.data.data.chi_nhanh_id);
                }
            } else {
                setCurrentShift(null);
                console.log('POS: No current shift');
            }
        } catch (error) {
            console.error('POS: Error loading shift:', error);
            setCurrentShift(null);
        }
    };

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

    // Filter service packages when search changes
    useEffect(() => {
        const packageList = Array.isArray(servicePackages) ? servicePackages : [];
        let filtered = packageList;

        if (packageSearch) {
            filtered = filtered.filter(pkg =>
                pkg.ten_goi?.toLowerCase().includes(packageSearch.toLowerCase()) ||
                pkg.ma_goi?.toLowerCase().includes(packageSearch.toLowerCase())
            );
        }

        setFilteredServicePackages(filtered);
    }, [packageSearch, servicePackages]);

    // Filter gift cards when search changes
    useEffect(() => {
        const cardList = Array.isArray(giftCards) ? giftCards : [];
        let filtered = cardList;

        if (giftCardSearch) {
            filtered = filtered.filter(card =>
                card.ten_the?.toLowerCase().includes(giftCardSearch.toLowerCase()) ||
                card.ma_the?.toLowerCase().includes(giftCardSearch.toLowerCase()) ||
                card.ma_code?.toLowerCase().includes(giftCardSearch.toLowerCase())
            );
        }

        setFilteredGiftCards(filtered);
    }, [giftCardSearch, giftCards]);

    // Auto-calculate payment amounts based on checkbox selection
    useEffect(() => {
        const totalAmount = calculateTotal();
        const checkedCount = [useWallet, useCash, useTransfer, useCard].filter(Boolean).length;

        if (checkedCount === 0) {
            // No checkbox selected - reset all
            setWalletAmount(0);
            setCashAmount(0);
            setTransferAmount(0);
            setCardAmount(0);
        } else if (checkedCount === 1) {
            // Only 1 checkbox - auto-fill with full amount
            if (useWallet) {
                const maxWallet = Math.min(totalAmount, customerWallet?.so_du || 0);
                setWalletAmount(maxWallet);
            } else {
                setWalletAmount(0);
            }

            if (useCash) {
                setCashAmount(totalAmount - walletAmount);
            } else {
                setCashAmount(0);
            }

            if (useTransfer) {
                setTransferAmount(totalAmount - walletAmount);
            } else {
                setTransferAmount(0);
            }

            if (useCard) {
                setCardAmount(totalAmount - walletAmount);
            } else {
                setCardAmount(0);
            }
        } else {
            // Multiple checkboxes - set to 0 for manual input
            if (!useWallet) setWalletAmount(0);
            if (!useCash) setCashAmount(0);
            if (!useTransfer) setTransferAmount(0);
            if (!useCard) setCardAmount(0);
        }
    }, [useWallet, useCash, useTransfer, useCard]);

    // Check if payment is insufficient (công nợ)
    useEffect(() => {
        const totalAmount = calculateTotal();
        const totalPaid = walletAmount + cashAmount + transferAmount + cardAmount;
        const remaining = totalAmount - totalPaid;

        if (remaining > 0 && (useWallet || useCash || useTransfer || useCard)) {
            setShowDebtForm(true);
            setDebtAmount(remaining);
        } else {
            setShowDebtForm(false);
            setDebtAmount(0);
        }
    }, [walletAmount, cashAmount, transferAmount, cardAmount]);

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

    const fetchServicePackages = async () => {
        setLoadingData(true);
        try {
            const response = await axios.get(API.spaServicePackageList, {
                params: { per_page: 1000 }
            });

            const packageData = response.data.data?.data || response.data.data || [];
            setServicePackages(Array.isArray(packageData) ? packageData : []);
            setFilteredServicePackages(Array.isArray(packageData) ? packageData : []);
        } catch (error) {
            console.error('Error fetching service packages:', error);
            message.error('Không thể tải danh sách gói dịch vụ');
            setServicePackages([]);
            setFilteredServicePackages([]);
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

    const fetchStaff = async () => {
        try {
            const response = await axios.post(API.userSelect);
            if (response.data.status_code === 200) {
                const data = response.data.data || [];
                setStaff(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            message.error('Lỗi khi tải danh sách nhân viên');
            setStaff([]);
        }
    };

    const fetchBranches = async () => {
        try {
            console.log('POS: Fetching branches...');
            const response = await axios.get(API.spaBranchList);
            console.log('POS: Branches response:', response.data);
            if (response.data.success) {
                const data = response.data.data;
                const branchList = Array.isArray(data) ? data : (data.data || []);
                console.log('POS: Branch list extracted:', branchList);
                setBranches(branchList);
                // Set default branch if available
                if (branchList.length > 0 && !selectedBranch) {
                    setSelectedBranch(branchList[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            message.error('Lỗi khi tải danh sách chi nhánh');
            setBranches([]);
        }
    };

    const fetchGiftCards = async () => {
        setLoadingData(true);
        try {
            const response = await axios.get('/aio/api/spa/gift-cards', {
                params: { available: true }
            });
            setGiftCards(response.data || []);
            setFilteredGiftCards(response.data || []);
        } catch (error) {
            console.error('Error fetching gift cards:', error);
            message.error('Không thể tải danh sách thẻ giá trị');
            setGiftCards([]);
            setFilteredGiftCards([]);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchCustomerWallet = async (customerId: number) => {
        if (!customerId) {
            setCustomerWallet(null);
            return;
        }

        setLoadingWallet(true);
        try {
            const response = await axios.get(`/aio/api/spa/wallet/${customerId}`);
            if (response.data.success) {
                setCustomerWallet(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching wallet:', error);
            setCustomerWallet(null);
        } finally {
            setLoadingWallet(false);
        }
    };

    // Order management functions
    const addNewOrder = () => {
        const newOrderNumber = orders.length + 1;
        const newOrder: Order = {
            id: Date.now().toString(),
            label: `Đơn hàng ${newOrderNumber}`,
            cart: [],
            customer: null,
            discount: 0,
            pointsUsed: 0,
            tip: 0,
        };
        setOrders([...orders, newOrder]);
        setActiveOrderId(newOrder.id);
        message.success(`Đã tạo ${newOrder.label}`);
    };

    const removeOrder = (orderId: string) => {
        if (orders.length === 1) {
            message.warning('Phải có ít nhất 1 đơn hàng');
            return;
        }

        const orderToRemove = orders.find(o => o.id === orderId);
        if (orderToRemove && orderToRemove.cart.length > 0) {
            Modal.confirm({
                title: 'Xác nhận xóa đơn hàng',
                content: `${orderToRemove.label} có ${orderToRemove.cart.length} sản phẩm. Bạn có chắc muốn xóa?`,
                okText: 'Xóa',
                okType: 'danger',
                cancelText: 'Hủy',
                onOk: () => {
                    const newOrders = orders.filter(o => o.id !== orderId);
                    setOrders(newOrders);
                    if (activeOrderId === orderId) {
                        setActiveOrderId(newOrders[0].id);
                    }
                    message.success('Đã xóa đơn hàng');
                }
            });
        } else {
            const newOrders = orders.filter(o => o.id !== orderId);
            setOrders(newOrders);
            if (activeOrderId === orderId) {
                setActiveOrderId(newOrders[0].id);
            }
            message.success('Đã xóa đơn hàng');
        }
    };

    const clearCurrentOrder = () => {
        setOrders(prev => prev.map(order =>
            order.id === activeOrderId
                ? { ...order, cart: [], customer: null, discount: 0, pointsUsed: 0, tip: 0 }
                : order
        ));
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

    const addGiftCardToCart = (giftCard: any) => {
        const newItem: CartItem = {
            key: `gift_card-${giftCard.id}-${Date.now()}`,
            type: 'gift_card' as any,
            id: giftCard.id,
            name: giftCard.ten_the,
            price: giftCard.gia_ban,
            quantity: 1,
        };
        setCart([...cart, newItem]);

        // Show promotion info if exists
        if (giftCard.ti_le_thuong > 0) {
            const bonusAmount = giftCard.menh_gia * (giftCard.ti_le_thuong / 100);
            const totalDeposit = giftCard.menh_gia + bonusAmount;
            message.success(
                `Đã thêm ${giftCard.ten_the}! Khách sẽ nhận ${formatCurrency(totalDeposit)} vào ví (+${giftCard.ti_le_thuong}% khuyến mãi)`,
                5
            );
        } else {
            message.success(`Đã thêm ${giftCard.ten_the} vào giỏ hàng`);
        }
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

        // Check if shift is open
        if (!currentShift) {
            Modal.confirm({
                title: 'Chưa mở ca làm việc',
                content: 'Bạn cần mở ca làm việc trước khi thanh toán. Vui lòng mở ca mới.',
                okText: 'Đã hiểu',
                cancelButtonProps: { style: { display: 'none' } },
            });
            return;
        }

        // Reset payment states
        setUseWallet(false);
        setUseCash(false);
        setUseTransfer(false);
        setUseCard(false);
        setWalletAmount(0);
        setCashAmount(0);
        setTransferAmount(0);
        setCardAmount(0);
        setShowDebtForm(false);
        setDebtAmount(0);
        setDebtDueDate(null);

        setPaymentModalVisible(true);
    };

    // Handle promo code apply
    const handleApplyPromoCode = async () => {
        if (!selectedCustomer) {
            message.error('Vui lòng chọn khách hàng trước');
            return;
        }

        try {
            const values = await promoCodeForm.validateFields();
            const response = await axios.post('/aio/api/spa/wallet/apply-code', {
                khach_hang_id: selectedCustomer.value,
                ma_code: values.promo_code.toUpperCase(),
            });

            if (response.data.success) {
                message.success(response.data.message);
                promoCodeForm.resetFields();
                setPromoCodeModalVisible(false);
                // Refresh wallet
                await fetchCustomerWallet(selectedCustomer.value);
            } else {
                message.error(response.data.message);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Mã code không hợp lệ');
        }
    };

    // Handle add new customer
    const handleAddCustomer = async () => {
        try {
            const values = await customerForm.validateFields();
            setLoading(true);

            const response = await axios.post('/aio/api/customer/add', {
                name: values.name,
                email: values.email,
                phone: values.phone,
                address: values.address,
                ngay_sinh: values.ngay_sinh?.format('YYYY-MM-DD'),
            });

            if (response.data.status_code === 200 || response.data.success) {
                message.success('Thêm khách hàng thành công');
                customerForm.resetFields();
                setAddCustomerModalVisible(false);
                // Refresh customer list
                await fetchCustomers();
                // Auto select new customer
                const newCustomer = response.data.data;
                if (newCustomer) {
                    setSelectedCustomer({
                        value: newCustomer.id,
                        label: newCustomer.name || newCustomer.ho_ten,
                        code: newCustomer.code || newCustomer.ma_khach_hang,
                        phone: newCustomer.phone || newCustomer.sdt,
                        points: newCustomer.points || 0
                    });
                }
            } else {
                message.error(response.data.message || 'Không thể thêm khách hàng');
            }
        } catch (error: any) {
            console.error('Error adding customer:', error);
            message.error(error.response?.data?.message || 'Lỗi khi thêm khách hàng');
        } finally {
            setLoading(false);
        }
    };

    // Handle view customer info
    const handleViewCustomer = async () => {
        if (!selectedCustomer) {
            message.warning('Vui lòng chọn khách hàng');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`/aio/api/user/${selectedCustomer.value}`);
            if (response.data.status_code === 200 || response.data.success) {
                const customerData = response.data.data;
                setViewingCustomer(customerData);
                setViewCustomerModalVisible(true);
            } else {
                message.error('Không thể tải thông tin khách hàng');
            }
        } catch (error: any) {
            console.error('Error fetching customer info:', error);
            message.error('Lỗi khi tải thông tin khách hàng');
        } finally {
            setLoading(false);
        }
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
        const success = safeSetItem('heldInvoices', JSON.stringify(heldInvoices));
        if (!success) {
            message.warning('Không thể hold hóa đơn. Bộ nhớ đầy.');
            return;
        }

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
                                safeSetItem('heldInvoices', JSON.stringify(heldInvoices));

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
                clearCurrentOrder();
                message.success('Đã hủy hóa đơn');
            },
        });
    };

    const handleConfirmPayment = async () => {
        try {
            // Validate total payment
            const totalAmount = calculateTotal();
            const totalPaid = walletAmount + cashAmount + transferAmount + cardAmount;
            const remaining = totalAmount - totalPaid;

            // If payment is less than total, confirm debt
            if (remaining > 0.01) {
                if (!selectedCustomer) {
                    message.error('Cần chọn khách hàng để ghi công nợ');
                    return;
                }

                if (!debtDueDate) {
                    message.error('Vui lòng chọn thời hạn thanh toán công nợ');
                    return;
                }

                const confirmed = await new Promise<boolean>((resolve) => {
                    Modal.confirm({
                        title: 'Xác nhận thanh toán và lưu công nợ',
                        content: (
                            <div>
                                <p>Tổng hóa đơn: <strong>{formatCurrency(totalAmount)}</strong></p>
                                <p>Đã thanh toán: <strong>{formatCurrency(totalPaid)}</strong></p>
                                <p style={{ color: '#ff4d4f' }}>Công nợ: <strong>{formatCurrency(remaining)}</strong></p>
                                <p>Hạn thanh toán: <strong>{debtDueDate?.format('DD/MM/YYYY')}</strong></p>
                            </div>
                        ),
                        okText: 'Xác nhận',
                        cancelText: 'Hủy',
                        onOk: () => resolve(true),
                        onCancel: () => resolve(false),
                    });
                });

                if (!confirmed) {
                    return;
                }
            } else if (Math.abs(remaining) > 0.01) {
                message.error(`Tổng thanh toán (${formatCurrency(totalPaid)}) vượt quá tổng tiền (${formatCurrency(totalAmount)})`);
                return;
            }

            // Validate wallet amount
            if (walletAmount > 0) {
                if (!selectedCustomer) {
                    message.error('Cần chọn khách hàng để thanh toán bằng ví');
                    return;
                }
                if (walletAmount > (customerWallet?.so_du || 0)) {
                    message.error('Số dư ví không đủ');
                    return;
                }
            }

            // Validate shift and get branch/staff from current shift
            if (!currentShift) {
                message.error('Chưa mở ca làm việc');
                return;
            }

            setLoading(true);

            // Separate gift cards from regular items
            const giftCardItems = cart.filter(item => item.type === 'gift_card');
            const regularItems = cart.filter(item => item.type !== 'gift_card');

            const invoiceData = {
                khach_hang_id: selectedCustomer?.value,
                chi_nhanh_id: currentShift.chi_nhanh_id,
                nguoi_thu_id: currentShift.nguoi_thu_id,
                chi_tiets: regularItems.map(item => ({
                    dich_vu_id: item.type === 'service' ? item.id : null,
                    san_pham_id: item.type === 'product' ? item.id : null,
                    ktv_id: item.ktv_id,
                    so_luong: item.quantity,
                    don_gia: item.price,
                })),
                thanh_toan: remaining < 0.01, // Đã thanh toán đủ
                thanh_toan_vi: walletAmount,
                thanh_toan_tien_mat: cashAmount,
                thanh_toan_chuyen_khoan: transferAmount,
                thanh_toan_the: cardAmount,
                giam_gia: discount,
                diem_su_dung: pointsUsed,
                tien_tip: tip,
                nguoi_ban: 'Admin',
                // Debt info
                cong_no: remaining > 0.01 ? remaining : 0,
                ngay_han_thanh_toan: remaining > 0.01 ? debtDueDate?.format('YYYY-MM-DD') : null,
            };

            // Create invoice
            const response = await axios.post(API.spaPOSCreateInvoice, invoiceData);

            if (response.data.success) {
                const hoaDonId = response.data.data.id;

                // Process wallet payment if any
                if (walletAmount > 0 && selectedCustomer) {
                    await axios.post('/aio/api/spa/wallet/withdraw', {
                        khach_hang_id: selectedCustomer.value,
                        so_tien: walletAmount,
                        hoa_don_id: hoaDonId,
                        ghi_chu: `Thanh toán hóa đơn #${hoaDonId}`,
                    });
                }

                // Process gift card deposits
                for (const giftCardItem of giftCardItems) {
                    if (selectedCustomer) {
                        for (let i = 0; i < giftCardItem.quantity; i++) {
                            await axios.post('/aio/api/spa/wallet/deposit', {
                                khach_hang_id: selectedCustomer.value,
                                the_gia_tri_id: giftCardItem.id,
                                ghi_chu: `Mua thẻ giá trị từ hóa đơn #${hoaDonId}`,
                            });
                        }
                    }
                }

                message.success(remaining > 0.01 ? 'Thanh toán thành công! Đã lưu công nợ.' : 'Thanh toán thành công!');
                setPaymentModalVisible(false);
                form.resetFields();
                setWalletAmount(0);
                setCashAmount(0);
                setTransferAmount(0);
                setCardAmount(0);
                setUseWallet(false);
                setUseCash(false);
                setUseTransfer(false);
                setUseCard(false);
                setShowDebtForm(false);
                setDebtAmount(0);
                setDebtDueDate(null);

                // Reload shift and wallet
                loadCurrentShift();
                setShiftRefreshTrigger(prev => prev + 1);
                if (selectedCustomer) {
                    await fetchCustomerWallet(selectedCustomer.value);
                }

                // Close tab after payment (except if it's the last one)
                if (orders.length > 1) {
                    const newOrders = orders.filter(o => o.id !== activeOrderId);
                    setOrders(newOrders);
                    const currentIndex = orders.findIndex(o => o.id === activeOrderId);
                    const nextOrder = orders[currentIndex + 1] || orders[currentIndex - 1] || newOrders[0];
                    setActiveOrderId(nextOrder.id);
                    message.info(`Đã đóng ${currentOrder.label}`);
                } else {
                    clearCurrentOrder();
                }
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            message.error(error.response?.data?.message || 'Lỗi khi thanh toán');
        } finally {
            setLoading(false);
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

                        <TabPane tab={<span><Badge count={filteredServicePackages.length} showZero>Gói dịch vụ</Badge></span>} key="packages">
                            <Card
                                size="small"
                                title={
                                    <Search
                                        placeholder="Tìm kiếm gói dịch vụ theo tên hoặc mã..."
                                        allowClear
                                        style={{ width: '100%' }}
                                        value={packageSearch}
                                        onChange={(e) => setPackageSearch(e.target.value)}
                                        prefix={<SearchOutlined />}
                                    />
                                }
                            >
                                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    {loadingData ? (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>
                                    ) : filteredServicePackages.length === 0 ? (
                                        <Empty description="Không tìm thấy gói dịch vụ" />
                                    ) : (
                                        <Row gutter={[8, 8]}>
                                            {filteredServicePackages.map(pkg => (
                                                <Col span={8} key={pkg.id}>
                                                    <Card
                                                        hoverable
                                                        size="small"
                                                        onClick={() => addToCart({
                                                            id: pkg.id,
                                                            ten_dich_vu: pkg.ten_goi,
                                                            ma_dich_vu: pkg.ma_goi,
                                                            gia_ban: pkg.gia_ban,
                                                            gia_thanh_vien: pkg.gia_thanh_vien
                                                        }, 'package' as any)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <Card.Meta
                                                            title={
                                                                <div style={{ fontSize: '13px' }}>
                                                                    {pkg.ten_goi}
                                                                    <Tag color="purple" style={{ marginLeft: 8, fontSize: '11px' }}>
                                                                        Gói DV
                                                                    </Tag>
                                                                </div>
                                                            }
                                                            description={
                                                                <div>
                                                                    <div style={{ fontSize: '12px', color: '#888' }}>
                                                                        {pkg.ma_goi}
                                                                    </div>
                                                                    <div style={{ fontWeight: 'bold', color: '#1890ff', marginTop: 4 }}>
                                                                        {new Intl.NumberFormat('vi-VN').format(pkg.gia_ban)} đ
                                                                    </div>
                                                                    {pkg.gia_thanh_vien && (
                                                                        <div style={{ fontSize: '12px', color: '#52c41a' }}>
                                                                            TV: {new Intl.NumberFormat('vi-VN').format(pkg.gia_thanh_vien)} đ
                                                                        </div>
                                                                    )}
                                                                    {pkg.so_buoi > 0 && (
                                                                        <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                                                                            {pkg.so_buoi} buổi
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

                        <TabPane tab={<span><Badge count={filteredGiftCards.length} showZero style={{ backgroundColor: '#faad14' }}>Thẻ Giá Trị</Badge></span>} key="gift_cards">
                            <Card
                                size="small"
                                title={
                                    <Search
                                        placeholder="Tìm kiếm thẻ giá trị..."
                                        allowClear
                                        style={{ width: '100%' }}
                                        value={giftCardSearch}
                                        onChange={(e) => setGiftCardSearch(e.target.value)}
                                        prefix={<SearchOutlined />}
                                    />
                                }
                            >
                                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    {loadingData ? (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>
                                    ) : filteredGiftCards.length === 0 ? (
                                        <Empty description="Không tìm thấy thẻ giá trị" />
                                    ) : (
                                        <Row gutter={[8, 8]}>
                                            {filteredGiftCards.map(card => {
                                                const bonusAmount = card.menh_gia * (card.ti_le_thuong / 100);
                                                const totalDeposit = card.menh_gia + bonusAmount;

                                                return (
                                                    <Col span={8} key={card.id}>
                                                        <Card
                                                            hoverable
                                                            size="small"
                                                            onClick={() => addGiftCardToCart(card)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                borderColor: card.ti_le_thuong > 0 ? '#faad14' : undefined
                                                            }}
                                                        >
                                                            <Card.Meta
                                                                title={
                                                                    <div style={{ fontSize: '13px' }}>
                                                                        {card.ten_the}
                                                                        <Tag color="gold" style={{ marginLeft: 8, fontSize: '11px' }}>
                                                                            {card.ma_the}
                                                                        </Tag>
                                                                    </div>
                                                                }
                                                                description={
                                                                    <div>
                                                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>
                                                                            Giá: {formatCurrency(card.gia_ban)}
                                                                        </div>
                                                                        {card.ti_le_thuong > 0 && (
                                                                            <div style={{ fontSize: '12px', color: '#52c41a', marginTop: 4 }}>
                                                                                <Tag color="green" style={{ fontSize: '11px' }}>
                                                                                    +{card.ti_le_thuong}% KM
                                                                                </Tag>
                                                                                Nạp: {formatCurrency(totalDeposit)}
                                                                            </div>
                                                                        )}
                                                                        {!card.ti_le_thuong && (
                                                                            <div style={{ fontSize: '12px', color: '#888', marginTop: 4 }}>
                                                                                Nạp: {formatCurrency(card.menh_gia)}
                                                                            </div>
                                                                        )}
                                                                        {card.ma_code && (
                                                                            <div style={{ fontSize: '11px', color: '#666', marginTop: 4 }}>
                                                                                Code: {card.ma_code}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                }
                                                            />
                                                        </Card>
                                                    </Col>
                                                );
                                            })}
                                        </Row>
                                    )}
                                </div>
                            </Card>
                        </TabPane>
                    </Tabs>
                </Col>

                {/* Cart & Payment */}
                <Col span={12}>
                    {/* Shift Widget */}
                    <ShiftWidget
                        key={shiftRefreshTrigger}
                        chiNhanhId={selectedBranch || undefined}
                        staff={staff}
                        branches={branches}
                        onShiftChange={() => {
                            loadCurrentShift();
                            message.info('Ca làm việc đã thay đổi');
                        }}
                    />

                    {/* Multiple Orders Tabs */}
                    <Card
                        title={
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <span>Đơn hàng</span>
                                <Tooltip title="Thêm đơn hàng mới">
                                    <Button
                                        type="dashed"
                                        size="small"
                                        icon={<PlusOutlined />}
                                        onClick={addNewOrder}
                                    >
                                        Thêm đơn
                                    </Button>
                                </Tooltip>
                            </Space>
                        }
                        style={{ marginBottom: 16 }}
                    >
                        <Tabs
                            type="editable-card"
                            activeKey={activeOrderId}
                            onChange={setActiveOrderId}
                            onEdit={(targetKey, action) => {
                                if (action === 'remove') {
                                    removeOrder(targetKey as string);
                                }
                            }}
                            hideAdd
                            items={orders.map(order => ({
                                key: order.id,
                                label: (
                                    <Space size={4}>
                                        <span>{order.label}</span>
                                        {order.cart.length > 0 && (
                                            <Badge count={order.cart.length} />
                                        )}
                                    </Space>
                                ),
                                children: (
                                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                        <Space.Compact style={{ width: '100%' }}>
                                            <Select
                                                placeholder="Chọn khách hàng"
                                                style={{ flex: 1 }}
                                                value={order.customer?.value}
                                                onChange={(value: any) => {
                                                    const user = customers.find(u => u.value === value);
                                                    setSelectedCustomer(user || null);
                                                }}
                                                showSearch
                                                allowClear
                                                filterOption={filterSelectOption}
                                            >
                                                {customers.map(user => (
                                                    <Select.Option key={user.value} value={user.value}>
                                                        {user.code} - {user.label} {user.phone ? `- ${user.phone}` : ''}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                            <Tooltip title="Thêm khách hàng mới">
                                                <Button
                                                    type="primary"
                                                    icon={<UserAddOutlined />}
                                                    onClick={() => setAddCustomerModalVisible(true)}
                                                />
                                            </Tooltip>
                                            <Tooltip title="Xem thông tin khách hàng">
                                                <Button
                                                    type="default"
                                                    icon={<InfoCircleOutlined />}
                                                    onClick={handleViewCustomer}
                                                    disabled={!order.customer}
                                                />
                                            </Tooltip>
                                        </Space.Compact>

                                        {order.customer && (
                                            <Card size="small" style={{ background: '#f0f5ff', borderColor: '#1890ff' }}>
                                                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '13px' }}>
                                                            <DollarOutlined style={{ marginRight: 4 }} />
                                                            Số dư ví:
                                                        </span>
                                                        {loadingWallet ? (
                                                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>
                                                                Đang tải...
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                                                                {formatCurrency(customerWallet?.so_du || 0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {customerWallet && (
                                                        <div style={{ fontSize: '11px', color: '#666' }}>
                                                            <div>Tổng nạp: {formatCurrency(customerWallet.tong_nap || 0)}</div>
                                                            <div>Đã tiêu: {formatCurrency(customerWallet.tong_tieu || 0)}</div>
                                                        </div>
                                                    )}
                                                    <Button
                                                        type="link"
                                                        size="small"
                                                        style={{ padding: 0, height: 'auto' }}
                                                        onClick={() => setPromoCodeModalVisible(true)}
                                                    >
                                                        Nhập mã thẻ tặng
                                                    </Button>
                                                </Space>
                                            </Card>
                                        )}

                                        <Table
                                            dataSource={order.cart}
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
                                                        value={order.discount}
                                                        onChange={(value) => setDiscount(value || 0)}
                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                                                        style={{ width: 150 }}
                                                    />
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>Dùng điểm ({order.customer?.points ?? 0}):</span>
                                                    <InputNumber
                                                        value={order.pointsUsed}
                                                        onChange={(value) => setPointsUsed(value || 0)}
                                                        max={order.customer?.points ?? 0}
                                                        disabled={!order.customer || (order.customer?.points ?? 0) === 0}
                                                        style={{ width: 150 }}
                                                    />
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>Tiền tip:</span>
                                                    <InputNumber
                                                        value={order.tip}
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
                                                disabled={order.cart.length === 0}
                                            >
                                                Thanh toán
                                            </Button>
                                        </div>
                                    </Space>
                                ),
                            }))}
                        />
                    </Card>
                </Col>
            </Row>

            <Modal
                title="Xác nhận thanh toán"
                visible={paymentModalVisible}
                onOk={handleConfirmPayment}
                onCancel={() => {
                    setPaymentModalVisible(false);
                    setWalletAmount(0);
                    setCashAmount(0);
                    setTransferAmount(0);
                    setCardAmount(0);
                    setUseWallet(false);
                    setUseCash(false);
                    setUseTransfer(false);
                    setUseCard(false);
                    setShowDebtForm(false);
                    setDebtAmount(0);
                    setDebtDueDate(null);
                }}
                width={700}
                okText="Xác nhận thanh toán"
                cancelText="Hủy"
                confirmLoading={loading}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Statistic
                        title="Tổng tiền thanh toán"
                        value={calculateTotal()}
                        valueStyle={{ color: '#3f8600', fontSize: 28 }}
                        formatter={(value) => formatCurrency(Number(value))}
                    />

                    <Divider>Chọn hình thức thanh toán</Divider>

                    {/* Wallet Payment */}
                    {selectedCustomer && customerWallet && (
                        <Card size="small" style={{ background: '#f0f5ff' }}>
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <Checkbox
                                    checked={useWallet}
                                    onChange={(e) => setUseWallet(e.target.checked)}
                                >
                                    <span>
                                        <DollarOutlined style={{ marginRight: 4 }} />
                                        Thanh toán từ ví
                                    </span>
                                    <span style={{ fontSize: '13px', color: '#888', marginLeft: 8 }}>
                                        (Số dư: {formatCurrency(customerWallet.so_du)})
                                    </span>
                                </Checkbox>
                                {useWallet && (
                                    <>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            value={walletAmount}
                                            onChange={(value) => setWalletAmount(value || 0)}
                                            max={Math.min(calculateTotal(), customerWallet.so_du)}
                                            min={0}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                                            addonBefore="₫"
                                        />
                                        <Button
                                            size="small"
                                            type="link"
                                            onClick={() => setWalletAmount(Math.min(calculateTotal(), customerWallet.so_du))}
                                            style={{ padding: 0 }}
                                        >
                                            Dùng hết ví
                                        </Button>
                                    </>
                                )}
                            </Space>
                        </Card>
                    )}

                    {/* Cash Payment */}
                    <div>
                        <Checkbox
                            checked={useCash}
                            onChange={(e) => setUseCash(e.target.checked)}
                            style={{ marginBottom: 8 }}
                        >
                            Tiền mặt
                        </Checkbox>
                        {useCash && (
                            <InputNumber
                                style={{ width: '100%' }}
                                value={cashAmount}
                                onChange={(value) => setCashAmount(value || 0)}
                                min={0}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                                addonBefore="₫"
                            />
                        )}
                    </div>

                    {/* Transfer Payment */}
                    <div>
                        <Checkbox
                            checked={useTransfer}
                            onChange={(e) => setUseTransfer(e.target.checked)}
                            style={{ marginBottom: 8 }}
                        >
                            Chuyển khoản
                        </Checkbox>
                        {useTransfer && (
                            <InputNumber
                                style={{ width: '100%' }}
                                value={transferAmount}
                                onChange={(value) => setTransferAmount(value || 0)}
                                min={0}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                                addonBefore="₫"
                            />
                        )}
                    </div>

                    {/* Card Payment */}
                    <div>
                        <Checkbox
                            checked={useCard}
                            onChange={(e) => setUseCard(e.target.checked)}
                            style={{ marginBottom: 8 }}
                        >
                            Quẹt thẻ
                        </Checkbox>
                        {useCard && (
                            <InputNumber
                                style={{ width: '100%' }}
                                value={cardAmount}
                                onChange={(value) => setCardAmount(value || 0)}
                                min={0}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                                addonBefore="₫"
                            />
                        )}
                    </div>

                    <Divider />

                    {/* Total Paid Summary */}
                    <Card size="small">
                        <Space direction="vertical" style={{ width: '100%' }} size={4}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Tổng đã thanh toán:</span>
                                <strong style={{ fontSize: '16px', color: walletAmount + cashAmount + transferAmount + cardAmount >= calculateTotal() ? '#52c41a' : '#ff4d4f' }}>
                                    {formatCurrency(walletAmount + cashAmount + transferAmount + cardAmount)}
                                </strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#888' }}>
                                <span>Còn thiếu:</span>
                                <span style={{ color: calculateTotal() - (walletAmount + cashAmount + transferAmount + cardAmount) > 0 ? '#ff4d4f' : '#52c41a' }}>
                                    {formatCurrency(Math.max(0, calculateTotal() - (walletAmount + cashAmount + transferAmount + cardAmount)))}
                                </span>
                            </div>
                        </Space>
                    </Card>

                    {/* Debt Form */}
                    {showDebtForm && (
                        <>
                            <Alert
                                message="Thanh toán thiếu - Ghi công nợ"
                                description={
                                    <div>
                                        <p>Số tiền công nợ: <strong style={{ color: '#ff4d4f' }}>{formatCurrency(debtAmount)}</strong></p>
                                        <p style={{ fontSize: '12px', color: '#666', marginBottom: 0 }}>
                                            Hệ thống sẽ tự động lưu công nợ cho khách hàng này
                                        </p>
                                    </div>
                                }
                                type="warning"
                                showIcon
                                icon={<ExclamationCircleOutlined />}
                            />
                            <div>
                                <div style={{ marginBottom: 8 }}>Thời hạn thanh toán công nợ: <span style={{ color: 'red' }}>*</span></div>
                                <DatePicker
                                    style={{ width: '100%' }}
                                    value={debtDueDate}
                                    onChange={(date) => setDebtDueDate(date)}
                                    placeholder="Chọn ngày hạn thanh toán"
                                    format="DD/MM/YYYY"
                                    disabledDate={(current) => current && current.isBefore(new Date(), 'day')}
                                />
                            </div>
                        </>
                    )}
                </Space>
            </Modal>

            {/* Promo Code Modal */}
            <Modal
                title="Nhập mã thẻ tặng"
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
                        Nhập mã thẻ tặng để nạp tiền vào ví khách hàng
                    </div>
                </Form>
            </Modal>

            {/* Add Customer Modal */}
            <Modal
                title={<Space><UserAddOutlined /> Thêm khách hàng mới</Space>}
                visible={addCustomerModalVisible}
                onOk={handleAddCustomer}
                onCancel={() => {
                    setAddCustomerModalVisible(false);
                    customerForm.resetFields();
                }}
                okText="Thêm khách hàng"
                cancelText="Hủy"
                confirmLoading={loading}
                width={600}
            >
                <Form form={customerForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên khách hàng"
                                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                            >
                                <Input placeholder="Nguyễn Văn A" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập SĐT' },
                                    { pattern: /^[0-9]{10,11}$/, message: 'SĐT không hợp lệ' }
                                ]}
                            >
                                <Input placeholder="0987654321" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { type: 'email', message: 'Email không hợp lệ' }
                                ]}
                            >
                                <Input placeholder="email@example.com" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ngay_sinh"
                                label="Ngày sinh"
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder="Chọn ngày sinh"
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                    >
                        <Input.TextArea rows={2} placeholder="Địa chỉ khách hàng" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Customer Info Modal */}
            <Modal
                title={<Space><InfoCircleOutlined /> Thông tin khách hàng</Space>}
                visible={viewCustomerModalVisible}
                onCancel={() => {
                    setViewCustomerModalVisible(false);
                    setViewingCustomer(null);
                }}
                footer={[
                    <Button key="close" onClick={() => setViewCustomerModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={600}
            >
                {viewingCustomer && (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Card size="small" title="Thông tin cơ bản">
                            <Row gutter={[16, 12]}>
                                <Col span={8}><strong>Mã KH:</strong></Col>
                                <Col span={16}>{viewingCustomer.code || viewingCustomer.ma_khach_hang || 'N/A'}</Col>

                                <Col span={8}><strong>Họ tên:</strong></Col>
                                <Col span={16}>{viewingCustomer.name}</Col>

                                <Col span={8}><strong>SĐT:</strong></Col>
                                <Col span={16}>{viewingCustomer.phone || 'N/A'}</Col>

                                <Col span={8}><strong>Email:</strong></Col>
                                <Col span={16}>{viewingCustomer.email || 'N/A'}</Col>

                                <Col span={8}><strong>Ngày sinh:</strong></Col>
                                <Col span={16}>{viewingCustomer.ngay_sinh || 'N/A'}</Col>

                                <Col span={8}><strong>Địa chỉ:</strong></Col>
                                <Col span={16}>{viewingCustomer.address || 'N/A'}</Col>
                            </Row>
                        </Card>

                        <Card size="small" title="Ví & Điểm tích lũy">
                            <Row gutter={[16, 12]}>
                                <Col span={12}>
                                    <Statistic
                                        title="Số dư ví"
                                        value={customerWallet?.so_du || 0}
                                        suffix="₫"
                                        valueStyle={{ color: '#52c41a' }}
                                        formatter={(value) => formatCurrency(Number(value))}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Điểm tích lũy"
                                        value={viewingCustomer.points || 0}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        <div>Tổng nạp: {formatCurrency(customerWallet?.tong_nap || 0)} ₫</div>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        <div>Đã tiêu: {formatCurrency(customerWallet?.tong_tieu || 0)} ₫</div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Space>
                )}
            </Modal>
        </div>
    );
};

export default SpaPOSScreen;
