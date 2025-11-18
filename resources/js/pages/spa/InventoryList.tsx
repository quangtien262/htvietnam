import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, InputNumber, Modal, Form, Input, Select, message, DatePicker, Row, Col, Statistic, Upload, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined, ShopOutlined, InboxOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';
import dayjs from 'dayjs';
import { API } from '../../common/api';

const { Search } = Input;
const { TabPane } = Tabs;

interface InventoryItem {
    id: number;
    ma_san_pham: string;
    ten_san_pham: string;
    danh_muc_id?: number;
    danh_muc_ten?: string;
    don_vi_tinh: string;
    ton_kho: number;
    ton_kho_toi_thieu: number;
    gia_nhap: number;
    gia_ban: number;
    trang_thai: string;
}

interface InventoryTransaction {
    id: number;
    san_pham_id: number;
    loai: 'nhap' | 'xuat' | 'dieu_chinh';
    so_luong: number;
    gia_nhap?: number;
    nha_cung_cap?: string;
    ly_do?: string;
    nguoi_nhap: string;
    ngay_nhap: string;
    ghi_chu?: string;
}

interface BulkImportItem {
    san_pham_id?: number;
    ma_san_pham?: string;
    ten_san_pham?: string;
    so_luong: number;
    gia_nhap: number;
    nha_cung_cap_id?: number;
}

interface Supplier {
    id: number;
    ma_ncc: string;
    ten_ncc: string;
    nguoi_lien_he?: string;
    sdt?: string;
    email?: string;
    is_active: boolean;
}

