import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, InputNumber, Select, Space, Divider, Statistic, message, Modal, Form, Input, Tabs, Badge, Tag, Empty, Checkbox, Tooltip, DatePicker, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined, DollarOutlined, UserOutlined, SearchOutlined, FilterOutlined, CloseOutlined, ExclamationCircleOutlined, UserAddOutlined, InfoCircleOutlined, GiftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API } from '../../common/api';
import API_SPA from '../../common/api_spa';
import ShiftWidget from '../../components/spa/ShiftWidget';
import { filterSelectOption } from '../../utils/stringUtils';
import { safeSetItem, logStorageInfo, getLocalStorageSizeFormatted } from '../../utils/storageUtils';

const { Search } = Input;
const { TabPane } = Tabs;

interface StaffCommission {
    staff_id: number;
    staff_name: string;
    commission_value: number; // Giá trị chiết khấu (tiền hoặc %)
    commission_unit: 'percent' | 'cash'; // percent: %, cash: tiền mặt
    commission_type: 'sale' | 'service'; // sale: NV tư vấn, service: NV làm dịch vụ
}

interface CartItem {
    key: string;
    type: 'service' | 'product' | 'package' | 'gift_card';
    id: number;
    name: string;
    price: number;
    quantity: number;
    ktv_id?: number;
    ktv_name?: string;
    su_dung_goi?: number; // ID của customer package nếu dùng từ gói
    customer_package_name?: string; // Tên gói để hiển thị
    sale_commissions?: StaffCommission[]; // Hoa hồng NV tư vấn
    service_commissions?: StaffCommission[]; // Hoa hồng NV làm dịch vụ
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

    // Commission modal states
    const [commissionModalVisible, setCommissionModalVisible] = useState(false);
    const [currentCommissionItem, setCurrentCommissionItem] = useState<CartItem | null>(null);
    const [commissionType, setCommissionType] = useState<'sale' | 'service'>('sale');
    const [tempCommissions, setTempCommissions] = useState<StaffCommission[]>([]);

    // Expanded rows for cart table (mặc định expand tất cả)
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

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

    // Voucher states
    const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
    const [voucherDiscount, setVoucherDiscount] = useState<number>(0);

