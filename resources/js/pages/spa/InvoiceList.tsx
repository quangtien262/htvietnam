import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Select, Tag, Modal, Drawer, Descriptions,
    Row, Col, Statistic, DatePicker, Badge, message, Popconfirm, Divider, Timeline
} from 'antd';
import {
    FileTextOutlined, EyeOutlined, PrinterOutlined, DeleteOutlined,
    DollarOutlined, CalendarOutlined, UserOutlined, ShopOutlined,
    ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
    ExportOutlined, SearchOutlined, FilterOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';
import { API } from '../../common/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Invoice {
    id: number;
    ma_hoa_don: string;
    khach_hang_id?: number;
    khach_hang?: {
        id: number;
        name: string;
        ho_ten?: string;
        phone?: string;
        sdt?: string;
    };
    chi_nhanh_id: number;
    chi_nhanh?: {
        id: number;
        ten_chi_nhanh: string;
    };
    ngay_ban: string;
    tong_tien_dich_vu: number;
    tong_tien_san_pham: number;
    tong_tien: number;
    giam_gia: number;
    tien_tip: number;
    tong_thanh_toan: number;
    phuong_thuc_thanh_toan?: any;
    trang_thai: string;
    nguoi_ban?: string;
    ghi_chu?: string;
    created_at: string;
}

interface InvoiceDetail extends Invoice {
    chi_tiets: Array<{
        id: number;
        dich_vu_id?: number;
        san_pham_id?: number;
        ktv_id?: number;
        dich_vu?: {
            id: number;
            ten_dich_vu: string;
        };
        san_pham?: {
            id: number;
            ten_san_pham: string;
        };
        ktv?: {
            id: number;
            admin_user?: {
                name: string;
            };
        };
        so_luong: number;
        don_gia: number;
        thanh_tien: number;
        ghi_chu?: string;
    }>;
    hoa_hongs?: Array<{
        id: number;
        ktv_id: number;
        ktv?: {
            admin_user?: {
                name: string;
            };
        };
        gia_tri_goc: number;
        ti_le_hoa_hong: number;
        tien_hoa_hong: number;
    }>;
}