const InventoryList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
    const [products, setProducts] = useState<InventoryItem[]>([]);
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [bulkImportModalVisible, setBulkImportModalVisible] = useState(false);
    const [transactionModalVisible, setTransactionModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [bulkItems, setBulkItems] = useState<BulkImportItem[]>([]);
    const [uploadedFile, setUploadedFile] = useState<UploadFile | null>(null);
    const [uploading, setUploading] = useState(false);
    const [applySupplierToAll, setApplySupplierToAll] = useState(false);
    const [form] = Form.useForm();
    const [bulkForm] = Form.useForm();

    useEffect(() => {
        fetchInventory();
        fetchCategories();
        fetchSuppliers();
        fetchProducts();
        fetchBranches();
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [selectedBranch, statusFilter]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            console.log('Fetching inventory with params:', {
                per_page: 1000,
                trang_thai: statusFilter === 'all' ? undefined : statusFilter,
                chi_nhanh_id: selectedBranch || undefined
            });
            const response = await axios.get(API.spaInventoryStockList, {
                params: {
                    per_page: 1000,
                    trang_thai: statusFilter === 'all' ? undefined : statusFilter,
                    chi_nhanh_id: selectedBranch || undefined
                }
            });

            console.log('Inventory response:', response.data);
            // Handle both paginated and non-paginated responses
            const data = response.data?.data?.data || response.data?.data || [];
            console.log('Parsed inventory data:', data);
            setInventoryData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            message.error('Không thể tải dữ liệu kho');
            setInventoryData([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(API.spaProductCategoryList);
            // Handle both response structures: wrapped in data.data or direct data
            const data = response.data?.data?.data || response.data?.data || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(API.spaProductList, {
                params: { per_page: 1000 }
            });
            const data = response.data?.data?.data || response.data?.data || [];
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get(API.nhaCungCapList);
            const suppliersData = response.data.data || response.data || [];
            // Filter only active suppliers
            setSuppliers(Array.isArray(suppliersData) ? suppliersData.filter((s: Supplier) => s.is_active) : []);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            setSuppliers([]);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await axios.get(API.spaBranchList);
            if (response.data.success) {
                const data = response.data.data;
                const branchList = data.data || data || [];
                setBranches(Array.isArray(branchList) ? branchList.filter((b: any) => b.trang_thai === 'active') : []);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            setBranches([]);
        }
    };

    const fetchTransactions = async (productId: number) => {
        try {
            const response = await axios.get(API.spaInventoryTransactions(productId));
            setTransactions(response.data.data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const handleStockAdjustment = async (values: any) => {
        try {
            const donGia = values.gia_nhap || selectedProduct?.gia_nhap || 0;
            const soLuongNhap = Math.abs(values.so_luong); // Always positive

            const payload = {
                chi_nhanh_id: values.chi_nhanh_id || 1,
                nha_cung_cap_id: values.nha_cung_cap ? suppliers.find(s => s.ten_ncc === values.nha_cung_cap)?.id : null,
                ngay_nhap: values.ngay_nhap?.format('YYYY-MM-DD HH:mm:ss') || dayjs().format('YYYY-MM-DD HH:mm:ss'),
                ghi_chu: values.ghi_chu,
                loai_giao_dich: values.loai, // Add transaction type for backend
                chi_tiets: [
                    {
                        san_pham_id: selectedProduct?.id,
                        so_luong: soLuongNhap, // Always send positive number
                        don_gia: donGia,
                        thanh_tien: donGia * soLuongNhap,
                    }
                ]
            };

            await axios.post(API.spaInventoryCreate, payload);

            message.success('Cập nhật tồn kho thành công');
            setModalVisible(false);
            form.resetFields();
            fetchInventory();
        } catch (error: any) {
            console.error('Error updating inventory:', error);
            message.error(error.response?.data?.message || 'Lỗi khi cập nhật tồn kho');
        }
    };

    const showStockModal = (record: InventoryItem) => {
        setSelectedProduct(record);
        setModalVisible(true);
        form.setFieldsValue({
            loai: 'nhap',
            ngay_nhap: dayjs(),
        });
    };

    const showTransactionHistory = (record: InventoryItem) => {
        setSelectedProduct(record);
        fetchTransactions(record.id);
        setTransactionModalVisible(true);
    };

    const getLowStockCount = () => {
        return inventoryData.filter(item => item.ton_kho <= item.ton_kho_toi_thieu).length;
    };

    const getTotalValue = () => {
        return inventoryData.reduce((sum, item) => sum + (item.ton_kho * item.gia_nhap), 0);
    };

    // Bulk Import Functions
    const handleAddBulkItem = () => {
        setBulkItems([...bulkItems, { so_luong: 0, gia_nhap: 0 }]);
    };

    const handleRemoveBulkItem = (index: number) => {
        const newItems = bulkItems.filter((_, i) => i !== index);
        setBulkItems(newItems);
    };

    const handleBulkItemChange = (index: number, field: string, value: any) => {
        const newItems = [...bulkItems];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-fill product info when selecting
        if (field === 'san_pham_id') {
            const product = products.find(p => p.id === value);
            if (product) {
                newItems[index].ma_san_pham = product.ma_san_pham;
                newItems[index].ten_san_pham = product.ten_san_pham;
                newItems[index].gia_nhap = product.gia_nhap;
            }
        }

        // Apply supplier to all if checkbox is checked
        if (field === 'nha_cung_cap_id' && applySupplierToAll) {
            newItems.forEach(item => {
                item.nha_cung_cap_id = value;
            });
        }

        setBulkItems(newItems);
    };

    const handleBulkSubmit = async () => {
        try {
            const values = await bulkForm.validateFields();

            if (bulkItems.length === 0) {
                message.warning('Vui lòng thêm ít nhất 1 sản phẩm');
                return;
            }

            // Validate all items have product selected
            const invalidItems = bulkItems.filter(item => !item.san_pham_id || !item.so_luong);
            if (invalidItems.length > 0) {
                message.error('Vui lòng điền đầy đủ thông tin cho tất cả sản phẩm');
                return;
            }

            const payload = {
                chi_nhanh_id: values.chi_nhanh_id || 1,
                nha_cung_cap: values.nha_cung_cap,
                ngay_nhap: values.ngay_nhap?.format('YYYY-MM-DD HH:mm:ss') || dayjs().format('YYYY-MM-DD HH:mm:ss'),
                ghi_chu: values.ghi_chu,
                items: bulkItems.map(item => ({
                    san_pham_id: item.san_pham_id,
                    so_luong: item.so_luong,
                    gia_nhap: item.gia_nhap,
                    nha_cung_cap_id: item.nha_cung_cap_id,
                }))
            };

            await axios.post(API.spaInventoryBulkImport, payload);
            message.success(`Nhập kho thành công ${bulkItems.length} sản phẩm`);
            setBulkImportModalVisible(false);
            bulkForm.resetFields();
            setBulkItems([]);
            setApplySupplierToAll(false);
            fetchInventory();
        } catch (error: any) {
            console.error('Bulk import error:', error);
            message.error(error.response?.data?.message || 'Lỗi khi nhập kho hàng loạt');
        }
    };

    const handleDownloadTemplate = () => {
        // Create CSV template
        const headers = ['ma_san_pham', 'ten_san_pham', 'so_luong', 'gia_nhap'];
        const csvContent = headers.join(',') + '\\n' +
            'SP001,Sản phẩm mẫu 1,10,100000\\n' +
            'SP002,Sản phẩm mẫu 2,20,200000';

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'template_nhap_kho.csv';
        link.click();
    };

    const handleFileUpload = async (file: UploadFile) => {
        setUploading(true);
        try {
            const values = await bulkForm.validateFields(['nha_cung_cap', 'ngay_nhap']);

            const formData = new FormData();
            formData.append('file', file as any);
            formData.append('chi_nhanh_id', values.chi_nhanh_id || '1');
            formData.append('nha_cung_cap', values.nha_cung_cap || '');
            formData.append('ngay_nhap', values.ngay_nhap?.format('YYYY-MM-DD HH:mm:ss') || dayjs().format('YYYY-MM-DD HH:mm:ss'));
            formData.append('ghi_chu', values.ghi_chu || '');

            const response = await axios.post(API.spaInventoryImportCsv, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            message.success(`Import thành công ${response.data.data?.count || 0} sản phẩm`);
            setBulkImportModalVisible(false);
            bulkForm.resetFields();
            setUploadedFile(null);
            fetchInventory();
        } catch (error: any) {
            console.error('CSV import error:', error);
            message.error(error.response?.data?.message || 'Lỗi khi import file');
        } finally {
            setUploading(false);
        }
        return false; // Prevent default upload
    };

    const columns: ColumnsType<InventoryItem> = [
        {
            title: 'Mã SP',
            dataIndex: 'ma_san_pham',
            key: 'ma_san_pham',
            width: 120,
            fixed: 'left',
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'ten_san_pham',
            key: 'ten_san_pham',
            width: 250,
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) =>
                record.ten_san_pham.toLowerCase().includes(String(value).toLowerCase()) ||
                record.ma_san_pham.toLowerCase().includes(String(value).toLowerCase()),
        },
        {
            title: 'Danh mục',
            dataIndex: 'danh_muc_ten',
            key: 'danh_muc_ten',
            width: 150,
            render: (text) => text ? <Tag color="blue">{text}</Tag> : '-',
            filteredValue: categoryFilter ? [categoryFilter] : null,
            onFilter: (value, record) => record.danh_muc_id === value,
        },
        {
            title: 'Tồn kho',
            dataIndex: 'ton_kho',
            key: 'ton_kho',
            width: 100,
            align: 'right',
            render: (ton_kho, record) => {
                const isLowStock = ton_kho <= record.ton_kho_toi_thieu;
                return (
                    <span style={{ color: isLowStock ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
                        {ton_kho} {record.don_vi_tinh}
                        {isLowStock && <WarningOutlined style={{ marginLeft: 8, color: '#ff4d4f' }} />}
                    </span>
                );
            },
        },
        {
            title: 'Tồn tối thiểu',
            dataIndex: 'ton_kho_toi_thieu',
            key: 'ton_kho_toi_thieu',
            width: 120,
            align: 'right',
            render: (value, record) => value ? `${value} ${record.don_vi_tinh}` : '-',
        },
        {
            title: 'Giá nhập',
            dataIndex: 'gia_nhap',
            key: 'gia_nhap',
            width: 130,
            align: 'right',
            render: (value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ',
        },
        {
            title: 'Giá bán',
            dataIndex: 'gia_ban',
            key: 'gia_ban',
            width: 130,
            align: 'right',
            render: (value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ',
        },
        {
            title: 'Giá trị tồn',
            key: 'gia_tri_ton',
            width: 150,
            align: 'right',
            render: (_, record) => {
                const value = record.ton_kho * record.gia_nhap;
                return <strong>{new Intl.NumberFormat('vi-VN').format(value)} đ</strong>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 120,
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 180,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showStockModal(record)}
                        size="small"
                    >
                        Nhập/Xuất
                    </Button>
                    <Button
                        icon={<InboxOutlined />}
                        onClick={() => showTransactionHistory(record)}
                        size="small"
                    >
                        Lịch sử
                    </Button>
                </Space>
            ),
        },
    ];

    const transactionColumns: ColumnsType<InventoryTransaction> = [
        {
            title: 'Ngày',
            dataIndex: 'ngay_nhap',
            key: 'ngay_nhap',
            width: 150,
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Loại',
            dataIndex: 'loai',
            key: 'loai',
            width: 100,
            render: (loai: 'nhap' | 'xuat' | 'dieu_chinh') => {
                const config: Record<'nhap' | 'xuat' | 'dieu_chinh', { color: string; text: string }> = {
                    nhap: { color: 'green', text: 'Nhập kho' },
                    xuat: { color: 'orange', text: 'Xuất kho' },
                    dieu_chinh: { color: 'blue', text: 'Điều chỉnh' },
                };
                const { color, text } = config[loai] || config.dieu_chinh;
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Số lượng',
            dataIndex: 'so_luong',
            key: 'so_luong',
            width: 100,
            align: 'right',
            render: (value, record) => (
                <span style={{ color: record.loai === 'nhap' ? '#52c41a' : '#ff4d4f' }}>
                    {record.loai === 'nhap' ? '+' : '-'}{value}
                </span>
            ),
        },
        {
            title: 'Giá nhập',
            dataIndex: 'gia_nhap',
            key: 'gia_nhap',
            width: 120,
            align: 'right',
            render: (value) => value ? new Intl.NumberFormat('vi-VN').format(value) + ' đ' : '-',
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'nha_cung_cap',
            key: 'nha_cung_cap',
            width: 150,
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'nguoi_nhap',
            key: 'nguoi_nhap',
            width: 120,
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghi_chu',
            key: 'ghi_chu',
            width: 200,
            ellipsis: true,
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h1>Quản lý kho hàng</h1>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng sản phẩm"
                            value={inventoryData.length}
                            prefix={<ShopOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Cảnh báo tồn thấp"
                            value={getLowStockCount()}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<WarningOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Giá trị tồn kho"
                            value={getTotalValue()}
                            precision={0}
                            formatter={(value) => new Intl.NumberFormat('vi-VN').format(Number(value)) + ' đ'}
                            prefix={<InboxOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            block
                            size="large"
                            onClick={() => setBulkImportModalVisible(true)}
                        >
                            Nhập kho hàng loạt
                        </Button>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                        <Search
                            placeholder="Tìm kiếm sản phẩm..."
                            allowClear
                            style={{ width: 300 }}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Select
                            placeholder="Chi nhánh"
                            allowClear
                            style={{ width: 200 }}
                            value={selectedBranch}
                            onChange={setSelectedBranch}
                        >
                            {branches.map(branch => (
                                <Select.Option key={branch.id} value={branch.id}>
                                    {branch.ten_chi_nhanh}
                                </Select.Option>
                            ))}
                        </Select>
                        <Select
                            placeholder="Danh mục"
                            allowClear
                            style={{ width: 200 }}
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                        >
                            {categories.map(cat => (
                                <Select.Option key={cat.id} value={cat.id}>
                                    {cat.ten_danh_muc}
                                </Select.Option>
                            ))}
                        </Select>
                        <Select
                            placeholder="Trạng thái"
                            style={{ width: 150 }}
                            value={statusFilter}
                            onChange={setStatusFilter}
                        >
                            <Select.Option value="all">Tất cả</Select.Option>
                            <Select.Option value="active">Đang bán</Select.Option>
                            <Select.Option value="inactive">Ngừng bán</Select.Option>
                        </Select>
                    </Space>
                    <Button onClick={fetchInventory}>Làm mới</Button>
                </Space>
            </Card>

            {/* Inventory Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={inventoryData}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1500 }}
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} sản phẩm`,
                    }}
                />
            </Card>

            {/* Stock Adjustment Modal */}
            <Modal
                title={`Nhập/Xuất kho: ${selectedProduct?.ten_san_pham}`}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={700}
                maskClosable={false}
            >
                <Form form={form} onFinish={handleStockAdjustment} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="chi_nhanh_id"
                                label="Chi nhánh"
                                rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
                                initialValue={branches.length > 0 ? branches[0].id : undefined}
                            >
                                <Select placeholder="Chọn chi nhánh">
                                    {branches.map(branch => (
                                        <Select.Option key={branch.id} value={branch.id}>
                                            {branch.ten_chi_nhanh}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="loai" label="Loại giao dịch" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="nhap">Nhập kho</Select.Option>
                                    <Select.Option value="xuat">Xuất kho</Select.Option>
                                    <Select.Option value="dieu_chinh_tang">Điều chỉnh tăng</Select.Option>
                                    <Select.Option value="dieu_chinh_giam">Điều chỉnh giảm</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="so_luong" label="Số lượng" rules={[{ required: true }]}>
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="gia_nhap" label="Giá nhập (cho nhập kho)">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="nha_cung_cap" label="Nhà cung cấp">
                                <Select
                                    placeholder="Chọn nhà cung cấp"
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as string)
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                >
                                    {suppliers.map(supplier => (
                                        <Select.Option key={supplier.id} value={supplier.ten_ncc}>
                                            {supplier.ten_ncc}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="ngay_nhap" label="Ngày" rules={[{ required: true }]}>
                                <DatePicker showTime style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="ly_do" label="Lý do">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="ghi_chu" label="Ghi chú">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Xác nhận
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Transaction History Modal */}
            <Modal
                title={`Lịch sử nhập/xuất: ${selectedProduct?.ten_san_pham}`}
                open={transactionModalVisible}
                onCancel={() => setTransactionModalVisible(false)}
                footer={null}
                width={1000}
            >
                <Table
                    columns={transactionColumns}
                    dataSource={transactions}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                />
            </Modal>

            {/* Bulk Import Modal */}
            <Modal
                title="Nhập kho hàng loạt"
                open={bulkImportModalVisible}
                onCancel={() => {
                    setBulkImportModalVisible(false);
                    bulkForm.resetFields();
                    setBulkItems([]);
                    setUploadedFile(null);
                }}
                footer={null}
                width={1000}
            >
                <Tabs defaultActiveKey="manual">
                    <TabPane tab="📝 Nhập thủ công" key="manual">
                        <Form form={bulkForm} layout="vertical">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="chi_nhanh_id"
                                        label="Chi nhánh"
                                        rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
                                        initialValue={branches.length > 0 ? branches[0].id : undefined}
                                    >
                                        <Select placeholder="Chọn chi nhánh">
                                            {branches.map(branch => (
                                                <Select.Option key={branch.id} value={branch.id}>
                                                    {branch.ten_chi_nhanh}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="ngay_nhap"
                                        label="Ngày nhập"
                                        initialValue={dayjs()}
                                        rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}
                                    >
                                        <DatePicker showTime style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="ghi_chu" label="Ghi chú chung">
                                <Input.TextArea rows={2} placeholder="Ghi chú chung cho đợt nhập kho..." />
                            </Form.Item>

                            <Form.Item label={
                                <Space>
                                    <span>Danh sách sản phẩm</span>
                                </Space>
                            }>
                                <Table
                                    dataSource={bulkItems}
                                    pagination={false}
                                    size="small"
                                    rowKey={(_, index) => index || 0}
                                    scroll={{ y: 300 }}
                                    footer={() => (
                                        <Button
                                            type="dashed"
                                            onClick={handleAddBulkItem}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            Thêm sản phẩm
                                        </Button>
                                    )}
                                >
                                    <Table.Column
                                        title="Sản phẩm"
                                        key="san_pham_id"
                                        width="1000"
                                        render={(_, record: any, index: number) => (
                                            <Select
                                                showSearch
                                                placeholder="Chọn sản phẩm"
                                                style={{ width: '100%' }}
                                                value={record.san_pham_id}
                                                onChange={(value) => handleBulkItemChange(index, 'san_pham_id', value)}
                                                optionFilterProp="children"
                                                filterOption={(input, option: any) =>
                                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                            >
                                                {products.map(product => (
                                                    <Select.Option key={product.id} value={product.id}>
                                                        {product.ma_san_pham} - {product.ten_san_pham}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    <Table.Column
                                        title={<div>
                                            <span>Nhà cung cấp</span>
                                            <br />
                                            <label style={{ fontWeight: 'normal', marginLeft: 16 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={applySupplierToAll}
                                                    onChange={(e) => setApplySupplierToAll(e.target.checked)}
                                                    style={{ marginRight: 4 }}
                                                />
                                                Áp dụng tất cả
                                            </label>
                                        </div>}
                                        key="nha_cung_cap_id"
                                        width="25%"
                                        render={(_, record: any, index: number) => (
                                            <Select
                                                showSearch
                                                placeholder="Chọn NCC"
                                                style={{ width: '100%' }}
                                                value={record.nha_cung_cap_id}
                                                onChange={(value) => handleBulkItemChange(index, 'nha_cung_cap_id', value)}
                                                allowClear
                                            >
                                                {suppliers.map(supplier => (
                                                    <Select.Option key={supplier.id} value={supplier.id}>
                                                        {supplier.ten_ncc}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    <Table.Column
                                        title="Số lượng"
                                        key="so_luong"
                                        width="15%"
                                        render={(_, record: any, index: number) => (
                                            <InputNumber
                                                min={1}
                                                style={{ width: '100%' }}
                                                value={record.so_luong}
                                                onChange={(value) => handleBulkItemChange(index, 'so_luong', value)}
                                                placeholder="SL"
                                            />
                                        )}
                                    />
                                    <Table.Column
                                        title="Giá nhập"
                                        key="gia_nhap"
                                        width="30%"
                                        render={(_, record: any, index: number) => (
                                            <InputNumber
                                                min={0}
                                                style={{ width: '100%' }}
                                                value={record.gia_nhap}
                                                onChange={(value) => handleBulkItemChange(index, 'gia_nhap', value)}
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                placeholder="Giá"
                                            />
                                        )}
                                    />
                                    <Table.Column
                                        title=""
                                        key="action"
                                        width="10%"
                                        render={(_, record: any, index: number) => (
                                            <Button
                                                type="link"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleRemoveBulkItem(index)}
                                            />
                                        )}
                                    />
                                </Table>
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button type="primary" onClick={handleBulkSubmit} loading={uploading}>
                                        Xác nhận nhập kho
                                    </Button>
                                    <Button onClick={() => setBulkImportModalVisible(false)}>
                                        Hủy
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    <TabPane tab="📄 Import từ file" key="file">
                        <Form form={bulkForm} layout="vertical">
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="chi_nhanh_id"
                                        label="Chi nhánh"
                                        rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
                                        initialValue={branches.length > 0 ? branches[0].id : undefined}
                                    >
                                        <Select placeholder="Chọn chi nhánh">
                                            {branches.map(branch => (
                                                <Select.Option key={branch.id} value={branch.id}>
                                                    {branch.ten_chi_nhanh}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="nha_cung_cap" label="Nhà cung cấp">
                                        <Select
                                            placeholder="Chọn nhà cung cấp"
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.children as string)
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                        >
                                            {suppliers.map(supplier => (
                                                <Select.Option key={supplier.id} value={supplier.ten_ncc}>
                                                    {supplier.ten_ncc}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="ngay_nhap"
                                        label="Ngày nhập"
                                        initialValue={dayjs()}
                                        rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}
                                    >
                                        <DatePicker showTime style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="ghi_chu" label="Ghi chú">
                                <Input.TextArea rows={2} placeholder="Ghi chú..." />
                            </Form.Item>

                            <Form.Item label="File CSV/Excel">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Button
                                        icon={<DownloadOutlined />}
                                        onClick={handleDownloadTemplate}
                                    >
                                        Tải file mẫu (Template)
                                    </Button>

                                    <Upload
                                        accept=".csv,.xlsx,.xls"
                                        maxCount={1}
                                        beforeUpload={handleFileUpload}
                                        fileList={uploadedFile ? [uploadedFile] : []}
                                        onRemove={() => setUploadedFile(null)}
                                    >
                                        <Button icon={<UploadOutlined />} loading={uploading}>
                                            Chọn file để import
                                        </Button>
                                    </Upload>

                                    <Card size="small" style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                                        <p style={{ margin: 0, fontSize: 12 }}>
                                            <strong>Lưu ý:</strong> File CSV phải có các cột: ma_san_pham, ten_san_pham, so_luong, gia_nhap
                                        </p>
                                    </Card>
                                </Space>
                            </Form.Item>
                        </Form>
                    </TabPane>
                </Tabs>
            </Modal>
        </div>
    );
};

export default InventoryList;