    // Customer Package states
    const [customerPackages, setCustomerPackages] = useState<any[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(false);

    // Customer modal states
    const [addCustomerModalVisible, setAddCustomerModalVisible] = useState(false);
    const [viewCustomerModalVisible, setViewCustomerModalVisible] = useState(false);
    const [customerForm] = Form.useForm();
    const [viewingCustomer, setViewingCustomer] = useState<any>(null);
    const [selectedPackageForService, setSelectedPackageForService] = useState<any>(null);
    const [packageServiceModalVisible, setPackageServiceModalVisible] = useState(false);

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
        console.log('=== Customer changed, selectedCustomer:', selectedCustomer);
        if (selectedCustomer?.value) {
            console.log('=== Fetching data for customer ID:', selectedCustomer.value);
            fetchCustomerWallet(selectedCustomer.value);
            fetchCustomerPackages(selectedCustomer.value);
        } else {
            console.log('=== No customer selected, clearing data');
            setCustomerWallet(null);
            setCustomerPackages([]);
        }
    }, [selectedCustomer]);

    // Auto expand all cart rows
    useEffect(() => {
        const keys = cart.map(item => item.key);
        setExpandedRowKeys(keys);
    }, [cart]);

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
            const response = await axios.get(API_SPA.spaShiftCurrent);
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
            const response = await axios.get(API_SPA.spaServiceList, {
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
            const response = await axios.get(API_SPA.spaProductList, {
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
            const response = await axios.get(API_SPA.spaServicePackageList, {
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
                axios.get(API_SPA.spaServiceCategoryList),
                axios.get(API_SPA.spaProductCategoryList)
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
            const response = await axios.post(API_SPA.userSelect);
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
            const response = await axios.post(API_SPA.userSelect);
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
            console.log('POS: Fetching branches from:', API_SPA.spaBranchList);
            const response = await axios.get(API_SPA.spaBranchList);
            console.log('POS: Branches raw response:', response);
            console.log('POS: Branches data:', response.data);

            if (response.data.success) {
                const data = response.data.data;
                console.log('POS: Branches success data:', data);
                const branchList = Array.isArray(data) ? data : (data.data || []);
                console.log('POS: Branch list extracted:', branchList);
                setBranches(branchList);
                // Set default branch if available
                if (branchList.length > 0 && !selectedBranch) {
                    console.log('POS: Setting default branch:', branchList[0].id);
                    setSelectedBranch(branchList[0].id);
                }
            } else {
                console.warn('POS: Branches API returned success=false');
                message.warning('Không thể tải danh sách chi nhánh');
                setBranches([]);
            }
        } catch (error: any) {
            console.error('POS: Error fetching branches:', error);
            console.error('POS: Error response:', error.response);
            message.error('Lỗi khi tải danh sách chi nhánh: ' + (error.message || 'Unknown error'));
            setBranches([]);
        }
    };

    const fetchGiftCards = async () => {
        setLoadingData(true);
        try {
            const response = await axios.get(API_SPA.spaGiftCardList, {
                params: { available: true }
            });

            // Handle different response structures
            let data = response.data;
            if (data && data.data) {
                data = data.data;
            }
            const giftCardsArray = Array.isArray(data) ? data : [];

            setGiftCards(giftCardsArray);
            setFilteredGiftCards(giftCardsArray);
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
            const response = await axios.get(API_SPA.spaWalletGet(customerId));
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

    // Fetch customer packages
    const fetchCustomerPackages = async (customerId: number) => {
        console.log('fetchCustomerPackages called with customerId:', customerId);
        if (!customerId) {
            setCustomerPackages([]);
            return;
        }

        setLoadingPackages(true);
        try {
            const response = await axios.post(API_SPA.spaCustomerPackageList, {
                khach_hang_id: customerId
            });
            console.log('Customer packages response:', response.data);
            if (response.data.success) {
                setCustomerPackages(response.data.data || []);
                console.log('Customer packages set:', response.data.data);
            }
        } catch (error) {
            console.error('Error fetching customer packages:', error);
            setCustomerPackages([]);
        } finally {
            setLoadingPackages(false);
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

    const addToCart = (item: ServiceProduct, type: 'service' | 'product' | 'package') => {
        const name = type === 'service' ? item.ten_dich_vu :
                     type === 'product' ? item.ten_san_pham :
                     type === 'package' ? item.ten_dich_vu : // Package uses ten_dich_vu (same field as ten_goi)
                     'Unknown';
        const price = selectedCustomer && item.gia_thanh_vien ? item.gia_thanh_vien : item.gia_ban;

        // Check if customer has an active package for this service
        if (type === 'service' && selectedCustomer && customerPackages.length > 0) {
            console.log('Checking packages for service:', item.id);
            console.log('Available customer packages:', customerPackages);

            const availablePackages = customerPackages.filter((pkg: any) =>
                pkg.dich_vu_list?.some((dv: any) => dv.id === item.id) &&
                pkg.so_luong_con_lai > 0
            );

            console.log('Available packages for this service:', availablePackages);

            if (availablePackages.length > 0) {
                // Show modal to ask if user wants to use from package
                Modal.confirm({
                    title: 'Sử dụng từ gói dịch vụ?',
                    icon: <GiftOutlined style={{ color: '#52c41a' }} />,
                    content: (
                        <div>
                            <p>Khách hàng có gói dịch vụ khả dụng cho dịch vụ này:</p>
                            {availablePackages.map((pkg: any) => (
                                <div key={pkg.id} style={{
                                    padding: '8px 12px',
                                    background: '#f6ffed',
                                    border: '1px solid #b7eb8f',
                                    borderRadius: 4,
                                    marginBottom: 8
                                }}>
                                    <div style={{ fontWeight: 'bold', color: '#52c41a' }}>{pkg.ten_goi}</div>
                                    <div>Còn lại: {pkg.so_luong_con_lai}/{pkg.so_luong_tong} lần</div>
                                </div>
                            ))}
                            <p style={{ marginTop: 12 }}>Bạn có muốn sử dụng từ gói dịch vụ không?</p>
                        </div>
                    ),
                    okText: 'Sử dụng từ gói',
                    cancelText: 'Thanh toán thường',
                    onOk: () => {
                        // Use the first available package
                        const selectedPackage = availablePackages[0];
                        const newItem: CartItem = {
                            key: `${type}-${item.id}-${Date.now()}`,
                            type: type,
                            id: item.id,
                            name: name || 'Unknown',
                            price: 0, // Free when using from package
                            quantity: 1,
                            su_dung_goi: selectedPackage.id,
                            customer_package_name: selectedPackage.ten_goi
                        };
                        setCart([...cart, newItem]);
                        message.success(`Đã thêm "${name}" sử dụng từ gói "${selectedPackage.ten_goi}"`);
                    },
                    onCancel: () => {
                        // Normal payment
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
                    }
                });
                return; // Exit early, modal will handle the add
            }
        }

        // Normal add to cart (no package available or not a service)
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
        return subtotal - discount - pointDiscount - voucherDiscount + tip;
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
        console.log('=== handleApplyPromoCode START ===');
        console.log('selectedCustomer:', selectedCustomer);

        if (!selectedCustomer) {
            message.error('Vui lòng chọn khách hàng trước');
            return;
        }

        try {
            console.log('Validating form...');
            const values = await promoCodeForm.validateFields();
            console.log('Form values:', values);
            const maCode = values.promo_code.toUpperCase();
            console.log('Ma code:', maCode);

            // Try voucher first
            try {
                const totalAmount = calculateTotal();
                console.log('Total amount:', totalAmount);
                console.log('Calling voucher verify API...');

                const voucherResponse = await axios.post(API_SPA.spaVoucherVerify, {
                    ma_voucher: maCode,
                    gia_tri_don_hang: totalAmount
                });

                console.log('Voucher response:', voucherResponse);
                console.log('Voucher response.data:', voucherResponse.data);
                console.log('Voucher response.data.success:', voucherResponse.data.success);

                if (voucherResponse.data.success === true) {
                    console.log('Success = true, processing voucher...');
                    const voucher = voucherResponse.data.data;
                    console.log('Voucher data:', voucher);
                    setAppliedVoucher(voucher);
                    setVoucherDiscount(voucher.so_tien_giam);
                    message.success(`Áp dụng voucher thành công! Giảm ${formatCurrency(voucher.so_tien_giam)}`);
                    promoCodeForm.resetFields();
                    setPromoCodeModalVisible(false);
                    return;
                } else if (voucherResponse.data.success === false) {
                    // Backend returned error with HTTP 200 but success=false
                    console.log('Success = false, showing error:', voucherResponse.data.message);
                    message.error(voucherResponse.data.message || 'Voucher không hợp lệ');
                    return;
                } else {
                    console.log('Success = undefined');
                    console.log('Full response data:', JSON.stringify(voucherResponse.data));
                }
            } catch (voucherError: any) {
                console.log('=== Voucher error caught ===');
                console.log('Error object:', voucherError);
                console.log('Error response:', voucherError.response);

                // Check if response exists
                if (voucherError.response) {
                    const errorMsg = voucherError.response.data?.message;
                    const status = voucherError.response.status;

                    console.log('Status:', status);
                    console.log('Error message:', errorMsg);

                    // If voucher exists but has error (400), show the error
                    if (status === 400 && errorMsg) {
                        console.log('Showing 400 error:', errorMsg);
                        message.error(errorMsg);
                        return;
                    }

                    // If voucher not found (404), try gift card
                    if (status === 404) {
                        console.log('Voucher not found (404), trying gift card...');
                        try {
                            const response = await axios.post(API_SPA.spaWalletApplyCode, {
                                khach_hang_id: selectedCustomer.value,
                                ma_code: maCode,
                            });

                            console.log('Gift card response:', response);

                            if (response.data.success) {
                                message.success(response.data.message);
                                promoCodeForm.resetFields();
                                setPromoCodeModalVisible(false);
                                await fetchCustomerWallet(selectedCustomer.value);
                                return;
                            }
                        } catch (giftCardError: any) {
                            console.log('Gift card error:', giftCardError);
                            message.error(giftCardError.response?.data?.message || 'Mã không hợp lệ');
                            return;
                        }
                    }
                }

                // Generic error
                console.log('Generic voucher error - showing message');
                message.error(voucherError.response?.data?.message || 'Lỗi khi kiểm tra mã');
            }
        } catch (error: any) {
            console.error('=== Outer catch - Apply code error ===');
            console.error('Error:', error);
            message.error(error.response?.data?.message || 'Mã không hợp lệ');
        }

        console.log('=== handleApplyPromoCode END ===');
    };

    // Handle add new customer
    const handleAddCustomer = async () => {
        try {
            const values = await customerForm.validateFields();
            setLoading(true);

            const response = await axios.post(API_SPA.userAdd, {
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
            const response = await axios.get(API_SPA.userGet(selectedCustomer.value));
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

            // Validate: Must select customer if cart contains gift cards
            if (giftCardItems.length > 0 && !selectedCustomer) {
                message.error('Vui lòng chọn khách hàng để mua thẻ giá trị');
                setLoading(false);
                return;
            }

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
                    su_dung_goi: item.su_dung_goi || null, // ID của customer package nếu sử dụng từ gói
                    sale_commissions: item.sale_commissions || [],
                    service_commissions: item.service_commissions || [],
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
            const response = await axios.post(API_SPA.spaPOSCreateInvoice, invoiceData);

            if (response.data.success) {
                const hoaDonId = response.data.data.id;

                // Process wallet payment if any
                if (walletAmount > 0 && selectedCustomer) {
                    await axios.post(API_SPA.spaWalletWithdraw, {
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
                            await axios.post(API_SPA.spaWalletDeposit, {
                                khach_hang_id: selectedCustomer.value,
                                the_gia_tri_id: giftCardItem.id,
                                ghi_chu: `Mua thẻ giá trị từ hóa đơn #${hoaDonId}`,
                            });
                        }
                    }
                }

                // Apply voucher if used
                if (appliedVoucher && selectedCustomer) {
                    try {
                        await axios.post(API_SPA.spaVoucherApply, {
                            ma_voucher: appliedVoucher.ma_voucher,
                            khach_hang_id: selectedCustomer.value,
                            hoa_don_id: hoaDonId,
                            so_tien_giam: voucherDiscount,
                        });
                    } catch (voucherError) {
                        console.error('Error applying voucher:', voucherError);
                        // Don't block payment on voucher error
                    }
                }

                // Process purchased service packages (create customer package records)
                const purchasedPackages = regularItems.filter(item => item.type === 'package');
                for (const pkgItem of purchasedPackages) {
                    if (selectedCustomer) {
                        try {
                            await axios.post(API_SPA.spaCustomerPackagePurchase, {
                                khach_hang_id: selectedCustomer.value,
                                goi_dich_vu_id: pkgItem.id,
                                hoa_don_id: hoaDonId,
                            });
                        } catch (pkgError) {
                            console.error('Error creating customer package:', pkgError);
                            message.warning(`Không thể tạo gói "${pkgItem.name}" cho khách hàng`);
                        }
                    }
                }

                // Process package usage for items that used packages
                const packageItems = regularItems.filter(item => item.su_dung_goi);
                for (const packageItem of packageItems) {
                    try {
                        await axios.post(API_SPA.spaCustomerPackageUse, {
                            customer_package_id: packageItem.su_dung_goi,
                            dich_vu_id: packageItem.id,
                            hoa_don_id: hoaDonId,
                        });
                    } catch (packageError) {
                        console.error('Error using package:', packageError);
                        message.warning(`Không thể sử dụng gói cho dịch vụ "${packageItem.name}"`);
                        // Don't block payment on package error
                    }
                }

                // Refresh customer packages after payment
                if (selectedCustomer && (packageItems.length > 0 || purchasedPackages.length > 0)) {
                    fetchCustomerPackages(selectedCustomer.value);
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
                setAppliedVoucher(null);
                setVoucherDiscount(0);

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
            render: (name: string, record: CartItem) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    {record.su_dung_goi && (
                        <div style={{ fontSize: '11px', color: '#52c41a', marginTop: 4 }}>
                            <GiftOutlined /> {record.customer_package_name}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            width: 140,
            render: (price: number, record: CartItem) => (
                <span style={record.su_dung_goi ? { color: '#52c41a', fontWeight: 'bold' } : {}}>
                    {record.su_dung_goi ? 'Miễn phí' : new Intl.NumberFormat('vi-VN').format(price) + ' đ'}
                </span>
            ),
        },
        {
            title: 'SL',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 80,
            render: (qty: number, record: CartItem) => (
                <InputNumber
                    min={1}
                    value={qty}
                    onChange={(value) => updateQuantity(record.key, value || 1)}
                    style={{ width: 60 }}
                    disabled={!!record.su_dung_goi}
                />
            ),
        },
        {
            title: 'Thành tiền',
            key: 'total',
            width: 140,
            render: (_: any, record: CartItem) => (
                <span style={record.su_dung_goi ? { color: '#52c41a', fontWeight: 'bold' } : {}}>
                    {record.su_dung_goi ? 'Miễn phí' : new Intl.NumberFormat('vi-VN').format(record.price * record.quantity) + ' đ'}
                </span>
            ),
        },
        {
            title: '',
            key: 'action',
            width: 50,
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

    // Expanded row render for commission buttons
    const expandedRowRender = (record: CartItem) => {
        const saleComms = record.sale_commissions || [];
        const serviceComms = record.service_commissions || [];
        const showSaleComm = record.type !== 'gift_card' && !record.su_dung_goi;
        const showServiceComm = record.type === 'service' && !record.su_dung_goi;

        if (!showSaleComm && !showServiceComm) {
            return null;
        }

        const formatCommissionValue = (comm: StaffCommission) => {
            if (comm.commission_unit === 'percent') {
                return `${comm.commission_value}%`;
            }
            return new Intl.NumberFormat('vi-VN').format(comm.commission_value) + 'đ';
        };

        return (
            <div style={{ padding: '8px 0' }}>
                {showSaleComm && (
                    <div style={{ marginBottom: showServiceComm ? 12 : 0 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 6
                                }}>
                                    <UserOutlined style={{ color: '#1890ff' }} />
                                    <span style={{ fontSize: 13, fontWeight: 500, color: '#262626' }}>NV Tư vấn:</span>
                                </div>
                                {saleComms.length > 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 6,
                                        paddingLeft: 24
                                    }}>
                                        {saleComms.map((comm, idx) => (
                                            <Tag
                                                key={idx}
                                                color="blue"
                                                style={{ margin: 0, fontSize: 12 }}
                                            >
                                                {comm.staff_name} ({formatCommissionValue(comm)})
                                            </Tag>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{
                                        paddingLeft: 24,
                                        fontSize: 12,
                                        color: '#bfbfbf',
                                        fontStyle: 'italic'
                                    }}>
                                        Chưa chọn nhân viên
                                    </div>
                                )}
                            </div>
                            <Button
                                size="small"
                                type={saleComms.length > 0 ? 'primary' : 'default'}
                                ghost
                                onClick={() => openCommissionModal(record, 'sale')}
                                icon={<UserOutlined />}
                            >
                                {saleComms.length > 0 ? 'Sửa' : 'Chọn'}
                            </Button>
                        </div>
                    </div>
                )}

                {showServiceComm && (
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 6
                                }}>
                                    <UserOutlined style={{ color: '#52c41a' }} />
                                    <span style={{ fontSize: 13, fontWeight: 500, color: '#262626' }}>NV Làm dịch vụ:</span>
                                </div>
                                {serviceComms.length > 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 6,
                                        paddingLeft: 24
                                    }}>
                                        {serviceComms.map((comm, idx) => (
                                            <Tag
                                                key={idx}
                                                color="green"
                                                style={{ margin: 0, fontSize: 12 }}
                                            >
                                                {comm.staff_name} ({formatCommissionValue(comm)})
                                            </Tag>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{
                                        paddingLeft: 24,
                                        fontSize: 12,
                                        color: '#bfbfbf',
                                        fontStyle: 'italic'
                                    }}>
                                        Chưa chọn nhân viên
                                    </div>
                                )}
                            </div>
                            <Button
                                size="small"
                                type='primary'
                                ghost
                                onClick={() => openCommissionModal(record, 'service')}
                                icon={<UserOutlined />}
                            >
                                {serviceComms.length > 0 ? 'Sửa' : 'Chọn'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Commission modal functions
    const openCommissionModal = (item: CartItem, type: 'sale' | 'service') => {
        setCurrentCommissionItem(item);
        setCommissionType(type);
        const existingCommissions = type === 'sale' ? (item.sale_commissions || []) : (item.service_commissions || []);
        setTempCommissions([...existingCommissions]);
        setCommissionModalVisible(true);
    };

    const addCommissionRow = () => {
        setTempCommissions([...tempCommissions, {
            staff_id: 0,
            staff_name: '',
            commission_value: 0,
            commission_unit: 'percent',
            commission_type: commissionType
        }]);
    };

    const updateCommissionRow = (index: number, field: keyof StaffCommission, value: any) => {
        const newCommissions = [...tempCommissions];
        if (field === 'staff_id') {
            const selectedStaff = staff.find((s: any) => s.value === value);
            newCommissions[index].staff_id = value;
            newCommissions[index].staff_name = selectedStaff?.label || '';
        } else if (field === 'commission_value') {
            newCommissions[index].commission_value = value;
        } else if (field === 'commission_unit') {
            newCommissions[index].commission_unit = value;
        }
        setTempCommissions(newCommissions);
    };

    const removeCommissionRow = (index: number) => {
        setTempCommissions(tempCommissions.filter((_, i) => i !== index));
    };

    const saveCommissions = () => {
        if (!currentCommissionItem) return;

        setCart(prev => prev.map(item => {
            if (item.key === currentCommissionItem.key) {
                if (commissionType === 'sale') {
                    return { ...item, sale_commissions: tempCommissions };
                } else {
                    return { ...item, service_commissions: tempCommissions };
                }
            }
            return item;
        }));

        setCommissionModalVisible(false);
        message.success('Đã lưu thông tin hoa hồng');
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
                                        <Row gutter={[12, 12]}>
                                            {filteredServices.map(service => (
                                                <Col span={8} key={service.id}>
                                                    <Card
                                                        hoverable
                                                        onClick={() => addToCart(service, 'service')}
                                                        style={{
                                                            cursor: 'pointer',
                                                            borderRadius: '8px',
                                                            transition: 'all 0.3s ease',
                                                            height: '100%'
                                                        }}
                                                        bodyStyle={{ padding: '12px' }}
                                                    >
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            <div style={{
                                                                fontSize: '14px',
                                                                fontWeight: 500,
                                                                color: '#262626',
                                                                lineHeight: '1.4',
                                                                minHeight: '40px',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden'
                                                            }}>
                                                                {service.ten_dich_vu}
                                                            </div>

                                                            {service.danh_muc_ten && (
                                                                <Tag color="blue" style={{ width: 'fit-content', fontSize: '11px', margin: 0 }}>
                                                                    {service.danh_muc_ten}
                                                                </Tag>
                                                            )}

                                                            <div style={{
                                                                fontSize: '11px',
                                                                color: '#8c8c8c',
                                                                fontFamily: 'monospace'
                                                            }}>
                                                                #{service.ma_dich_vu}
                                                            </div>

                                                            <div style={{
                                                                marginTop: '4px',
                                                                paddingTop: '8px',
                                                                borderTop: '1px solid #f0f0f0'
                                                            }}>
                                                                <div style={{
                                                                    fontSize: '16px',
                                                                    fontWeight: 600,
                                                                    color: '#1890ff'
                                                                }}>
                                                                    {new Intl.NumberFormat('vi-VN').format(service.gia_ban)}₫
                                                                </div>
                                                                {service.gia_thanh_vien && service.gia_thanh_vien !== service.gia_ban && (
                                                                    <div style={{
                                                                        fontSize: '12px',
                                                                        color: '#52c41a',
                                                                        marginTop: '2px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}>
                                                                        <span style={{
                                                                            background: '#f6ffed',
                                                                            padding: '1px 6px',
                                                                            borderRadius: '4px',
                                                                            border: '1px solid #b7eb8f'
                                                                        }}>
                                                                            TV: {new Intl.NumberFormat('vi-VN').format(service.gia_thanh_vien)}₫
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
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
                                        <Row gutter={[12, 12]}>
                                            {filteredProducts.map(product => (
                                                <Col span={8} key={product.id}>
                                                    <Card
                                                        hoverable
                                                        onClick={() => addToCart(product, 'product')}
                                                        style={{
                                                            cursor: 'pointer',
                                                            borderRadius: '8px',
                                                            transition: 'all 0.3s ease',
                                                            height: '100%'
                                                        }}
                                                        bodyStyle={{ padding: '12px' }}
                                                    >
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            <div style={{
                                                                fontSize: '14px',
                                                                fontWeight: 500,
                                                                color: '#262626',
                                                                lineHeight: '1.4',
                                                                minHeight: '40px',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden'
                                                            }}>
                                                                {product.ten_san_pham}
                                                            </div>

                                                            {product.danh_muc_ten && (
                                                                <Tag color="green" style={{ width: 'fit-content', fontSize: '11px', margin: 0 }}>
                                                                    {product.danh_muc_ten}
                                                                </Tag>
                                                            )}

                                                            <div style={{
                                                                fontSize: '11px',
                                                                color: '#8c8c8c',
                                                                fontFamily: 'monospace'
                                                            }}>
                                                                #{product.ma_san_pham}
                                                            </div>

                                                            <div style={{
                                                                marginTop: '4px',
                                                                paddingTop: '8px',
                                                                borderTop: '1px solid #f0f0f0'
                                                            }}>
                                                                <div style={{
                                                                    fontSize: '16px',
                                                                    fontWeight: 600,
                                                                    color: '#1890ff'
                                                                }}>
                                                                    {new Intl.NumberFormat('vi-VN').format(product.gia_ban)}₫
                                                                </div>
                                                                {product.gia_thanh_vien && product.gia_thanh_vien !== product.gia_ban && (
                                                                    <div style={{
                                                                        fontSize: '12px',
                                                                        color: '#52c41a',
                                                                        marginTop: '2px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}>
                                                                        <span style={{
                                                                            background: '#f6ffed',
                                                                            padding: '1px 6px',
                                                                            borderRadius: '4px',
                                                                            border: '1px solid #b7eb8f'
                                                                        }}>
                                                                            TV: {new Intl.NumberFormat('vi-VN').format(product.gia_thanh_vien)}₫
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
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
                                        <Row gutter={[12, 12]}>
                                            {filteredServicePackages.map(pkg => (
                                                <Col span={8} key={pkg.id}>
                                                    <Card
                                                        hoverable
                                                        onClick={() => addToCart({
                                                            id: pkg.id,
                                                            ten_dich_vu: pkg.ten_goi,
                                                            ma_dich_vu: pkg.ma_goi,
                                                            gia_ban: pkg.gia_ban,
                                                            gia_thanh_vien: pkg.gia_thanh_vien
                                                        }, 'package' as any)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            borderRadius: '8px',
                                                            transition: 'all 0.3s ease',
                                                            height: '100%',
                                                            borderColor: '#d3adf7'
                                                        }}
                                                        bodyStyle={{ padding: '12px' }}
                                                    >
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            <div style={{
                                                                fontSize: '14px',
                                                                fontWeight: 500,
                                                                color: '#262626',
                                                                lineHeight: '1.4',
                                                                minHeight: '40px',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden'
                                                            }}>
                                                                {pkg.ten_goi}
                                                            </div>

                                                            <Tag color="purple" style={{ width: 'fit-content', fontSize: '11px', margin: 0 }}>
                                                                Gói DV
                                                            </Tag>

                                                            <div style={{
                                                                fontSize: '11px',
                                                                color: '#8c8c8c',
                                                                fontFamily: 'monospace'
                                                            }}>
                                                                #{pkg.ma_goi}
                                                            </div>

                                                            {pkg.so_buoi > 0 && (
                                                                <div style={{
                                                                    fontSize: '12px',
                                                                    color: '#722ed1',
                                                                    background: '#f9f0ff',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '4px',
                                                                    width: 'fit-content',
                                                                    border: '1px solid #d3adf7'
                                                                }}>
                                                                    📅 {pkg.so_buoi} buổi
                                                                </div>
                                                            )}

                                                            <div style={{
                                                                marginTop: '4px',
                                                                paddingTop: '8px',
                                                                borderTop: '1px solid #f0f0f0'
                                                            }}>
                                                                <div style={{
                                                                    fontSize: '16px',
                                                                    fontWeight: 600,
                                                                    color: '#722ed1'
                                                                }}>
                                                                    {new Intl.NumberFormat('vi-VN').format(pkg.gia_ban)}₫
                                                                </div>
                                                                {pkg.gia_thanh_vien && pkg.gia_thanh_vien !== pkg.gia_ban && (
                                                                    <div style={{
                                                                        fontSize: '12px',
                                                                        color: '#52c41a',
                                                                        marginTop: '2px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}>
                                                                        <span style={{
                                                                            background: '#f6ffed',
                                                                            padding: '1px 6px',
                                                                            borderRadius: '4px',
                                                                            border: '1px solid #b7eb8f'
                                                                        }}>
                                                                            TV: {new Intl.NumberFormat('vi-VN').format(pkg.gia_thanh_vien)}₫
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
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
                                        <Row gutter={[12, 12]}>
                                            {filteredGiftCards.map(card => {
                                                const bonusAmount = card.menh_gia * (card.ti_le_thuong / 100);
                                                const totalDeposit = card.menh_gia + bonusAmount;

                                                return (
                                                    <Col span={8} key={card.id}>
                                                        <Card
                                                            hoverable
                                                            onClick={() => addGiftCardToCart(card)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                borderRadius: '8px',
                                                                transition: 'all 0.3s ease',
                                                                height: '100%',
                                                                borderColor: card.ti_le_thuong > 0 ? '#faad14' : '#ffd591',
                                                                background: card.ti_le_thuong > 0 ? '#fffbf0' : '#fff'
                                                            }}
                                                            bodyStyle={{ padding: '12px' }}
                                                        >
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                <div style={{
                                                                    fontSize: '14px',
                                                                    fontWeight: 500,
                                                                    color: '#262626',
                                                                    lineHeight: '1.4',
                                                                    minHeight: '40px',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    {card.ten_the}
                                                                </div>

                                                                <Tag color="gold" style={{ width: 'fit-content', fontSize: '11px', margin: 0 }}>
                                                                    Thẻ Giá Trị
                                                                </Tag>

                                                                <div style={{
                                                                    fontSize: '11px',
                                                                    color: '#8c8c8c',
                                                                    fontFamily: 'monospace'
                                                                }}>
                                                                    #{card.ma_the}
                                                                </div>

                                                                <div style={{
                                                                    marginTop: '4px',
                                                                    paddingTop: '8px',
                                                                    borderTop: '1px solid #f0f0f0'
                                                                }}>
                                                                    <div style={{
                                                                        fontSize: '16px',
                                                                        fontWeight: 600,
                                                                        color: '#faad14'
                                                                    }}>
                                                                        {formatCurrency(card.gia_ban)}
                                                                    </div>

                                                                    {card.ti_le_thuong > 0 && (
                                                                        <div style={{
                                                                            fontSize: '12px',
                                                                            marginTop: '4px',
                                                                            background: '#f6ffed',
                                                                            padding: '4px 8px',
                                                                            borderRadius: '4px',
                                                                            border: '1px solid #b7eb8f'
                                                                        }}>
                                                                            <span style={{ color: '#52c41a', fontWeight: 500 }}>
                                                                                🎁 +{card.ti_le_thuong}% Khuyến mãi
                                                                            </span>
                                                                            <div style={{ color: '#52c41a', marginTop: '2px' }}>
                                                                                → Nạp: {formatCurrency(totalDeposit)}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {!card.ti_le_thuong && (
                                                                        <div style={{
                                                                            fontSize: '12px',
                                                                            color: '#8c8c8c',
                                                                            marginTop: '4px'
                                                                        }}>
                                                                            Nạp: {formatCurrency(card.menh_gia)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
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
                                    <Button className="btn-default"
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

                                                    // Remove package items from cart when changing customer
                                                    const updatedCart = cart.filter(item => !item.su_dung_goi);
                                                    if (updatedCart.length !== cart.length) {
                                                        setCart(updatedCart);
                                                        message.info('Đã xóa các dịch vụ sử dụng từ gói của khách hàng trước');
                                                    }

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

                                                    {/* Package Info */}
                                                    {loadingPackages ? (
                                                        <div style={{ fontSize: '13px', color: '#1890ff', marginTop: 8 }}>
                                                            <GiftOutlined style={{ marginRight: 4 }} />
                                                            Đang tải gói dịch vụ...
                                                        </div>
                                                    ) : customerPackages.length > 0 ? (
                                                        <div style={{ borderTop: '1px dashed #d9d9d9', paddingTop: 8, marginTop: 8 }}>
                                                            <div style={{ fontSize: '13px', marginBottom: 8, fontWeight: 'bold' }}>
                                                                <GiftOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                                                                <span style={{ color: '#52c41a' }}>Gói dịch vụ đã mua ({customerPackages.length})</span>
                                                            </div>
                                                            {customerPackages.map((pkg: any) => (
                                                                <div
                                                                    key={pkg.id}
                                                                    style={{
                                                                        fontSize: '11px',
                                                                        padding: '8px',
                                                                        background: '#f6ffed',
                                                                        borderRadius: 4,
                                                                        marginBottom: 6,
                                                                        border: '1px solid #b7eb8f',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                    onClick={() => {
                                                                        setSelectedPackageForService(pkg);
                                                                        setPackageServiceModalVisible(true);
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.background = '#d9f7be';
                                                                        e.currentTarget.style.borderColor = '#52c41a';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.background = '#f6ffed';
                                                                        e.currentTarget.style.borderColor = '#b7eb8f';
                                                                    }}
                                                                >
                                                                    <div style={{ fontWeight: 'bold', color: '#52c41a', marginBottom: 4 }}>
                                                                        🎁 {pkg.ten_goi}
                                                                    </div>
                                                                    <div style={{ color: '#389e0d', fontWeight: 'bold' }}>
                                                                        ✓ Còn lại: {pkg.so_luong_con_lai}/{pkg.so_luong_tong} lần
                                                                    </div>
                                                                    {pkg.ngay_het_han && (
                                                                        <div style={{ color: '#8c8c8c', fontSize: '10px', marginTop: 2 }}>
                                                                            HSD: {new Date(pkg.ngay_het_han).toLocaleDateString('vi-VN')}
                                                                        </div>
                                                                    )}
                                                                    {pkg.dich_vu_list && pkg.dich_vu_list.length > 0 && (
                                                                        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #d9f7be' }}>
                                                                            <div style={{ color: '#595959', marginBottom: 4, fontWeight: 'bold' }}>
                                                                                Dịch vụ khả dụng:
                                                                            </div>
                                                                            {pkg.dich_vu_list.slice(0, 3).map((dv: any, index: number) => (
                                                                                <div key={index} style={{ color: '#595959', fontSize: '10px', paddingLeft: 8 }}>
                                                                                    • {dv.ten_dich_vu}
                                                                                </div>
                                                                            ))}
                                                                            {pkg.dich_vu_list.length > 3 && (
                                                                                <div style={{ color: '#8c8c8c', fontSize: '10px', paddingLeft: 8, fontStyle: 'italic' }}>
                                                                                    ... và {pkg.dich_vu_list.length - 3} dịch vụ khác
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    <div style={{
                                                                        marginTop: 6,
                                                                        padding: '4px 6px',
                                                                        background: '#e6f7ff',
                                                                        borderRadius: 3,
                                                                        fontSize: '10px',
                                                                        color: '#0050b3',
                                                                        textAlign: 'center',
                                                                        fontWeight: 'bold'
                                                                    }}>
                                                                        👆 Click để chọn dịch vụ sử dụng
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : null}

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

                                        <Table className='table-card'
                                            dataSource={order.cart}
                                            columns={cartColumns}
                                            pagination={false}
                                            size="small"
                                            expandable={{
                                                expandedRowRender,
                                                expandedRowKeys: expandedRowKeys,
                                                onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
                                                expandIcon: () => null, // Ẩn icon expand mặc định
                                            }}
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

                                                {appliedVoucher && (
                                                    <div style={{
                                                        padding: '8px 12px',
                                                        background: '#f6ffed',
                                                        border: '1px solid #b7eb8f',
                                                        borderRadius: 4,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <div>
                                                            <Tag color="green">{appliedVoucher.ma_voucher}</Tag>
                                                            <span style={{ fontSize: '12px', color: '#52c41a' }}>
                                                                {appliedVoucher.ten_voucher}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                                                                -{formatCurrency(voucherDiscount)}
                                                            </span>
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                danger
                                                                icon={<CloseOutlined />}
                                                                onClick={() => {
                                                                    setAppliedVoucher(null);
                                                                    setVoucherDiscount(0);
                                                                    message.info('Đã hủy voucher');
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

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

            {/* Payment Modal - Redesigned */}
            <Modal
                title={
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        margin: '-20px -24px 20px',
                        padding: '20px 24px',
                        color: 'white',
                        borderRadius: '8px 8px 0 0'
                    }}>
                        <DollarOutlined style={{ fontSize: '20px', marginRight: '8px' }} />
                        <span style={{ fontSize: '18px', fontWeight: 600 }}>Xác nhận thanh toán</span>
                    </div>
                }
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
                width={750}
                okText="Xác nhận thanh toán"
                cancelText="Hủy"
                confirmLoading={loading}
                okButtonProps={{
                    size: 'large',
                    style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', height: '45px', fontSize: '16px' }
                }}
                cancelButtonProps={{
                    size: 'large',
                    style: { height: '45px', fontSize: '16px' }
                }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {/* Total Amount Card */}
                    <Card
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '12px'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <div style={{ textAlign: 'center', color: 'white' }}>
                            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                                Tổng tiền thanh toán
                            </div>
                            <div style={{ fontSize: '36px', fontWeight: 'bold', letterSpacing: '1px' }}>
                                {formatCurrency(calculateTotal())}
                            </div>
                        </div>
                    </Card>

                    {/* Payment Methods */}
                    <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
                            💳 Chọn hình thức thanh toán
                        </div>

                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            {/* Wallet Payment */}
                            {selectedCustomer && customerWallet && (
                                <Card
                                    size="small"
                                    style={{
                                        background: useWallet ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'white',
                                        border: useWallet ? 'none' : '1px solid #d9d9d9',
                                        borderRadius: '8px',
                                        transition: 'all 0.3s'
                                    }}
                                    bodyStyle={{ padding: '16px' }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                                        <Checkbox
                                            checked={useWallet}
                                            onChange={(e) => setUseWallet(e.target.checked)}
                                            style={{ color: useWallet ? 'white' : 'inherit' }}
                                        >
                                            <span style={{ fontSize: '15px', fontWeight: 500, color: useWallet ? 'white' : '#333' }}>
                                                💰 Thanh toán từ ví
                                            </span>
                                            <Tag color={useWallet ? 'white' : 'blue'} style={{ marginLeft: 8, color: useWallet ? '#667eea' : undefined }}>
                                                Số dư: {formatCurrency(customerWallet.so_du)}
                                            </Tag>
                                        </Checkbox>
                                        {useWallet && (
                                            <div style={{ paddingLeft: '24px' }}>
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    size="large"
                                                    value={walletAmount}
                                                    onChange={(value) => setWalletAmount(value || 0)}
                                                    max={Math.min(calculateTotal(), customerWallet.so_du)}
                                                    min={0}
                                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                                                    addonBefore={<span style={{ color: 'white' }}>₫</span>}
                                                />
                                                <Button
                                                    size="small"
                                                    type="link"
                                                    onClick={() => setWalletAmount(Math.min(calculateTotal(), customerWallet.so_du))}
                                                    style={{ padding: '4px 0', color: 'white', textDecoration: 'underline' }}
                                                >
                                                    Dùng hết ví
                                                </Button>
                                            </div>
                                        )}
                                    </Space>
                                </Card>
                            )}

                            {/* Cash Payment */}
                            <Card
                                size="small"
                                style={{
                                    background: useCash ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 'white',
                                    border: useCash ? 'none' : '1px solid #d9d9d9',
                                    borderRadius: '8px',
                                    transition: 'all 0.3s'
                                }}
                                bodyStyle={{ padding: '16px' }}
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    <Checkbox
                                        checked={useCash}
                                        onChange={(e) => setUseCash(e.target.checked)}
                                        style={{ color: useCash ? 'white' : 'inherit' }}
                                    >
                                        <span style={{ fontSize: '15px', fontWeight: 500, color: useCash ? 'white' : '#333' }}>
                                            💵 Tiền mặt
                                        </span>
                                    </Checkbox>
                                    {useCash && (
                                        <div style={{ paddingLeft: '24px' }}>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                size="large"
                                                value={cashAmount}
                                                onChange={(value) => setCashAmount(value || 0)}
                                                min={0}
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                                                addonBefore={<span style={{ color: 'white' }}>₫</span>}
                                            />
                                        </div>
                                    )}
                                </Space>
                            </Card>

                            {/* Transfer Payment */}
                            <Card
                                size="small"
                                style={{
                                    background: useTransfer ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' : 'white',
                                    border: useTransfer ? 'none' : '1px solid #d9d9d9',
                                    borderRadius: '8px',
                                    transition: 'all 0.3s'
                                }}
                                bodyStyle={{ padding: '16px' }}
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    <Checkbox
                                        checked={useTransfer}
                                        onChange={(e) => setUseTransfer(e.target.checked)}
                                        style={{ color: useTransfer ? 'white' : 'inherit' }}
                                    >
                                        <span style={{ fontSize: '15px', fontWeight: 500, color: useTransfer ? 'white' : '#333' }}>
                                            🏦 Chuyển khoản
                                        </span>
                                    </Checkbox>
                                    {useTransfer && (
                                        <div style={{ paddingLeft: '24px' }}>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                size="large"
                                                value={transferAmount}
                                                onChange={(value) => setTransferAmount(value || 0)}
                                                min={0}
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                                                addonBefore={<span style={{ color: 'white' }}>₫</span>}
                                            />
                                        </div>
                                    )}
                                </Space>
                            </Card>

                            {/* Card Payment */}
                            <Card
                                size="small"
                                style={{
                                    background: useCard ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' : 'white',
                                    border: useCard ? 'none' : '1px solid #d9d9d9',
                                    borderRadius: '8px',
                                    transition: 'all 0.3s'
                                }}
                                bodyStyle={{ padding: '16px' }}
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    <Checkbox
                                        checked={useCard}
                                        onChange={(e) => setUseCard(e.target.checked)}
                                        style={{ color: useCard ? '#333' : 'inherit' }}
                                    >
                                        <span style={{ fontSize: '15px', fontWeight: 500, color: useCard ? '#333' : '#333' }}>
                                            💳 Quẹt thẻ
                                        </span>
                                    </Checkbox>
                                    {useCard && (
                                        <div style={{ paddingLeft: '24px' }}>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                size="large"
                                                value={cardAmount}
                                                onChange={(value) => setCardAmount(value || 0)}
                                                min={0}
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                                                addonBefore="₫"
                                            />
                                        </div>
                                    )}
                                </Space>
                            </Card>
                        </Space>
                    </div>

                    {/* Payment Summary */}
                    <Card
                        style={{
                            background: walletAmount + cashAmount + transferAmount + cardAmount >= calculateTotal()
                                ? 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)'
                                : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                            border: 'none',
                            borderRadius: '12px'
                        }}
                        bodyStyle={{ padding: '20px' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size={8}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '15px', fontWeight: 500 }}>📊 Tổng đã thanh toán:</span>
                                <span style={{
                                    fontSize: '22px',
                                    fontWeight: 'bold',
                                    color: walletAmount + cashAmount + transferAmount + cardAmount >= calculateTotal() ? '#2d8659' : '#d84315'
                                }}>
                                    {formatCurrency(walletAmount + cashAmount + transferAmount + cardAmount)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '2px dashed rgba(0,0,0,0.1)' }}>
                                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                                    {calculateTotal() - (walletAmount + cashAmount + transferAmount + cardAmount) > 0 ? '⚠️ Còn thiếu:' : '✅ Thừa:'}
                                </span>
                                <span style={{
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    color: calculateTotal() - (walletAmount + cashAmount + transferAmount + cardAmount) > 0 ? '#d84315' : '#2d8659'
                                }}>
                                    {formatCurrency(Math.abs(calculateTotal() - (walletAmount + cashAmount + transferAmount + cardAmount)))}
                                </span>
                            </div>
                        </Space>
                    </Card>

                    {/* Debt Form */}
                    {showDebtForm && (
                        <>
                            <Alert
                                message={
                                    <div style={{ fontSize: '15px', fontWeight: 600 }}>
                                        ⚠️ Thanh toán thiếu - Ghi công nợ
                                    </div>
                                }
                                description={
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                                            Số tiền công nợ: <strong style={{ color: '#ff4d4f', fontSize: '18px' }}>{formatCurrency(debtAmount)}</strong>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#666' }}>
                                            💡 Hệ thống sẽ tự động lưu công nợ cho khách hàng này
                                        </div>
                                    </div>
                                }
                                type="warning"
                                showIcon={false}
                                style={{
                                    background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                                    border: '2px solid #ff9800',
                                    borderRadius: '8px'
                                }}
                            />
                            <div>
                                <div style={{ marginBottom: 8, fontSize: '15px', fontWeight: 500 }}>
                                    📅 Thời hạn thanh toán công nợ: <span style={{ color: 'red' }}>*</span>
                                </div>
                                <DatePicker
                                    style={{ width: '100%' }}
                                    size="large"
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
                title="Nhập mã Voucher / Thẻ tặng"
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
                        label="Mã Voucher hoặc Thẻ tặng"
                        rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
                    >
                        <Input
                            placeholder="VD: VOUCHER0001, NEWCUSTOMER, SALE50"
                            autoFocus
                            style={{ textTransform: 'uppercase' }}
                        />
                    </Form.Item>
                    <Alert
                        message="Hỗ trợ 2 loại mã"
                        description={
                            <div>
                                <div>• <strong>Voucher:</strong> Giảm giá trực tiếp trên hóa đơn</div>
                                <div>• <strong>Thẻ tặng:</strong> Nạp tiền vào ví khách hàng</div>
                            </div>
                        }
                        type="info"
                        showIcon
                        style={{ fontSize: '12px' }}
                    />
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

            {/* Package Service Selection Modal */}
            <Modal
                title={
                    <div>
                        <GiftOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        Chọn dịch vụ từ gói: {selectedPackageForService?.ten_goi}
                    </div>
                }
                open={packageServiceModalVisible}
                onCancel={() => {
                    setPackageServiceModalVisible(false);
                    setSelectedPackageForService(null);
                }}
                footer={null}
                width={600}
            >
                {selectedPackageForService && (
                    <div>
                        {(() => {
                            const packageUsageInCart = cart.filter(item =>
                                item.su_dung_goi === selectedPackageForService.id
                            ).length;
                            const remainingUses = selectedPackageForService.so_luong_con_lai - packageUsageInCart;

                            return (
                                <>
                                    <div style={{ marginBottom: 16, padding: 12, background: '#f6ffed', borderRadius: 4, border: '1px solid #b7eb8f' }}>
                                        <div style={{ fontSize: '13px', color: '#52c41a', fontWeight: 'bold', marginBottom: 4 }}>
                                            Thông tin gói
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            Còn lại: <strong style={{ color: '#52c41a' }}>{selectedPackageForService.so_luong_con_lai}/{selectedPackageForService.so_luong_tong}</strong> lần
                                        </div>
                                        {packageUsageInCart > 0 && (
                                            <div style={{ fontSize: '12px', color: '#ff4d4f', fontWeight: 'bold', marginTop: 4 }}>
                                                ⚠️ Đang chọn: {packageUsageInCart} dịch vụ từ gói này trong giỏ hàng
                                            </div>
                                        )}
                                        {remainingUses <= 0 && (
                                            <div style={{ fontSize: '12px', color: '#ff4d4f', fontWeight: 'bold', marginTop: 4 }}>
                                                ✗ Đã hết lượt sử dụng trong giỏ hàng hiện tại
                                            </div>
                                        )}
                                        {selectedPackageForService.ngay_het_han && (
                                            <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                                                Hạn sử dụng: <strong>{new Date(selectedPackageForService.ngay_het_han).toLocaleDateString('vi-VN')}</strong>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ marginBottom: 8, fontSize: '13px', fontWeight: 'bold' }}>
                                        Chọn dịch vụ để thêm vào giỏ hàng:
                                        {remainingUses > 0 && (
                                            <span style={{ color: '#52c41a', marginLeft: 8, fontSize: '12px' }}>
                                                (Còn {remainingUses} lần)
                                            </span>
                                        )}
                                    </div>
                                </>
                            );
                        })()}

                        {selectedPackageForService.dich_vu_list && selectedPackageForService.dich_vu_list.length > 0 ? (
                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                {selectedPackageForService.dich_vu_list.map((dv: any) => {
                                    // Count how many times this package has been used in current cart
                                    const packageUsageInCart = cart.filter(item =>
                                        item.su_dung_goi === selectedPackageForService.id
                                    ).length;

                                    // Check if package has remaining uses
                                    const canUsePackage = packageUsageInCart < selectedPackageForService.so_luong_con_lai;

                                    return (
                                        <Card
                                            key={dv.id}
                                            hoverable={canUsePackage}
                                            size="small"
                                            style={{
                                                marginBottom: 8,
                                                cursor: canUsePackage ? 'pointer' : 'not-allowed',
                                                opacity: canUsePackage ? 1 : 0.5
                                            }}
                                            onClick={() => {
                                                if (!canUsePackage) {
                                                    message.warning(`Gói chỉ còn ${selectedPackageForService.so_luong_con_lai} lần sử dụng. Bạn đã thêm ${packageUsageInCart} dịch vụ từ gói này vào giỏ hàng.`);
                                                    return;
                                                }

                                                // Add service to cart with package usage
                                                const newItem: CartItem = {
                                                    key: `service-${dv.id}-${Date.now()}`,
                                                    type: 'service',
                                                    id: dv.id,
                                                    name: dv.ten_dich_vu || 'Unknown',
                                                    price: 0, // Free when using from package
                                                    quantity: 1,
                                                    su_dung_goi: selectedPackageForService.id,
                                                    customer_package_name: selectedPackageForService.ten_goi
                                                };
                                                setCart([...cart, newItem]);
                                                message.success(`Đã thêm "${dv.ten_dich_vu}" sử dụng từ gói "${selectedPackageForService.ten_goi}"`);

                                                // Auto close if reached limit
                                                if (packageUsageInCart + 1 >= selectedPackageForService.so_luong_con_lai) {
                                                    message.info(`Đã sử dụng hết ${selectedPackageForService.so_luong_con_lai} lần của gói`);
                                                    setPackageServiceModalVisible(false);
                                                    setSelectedPackageForService(null);
                                                }
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{dv.ten_dich_vu}</div>
                                                    <div style={{ fontSize: '12px', color: canUsePackage ? '#52c41a' : '#999' }}>
                                                        {canUsePackage ? '✓ Miễn phí (sử dụng từ gói)' : '✗ Gói đã hết lượt'}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through' }}>
                                                    {new Intl.NumberFormat('vi-VN').format(dv.gia_ban)} đ
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <Empty description="Không có dịch vụ trong gói" />
                        )}
                    </div>
                )}
            </Modal>

            {/* Commission Modal */}
            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        {commissionType === 'sale' ? 'Chọn NV Tư vấn bán hàng' : 'Chọn NV Làm dịch vụ'}
                    </Space>
                }
                open={commissionModalVisible}
                onCancel={() => setCommissionModalVisible(false)}
                onOk={saveCommissions}
                width={700}
                okText="Lưu"
                cancelText="Hủy"
            >
                <div style={{ marginBottom: 16 }}>
                    <strong>Sản phẩm:</strong> {currentCommissionItem?.name}
                </div>

                <Table
                    dataSource={tempCommissions}
                    pagination={false}
                    size="small"
                    rowKey={(record, index) => `commission-${index}`}
                    columns={[
                        {
                            title: 'STT',
                            key: 'index',
                            width: 60,
                            render: (_: any, __: any, index: number) => index + 1,
                        },
                        {
                            title: 'Nhân viên *',
                            key: 'staff_id',
                            render: (_: any, record: StaffCommission, index: number) => (
                                <Select
                                    placeholder="Chọn nhân viên"
                                    style={{ width: '100%' }}
                                    value={record.staff_id || undefined}
                                    onChange={(value) => updateCommissionRow(index, 'staff_id', value)}
                                    showSearch
                                    filterOption={filterSelectOption}
                                    options={staff}
                                />
                            ),
                        },
                        {
                            title: 'Loại CK',
                            key: 'commission_unit',
                            width: 120,
                            render: (_: any, record: StaffCommission, index: number) => (
                                <Select
                                    style={{ width: '100%' }}
                                    value={record.commission_unit}
                                    onChange={(value) => updateCommissionRow(index, 'commission_unit', value)}
                                >
                                    <Select.Option value="percent">%</Select.Option>
                                    <Select.Option value="cash">Tiền</Select.Option>
                                </Select>
                            ),
                        },
                        {
                            title: 'Giá trị CK',
                            key: 'commission_value',
                            width: 150,
                            render: (_: any, record: StaffCommission, index: number) => (
                                <InputNumber
                                    min={0}
                                    max={record.commission_unit === 'percent' ? 100 : undefined}
                                    style={{ width: '100%' }}
                                    value={record.commission_value}
                                    onChange={(value) => updateCommissionRow(index, 'commission_value', value || 0)}
                                    formatter={(value) =>
                                        record.commission_unit === 'percent'
                                            ? `${value}%`
                                            : new Intl.NumberFormat('vi-VN').format(Number(value))
                                    }
                                    parser={(value) => {
                                        if (record.commission_unit === 'percent') {
                                            return value?.replace('%', '') as any;
                                        }
                                        return value?.replace(/\D/g, '') as any;
                                    }}
                                    placeholder={record.commission_unit === 'percent' ? '0%' : '0 đ'}
                                />
                            ),
                        },
                        {
                            title: 'Thao tác',
                            key: 'action',
                            width: 80,
                            render: (_: any, __: any, index: number) => (
                                <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeCommissionRow(index)}
                                />
                            ),
                        },
                    ]}
                />

                <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={addCommissionRow}
                    style={{ marginTop: 16 }}
                >
                    Thêm nhân viên
                </Button>

                <div style={{ marginTop: 16, fontSize: 12, color: '#999' }}>
                    <InfoCircleOutlined /> Bạn có thể chọn nhiều nhân viên và phân chia chiết khấu cho từng người
                </div>
            </Modal>
        </div>
    );
};

export default SpaPOSScreen;
