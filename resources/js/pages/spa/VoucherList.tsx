import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Select, Tag, Modal, Form, InputNumber,
    message, Popconfirm, Row, Col, Divider, Drawer, Descriptions, DatePicker,
    Switch, Badge, Statistic, Alert, Progress, QRCode
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, TagsOutlined,
    EyeOutlined, GiftOutlined, DollarOutlined, PercentageOutlined, CopyOutlined,
    CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import API_SPA from '../../common/api_spa';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Voucher {
    id: number;
    ma_voucher: string;
    ten_voucher: string;
    loai_giam_gia: string; // 'phan_tram', 'so_tien'
    gia_tri_giam: number;
    giam_toi_da?: number;
    don_toi_thieu?: number;
    so_luong: number;
    so_luong_da_dung: number;
    ngay_bat_dau: string;
    ngay_ket_thuc: string;
    ap_dung_cho?: string; // 'tat_ca', 'dich_vu', 'san_pham', 'lieu_trinh'
    danh_sach_ap_dung?: number[];
    mo_ta?: string;
    trang_thai: string;
    created_at: string;
}

const VoucherList: React.FC = () => {
    // State
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

    // Filters
    const [searchText, setSearchText] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    // Pagination
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Form
    const [form] = Form.useForm();

    // Stats
    const [stats, setStats] = useState({
        totalVouchers: 0,
        activeVouchers: 0,
        totalUsed: 0,
        totalDiscount: 0,
    });

    // Load data
    useEffect(() => {
        loadVouchers();
    }, [pagination.current, pagination.pageSize, searchText, selectedType, selectedStatus]);

    const loadVouchers = async () => {
        setLoading(true);
        try {
            const response = await axios.post(API_SPA.spaVoucherList, {
                page: pagination.current,
                limit: pagination.pageSize,
                search: searchText,
                loai_giam_gia: selectedType,
                trang_thai: selectedStatus,
            });

            if (response.data.success) {
                const data = response.data.data;
                setVouchers(data.data || []);
                setPagination({
                    ...pagination,
                    total: data.total || 0,
                });

                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            message.error('Không thể tải danh sách voucher');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleCreate = () => {
        form.resetFields();
        setSelectedVoucher(null);
        setModalVisible(true);
    };

    const handleEdit = (record: Voucher) => {
        setSelectedVoucher(record);
        form.setFieldsValue({
            ...record,
            ngay_bat_dau: dayjs(record.ngay_bat_dau),
            ngay_ket_thuc: dayjs(record.ngay_ket_thuc),
        });
        setModalVisible(true);
    };

    const handleView = (record: Voucher) => {
        setSelectedVoucher(record);
        setDetailDrawerVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                id: selectedVoucher?.id,
                ...values,
                ngay_bat_dau: values.ngay_bat_dau.format('YYYY-MM-DD'),
                ngay_ket_thuc: values.ngay_ket_thuc.format('YYYY-MM-DD'),
            };

            const response = await axios.post(API_SPA.spaVoucherCreateOrUpdate, payload);

            if (response.data.success) {
                message.success(selectedVoucher ? 'Cập nhật voucher thành công' : 'Tạo voucher mới thành công');
                setModalVisible(false);
                loadVouchers();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await axios.post(API_SPA.spaVoucherDelete, { id });
            if (response.data.success) {
                message.success('Xóa voucher thành công');
                loadVouchers();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa voucher');
        }
    };

    const handleStatusToggle = async (record: Voucher) => {
        try {
            const newStatus = record.trang_thai === 'hoat_dong' ? 'tam_dung' : 'hoat_dong';
            const response = await axios.post(API_SPA.spaVoucherCreateOrUpdate, {
                id: record.id,
                trang_thai: newStatus,
            });

            if (response.data.success) {
                message.success('Cập nhật trạng thái thành công');
                loadVouchers();
            }
        } catch (error) {
            message.error('Không thể cập nhật trạng thái');
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        message.success('Đã sao chép mã voucher');
    };

    const getVoucherTypeLabel = (type: string) => {
        return type === 'phan_tram' ? 'Phần trăm' : 'Số tiền';
    };

    const getVoucherTypeColor = (type: string) => {
        return type === 'phan_tram' ? 'green' : 'blue';
    };

    const formatDiscount = (voucher: Voucher) => {
        if (voucher.loai_giam_gia === 'phan_tram') {
            return `${voucher.gia_tri_giam}%`;
        }
        return `${voucher.gia_tri_giam.toLocaleString()} VNĐ`;
    };

    const getVoucherStatus = (voucher: Voucher) => {
        const now = dayjs();
        const start = dayjs(voucher.ngay_bat_dau);
        const end = dayjs(voucher.ngay_ket_thuc);

        if (voucher.trang_thai === 'tam_dung') {
            return { text: 'Tạm dừng', color: 'red', icon: <CloseCircleOutlined /> };
        }

        if (now.isBefore(start)) {
            return { text: 'Sắp diễn ra', color: 'orange', icon: <ClockCircleOutlined /> };
        }

        if (now.isAfter(end)) {
            return { text: 'Đã hết hạn', color: 'default', icon: <CloseCircleOutlined /> };
        }

        if (voucher.so_luong_da_dung >= voucher.so_luong) {
            return { text: 'Đã hết lượt', color: 'volcano', icon: <WarningOutlined /> };
        }

        return { text: 'Đang hoạt động', color: 'green', icon: <CheckCircleOutlined /> };
    };

    const calculateUsagePercent = (voucher: Voucher) => {
        return Math.round((voucher.so_luong_da_dung / voucher.so_luong) * 100);
    };

    // Table columns
    const columns: ColumnsType<Voucher> = [
        {
            title: 'Mã Voucher',
            dataIndex: 'ma_voucher',
            key: 'ma_voucher',
            width: 150,
            fixed: 'left',
            render: (value: string) => (
                <Space>
                    <Tag color="blue" style={{ fontSize: 13, fontWeight: 'bold' }}>
                        {value}
                    </Tag>
                    <Button
                        type="link"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => handleCopyCode(value)}
                    />
                </Space>
            ),
        },
        {
            title: 'Tên Voucher',
            dataIndex: 'ten_voucher',
            key: 'ten_voucher',
            width: 250,
            render: (text: string, record) => (
                <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
                    <Tag color={getVoucherTypeColor(record.loai_giam_gia)}>
                        {getVoucherTypeLabel(record.loai_giam_gia)}
                    </Tag>
                </div>
            ),
        },
        {
            title: 'Giảm giá',
            key: 'discount',
            width: 150,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500, color: '#f5222d', fontSize: 15 }}>
                        {formatDiscount(record)}
                    </div>
                    {record.giam_toi_da && (
                        <div style={{ fontSize: 12, color: '#666' }}>
                            Tối đa: {record.giam_toi_da.toLocaleString()} VNĐ
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'don_toi_thieu',
            key: 'don_toi_thieu',
            width: 140,
            align: 'right',
            render: (value?: number) => value ? `${value.toLocaleString()} VNĐ` : 'Không yêu cầu',
        },
        {
            title: 'Số lượng',
            key: 'quantity',
            width: 150,
            render: (_, record) => {
                const percent = calculateUsagePercent(record);
                return (
                    <div>
                        <div style={{ marginBottom: 4 }}>
                            <Badge count={record.so_luong_da_dung} showZero color="green" />
                            <span style={{ margin: '0 4px' }}>/</span>
                            <Badge count={record.so_luong} showZero color="blue" />
                        </div>
                        <Progress percent={percent} size="small" status={percent >= 100 ? 'exception' : 'active'} />
                    </div>
                );
            },
        },
        {
            title: 'Thời gian',
            key: 'duration',
            width: 200,
            render: (_, record) => (
                <div>
                    <div style={{ fontSize: 12 }}>
                        <CalendarOutlined /> {dayjs(record.ngay_bat_dau).format('DD/MM/YYYY')}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 2 }}>
                        đến {dayjs(record.ngay_ket_thuc).format('DD/MM/YYYY')}
                    </div>
                </div>
            ),
        },
        {
            title: 'Áp dụng',
            dataIndex: 'ap_dung_cho',
            key: 'ap_dung_cho',
            width: 120,
            render: (value?: string) => {
                const labels: Record<string, string> = {
                    'tat_ca': 'Tất cả',
                    'dich_vu': 'Dịch vụ',
                    'san_pham': 'Sản phẩm',
                    'lieu_trinh': 'Liệu trình',
                };
                return <Tag color="purple">{labels[value || 'tat_ca']}</Tag>;
            },
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 150,
            render: (_, record) => {
                const status = getVoucherStatus(record);
                return (
                    <Tag color={status.color} icon={status.icon}>
                        {status.text}
                    </Tag>
                );
            },
        },
        {
            title: 'Kích hoạt',
            key: 'active',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Switch
                    checked={record.trang_thai === 'hoat_dong'}
                    onChange={() => handleStatusToggle(record)}
                />
            ),
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
                        title="Xác nhận xóa voucher này?"
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

    return (
        <div style={{ padding: 24 }}>
            {/* Stats Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng Voucher"
                            value={stats.totalVouchers}
                            prefix={<TagsOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={stats.activeVouchers}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đã sử dụng"
                            value={stats.totalUsed}
                            prefix={<GiftOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng giảm giá"
                            value={stats.totalDiscount}
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title={
                    <Space>
                        <TagsOutlined />
                        <span>Quản lý Voucher</span>
                        <Badge count={pagination.total} showZero />
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Tạo Voucher
                    </Button>
                }
            >
                {/* Filters */}
                <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Input.Search
                                placeholder="Tìm kiếm mã, tên voucher..."
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Loại giảm giá"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedType}
                                onChange={setSelectedType}
                            >
                                <Option value="phan_tram">Phần trăm</Option>
                                <Option value="so_tien">Số tiền</Option>
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
                                <Option value="hoat_dong">Hoạt động</Option>
                                <Option value="tam_dung">Tạm dừng</Option>
                            </Select>
                        </Col>
                    </Row>
                </Space>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={vouchers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} voucher`,
                        onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize });
                        },
                    }}
                    scroll={{ x: 1600 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={selectedVoucher ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                width={800}
                okText={selectedVoucher ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="ma_voucher"
                                label="Mã Voucher"
                                tooltip="Bỏ trống để tự động tạo mã (VOUCHER0001, VOUCHER0002...)"
                            >
                                <Input placeholder="Bỏ trống để tự động tạo" style={{ textTransform: 'uppercase' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ten_voucher"
                                label="Tên Voucher"
                                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                            >
                                <Input placeholder="VD: Giảm giá mùa hè" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="loai_giam_gia"
                                label="Loại giảm giá"
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value="phan_tram">Phần trăm (%)</Option>
                                    <Option value="so_tien">Số tiền (VNĐ)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="gia_tri_giam"
                                label="Giá trị giảm"
                                rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="giam_toi_da"
                                label="Giảm tối đa (VNĐ)"
                                tooltip="Áp dụng cho voucher phần trăm"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="don_toi_thieu"
                                label="Đơn tối thiểu (VNĐ)"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="so_luong"
                                label="Số lượng"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={1} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ap_dung_cho"
                                label="Áp dụng cho"
                                initialValue="tat_ca"
                            >
                                <Select>
                                    <Option value="tat_ca">Tất cả</Option>
                                    <Option value="dich_vu">Dịch vụ</Option>
                                    <Option value="san_pham">Sản phẩm</Option>
                                    <Option value="lieu_trinh">Liệu trình</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ngay_bat_dau"
                                label="Ngày bắt đầu"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ngay_ket_thuc"
                                label="Ngày kết thúc"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="mo_ta" label="Mô tả">
                                <TextArea rows={3} placeholder="Mô tả chi tiết về voucher..." />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="trang_thai" label="Trạng thái" initialValue="hoat_dong">
                                <Select>
                                    <Option value="hoat_dong">Hoạt động</Option>
                                    <Option value="tam_dung">Tạm dừng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết Voucher"
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={600}
            >
                {selectedVoucher && (
                    <div>
                        {/* QR Code */}
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <QRCode value={selectedVoucher.ma_voucher} size={200} />
                            <div style={{ marginTop: 16 }}>
                                <Tag color="blue" style={{ fontSize: 18, padding: '8px 16px', fontWeight: 'bold' }}>
                                    {selectedVoucher.ma_voucher}
                                </Tag>
                                <Button
                                    type="link"
                                    icon={<CopyOutlined />}
                                    onClick={() => handleCopyCode(selectedVoucher.ma_voucher)}
                                >
                                    Sao chép
                                </Button>
                            </div>
                        </div>

                        {/* Status Alert */}
                        <Alert
                            message={getVoucherStatus(selectedVoucher).text}
                            type={
                                getVoucherStatus(selectedVoucher).color === 'green' ? 'success' :
                                getVoucherStatus(selectedVoucher).color === 'red' ? 'error' : 'warning'
                            }
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        <Divider>Thông tin chung</Divider>

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Tên Voucher">{selectedVoucher.ten_voucher}</Descriptions.Item>
                            <Descriptions.Item label="Loại giảm giá">
                                <Tag color={getVoucherTypeColor(selectedVoucher.loai_giam_gia)}>
                                    {getVoucherTypeLabel(selectedVoucher.loai_giam_gia)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá trị giảm">
                                <strong style={{ color: '#f5222d', fontSize: 16 }}>
                                    {formatDiscount(selectedVoucher)}
                                </strong>
                            </Descriptions.Item>
                            {selectedVoucher.giam_toi_da && (
                                <Descriptions.Item label="Giảm tối đa">
                                    {selectedVoucher.giam_toi_da.toLocaleString()} VNĐ
                                </Descriptions.Item>
                            )}
                            {selectedVoucher.don_toi_thieu && (
                                <Descriptions.Item label="Đơn tối thiểu">
                                    {selectedVoucher.don_toi_thieu.toLocaleString()} VNĐ
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Áp dụng cho">
                                {selectedVoucher.ap_dung_cho === 'tat_ca' ? 'Tất cả' :
                                 selectedVoucher.ap_dung_cho === 'dich_vu' ? 'Dịch vụ' :
                                 selectedVoucher.ap_dung_cho === 'san_pham' ? 'Sản phẩm' : 'Liệu trình'}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider>Thời gian & Số lượng</Divider>

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Ngày bắt đầu">
                                {dayjs(selectedVoucher.ngay_bat_dau).format('DD/MM/YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày kết thúc">
                                {dayjs(selectedVoucher.ngay_ket_thuc).format('DD/MM/YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng số lượng">
                                {selectedVoucher.so_luong}
                            </Descriptions.Item>
                            <Descriptions.Item label="Đã sử dụng">
                                <Space>
                                    <Badge count={selectedVoucher.so_luong_da_dung} showZero color="green" />
                                    <Progress
                                        percent={calculateUsagePercent(selectedVoucher)}
                                        size="small"
                                        style={{ width: 200 }}
                                    />
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Còn lại">
                                <Badge
                                    count={selectedVoucher.so_luong - selectedVoucher.so_luong_da_dung}
                                    showZero
                                    color="blue"
                                />
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedVoucher.mo_ta && (
                            <div style={{ marginTop: 16 }}>
                                <Divider>Mô tả</Divider>
                                <p>{selectedVoucher.mo_ta}</p>
                            </div>
                        )}

                        <Divider />

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Ngày tạo">
                                {dayjs(selectedVoucher.created_at).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default VoucherList;
