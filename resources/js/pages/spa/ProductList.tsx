import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Select, Tag, Modal, Form, InputNumber,
    message, Popconfirm, Upload, Image, Row, Col, Divider, Drawer, Descriptions,
    Switch, Badge, Alert, Progress, Tooltip, Statistic, DatePicker, Checkbox
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, SkinOutlined,
    UploadOutlined, EyeOutlined, DollarOutlined, AppstoreOutlined, BarsOutlined,
    WarningOutlined, CheckCircleOutlined, StockOutlined, BarChartOutlined,
    MinusCircleOutlined, SwapOutlined, CalendarOutlined, ClockCircleOutlined,
    FileTextOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';
import { API } from '../../common/api';

const { TextArea } = Input;
const { Option } = Select;

interface UnitConversion {
    id: number;
    don_vi: string;
    ty_le: number;
    ghi_chu?: string;
}

interface Product {
    id: number;
    ma_san_pham: string;
    ten_san_pham: string;
    danh_muc_id?: number;
    danh_muc?: {
        id: number;
        ten_danh_muc: string;
    };
    danh_muc_ten?: string;
    gia_nhap: number;
    gia_ban: number;
    ton_kho: number;
    ton_kho_toi_thieu: number;
    ton_kho_canh_bao?: number;
    don_vi_tinh: string;
    don_vi_quy_doi?: UnitConversion[];
    mo_ta?: string;
    mo_ta_ngan?: string;
    hinh_anh?: string;
    hinh_anh_ids?: string;
    trang_thai: string;
    is_active?: boolean;
    xuat_xu?: string;
    thuong_hieu_id?: number;
    ten_thuong_hieu?: string;
    ngay_het_han?: string;
    so_luong_da_ban: number;
    doanh_thu: number;
    created_at: string;
}

interface Category {
    id: number;
    ten_danh_muc: string;
    mo_ta?: string;
}

interface Brand {
    id: number;
    ten_thuong_hieu: string;
    color?: string;
    sort_order?: number;
    is_active?: boolean;
}

interface Origin {
    id: number;
    name: string;
    color?: string;
    sort_order?: number;
}

interface ProductUnit {
    id: number;
    name: string;
    color?: string;
    sort_order?: number;
    note?: string;
}