const InvoiceList: React.FC = () => {
    // State
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);

    // Filters
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[any, any] | null>(null);

    // Pagination
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        paid: 0,
        pending: 0,
        cancelled: 0,
        today_revenue: 0,
        today_count: 0,
    });

    // Load invoices
    useEffect(() => {
        loadInvoices();
    }, [pagination.current, pagination.pageSize, searchText, selectedStatus, dateRange]);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API.spaInvoiceList, {
                params: {
                    page: pagination.current,
                    per_page: pagination.pageSize,
                    search: searchText || undefined,
                    trang_thai: selectedStatus || undefined,
                    tu_ngay: dateRange?.[0]?.format('YYYY-MM-DD'),
                    den_ngay: dateRange?.[1]?.format('YYYY-MM-DD'),
                }
            });

            if (response.data.status_code === 200) {
                const data = response.data.data;
                setInvoices(data.data || []);
                setPagination({
                    ...pagination,
                    total: data.total || 0,
                });
                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            console.error('Load invoices error:', error);
            message.error('Không thể tải danh sách hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (record: Invoice) => {
        try {
            const response = await axios.get(API.spaInvoiceDetail(record.id));
            if (response.data.status_code === 200) {
                setSelectedInvoice(response.data.data);
                setDetailDrawerVisible(true);
            }
        } catch (error) {
            message.error('Không thể tải chi tiết hóa đơn');
        }
    };

    const handlePrint = async (record: Invoice) => {
        try {
            const response = await axios.get(API.spaInvoicePrint(record.id));
            if (response.data.status_code === 200) {
                // TODO: Implement print logic
                message.success('Chuẩn bị in hóa đơn...');
                console.log('Print invoice:', response.data.data);
            }
        } catch (error) {
            message.error('Không thể in hóa đơn');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await axios.delete(API.spaInvoiceDelete(id));
            if (response.data.status_code === 200) {
                message.success('Đã xóa hóa đơn');
                loadInvoices();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa hóa đơn');
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.post(API.spaInvoiceExport, {
                tu_ngay: dateRange?.[0]?.format('YYYY-MM-DD'),
                den_ngay: dateRange?.[1]?.format('YYYY-MM-DD'),
                trang_thai: selectedStatus,
            });

            if (response.data.status_code === 200) {
                message.success('Đã xuất dữ liệu');
                // TODO: Download file
            }
        } catch (error) {
            message.error('Không thể xuất dữ liệu');
        }
    };

    const getStatusTag = (status: string) => {
        const statusConfig: Record<string, { color: string; text: string; icon: any }> = {
            'cho_thanh_toan': { color: 'orange', text: 'Chờ thanh toán', icon: <ClockCircleOutlined /> },
            'da_thanh_toan': { color: 'green', text: 'Đã thanh toán', icon: <CheckCircleOutlined /> },
            'da_huy': { color: 'red', text: 'Đã hủy', icon: <CloseCircleOutlined /> },
        };

        const config = statusConfig[status] || { color: 'default', text: status, icon: null };
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    const columns: ColumnsType<Invoice> = [
        {
            title: 'Mã HĐ',
            dataIndex: 'ma_hoa_don',
            key: 'ma_hoa_don',
            width: 120,
            fixed: 'left',
            render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
        },
        {
            title: 'Ngày bán',
            dataIndex: 'ngay_ban',
            key: 'ngay_ban',
            width: 150,
            render: (date) => (
                <div>
                    <div>{dayjs(date).format('DD/MM/YYYY')}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                        {dayjs(date).format('HH:mm')}
                    </div>
                </div>
            ),
            sorter: (a, b) => dayjs(a.ngay_ban).unix() - dayjs(b.ngay_ban).unix(),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'khach_hang',
            key: 'khach_hang',
            width: 200,
            render: (khachHang) => (
                <div>
                    <div>
                        <UserOutlined /> {khachHang?.name || khachHang?.ho_ten || 'Khách lẻ'}
                    </div>
                    {khachHang?.phone || khachHang?.sdt ? (
                        <div style={{ fontSize: 12, color: '#999' }}>
                            {khachHang.phone || khachHang.sdt}
                        </div>
                    ) : null}
                </div>
            ),
        },
        {
            title: 'Chi nhánh',
            dataIndex: 'chi_nhanh',
            key: 'chi_nhanh',
            width: 150,
            render: (chiNhanh) => (
                <div>
                    <ShopOutlined /> {chiNhanh?.ten_chi_nhanh || 'N/A'}
                </div>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'tong_tien',
            key: 'tong_tien',
            width: 130,
            align: 'right',
            render: (value) => (
                <strong style={{ color: '#52c41a' }}>
                    {value.toLocaleString()} ₫
                </strong>
            ),
            sorter: (a, b) => a.tong_tien - b.tong_tien,
        },
        {
            title: 'Giảm giá',
            dataIndex: 'giam_gia',
            key: 'giam_gia',
            width: 120,
            align: 'right',
            render: (value) => value > 0 ? (
                <span style={{ color: '#ff4d4f' }}>
                    -{value.toLocaleString()} ₫
                </span>
            ) : '-',
        },
        {
            title: 'Thanh toán',
            dataIndex: 'tong_thanh_toan',
            key: 'tong_thanh_toan',
            width: 140,
            align: 'right',
            render: (value) => (
                <strong style={{ color: '#1890ff', fontSize: 15 }}>
                    {value.toLocaleString()} ₫
                </strong>
            ),
            sorter: (a, b) => a.tong_thanh_toan - b.tong_thanh_toan,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 140,
            render: (status) => getStatusTag(status),
            filters: [
                { text: 'Chờ thanh toán', value: 'cho_thanh_toan' },
                { text: 'Đã thanh toán', value: 'da_thanh_toan' },
                { text: 'Đã hủy', value: 'da_huy' },
            ],
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space>
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
                        icon={<PrinterOutlined />}
                        onClick={() => handlePrint(record)}
                    />
                    {record.trang_thai !== 'da_thanh_toan' && (
                        <Popconfirm
                            title="Xác nhận xóa hóa đơn?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button
                                type="link"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng hóa đơn"
                            value={stats.total}
                            prefix={<FileTextOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đã thanh toán"
                            value={stats.paid}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Chờ thanh toán"
                            value={stats.pending}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu hôm nay"
                            value={stats.today_revenue}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Card */}
            <Card
                title={
                    <Space>
                        <FileTextOutlined />
                        <span>Quản lý Hóa đơn</span>
                        <Badge count={pagination.total} showZero />
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<ExportOutlined />}
                        onClick={handleExport}
                    >
                        Xuất Excel
                    </Button>
                }
            >
                {/* Filters */}
                <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8}>
                            <Input.Search
                                placeholder="Tìm kiếm mã HĐ, khách hàng, SĐT..."
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Trạng thái"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                            >
                                <Option value="cho_thanh_toan">Chờ thanh toán</Option>
                                <Option value="da_thanh_toan">Đã thanh toán</Option>
                                <Option value="da_huy">Đã hủy</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={10}>
                            <RangePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                placeholder={['Từ ngày', 'Đến ngày']}
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates as any)}
                            />
                        </Col>
                    </Row>
                </Space>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={invoices}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} hóa đơn`,
                        onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize });
                        },
                    }}
                    scroll={{ x: 1400 }}
                />
            </Card>

            {/* Detail Drawer */}
            <Drawer
                title={`Chi tiết hóa đơn: ${selectedInvoice?.ma_hoa_don}`}
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={700}
                extra={
                    <Space>
                        <Button
                            icon={<PrinterOutlined />}
                            onClick={() => selectedInvoice && handlePrint(selectedInvoice)}
                        >
                            In
                        </Button>
                    </Space>
                }
            >
                {selectedInvoice && (
                    <div>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Mã hóa đơn" span={2}>
                                <strong>{selectedInvoice.ma_hoa_don}</strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày bán" span={2}>
                                {dayjs(selectedInvoice.ngay_ban).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng" span={2}>
                                {selectedInvoice.khach_hang?.name || selectedInvoice.khach_hang?.ho_ten || 'Khách lẻ'}
                                {selectedInvoice.khach_hang?.phone && ` - ${selectedInvoice.khach_hang.phone}`}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chi nhánh" span={2}>
                                {selectedInvoice.chi_nhanh?.ten_chi_nhanh}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người bán" span={2}>
                                {selectedInvoice.nguoi_ban || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái" span={2}>
                                {getStatusTag(selectedInvoice.trang_thai)}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider>Chi tiết sản phẩm/dịch vụ</Divider>
                        <Table
                            dataSource={selectedInvoice.chi_tiets}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            columns={[
                                {
                                    title: 'Tên',
                                    dataIndex: 'ten',
                                    render: (_, record) => (
                                        <div>
                                            {record.dich_vu?.ten_dich_vu || record.san_pham?.ten_san_pham}
                                            {record.ktv && (
                                                <div style={{ fontSize: 12, color: '#999' }}>
                                                    KTV: {record.ktv.admin_user?.name}
                                                </div>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    title: 'SL',
                                    dataIndex: 'so_luong',
                                    width: 60,
                                    align: 'center',
                                },
                                {
                                    title: 'Đơn giá',
                                    dataIndex: 'don_gia',
                                    width: 100,
                                    align: 'right',
                                    render: (value) => `${value.toLocaleString()} ₫`,
                                },
                                {
                                    title: 'Thành tiền',
                                    dataIndex: 'thanh_tien',
                                    width: 120,
                                    align: 'right',
                                    render: (value) => (
                                        <strong style={{ color: '#52c41a' }}>
                                            {value.toLocaleString()} ₫
                                        </strong>
                                    ),
                                },
                            ]}
                        />

                        <Divider>Thông tin thanh toán</Divider>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Tổng tiền dịch vụ">
                                {selectedInvoice.tong_tien_dich_vu.toLocaleString()} ₫
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền sản phẩm">
                                {selectedInvoice.tong_tien_san_pham.toLocaleString()} ₫
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng cộng">
                                <strong>{selectedInvoice.tong_tien.toLocaleString()} ₫</strong>
                            </Descriptions.Item>
                            {selectedInvoice.giam_gia > 0 && (
                                <Descriptions.Item label="Giảm giá">
                                    <span style={{ color: '#ff4d4f' }}>
                                        -{selectedInvoice.giam_gia.toLocaleString()} ₫
                                    </span>
                                </Descriptions.Item>
                            )}
                            {selectedInvoice.tien_tip > 0 && (
                                <Descriptions.Item label="Tiền tip">
                                    <span style={{ color: '#52c41a' }}>
                                        +{selectedInvoice.tien_tip.toLocaleString()} ₫
                                    </span>
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Tổng thanh toán">
                                <strong style={{ color: '#1890ff', fontSize: 18 }}>
                                    {selectedInvoice.tong_thanh_toan.toLocaleString()} ₫
                                </strong>
                            </Descriptions.Item>
                            {selectedInvoice.phuong_thuc_thanh_toan && (
                                <Descriptions.Item label="Phương thức thanh toán">
                                    {Object.entries(selectedInvoice.phuong_thuc_thanh_toan).map(([key, value]: [string, any]) => (
                                        <Tag key={key}>{key}: {value.toLocaleString()} ₫</Tag>
                                    ))}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {selectedInvoice.hoa_hongs && selectedInvoice.hoa_hongs.length > 0 && (
                            <>
                                <Divider>Hoa hồng KTV</Divider>
                                <Table
                                    dataSource={selectedInvoice.hoa_hongs}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                    columns={[
                                        {
                                            title: 'KTV',
                                            dataIndex: 'ktv',
                                            render: (ktv) => ktv?.admin_user?.name,
                                        },
                                        {
                                            title: 'Giá trị gốc',
                                            dataIndex: 'gia_tri_goc',
                                            align: 'right',
                                            render: (value) => `${value.toLocaleString()} ₫`,
                                        },
                                        {
                                            title: 'Tỷ lệ',
                                            dataIndex: 'ti_le_hoa_hong',
                                            align: 'center',
                                            render: (value) => `${value}%`,
                                        },
                                        {
                                            title: 'Hoa hồng',
                                            dataIndex: 'tien_hoa_hong',
                                            align: 'right',
                                            render: (value) => (
                                                <strong style={{ color: '#52c41a' }}>
                                                    {value.toLocaleString()} ₫
                                                </strong>
                                            ),
                                        },
                                    ]}
                                />
                            </>
                        )}

                        {selectedInvoice.ghi_chu && (
                            <>
                                <Divider>Ghi chú</Divider>
                                <p>{selectedInvoice.ghi_chu}</p>
                            </>
                        )}
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default InvoiceList;
