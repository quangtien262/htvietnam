import React, { useState } from 'react';
import {
    Card, Row, Col, DatePicker, Select, Button, Space, Table, Tabs, Tag, Typography,
    message, Statistic, Radio, Checkbox, Form, Divider, Alert
} from 'antd';
import {
    DownloadOutlined, FileExcelOutlined, FilePdfOutlined, PrinterOutlined,
    CalendarOutlined, DollarOutlined, UserOutlined, ShoppingOutlined,
    TeamOutlined, GiftOutlined, BarChartOutlined, FileTextOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import API_SPA from '../../common/api_spa';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

interface ReportData {
    date: string;
    revenue: number;
    customers: number;
    bookings: number;
    services: number;
    products: number;
}

interface DetailedTransaction {
    id: number;
    ma_hoa_don: string;
    ngay_tao: string;
    ten_khach_hang: string;
    dich_vu: string;
    tong_tien: number;
    giam_gia: number;
    thanh_toan: number;
    trang_thai: string;
}

interface StaffReport {
    id: number;
    ten_nhan_vien: string;
    so_khach: number;
    doanh_thu: number;
    hoa_hong: number;
    diem_danh_gia: number;
}

interface InventoryReport {
    id: number;
    ten_san_pham: string;
    ton_dau_ky: number;
    nhap: number;
    xuat: number;
    ton_cuoi_ky: number;
    gia_tri_ton: number;
}

const ReportPage: React.FC = () => {
    // State
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('revenue');
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().startOf('month'),
        dayjs()
    ]);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

    // Report Data
    const [reportData, setReportData] = useState<ReportData[]>([]);
    const [transactions, setTransactions] = useState<DetailedTransaction[]>([]);
    const [staffReport, setStaffReport] = useState<StaffReport[]>([]);
    const [inventoryReport, setInventoryReport] = useState<InventoryReport[]>([]);

    // Totals
    const [totals, setTotals] = useState({
        revenue: 0,
        customers: 0,
        bookings: 0,
        avgOrder: 0,
    });

    // Export settings
    const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('excel');
    const [includeCharts, setIncludeCharts] = useState(true);

    const loadReportData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'revenue':
                    endpoint = API_SPA.spaReportRevenue;
                    break;
                case 'transactions':
                    endpoint = API_SPA.spaReportTransactions;
                    break;
                case 'staff':
                    endpoint = API_SPA.spaReportStaff;
                    break;
                case 'inventory':
                    endpoint = API_SPA.spaReportInventory;
                    break;
            }

            const response = await axios.post(endpoint, {
                start_date: dateRange[0].format('YYYY-MM-DD'),
                end_date: dateRange[1].format('YYYY-MM-DD'),
                branch_id: branchId,
                group_by: groupBy,
            });

            if (response.data.success) {
                const data = response.data.data;

                switch (activeTab) {
                    case 'revenue':
                        setReportData(data.report || []);
                        setTotals(data.totals || {});
                        break;
                    case 'transactions':
                        setTransactions(data.transactions || []);
                        setTotals(data.totals || {});
                        break;
                    case 'staff':
                        setStaffReport(data.staff || []);
                        break;
                    case 'inventory':
                        setInventoryReport(data.inventory || []);
                        break;
                }
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu báo cáo');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            message.loading(`Đang xuất báo cáo ${exportFormat.toUpperCase()}...`, 0);

            const response = await axios.post(API_SPA.spaReportExport, {
                type: activeTab,
                format: exportFormat,
                start_date: dateRange[0].format('YYYY-MM-DD'),
                end_date: dateRange[1].format('YYYY-MM-DD'),
                branch_id: branchId,
                group_by: groupBy,
                include_charts: includeCharts,
            }, {
                responseType: 'blob',
            });

            const extension = exportFormat === 'excel' ? 'xlsx' : 'pdf';
            const filename = `report_${activeTab}_${dayjs().format('YYYYMMDD_HHmmss')}.${extension}`;

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            message.destroy();
            message.success('Xuất báo cáo thành công');
        } catch (error) {
            message.destroy();
            message.error('Không thể xuất báo cáo');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Revenue Report Columns
    const revenueColumns: ColumnsType<ReportData> = [
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right',
            render: (value: number) => (
                <Text strong style={{ color: '#f5222d' }}>
                    {value.toLocaleString()}
                </Text>
            ),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customers',
            key: 'customers',
            align: 'center',
            render: (value: number) => <Tag color="blue">{value}</Tag>,
        },
        {
            title: 'Booking',
            dataIndex: 'bookings',
            key: 'bookings',
            align: 'center',
            render: (value: number) => <Tag color="green">{value}</Tag>,
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'services',
            key: 'services',
            align: 'center',
            render: (value: number) => <Tag color="purple">{value}</Tag>,
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'products',
            key: 'products',
            align: 'center',
            render: (value: number) => <Tag color="orange">{value}</Tag>,
        },
    ];

    // Transaction Columns
    const transactionColumns: ColumnsType<DetailedTransaction> = [
        {
            title: 'Mã HĐ',
            dataIndex: 'ma_hoa_don',
            key: 'ma_hoa_don',
            width: 120,
            render: (value: string) => <Tag color="blue">{value}</Tag>,
        },
        {
            title: 'Ngày',
            dataIndex: 'ngay_tao',
            key: 'ngay_tao',
            width: 120,
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'ten_khach_hang',
            key: 'ten_khach_hang',
            width: 200,
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'dich_vu',
            key: 'dich_vu',
            ellipsis: true,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'tong_tien',
            key: 'tong_tien',
            align: 'right',
            width: 120,
            render: (value: number) => value.toLocaleString(),
        },
        {
            title: 'Giảm giá',
            dataIndex: 'giam_gia',
            key: 'giam_gia',
            align: 'right',
            width: 100,
            render: (value: number) => (
                <Text type="danger">-{value.toLocaleString()}</Text>
            ),
        },
        {
            title: 'Thanh toán',
            dataIndex: 'thanh_toan',
            key: 'thanh_toan',
            align: 'right',
            width: 120,
            render: (value: number) => (
                <Text strong style={{ color: '#52c41a' }}>
                    {value.toLocaleString()}
                </Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 120,
            render: (status: string) => (
                <Tag color={status === 'hoan_thanh' ? 'green' : 'orange'}>
                    {status === 'hoan_thanh' ? 'Hoàn thành' : 'Chưa hoàn thành'}
                </Tag>
            ),
        },
    ];

    // Staff Report Columns
    const staffColumns: ColumnsType<StaffReport> = [
        {
            title: 'Nhân viên',
            dataIndex: 'ten_nhan_vien',
            key: 'ten_nhan_vien',
        },
        {
            title: 'Số khách',
            dataIndex: 'so_khach',
            key: 'so_khach',
            align: 'center',
            render: (value: number) => <Tag color="blue">{value}</Tag>,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'doanh_thu',
            key: 'doanh_thu',
            align: 'right',
            render: (value: number) => (
                <Text strong style={{ color: '#f5222d' }}>
                    {value.toLocaleString()}
                </Text>
            ),
        },
        {
            title: 'Hoa hồng',
            dataIndex: 'hoa_hong',
            key: 'hoa_hong',
            align: 'right',
            render: (value: number) => (
                <Text style={{ color: '#52c41a' }}>
                    {value.toLocaleString()}
                </Text>
            ),
        },
        {
            title: 'Đánh giá TB',
            dataIndex: 'diem_danh_gia',
            key: 'diem_danh_gia',
            align: 'center',
            render: (value: number) => (
                <Tag color={value >= 4.5 ? 'green' : value >= 4 ? 'blue' : 'orange'}>
                    {value.toFixed(1)} ⭐
                </Tag>
            ),
        },
    ];

    // Inventory Report Columns
    const inventoryColumns: ColumnsType<InventoryReport> = [
        {
            title: 'Sản phẩm',
            dataIndex: 'ten_san_pham',
            key: 'ten_san_pham',
        },
        {
            title: 'Tồn đầu kỳ',
            dataIndex: 'ton_dau_ky',
            key: 'ton_dau_ky',
            align: 'center',
        },
        {
            title: 'Nhập',
            dataIndex: 'nhap',
            key: 'nhap',
            align: 'center',
            render: (value: number) => <Text type="success">+{value}</Text>,
        },
        {
            title: 'Xuất',
            dataIndex: 'xuat',
            key: 'xuat',
            align: 'center',
            render: (value: number) => <Text type="danger">-{value}</Text>,
        },
        {
            title: 'Tồn cuối kỳ',
            dataIndex: 'ton_cuoi_ky',
            key: 'ton_cuoi_ky',
            align: 'center',
            render: (value: number) => <Tag color="blue">{value}</Tag>,
        },
        {
            title: 'Giá trị tồn',
            dataIndex: 'gia_tri_ton',
            key: 'gia_tri_ton',
            align: 'right',
            render: (value: number) => (
                <Text strong>{value.toLocaleString()} VNĐ</Text>
            ),
        },
    ];

    const tabItems = [
        {
            key: 'revenue',
            label: (
                <span>
                    <DollarOutlined /> Báo cáo doanh thu
                </span>
            ),
            children: (
                <div>
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Tổng doanh thu"
                                    value={totals.revenue}
                                    prefix={<DollarOutlined />}
                                    suffix="VNĐ"
                                    valueStyle={{ color: '#f5222d' }}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Tổng khách hàng"
                                    value={totals.customers}
                                    prefix={<UserOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Tổng booking"
                                    value={totals.bookings}
                                    prefix={<CalendarOutlined />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Giá trị TB/đơn"
                                    value={totals.avgOrder}
                                    prefix={<ShoppingOutlined />}
                                    suffix="VNĐ"
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Table
                        columns={revenueColumns}
                        dataSource={reportData}
                        rowKey="date"
                        loading={loading}
                        pagination={{ pageSize: 20 }}
                        summary={(data) => {
                            const total = data.reduce((sum, record) => sum + record.revenue, 0);
                            const totalCustomers = data.reduce((sum, record) => sum + record.customers, 0);
                            const totalBookings = data.reduce((sum, record) => sum + record.bookings, 0);
                            const totalServices = data.reduce((sum, record) => sum + record.services, 0);
                            const totalProducts = data.reduce((sum, record) => sum + record.products, 0);

                            return (
                                <Table.Summary.Row style={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                                    <Table.Summary.Cell index={0}>Tổng cộng</Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right">
                                        <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
                                            {total.toLocaleString()}
                                        </Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} align="center">{totalCustomers}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={3} align="center">{totalBookings}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={4} align="center">{totalServices}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={5} align="center">{totalProducts}</Table.Summary.Cell>
                                </Table.Summary.Row>
                            );
                        }}
                    />
                </div>
            ),
        },
        {
            key: 'transactions',
            label: (
                <span>
                    <FileTextOutlined /> Chi tiết giao dịch
                </span>
            ),
            children: (
                <Table
                    columns={transactionColumns}
                    dataSource={transactions}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 20 }}
                    scroll={{ x: 1400 }}
                    summary={(data) => {
                        const totalAmount = data.reduce((sum, record) => sum + record.thanh_toan, 0);
                        const totalDiscount = data.reduce((sum, record) => sum + record.giam_gia, 0);

                        return (
                            <Table.Summary.Row style={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                                <Table.Summary.Cell index={0} colSpan={4}>Tổng cộng</Table.Summary.Cell>
                                <Table.Summary.Cell index={4} align="right" />
                                <Table.Summary.Cell index={5} align="right">
                                    <Text type="danger">-{totalDiscount.toLocaleString()}</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={6} align="right">
                                    <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                                        {totalAmount.toLocaleString()}
                                    </Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={7} />
                            </Table.Summary.Row>
                        );
                    }}
                />
            ),
        },
        {
            key: 'staff',
            label: (
                <span>
                    <TeamOutlined /> Báo cáo nhân viên
                </span>
            ),
            children: (
                <Table
                    columns={staffColumns}
                    dataSource={staffReport}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    summary={(data) => {
                        const totalCustomers = data.reduce((sum, record) => sum + record.so_khach, 0);
                        const totalRevenue = data.reduce((sum, record) => sum + record.doanh_thu, 0);
                        const totalCommission = data.reduce((sum, record) => sum + record.hoa_hong, 0);

                        return (
                            <Table.Summary.Row style={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                                <Table.Summary.Cell index={0}>Tổng cộng</Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="center">{totalCustomers}</Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
                                        {totalRevenue.toLocaleString()}
                                    </Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={3} align="right">
                                    <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                                        {totalCommission.toLocaleString()}
                                    </Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={4} />
                            </Table.Summary.Row>
                        );
                    }}
                />
            ),
        },
        {
            key: 'inventory',
            label: (
                <span>
                    <GiftOutlined /> Báo cáo tồn kho
                </span>
            ),
            children: (
                <Table
                    columns={inventoryColumns}
                    dataSource={inventoryReport}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 20 }}
                    summary={(data) => {
                        const totalValue = data.reduce((sum, record) => sum + record.gia_tri_ton, 0);

                        return (
                            <Table.Summary.Row style={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                                <Table.Summary.Cell index={0} colSpan={5}>Tổng giá trị tồn kho</Table.Summary.Cell>
                                <Table.Summary.Cell index={5} align="right">
                                    <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
                                        {totalValue.toLocaleString()} VNĐ
                                    </Text>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        );
                    }}
                />
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <Card style={{ marginBottom: 24 }}>
                <Row justify="space-between" align="middle" gutter={16}>
                    <Col flex="auto">
                        <Space wrap>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
                                format="DD/MM/YYYY"
                            />
                            <Select
                                placeholder="Tất cả chi nhánh"
                                allowClear
                                style={{ width: 200 }}
                                value={branchId}
                                onChange={setBranchId}
                            >
                                <Option value={1}>Chi nhánh 1</Option>
                                <Option value={2}>Chi nhánh 2</Option>
                            </Select>
                            <Radio.Group value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                                <Radio.Button value="day">Ngày</Radio.Button>
                                <Radio.Button value="week">Tuần</Radio.Button>
                                <Radio.Button value="month">Tháng</Radio.Button>
                            </Radio.Group>
                            <Button
                                type="primary"
                                icon={<BarChartOutlined />}
                                onClick={loadReportData}
                            >
                                Xem báo cáo
                            </Button>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Select
                                value={exportFormat}
                                onChange={setExportFormat}
                                style={{ width: 120 }}
                            >
                                <Option value="excel">
                                    <FileExcelOutlined /> Excel
                                </Option>
                                <Option value="pdf">
                                    <FilePdfOutlined /> PDF
                                </Option>
                            </Select>
                            <Checkbox
                                checked={includeCharts}
                                onChange={(e) => setIncludeCharts(e.target.checked)}
                            >
                                Kèm biểu đồ
                            </Checkbox>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={handleExport}
                            >
                                Xuất file
                            </Button>
                            <Button
                                icon={<PrinterOutlined />}
                                onClick={handlePrint}
                            >
                                In
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Report Tabs */}
            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                />
            </Card>
        </div>
    );
};

export default ReportPage;