const ProductList: React.FC = () => {
    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [origins, setOrigins] = useState<Origin[]>([]);
    const [units, setUnits] = useState<ProductUnit[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Quick Create Modals
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [brandModalVisible, setBrandModalVisible] = useState(false);
    const [originModalVisible, setOriginModalVisible] = useState(false);
    const [unitModalVisible, setUnitModalVisible] = useState(false);
    const [categoryForm] = Form.useForm();
    const [brandForm] = Form.useForm();
    const [originForm] = Form.useForm();
    const [unitForm] = Form.useForm();

    // Filters
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [stockFilter, setStockFilter] = useState<string | null>(null);

    // Pagination
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Form
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    // Bulk Add Modal
    const [bulkAddModalVisible, setBulkAddModalVisible] = useState(false);
    const [bulkProducts, setBulkProducts] = useState<any[]>([
        { key: 1, ten_san_pham: '', danh_muc_id: null, gia_nhap: 0, gia_ban: 0, ton_kho: 0, don_vi_tinh: 'Chai' },
        { key: 2, ten_san_pham: '', danh_muc_id: null, gia_nhap: 0, gia_ban: 0, ton_kho: 0, don_vi_tinh: 'Chai' },
        { key: 3, ten_san_pham: '', danh_muc_id: null, gia_nhap: 0, gia_ban: 0, ton_kho: 0, don_vi_tinh: 'Chai' },
    ]);
    const [bulkApplyAll, setBulkApplyAll] = useState({
        danh_muc_id: false,
        ton_kho: false,
        don_vi_tinh: false,
    });
    const [bulkSubmitting, setBulkSubmitting] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0,
    });

    // Load data
    useEffect(() => {
        loadProducts();
        loadCategories();
        loadBrands();
        loadOrigins();
        loadUnits();
    }, [pagination.current, pagination.pageSize, searchText, selectedCategory, selectedStatus, stockFilter]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API.spaProductList, {
                params: {
                    page: pagination.current,
                    per_page: pagination.pageSize,
                    search: searchText || undefined,
                    danh_muc_id: selectedCategory || undefined,
                    is_active: selectedStatus === 'con_hang' ? true : selectedStatus === 'het_hang' ? false : undefined,
                    stock_filter: stockFilter || undefined,
                }
            });

            if (response.data.status_code === 200) {
                const data = response.data.data;
                const productsData = data.data || [];

                setProducts(productsData);
                setPagination({
                    ...pagination,
                    current: data.current_page || pagination.current,
                    total: data.total || 0,
                });

                // Calculate stats from loaded data
                const lowStock = productsData.filter((p: Product) => (p.ton_kho ?? 0) > 0 && (p.ton_kho ?? 0) <= (p.ton_kho_toi_thieu ?? 0)).length;
                const outOfStock = productsData.filter((p: Product) => (p.ton_kho ?? 0) === 0).length;
                const totalValue = productsData.reduce((sum: number, p: Product) => sum + ((p.ton_kho ?? 0) * (p.gia_nhap ?? 0)), 0);

                setStats({
                    total: data.total || 0,
                    lowStock,
                    outOfStock,
                    totalValue,
                });

            } else {
                message.error(response.data.message || 'Không thể tải danh sách sản phẩm');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await axios.get(API.spaProductCategoryList);

            if (response.data.status_code === 200) {
                const data = response.data.data?.data || response.data.data || [];
                setCategories(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Load categories error:', error);
        }
    };

    const loadBrands = async () => {
        try {
            const response = await axios.get(API.spaBrandList);

            if (response.data.status_code === 200) {
                const data = response.data.data;
                setBrands(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Load brands error:', error);
        }
    };

    const loadUnits = async () => {
        try {
            const response = await axios.get(API.spaProductUnitList, { params: { all: 'true' } });

            if (response.data.status_code === 200) {
                const data = response.data.data;
                setUnits(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Load units error:', error);
        }
    };

    const loadOrigins = async () => {
        try {
            const response = await axios.get(API.spaOriginList);

            if (response.data.status_code === 200) {
                const data = response.data.data;
                setOrigins(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Load origins error:', error);
        }
    };

    // Handlers
    const handleCreate = () => {
        form.resetFields();
        setImageUrl('');
        setSelectedProduct(null);
        setModalVisible(true);
    };

    const handleEdit = async (record: Product) => {
        setSelectedProduct(record);
        setModalVisible(true);

        try {
            // Load full product details including conversion units
            const response = await axios.get(API.spaProductDetail(record.id));
            if (response.data.status_code === 200) {
                const productData = response.data.data;
                setSelectedProduct(productData);
                form.setFieldsValue({
                    ...productData,
                    han_su_dung: productData.ngay_het_han ? dayjs(productData.ngay_het_han) : null,
                });
                setImageUrl(productData.hinh_anh || '');
            }
        } catch (error) {
            console.error('Load product detail error:', error);
            // Fallback to record data if API fails
            form.setFieldsValue({
                ...record,
                han_su_dung: record.ngay_het_han ? dayjs(record.ngay_het_han) : null,
            });
            setImageUrl(record.hinh_anh || '');
        }
    };

    const handleView = async (record: Product) => {
        try {
            setDetailDrawerVisible(true);
            setSelectedProduct(record); // Set temporary data first

            // Load full product details including conversion units
            const response = await axios.get(API.spaProductDetail(record.id));
            if (response.data.status_code === 200) {
                setSelectedProduct(response.data.data);
            }
        } catch (error) {
            console.error('Load product detail error:', error);
            message.error('Không thể tải chi tiết sản phẩm');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                hinh_anh: imageUrl,
                han_su_dung: values.han_su_dung ? dayjs(values.han_su_dung).format('YYYY-MM-DD') : null,
            };

            let response;
            if (selectedProduct) {
                // Update existing product
                response = await axios.put(API.spaProductUpdate(selectedProduct.id), payload);
            } else {
                // Create new product
                response = await axios.post(API.spaProductCreate, payload);
            }

            if (response.data.status_code === 200) {
                message.success(selectedProduct ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm mới thành công');
                setModalVisible(false);
                loadProducts();
            } else {
                message.error(response.data.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await axios.delete(API.spaProductDelete(id));

            if (response.data.status_code === 200) {
                message.success('Xóa sản phẩm thành công');
                loadProducts();
            } else {
                message.error(response.data.message || 'Không thể xóa sản phẩm');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            message.error(error.response?.data?.message || 'Không thể xóa sản phẩm');
        }
    };

    const handleStatusToggle = async (record: Product) => {
        try {
            const newStatus = !record.is_active;
            const response = await axios.put(API.spaProductUpdate(record.id), {
                is_active: newStatus,
            });

            if (response.data.status_code === 200) {
                message.success('Cập nhật trạng thái thành công');
                loadProducts();
            } else {
                message.error(response.data.message || 'Không thể cập nhật trạng thái');
            }
        } catch (error: any) {
            console.error('Status toggle error:', error);
            message.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(API.uploadImage, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data && response.data.status_code === 200) {
                const filePath = response.data.data?.filePath || response.data.data?.path;
                const fullUrl = `/files/${filePath}`;
                setImageUrl(fullUrl);
                message.success('Upload ảnh thành công');
            } else {
                message.error('Upload ảnh thất bại');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            message.error(error.response?.data?.message || 'Upload ảnh thất bại');
        } finally {
            setUploading(false);
        }
        return false;
    };

    // Bulk Add Handlers
    const handleBulkAdd = () => {
        setBulkProducts([
            { key: 1, ten_san_pham: '', danh_muc_id: null, gia_nhap: 0, gia_ban: 0, ton_kho: 0, don_vi_tinh: 'Chai' },
            { key: 2, ten_san_pham: '', danh_muc_id: null, gia_nhap: 0, gia_ban: 0, ton_kho: 0, don_vi_tinh: 'Chai' },
            { key: 3, ten_san_pham: '', danh_muc_id: null, gia_nhap: 0, gia_ban: 0, ton_kho: 0, don_vi_tinh: 'Chai' },
        ]);
        setBulkApplyAll({ danh_muc_id: false, ton_kho: false, don_vi_tinh: false });
        setBulkAddModalVisible(true);
    };

    const handleBulkAddRow = () => {
        const newKey = bulkProducts.length > 0 ? Math.max(...bulkProducts.map(p => p.key)) + 1 : 1;
        setBulkProducts([...bulkProducts, {
            key: newKey,
            ten_san_pham: '',
            danh_muc_id: null,
            gia_nhap: 0,
            gia_ban: 0,
            ton_kho: 0,
            don_vi_tinh: 'Chai'
        }]);
    };

    const handleBulkRemoveRow = (key: number) => {
        setBulkProducts(bulkProducts.filter(p => p.key !== key));
    };

    const handleBulkFieldChange = (key: number, field: string, value: any) => {
        const updated = bulkProducts.map(p => {
            if (p.key === key) {
                return { ...p, [field]: value };
            }
            return p;
        });

        // Apply to all if checkbox is checked
        if (bulkApplyAll[field as keyof typeof bulkApplyAll]) {
            setBulkProducts(updated.map(p => ({ ...p, [field]: value })));
        } else {
            setBulkProducts(updated);
        }
    };

    const handleBulkApplyAllChange = (field: string, checked: boolean) => {
        setBulkApplyAll({ ...bulkApplyAll, [field]: checked });

        // If checking, apply first item's value to all
        if (checked && bulkProducts.length > 0) {
            const firstValue = bulkProducts[0][field as keyof typeof bulkProducts[0]];
            setBulkProducts(bulkProducts.map(p => ({ ...p, [field]: firstValue })));
        }
    };

    const handleBulkSubmit = async () => {
        // Validate
        const validProducts = bulkProducts.filter(p => p.ten_san_pham && p.ten_san_pham.trim());

        if (validProducts.length === 0) {
            message.error('Vui lòng nhập ít nhất 1 sản phẩm');
            return;
        }

        setBulkSubmitting(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const product of validProducts) {
                try {
                    const payload = {
                        ten_san_pham: product.ten_san_pham,
                        danh_muc_id: product.danh_muc_id,
                        gia_nhap: product.gia_nhap || 0,
                        gia_ban: product.gia_ban || 0,
                        ton_kho: product.ton_kho || 0,
                        don_vi_tinh: product.don_vi_tinh || 'Chai',
                    };

                    const response = await axios.post(API.spaProductCreate, payload);
                    if (response.data.status_code === 200) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (error) {
                    errorCount++;
                    console.error('Error creating product:', error);
                }
            }

            if (successCount > 0) {
                message.success(`Tạo thành công ${successCount} sản phẩm`);
                setBulkAddModalVisible(false);
                loadProducts();
            }

            if (errorCount > 0) {
                message.warning(`Có ${errorCount} sản phẩm tạo thất bại`);
            }
        } catch (error: any) {
            console.error('Bulk add error:', error);
            message.error('Có lỗi xảy ra khi thêm sản phẩm');
        } finally {
            setBulkSubmitting(false);
        }
    };

    // Quick Create handlers
    const handleQuickCreateCategory = () => {
        categoryForm.resetFields();
        setCategoryModalVisible(true);
    };

    const handleCategorySubmit = async () => {
        try {
            const values = await categoryForm.validateFields();
            // Remove mo_ta field if not in database
            const payload = {
                ten_danh_muc: values.ten_danh_muc,
                thu_tu: values.thu_tu || 0,
            };
            const response = await axios.post(API.spaProductCategoryCreate, payload);

            if (response.data.status_code === 200) {
                message.success('Tạo danh mục mới thành công');
                setCategoryModalVisible(false);
                await loadCategories();
                const newCategoryId = response.data.data.id;
                form.setFieldsValue({ danh_muc_id: newCategoryId });
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleQuickCreateBrand = () => {
        brandForm.resetFields();
        setBrandModalVisible(true);
    };

    const handleBrandSubmit = async () => {
        try {
            const values = await brandForm.validateFields();
            const response = await axios.post(API.spaBrandCreate, values);

            if (response.data.status_code === 200) {
                message.success('Tạo thương hiệu mới thành công');
                setBrandModalVisible(false);
                await loadBrands();
                const newBrandId = response.data.data.id;
                form.setFieldsValue({ thuong_hieu_id: newBrandId });
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleQuickCreateOrigin = () => {
        originForm.resetFields();
        setOriginModalVisible(true);
    };

    const handleOriginSubmit = async () => {
        try {
            const values = await originForm.validateFields();
            const response = await axios.post(API.spaOriginCreate, values);

            if (response.data.status_code === 200) {
                message.success('Tạo xuất xứ mới thành công');
                setOriginModalVisible(false);
                await loadOrigins();
                const newOriginName = response.data.data?.data?.name || values.name;
                form.setFieldsValue({ xuat_xu: newOriginName });
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleQuickCreateUnit = () => {
        unitForm.resetFields();
        setUnitModalVisible(true);
    };

    const handleUnitSubmit = async () => {
        try {
            const values = await unitForm.validateFields();
            const response = await axios.post(API.spaProductUnitCreate, values);

            if (response.data.status_code === 200) {
                message.success('Tạo đơn vị mới thành công');
                unitForm.resetFields();
                setUnitModalVisible(false);
                await loadUnits();
                const newUnitName = response.data.data?.name || values.name;
                form.setFieldsValue({ don_vi_tinh: newUnitName });
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const getStockStatus = (product: Product) => {
        const tonKho = product.ton_kho ?? 0;
        const tonKhoToiThieu = product.ton_kho_toi_thieu ?? 0;

        if (tonKho === 0) {
            return { text: 'Hết hàng', color: 'red', icon: <WarningOutlined /> };
        } else if (tonKho <= tonKhoToiThieu) {
            return { text: 'Sắp hết', color: 'orange', icon: <WarningOutlined /> };
        }
        return { text: 'Còn hàng', color: 'green', icon: <CheckCircleOutlined /> };
    };

    const calculateProfit = (product: Product) => {
        const giaBan = product.gia_ban ?? 0;
        const giaNhap = product.gia_nhap ?? 0;
        return giaBan - giaNhap;
    };

    const calculateProfitMargin = (product: Product) => {
        const giaNhap = product.gia_nhap ?? 0;
        const giaBan = product.gia_ban ?? 0;
        if (giaNhap === 0) return 0;
        return ((giaBan - giaNhap) / giaNhap) * 100;
    };

    // Table columns
    const columns: ColumnsType<Product> = [
        {
            title: 'Mã SP',
            dataIndex: 'ma_san_pham',
            key: 'ma_san_pham',
            width: 100,
            fixed: 'left',
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'hinh_anh',
            key: 'hinh_anh',
            width: 80,
            render: (url: string) => url ? (
                <Image src={url} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
            ) : (
                <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SkinOutlined style={{ fontSize: 20, color: '#999' }} />
                </div>
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'ten_san_pham',
            key: 'ten_san_pham',
            width: 250,
            render: (text: string, record: Product) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    {record.danh_muc && (
                        <Tag color="blue">{record.danh_muc.ten_danh_muc}</Tag>
                    )}
                    {record.ten_thuong_hieu && (
                        <Tag color="purple">{record.ten_thuong_hieu}</Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Giá nhập',
            dataIndex: 'gia_nhap',
            key: 'gia_nhap',
            width: 120,
            align: 'right',
            render: (value: number) => `${Math.round(value ?? 0).toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Giá bán',
            dataIndex: 'gia_ban',
            key: 'gia_ban',
            width: 120,
            align: 'right',
            render: (value: number) => (
                <span style={{ fontWeight: 500, color: '#52c41a' }}>
                    {Math.round(value ?? 0).toLocaleString('vi-VN')} VNĐ
                </span>
            ),
        },
        {
            title: 'Lợi nhuận',
            key: 'profit',
            width: 120,
            align: 'right',
            render: (_, record) => {
                const profit = calculateProfit(record);
                const margin = calculateProfitMargin(record);
                return (
                    <Tooltip title={`Tỷ suất: ${margin.toFixed(1)}%`}>
                        <span style={{ color: profit > 0 ? '#52c41a' : '#999' }}>
                            {profit.toLocaleString()} VNĐ
                        </span>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Tồn kho',
            dataIndex: 'ton_kho',
            key: 'ton_kho',
            width: 120,
            align: 'center',
            render: (value: number, record: Product) => {
                const status = getStockStatus(record);
                return (
                    <Tooltip title={`Tối thiểu: ${record.ton_kho_toi_thieu ?? 0}`}>
                        <Badge
                            count={value ?? 0}
                            showZero
                            color={status.color}
                            style={{ fontSize: 14 }}
                        />
                    </Tooltip>
                );
            },
            sorter: (a, b) => (a.ton_kho ?? 0) - (b.ton_kho ?? 0),
        },
        {
            title: 'Đã bán',
            dataIndex: 'so_luong_da_ban',
            key: 'so_luong_da_ban',
            width: 100,
            align: 'center',
            render: (value: number) => <Badge count={value ?? 0} showZero color="blue" />,
            sorter: (a, b) => (a.so_luong_da_ban ?? 0) - (b.so_luong_da_ban ?? 0),
        },
        {
            title: 'Doanh thu',
            dataIndex: 'doanh_thu',
            key: 'doanh_thu',
            width: 150,
            align: 'right',
            render: (value: number) => `${(value ?? 0).toLocaleString()} VNĐ`,
            sorter: (a, b) => (a.doanh_thu ?? 0) - (b.doanh_thu ?? 0),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            render: (_, record: Product) => {
                const status = getStockStatus(record);
                return (
                    <Tag color={status.color} icon={status.icon}>
                        {status.text}
                    </Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        Xem
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa sản phẩm này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Grid view
    const renderGridView = () => (
        <Row gutter={[16, 16]}>
            {products.map(product => {
                const stockStatus = getStockStatus(product);
                const profit = calculateProfit(product);
                const margin = calculateProfitMargin(product);

                return (
                    <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                        <Badge.Ribbon text={stockStatus.text} color={stockStatus.color}>
                            <Card
                                hoverable
                                cover={
                                    product.hinh_anh ? (
                                        <Image
                                            src={product.hinh_anh}
                                            height={200}
                                            style={{ objectFit: 'cover' }}
                                            preview={false}
                                        />
                                    ) : (
                                        <div style={{ height: 200, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <SkinOutlined style={{ fontSize: 48, color: '#999' }} />
                                        </div>
                                    )
                                }
                                actions={[
                                    <EyeOutlined key="view" onClick={() => handleView(product)} />,
                                    <EditOutlined key="edit" onClick={() => handleEdit(product)} />,
                                    <Popconfirm
                                        title="Xác nhận xóa?"
                                        onConfirm={() => handleDelete(product.id)}
                                        key="delete"
                                    >
                                        <DeleteOutlined />
                                    </Popconfirm>,
                                ]}
                            >
                                <Card.Meta
                                    title={<div style={{ marginBottom: 8 }}>{product.ten_san_pham}</div>}
                                    description={
                                        <div>
                                            {product.danh_muc && (
                                                <Tag color="blue" style={{ marginBottom: 8 }}>{product.danh_muc.ten_danh_muc}</Tag>
                                            )}
                                            <div style={{ marginBottom: 4 }}>
                                                <strong style={{ color: '#52c41a', fontSize: 16 }}>
                                                    {(product.gia_ban ?? 0).toLocaleString()} VNĐ
                                                </strong>
                                            </div>
                                            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                                                Tồn kho: <strong>{product.ton_kho ?? 0}</strong> {product.don_vi_tinh}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#666' }}>
                                                Đã bán: {product.so_luong_da_ban ?? 0} {product.don_vi_tinh}
                                            </div>
                                            <div style={{ fontSize: 12, color: profit > 0 ? '#52c41a' : '#999', marginTop: 4 }}>
                                                Lợi nhuận: {(profit ?? 0).toLocaleString()} VNĐ ({(margin ?? 0).toFixed(1)}%)
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        </Badge.Ribbon>
                    </Col>
                );
            })}
        </Row>
    );

    return (
        <div style={{ padding: 24 }}>
            {/* Stats Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng sản phẩm"
                            value={stats.total}
                            prefix={<StockOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Sắp hết hàng"
                            value={stats.lowStock}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Hết hàng"
                            value={stats.outOfStock}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Giá trị tồn kho"
                            value={stats.totalValue}
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title={
                    <Space>
                        <SkinOutlined />
                        <span>Quản lý Sản phẩm</span>
                        <Badge count={pagination.total} showZero />
                    </Space>
                }
                extra={
                    <Space>
                        <Button
                            type={viewMode === 'table' ? 'primary' : 'default'}
                            icon={<BarsOutlined />}
                            onClick={() => setViewMode('table')}
                        />
                        <Button
                            type={viewMode === 'grid' ? 'primary' : 'default'}
                            icon={<AppstoreOutlined />}
                            onClick={() => setViewMode('grid')}
                        />
                        <Button type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleBulkAdd}
                        >
                            Thêm nhanh
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                        >
                            Thêm sản phẩm
                        </Button>
                    </Space>
                }
            >
                {/* Filters */}
                <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Input.Search
                                placeholder="Tìm kiếm tên, mã sản phẩm..."
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Danh mục"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedCategory}
                                onChange={setSelectedCategory}
                            >
                                {categories.map(cat => (
                                    <Option key={cat.id} value={cat.id}>
                                        {cat.ten_danh_muc}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Tồn kho"
                                allowClear
                                style={{ width: '100%' }}
                                value={stockFilter}
                                onChange={setStockFilter}
                            >
                                <Option value="in_stock">Còn hàng</Option>
                                <Option value="low_stock">Sắp hết</Option>
                                <Option value="out_of_stock">Hết hàng</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Trạng thái"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                            >
                                <Option value="con_hang">Còn hàng</Option>
                                <Option value="het_hang">Hết hàng</Option>
                            </Select>
                        </Col>
                    </Row>
                </Space>

                {/* Low Stock Warning */}
                {stats.lowStock > 0 && (
                    <Alert
                        message={`Cảnh báo: Có ${stats.lowStock} sản phẩm sắp hết hàng`}
                        type="warning"
                        showIcon
                        closable
                        style={{ marginBottom: 16 }}
                    />
                )}

                {/* Content */}
                {viewMode === 'table' ? (
                    <Table
                        columns={columns}
                        dataSource={products}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} sản phẩm`,
                            onChange: (page, pageSize) => {
                                setPagination({ ...pagination, current: page, pageSize });
                            },
                        }}
                        scroll={{ x: 1600 }}
                    />
                ) : (
                    renderGridView()
                )}
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                width={900}
                okText={selectedProduct ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                maskClosable={false}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="ma_san_pham"
                                label="Mã sản phẩm"
                                tooltip="Để trống để tự động tạo mã (VD: SP00001)"
                            >
                                <Input placeholder="Tự động (SP00001, SP00002...)" />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                name="ten_san_pham"
                                label="Tên sản phẩm"
                                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                            >
                                <Input placeholder="VD: Kem dưỡng da..." />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="danh_muc_id"
                                label={
                                    <Space>
                                        <span>Danh mục</span>
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={handleQuickCreateCategory}
                                        >
                                            Thêm nhanh
                                        </Button>
                                    </Space>
                                }
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                            >
                                <Select placeholder="Chọn danh mục">
                                    {categories.map(cat => (
                                        <Option key={cat.id} value={cat.id}>
                                            {cat.ten_danh_muc}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="thuong_hieu_id"
                                label={
                                    <Space>
                                        <span>Thương hiệu</span>
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={handleQuickCreateBrand}
                                        >
                                            Thêm nhanh
                                        </Button>
                                    </Space>
                                }
                            >
                                <Select
                                    placeholder="Chọn thương hiệu"
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                >
                                    {brands.map(brand => (
                                        <Option key={brand.id} value={brand.id} label={brand.ten_thuong_hieu}>
                                            {brand.color && (
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        backgroundColor: brand.color,
                                                        marginRight: 8
                                                    }}
                                                />
                                            )}
                                            {brand.ten_thuong_hieu}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="xuat_xu"
                                label={
                                    <Space>
                                        <span>Xuất xứ</span>
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={handleQuickCreateOrigin}
                                        >
                                            Thêm nhanh
                                        </Button>
                                    </Space>
                                }
                            >
                                <Select
                                    placeholder="Chọn xuất xứ"
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                >
                                    {origins.map(origin => (
                                        <Option key={origin.id} value={origin.name} label={origin.name}>
                                            {origin.color && (
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        backgroundColor: origin.color,
                                                        marginRight: 8
                                                    }}
                                                />
                                            )}
                                            {origin.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="gia_nhap"
                                label="Giá nhập"
                                rules={[{ required: true, message: 'Vui lòng nhập giá nhập' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="gia_ban"
                                label="Giá bán"
                                rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="price_member"
                                label="Giá thành viên"
                                tooltip="Giá dành cho khách hàng đã mua thẻ giá trị hoặc gói dịch vụ"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                    placeholder="Để trống nếu không áp dụng"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="ton_kho"
                                label="Tồn kho"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="ton_kho_toi_thieu"
                                label="Tồn kho tối thiểu"
                                initialValue={10}
                            >
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="han_su_dung" label="Hạn sử dụng">
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày hết hạn"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="trang_thai" label="Trạng thái" initialValue="con_hang">
                                <Select>
                                    <Option value="con_hang">Còn hàng</Option>
                                    <Option value="het_hang">Hết hàng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="mo_ta" label="Mô tả">
                                <TextArea rows={3} placeholder="Mô tả sản phẩm..." />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item label="Hình ảnh">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Upload
                                        showUploadList={false}
                                        beforeUpload={handleImageUpload}
                                        accept="image/*"
                                    >
                                        <Button icon={<UploadOutlined />} loading={uploading}>
                                            Upload hình ảnh
                                        </Button>
                                    </Upload>
                                    {imageUrl && (
                                        <Image src={imageUrl} width={200} />
                                    )}
                                </Space>
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="don_vi_tinh"
                                label="Đơn vị tính"
                                initialValue="Chai"
                            >
                                <Select
                                    placeholder="Chọn đơn vị"
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                style={{ width: '100%' }}
                                                onClick={handleQuickCreateUnit}
                                            >
                                                Thêm đơn vị mới
                                            </Button>
                                        </>
                                    )}
                                >
                                    {units.map((unit) => (
                                        <Option key={unit.id} value={unit.name}>
                                            {unit.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        {/* Đơn vị quy đổi */}
                        <Col span={24}>
                            <Divider orientation="left">Đơn vị quy đổi (Tùy chọn)</Divider>
                            <Alert
                                message="Thêm các đơn vị quy đổi để dễ dàng sử dụng sản phẩm với nhiều đơn vị khác nhau"
                                description="Ví dụ: 1 Chai = 500 ml (nhập 500 ml), 1 Chai = 10 Lần (nhập 10 lần)"
                                type="info"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                            <Form.List name="don_vi_quy_doi">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field, index) => {
                                            const { key, ...restField } = field;
                                            return (
                                                <Card
                                                    key={key}
                                                    size="small"
                                                    style={{ marginBottom: 8 }}
                                                    title={`Đơn vị ${index + 1}`}
                                                    extra={
                                                        <MinusCircleOutlined
                                                            onClick={() => remove(field.name)}
                                                            style={{ color: '#ff4d4f' }}
                                                        />
                                                    }
                                                >
                                                    <Row gutter={16}>
                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[field.name, 'don_vi']}
                                                                label="Đơn vị"
                                                                rules={[
                                                                    { required: true, message: 'Vui lòng chọn đơn vị' },
                                                                    {
                                                                        validator: (_, value) => {
                                                                            const donViGoc = form.getFieldValue('don_vi_tinh');
                                                                            if (value && value === donViGoc) {
                                                                                return Promise.reject('Đơn vị quy đổi phải khác đơn vị gốc');
                                                                            }
                                                                            return Promise.resolve();
                                                                        }
                                                                    }
                                                                ]}
                                                            >
                                                                <Select placeholder="Chọn đơn vị">
                                                                    {units.map((unit) => (
                                                                        <Option key={unit.id} value={unit.name}>
                                                                            {unit.name}
                                                                        </Option>
                                                                    ))}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[field.name, 'ty_le']}
                                                                label="Số lượng"
                                                                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                                                                tooltip="1 đơn vị gốc = bao nhiêu đơn vị này"
                                                            >
                                                                <InputNumber
                                                                    style={{ width: '100%' }}
                                                                    min={1}
                                                                    step={1}
                                                                    precision={0}
                                                                    placeholder="500"
                                                                    addonBefore={
                                                                        <span style={{ fontSize: 12 }}>
                                                                            1 {form.getFieldValue('don_vi_tinh') || 'đơn vị gốc'} =
                                                                        </span>
                                                                    }
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[field.name, 'ghi_chu']}
                                                                label="Ghi chú"
                                                            >
                                                                <Input placeholder="VD: Chai 500ml" />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            );
                                        })}
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            Thêm đơn vị quy đổi
                                        </Button>
                                    </>
                                )}
                            </Form.List>
                        </Col>


                    </Row>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title={
                    <Space>
                        <SkinOutlined />
                        <span>Chi tiết sản phẩm</span>
                    </Space>
                }
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={650}
                extra={
                    <Space>
                        <Button icon={<EditOutlined />} type="primary" onClick={() => {
                            setDetailDrawerVisible(false);
                            handleEdit(selectedProduct!);
                        }}>
                            Chỉnh sửa
                        </Button>
                    </Space>
                }
            >
                {selectedProduct && (
                    <div>
                        {/* Product Image & Title */}
                        <Card
                            bordered={false}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                marginBottom: 16,
                                borderRadius: 12
                            }}
                            bodyStyle={{ padding: 20 }}
                        >
                            <Row gutter={16} align="middle">
                                <Col span={8}>
                                    {selectedProduct.hinh_anh ? (
                                        <Image
                                            src={selectedProduct.hinh_anh}
                                            style={{
                                                width: '100%',
                                                borderRadius: 8,
                                                border: '3px solid white'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            paddingTop: '100%',
                                            background: 'rgba(255,255,255,0.2)',
                                            borderRadius: 8,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}>
                                            <SkinOutlined style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                fontSize: 40,
                                                color: 'white'
                                            }} />
                                        </div>
                                    )}
                                </Col>
                                <Col span={16}>
                                    <div style={{ color: 'white' }}>
                                        <h2 style={{ color: 'white', marginBottom: 8 }}>
                                            {selectedProduct.ten_san_pham}
                                        </h2>
                                        <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 4 }}>
                                            <Tag color="blue">{selectedProduct.ma_san_pham}</Tag>
                                        </p>
                                        <Space>
                                            {selectedProduct.danh_muc && (
                                                <Tag color="cyan">{selectedProduct.danh_muc.ten_danh_muc}</Tag>
                                            )}
                                            {selectedProduct.ten_thuong_hieu && (
                                                <Tag color="purple">{selectedProduct.ten_thuong_hieu}</Tag>
                                            )}
                                        </Space>
                                    </div>
                                </Col>
                            </Row>
                        </Card>

                        {/* Stock Status Alert */}
                        <Alert
                            message={getStockStatus(selectedProduct).text}
                            description={
                                <Space direction="vertical" size={0}>
                                    <span>Tồn kho: <strong>{selectedProduct.ton_kho ?? 0}</strong> {selectedProduct.don_vi_tinh}</span>
                                    <span>Tối thiểu: {selectedProduct.ton_kho_toi_thieu ?? 0} {selectedProduct.don_vi_tinh}</span>
                                </Space>
                            }
                            type={(selectedProduct.ton_kho ?? 0) === 0 ? 'error' : (selectedProduct.ton_kho ?? 0) <= (selectedProduct.ton_kho_toi_thieu ?? 0) ? 'warning' : 'success'}
                            showIcon
                            icon={getStockStatus(selectedProduct).icon}
                            style={{ marginBottom: 16 }}
                        />

                        {/* Price Cards */}
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={6}>
                                <Card size="small">
                                    <Statistic
                                        title="Giá nhập"
                                        value={selectedProduct.gia_nhap ?? 0}
                                        precision={0}
                                        valueStyle={{ color: '#1890ff', fontSize: 16 }}
                                        suffix="đ"
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card size="small">
                                    <Statistic
                                        title="Giá bán"
                                        value={selectedProduct.gia_ban ?? 0}
                                        precision={0}
                                        valueStyle={{ color: '#52c41a', fontSize: 16 }}
                                        suffix="đ"
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card size="small">
                                    <Statistic
                                        title="Giá thành viên"
                                        value={selectedProduct.price_member ?? 0}
                                        precision={0}
                                        valueStyle={{ color: '#faad14', fontSize: 16 }}
                                        suffix="đ"
                                    />
                                    {!selectedProduct.price_member && (
                                        <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Chưa áp dụng</div>
                                    )}
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card size="small">
                                    <Statistic
                                        title="Lợi nhuận"
                                        value={calculateProfit(selectedProduct) ?? 0}
                                        precision={0}
                                        valueStyle={{ color: '#f5222d', fontSize: 16 }}
                                        suffix="đ"
                                        prefix={
                                            <Tooltip title={`Tỷ suất: ${calculateProfitMargin(selectedProduct).toFixed(1)}%`}>
                                                <DollarOutlined />
                                            </Tooltip>
                                        }
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Sales Performance */}
                        <Card
                            title={<Space><BarChartOutlined /> Hiệu suất bán hàng</Space>}
                            size="small"
                            style={{ marginBottom: 16 }}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Statistic
                                        title="Đã bán"
                                        value={selectedProduct.so_luong_da_ban ?? 0}
                                        suffix={selectedProduct.don_vi_tinh}
                                        valueStyle={{ fontSize: 20 }}
                                    />
                                    <Progress
                                        percent={Math.min(100, ((selectedProduct.so_luong_da_ban ?? 0) / ((selectedProduct.ton_kho ?? 0) + (selectedProduct.so_luong_da_ban ?? 0))) * 100)}
                                        strokeColor="#52c41a"
                                        format={(percent) => `${percent?.toFixed(0)}%`}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Doanh thu"
                                        value={selectedProduct.doanh_thu ?? 0}
                                        precision={0}
                                        suffix="đ"
                                        valueStyle={{ fontSize: 20, color: '#52c41a' }}
                                    />
                                </Col>
                            </Row>
                        </Card>

                        {/* Unit Conversions */}
                        {selectedProduct.don_vi_quy_doi && selectedProduct.don_vi_quy_doi.length > 0 && (
                            <Card
                                title={<Space><SwapOutlined /> Đơn vị quy đổi</Space>}
                                size="small"
                                style={{ marginBottom: 16 }}
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    {selectedProduct.don_vi_quy_doi.map((conversion, index) => (
                                        <Card
                                            key={index}
                                            size="small"
                                            style={{ background: '#f5f5f5' }}
                                        >
                                            <Row align="middle" gutter={16}>
                                                <Col span={12}>
                                                    <div style={{ fontSize: 16, fontWeight: 500 }}>
                                                        1 {selectedProduct.don_vi_tinh} = {conversion.ty_le} {conversion.don_vi}
                                                    </div>
                                                </Col>
                                                <Col span={12}>
                                                    {conversion.ghi_chu && (
                                                        <div style={{ fontSize: 13, color: '#666' }}>
                                                            <i>{conversion.ghi_chu}</i>
                                                        </div>
                                                    )}
                                                </Col>
                                            </Row>
                                        </Card>
                                    ))}
                                </Space>
                            </Card>
                        )}

                        {/* Product Info */}
                        <Card
                            title={<Space><SkinOutlined /> Thông tin sản phẩm</Space>}
                            size="small"
                            style={{ marginBottom: 16 }}
                        >
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Đơn vị tính chính">
                                    <Tag color="blue" style={{ fontSize: 14 }}>
                                        {selectedProduct.don_vi_tinh}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Xuất xứ">
                                    {selectedProduct.xuat_xu || <i style={{ color: '#999' }}>Chưa cập nhật</i>}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    {selectedProduct.trang_thai === 'con_hang' ? (
                                        <Tag color="success" icon={<CheckCircleOutlined />}>Còn hàng</Tag>
                                    ) : (
                                        <Tag color="error" icon={<CloseCircleOutlined />}>Hết hàng</Tag>
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tồn kho tối thiểu">
                                    <Badge
                                        count={selectedProduct.ton_kho_toi_thieu ?? 0}
                                        showZero
                                        color={(selectedProduct.ton_kho ?? 0) <= (selectedProduct.ton_kho_toi_thieu ?? 0) ? 'red' : 'green'}
                                    />
                                    <span style={{ marginLeft: 8 }}>{selectedProduct.don_vi_tinh}</span>
                                </Descriptions.Item>
                                {selectedProduct.ngay_het_han && (
                                    <Descriptions.Item label="Hạn sử dụng">
                                        <Space>
                                            <CalendarOutlined />
                                            {dayjs(selectedProduct.ngay_het_han).format('DD/MM/YYYY')}
                                            {dayjs(selectedProduct.ngay_het_han).isBefore(dayjs()) && (
                                                <Tag color="red">Đã hết hạn</Tag>
                                            )}
                                            {dayjs(selectedProduct.ngay_het_han).isBefore(dayjs().add(30, 'days')) &&
                                             dayjs(selectedProduct.ngay_het_han).isAfter(dayjs()) && (
                                                <Tag color="orange">Sắp hết hạn</Tag>
                                            )}
                                        </Space>
                                    </Descriptions.Item>
                                )}
                                <Descriptions.Item label="Ngày tạo">
                                    <Space>
                                        <ClockCircleOutlined />
                                        {dayjs(selectedProduct.created_at).format('DD/MM/YYYY HH:mm')}
                                    </Space>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Description */}
                        {selectedProduct.mo_ta && (
                            <Card
                                title={<Space><FileTextOutlined /> Mô tả sản phẩm</Space>}
                                size="small"
                            >
                                <p style={{ margin: 0, lineHeight: 1.8 }}>{selectedProduct.mo_ta}</p>
                            </Card>
                        )}
                    </div>
                )}
            </Drawer>

            {/* Bulk Add Modal */}
            <Modal
                title="Thêm nhanh sản phẩm"
                open={bulkAddModalVisible}
                onCancel={() => setBulkAddModalVisible(false)}
                width={1200}
                footer={[
                    <Button key="cancel" onClick={() => setBulkAddModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={bulkSubmitting}
                        onClick={handleBulkSubmit}
                    >
                        Lưu tất cả
                    </Button>,
                ]}
            >
                <div style={{ marginBottom: 16 }}>
                    <Alert
                        message="Nhập thông tin sản phẩm vào bảng dưới đây. Chỉ cần nhập Tên sản phẩm là bắt buộc."
                        type="info"
                        showIcon
                        closable
                    />
                </div>

                <Table
                    dataSource={bulkProducts}
                    pagination={false}
                    size="small"
                    scroll={{ x: 1000 }}
                    rowKey="key"
                >
                    <Table.Column
                        title="STT"
                        width={60}
                        render={(_, __, index) => index + 1}
                    />
                    <Table.Column
                        title={<span style={{ color: 'red' }}>* Tên sản phẩm</span>}
                        dataIndex="ten_san_pham"
                        width={200}
                        render={(value, record: any) => (
                            <Input
                                value={value}
                                placeholder="Nhập tên sản phẩm"
                                onChange={(e) => handleBulkFieldChange(record.key, 'ten_san_pham', e.target.value)}
                            />
                        )}
                    />
                    <Table.Column
                        title={
                            <div>
                                <Checkbox
                                    checked={bulkApplyAll.danh_muc_id}
                                    onChange={(e) => handleBulkApplyAllChange('danh_muc_id', e.target.checked)}
                                >
                                    Áp dụng tất cả
                                </Checkbox>
                                <div>Danh mục</div>
                            </div>
                        }
                        dataIndex="danh_muc_id"
                        width={180}
                        render={(value, record: any) => (
                            <Select
                                value={value}
                                placeholder="Chọn danh mục"
                                style={{ width: '100%' }}
                                allowClear
                                onChange={(val) => handleBulkFieldChange(record.key, 'danh_muc_id', val)}
                            >
                                {categories.map(cat => (
                                    <Option key={cat.id} value={cat.id}>
                                        {cat.ten_danh_muc}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    />
                    <Table.Column
                        title="Giá nhập"
                        dataIndex="gia_nhap"
                        width={120}
                        render={(value, record: any) => (
                            <InputNumber
                                value={value}
                                style={{ width: '100%' }}
                                min={0}
                                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(val) => val!.replace(/\$\s?|(,*)/g, '') as any}
                                onChange={(val) => handleBulkFieldChange(record.key, 'gia_nhap', val || 0)}
                            />
                        )}
                    />
                    <Table.Column
                        title="Giá bán"
                        dataIndex="gia_ban"
                        width={120}
                        render={(value, record: any) => (
                            <InputNumber
                                value={value}
                                style={{ width: '100%' }}
                                min={0}
                                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(val) => val!.replace(/\$\s?|(,*)/g, '') as any}
                                onChange={(val) => handleBulkFieldChange(record.key, 'gia_ban', val || 0)}
                            />
                        )}
                    />
                    <Table.Column
                        title={
                            <div>
                                <Checkbox
                                    checked={bulkApplyAll.ton_kho}
                                    onChange={(e) => handleBulkApplyAllChange('ton_kho', e.target.checked)}
                                >
                                    Áp dụng tất cả
                                </Checkbox>
                                <div>Tồn kho</div>
                            </div>
                        }
                        dataIndex="ton_kho"
                        width={120}
                        render={(value, record: any) => (
                            <InputNumber
                                value={value}
                                style={{ width: '100%' }}
                                min={0}
                                onChange={(val) => handleBulkFieldChange(record.key, 'ton_kho', val || 0)}
                            />
                        )}
                    />
                    <Table.Column
                        title={
                            <div>
                                <Checkbox
                                    checked={bulkApplyAll.don_vi_tinh}
                                    onChange={(e) => handleBulkApplyAllChange('don_vi_tinh', e.target.checked)}
                                >
                                    Áp dụng tất cả
                                </Checkbox>
                                <div>Đơn vị</div>
                            </div>
                        }
                        dataIndex="don_vi_tinh"
                        width={140}
                        render={(value, record: any) => (
                            <Select
                                value={value}
                                style={{ width: '100%' }}
                                onChange={(val) => handleBulkFieldChange(record.key, 'don_vi_tinh', val)}
                            >
                                <Option value="Chai">Chai</Option>
                                <Option value="Hộp">Hộp</Option>
                                <Option value="Tuýp">Tuýp</Option>
                                <Option value="Lọ">Lọ</Option>
                                <Option value="Cái">Cái</Option>
                                <Option value="Gói">Gói</Option>
                            </Select>
                        )}
                    />
                    <Table.Column
                        title="Thao tác"
                        width={80}
                        fixed="right"
                        render={(_, record: any) => (
                            <Button
                                type="link"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => handleBulkRemoveRow(record.key)}
                                disabled={bulkProducts.length === 1}
                            />
                        )}
                    />
                </Table>

                <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={handleBulkAddRow}
                    style={{ marginTop: 16 }}
                >
                    Thêm hàng
                </Button>
            </Modal>

            {/* Quick Create Category Modal */}
            <Modal
                title="Thêm danh mục mới"
                open={categoryModalVisible}
                onCancel={() => setCategoryModalVisible(false)}
                onOk={handleCategorySubmit}
                width={500}
                okText="Tạo mới"
                cancelText="Hủy"
            >
                <Form form={categoryForm} layout="vertical">
                    <Form.Item
                        name="ten_danh_muc"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                    >
                        <Input placeholder="VD: Chăm sóc da mặt" />
                    </Form.Item>
                    <Form.Item name="mo_ta" label="Mô tả">
                        <TextArea rows={3} placeholder="Mô tả về danh mục..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Quick Create Brand Modal */}
            <Modal
                title="Thêm thương hiệu mới"
                open={brandModalVisible}
                onCancel={() => setBrandModalVisible(false)}
                onOk={handleBrandSubmit}
                width={500}
                okText="Tạo mới"
                cancelText="Hủy"
            >
                <Form form={brandForm} layout="vertical">
                    <Form.Item
                        name="ten_thuong_hieu"
                        label="Tên thương hiệu"
                        rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu' }]}
                    >
                        <Input placeholder="VD: L'Oreal, Olay..." />
                    </Form.Item>
                    <Form.Item name="color" label="Màu đánh dấu">
                        <Input type="color" />
                    </Form.Item>
                    <Form.Item name="note" label="Ghi chú">
                        <TextArea rows={3} placeholder="Ghi chú về thương hiệu..." />
                    </Form.Item>
                    <Form.Item name="sort_order" label="Thứ tự" initialValue={0}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Quick Create Origin Modal */}
            <Modal
                title="Thêm xuất xứ mới"
                open={originModalVisible}
                onCancel={() => setOriginModalVisible(false)}
                onOk={handleOriginSubmit}
                width={500}
                okText="Tạo mới"
                cancelText="Hủy"
            >
                <Form form={originForm} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên xuất xứ"
                        rules={[{ required: true, message: 'Vui lòng nhập tên xuất xứ' }]}
                    >
                        <Input placeholder="VD: Pháp, Hàn Quốc, Nhật Bản..." />
                    </Form.Item>
                    <Form.Item name="color" label="Màu đánh dấu">
                        <Input type="color" />
                    </Form.Item>
                    <Form.Item name="note" label="Ghi chú">
                        <TextArea rows={3} placeholder="Ghi chú về xuất xứ..." />
                    </Form.Item>
                    <Form.Item name="sort_order" label="Thứ tự" initialValue={0}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Quick Create Unit Modal */}
            <Modal
                title="Thêm đơn vị mới"
                open={unitModalVisible}
                onCancel={() => setUnitModalVisible(false)}
                onOk={handleUnitSubmit}
                width={500}
                okText="Tạo mới"
                cancelText="Hủy"
            >
                <Form form={unitForm} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên đơn vị"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đơn vị' }]}
                    >
                        <Input placeholder="VD: Chai, Hộp, ml, Lít..." />
                    </Form.Item>
                    <Form.Item name="color" label="Màu đánh dấu">
                        <Input type="color" defaultValue="#1890ff" />
                    </Form.Item>
                    <Form.Item name="note" label="Ghi chú">
                        <TextArea rows={3} placeholder="Ghi chú về đơn vị..." />
                    </Form.Item>
                    <Form.Item name="sort_order" label="Thứ tự" initialValue={0}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductList;
