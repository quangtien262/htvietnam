import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    message,
    Space,
    Divider,
    Drawer,
    Row,
    Col,
    Card,
    Statistic,
    Select,
    InputNumber,
    Tag
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    FilterOutlined,
    TagsOutlined,
    DollarOutlined
} from '@ant-design/icons';
import axios from 'axios';
import API from '../../common/api';
import TextArea from 'antd/es/input/TextArea';
import QuickAddSetting from '../../components/QuickAddSetting';

interface HangHoa {
    id: number;
    code: string;
    name: string;
    loai_hang_hoa_id?: number;
    loai_hang_hoa?: {
        id: number;
        name: string;
        color: string;
    };
    don_vi_hang_hoa_id?: number;
    don_vi_hang_hoa?: {
        id: number;
        name: string;
    };
    unit?: string;
    price_default: number;
    so_luong_default: number;
    vat: number;
    description?: string;
    status: number;
}

interface Statistics {
    total_hang_hoa: number;
    active_hang_hoa: number;
    inactive_hang_hoa: number;
    total_value: number;
}

const HangHoaList: React.FC = () => {
    const [data, setData] = useState<HangHoa[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);

    // Filter states
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<number | undefined>(undefined);
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<HangHoa | null>(null);
    const [form] = Form.useForm();

    // Statistics
    const [statistics, setStatistics] = useState<Statistics>({
        total_hang_hoa: 0,
        active_hang_hoa: 0,
        inactive_hang_hoa: 0,
        total_value: 0
    });

    // Selected rows for bulk delete
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    // Loại hàng hóa list
    const [loaiHangHoaList, setLoaiHangHoaList] = useState<any[]>([]);
    
    // Đơn vị hàng hóa list
    const [donViHangHoaList, setDonViHangHoaList] = useState<any[]>([]);

    useEffect(() => {
        loadData();
        loadStatistics();
        loadLoaiHangHoa();
        loadDonViHangHoa();
    }, [page, pageSize, search, filterStatus]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await axios.post(API.hangHoaList, {
                page,
                pageSize,
                search,
                status: filterStatus
            });

            if (res.data.status_code === 200) {
                setData(res.data.data.list);
                setTotal(res.data.data.total);
            }
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const res = await axios.post(API.hangHoaList, { status: undefined });
            if (res.data.status_code === 200) {
                const allData = res.data.data.list;
                const activeCount = allData.filter((item: HangHoa) => item.status === 1).length;
                const inactiveCount = allData.filter((item: HangHoa) => item.status === 0).length;
                const totalValue = allData.reduce((sum: number, item: HangHoa) => sum + (item.price_default * item.so_luong_default), 0);

                setStatistics({
                    total_hang_hoa: allData.length,
                    active_hang_hoa: activeCount,
                    inactive_hang_hoa: inactiveCount,
                    total_value: totalValue
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải thống kê:', error);
        }
    };

    const loadLoaiHangHoa = async () => {
        try {
            const res = await axios.post(API.loaiHangHoaList, {});
            if (res.data.status_code === 200) {
                setLoaiHangHoaList(res.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải loại hàng hóa:', error);
        }
    };

    const loadDonViHangHoa = async () => {
        try {
            const res = await axios.post(API.commonSettingList('don_vi_hang_hoa'), { page: 1, pageSize: 100 });
            if (res.data.status_code === 200) {
                setDonViHangHoaList(res.data.data.list || []);
            }
        } catch (error) {
            console.error('Lỗi khi tải đơn vị hàng hóa:', error);
            setDonViHangHoaList([]); // Set empty array on error
        }
    };

    const handleQuickAddSuccess = (newItem: any) => {
        // Thêm item mới vào danh sách
        setLoaiHangHoaList(prev => [...prev, newItem]);

        // Tự động chọn item vừa thêm
        form.setFieldsValue({
            loai_hang_hoa_id: newItem.id
        });

        message.success('Đã thêm và chọn phân loại mới');
    };

    const handleQuickAddDonViSuccess = (newItem: any) => {
        // Thêm item mới vào danh sách
        setDonViHangHoaList(prev => [...prev, newItem]);

        // Tự động chọn item vừa thêm
        form.setFieldsValue({
            don_vi_hang_hoa_id: newItem.id
        });

        message.success('Đã thêm và chọn đơn vị mới');
    };

    const handleAdd = () => {
        setEditingRecord(null);
        form.resetFields();
        form.setFieldsValue({
            status: 1,
            vat: 0,
            so_luong_default: 1,
            price_default: 0
        });
        setIsModalVisible(true);
    };

    const handleEdit = (record: HangHoa) => {
        setEditingRecord(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (ids: number[]) => {
        if (ids.length === 0) {
            message.warning('Vui lòng chọn hàng hóa cần xóa');
            return;
        }

        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa ${ids.length} hàng hóa đã chọn?`,
            onOk: async () => {
                try {
                    const res = await axios.post(API.hangHoaDelete, { ids });
                    if (res.data.status_code === 200) {
                        message.success('Xóa thành công');
                        setSelectedRowKeys([]);
                        loadData();
                        loadStatistics();
                    }
                } catch (error) {
                    message.error('Có lỗi xảy ra khi xóa');
                }
            }
        });
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            const apiUrl = editingRecord ? API.hangHoaUpdate : API.hangHoaAdd;
            const payload = editingRecord ? { id: editingRecord.id, ...values } : values;

            const res = await axios.post(apiUrl, payload);

            if (res.data.status_code === 200) {
                message.success(editingRecord ? 'Cập nhật thành công' : 'Thêm mới thành công');
                setIsModalVisible(false);
                form.resetFields();
                loadData();
                loadStatistics();
            } else {
                message.error(res.data.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.errors) {
                const errors = error.response.data.errors;
                const firstError = Object.values(errors)[0] as string[];
                message.error(firstError[0]);
            } else {
                message.error('Có lỗi xảy ra');
            }
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleFilterStatusChange = (value: number | undefined) => {
        setFilterStatus(value);
        setPage(1);
    };

    const handleResetFilters = () => {
        setSearch('');
        setFilterStatus(undefined);
        setPage(1);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const columns = [
        {
            title: 'Hàng hóa',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            fixed: 'left' as const,
            render: (name: string, record: HangHoa) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.code}</div>
                </div>
            )
        },
        {
            title: 'Phân loại',
            dataIndex: 'loai_hang_hoa',
            key: 'loai_hang_hoa',
            width: 150,
            render: (loaiHangHoa: any) => {
                if (!loaiHangHoa) return '-';
                return <Tag color={loaiHangHoa.color}>{loaiHangHoa.name}</Tag>;
            }
        },
        {
            title: 'Đơn vị',
            dataIndex: 'don_vi_hang_hoa',
            key: 'don_vi_hang_hoa',
            width: 100,
            render: (donViHangHoa: any) => {
                return donViHangHoa?.name || '-';
            }
        },
        {
            title: 'Giá mặc định',
            dataIndex: 'price_default',
            key: 'price_default',
            width: 150,
            render: (value: number) => formatCurrency(value)
        },
        {
            title: 'Số lượng mặc định',
            dataIndex: 'so_luong_default',
            key: 'so_luong_default',
            width: 100,
            align: 'center' as const
        },
        {
            title: 'VAT (%)',
            dataIndex: 'vat',
            key: 'vat',
            width: 80,
            align: 'center' as const,
            render: (value: number) => `${value}%`
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            align: 'center' as const,
            render: (status: number) => (
                <Tag color={status === 1 ? 'green' : 'red'}>
                    {status === 1 ? 'Hoạt động' : 'Ngừng'}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'center' as const,
            fixed: 'right' as const,
            render: (_: any, record: HangHoa) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete([record.id])}
                    />
                </Space>
            )
        }
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    // Statistics cards
    const statisticsCards = (
        <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} lg={6}>
                <Card>
                    <Statistic
                        title="Tổng hàng hóa"
                        value={statistics.total_hang_hoa}
                        prefix={<TagsOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card>
                    <Statistic
                        title="Đang hoạt động"
                        value={statistics.active_hang_hoa}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card>
                    <Statistic
                        title="Ngừng hoạt động"
                        value={statistics.inactive_hang_hoa}
                        valueStyle={{ color: '#cf1322' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card>
                    <Statistic
                        title="Tổng giá trị"
                        value={statistics.total_value}
                        prefix={<DollarOutlined />}
                        formatter={(value) => formatCurrency(Number(value))}
                    />
                </Card>
            </Col>
        </Row>
    );

    // Filter section for desktop
    const filterSection = (
        <div style={{ marginBottom: 16 }}>
            <Input
                placeholder="Tìm theo tên hoặc mã hàng hóa..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ marginBottom: 8 }}
            />
            <Select
                placeholder="Lọc theo trạng thái"
                value={filterStatus}
                onChange={handleFilterStatusChange}
                style={{ width: '100%', marginBottom: 8 }}
                allowClear
            >
                <Select.Option value={1}>Hoạt động</Select.Option>
                <Select.Option value={0}>Ngừng hoạt động</Select.Option>
            </Select>
            <Button
                onClick={handleResetFilters}
                style={{ width: '100%' }}
            >
                Đặt lại bộ lọc
            </Button>
        </div>
    );

    return (
        <div style={{ padding: window.innerWidth <= 768 ? 12 : 24 }}>
            {statisticsCards}

            <Row gutter={16}>
                {/* Desktop Filter Sidebar */}
                <Col xs={0} lg={5} className="desktop-only">
                    <Card title="Bộ lọc" size="small">
                        {filterSection}
                    </Card>
                </Col>

                {/* Main Content */}
                <Col xs={24} lg={19}>
                    <Card>
                        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAdd}
                                >
                                    Thêm hàng hóa
                                </Button>
                                {selectedRowKeys.length > 0 && (
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDelete(selectedRowKeys as number[])}
                                    >
                                        Xóa ({selectedRowKeys.length})
                                    </Button>
                                )}
                            </Space>

                            {/* Mobile Filter Button */}
                            <Button
                                className="mobile-only"
                                icon={<FilterOutlined />}
                                onClick={() => setFilterDrawerVisible(true)}
                            >
                                Bộ lọc
                            </Button>
                        </Space>

                        <Table
                            rowSelection={rowSelection}
                            columns={columns}
                            dataSource={data}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                current: page,
                                pageSize: pageSize,
                                total: total,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} hàng hóa`,
                                onChange: (page, pageSize) => {
                                    setPage(page);
                                    setPageSize(pageSize);
                                }
                            }}
                            scroll={{ x: 1200 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Mobile Filter Drawer */}
            <Drawer
                title="Bộ lọc"
                placement="right"
                onClose={() => setFilterDrawerVisible(false)}
                open={filterDrawerVisible}
                className="mobile-only"
            >
                {filterSection}
            </Drawer>

            {/* Add/Edit Modal */}
            <Modal
                title={editingRecord ? 'Sửa hàng hóa' : 'Thêm hàng hóa'}
                open={isModalVisible}
                onOk={handleSave}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                width={600}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    {editingRecord && (
                        <Form.Item label="Mã hàng hóa">
                            <Input value={editingRecord.code} disabled />
                        </Form.Item>
                    )}

                    <Form.Item
                        label="Tên hàng hóa"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên hàng hóa' }]}
                    >
                        <Input placeholder="Nhập tên hàng hóa" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={24} sm={12}>

                            <Form.Item
                                label={
                                    <span>
                                        Phân loại{' '}
                                        <QuickAddSetting
                                            tableName="loai_hang_hoa"
                                            buttonText="Thêm nhanh"
                                            showAsTag={true}
                                            onSuccess={handleQuickAddSuccess}
                                            modalTitle="Thêm phân loại hàng hóa"
                                            placeholder="Nhập tên phân loại..."
                                            hasColor={true}
                                        />
                                    </span>
                                }
                                name="loai_hang_hoa_id"
                            >
                                <Select
                                    placeholder="Chọn phân loại"
                                    allowClear
                                >
                                    {loaiHangHoaList.map(loai => (
                                        <Select.Option key={loai.id} value={loai.id}>
                                            <Tag color={loai.color}>{loai.name}</Tag>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24} sm={12}>
                            <Form.Item
                                label="Trạng thái"
                                name="status"
                            >
                                <Select>
                                    <Select.Option value={1}>Hoạt động</Select.Option>
                                    <Select.Option value={0}>Ngừng hoạt động</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={24} sm={12}>
                            <Form.Item
                                label={
                                    <span>
                                        Đơn vị{' '}
                                        <QuickAddSetting
                                            tableName="don_vi_hang_hoa"
                                            showAsTag={true}
                                            onSuccess={handleQuickAddDonViSuccess}
                                            modalTitle="Thêm đơn vị hàng hóa"
                                            placeholder="Nhập tên đơn vị (Cái, Hộp, Kg...)"
                                            hasColor={false}
                                        />
                                    </span>
                                }
                                name="don_vi_hang_hoa_id"
                            >
                                <Select
                                    placeholder="Chọn đơn vị"
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {donViHangHoaList?.map(donVi => (
                                        <Select.Option key={donVi.id} value={donVi.id}>
                                            {donVi.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24} sm={12}>
                            <Form.Item
                                label="Số lượng mặc định"
                                name="so_luong_default"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                            >
                                <InputNumber
                                    min={1}
                                    style={{ width: '100%' }}
                                    placeholder="Số lượng"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Giá mặc định"
                                name="price_default"
                                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value: any) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                    placeholder="Giá"
                                    addonAfter="₫"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="VAT (%)"
                                name="vat"
                            >
                                <InputNumber
                                    min={0}
                                    max={100}
                                    style={{ width: '100%' }}
                                    placeholder="VAT"
                                    addonAfter="%"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                    >
                        <TextArea rows={3} placeholder="Mô tả chi tiết về hàng hóa" />
                    </Form.Item>


                </Form>
            </Modal>
        </div>
    );
};

export default HangHoaList;
