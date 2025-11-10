import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
    Card,
    Row,
    Col,
    Statistic,
    DatePicker,
    Space,
    Table,
    Tag,
    Tabs,
    Button,
} from 'antd';
import {
    DollarOutlined,
    RiseOutlined,
    FallOutlined,
    BankOutlined,
    FileTextOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import API from '../../common/api';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface Overview {
    tong_thu: number;
    tong_chi: number;
    loi_nhuan: number;
    so_du_ngan_hang: number;
    tong_cong_no: number;
    hoa_don_qua_han: number;
    doanh_thu: number;
    da_thu: number;
    con_phai_thu: number;
}

interface CashFlowItem {
    ngay: string;
    thu: number;
    chi: number;
    chenh_lech: number;
}

interface CongNoItem {
    ten_khach_hang: string;
    tong_tien: number;
    da_thanh_toan: number;
    con_lai: number;
    so_hoa_don: number;
    ngay_gan_nhat: string;
}

interface ChartDataItem {
    name: string;
    value: number;
    [key: string]: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

const ERPDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [overview, setOverview] = useState<Overview>({
        tong_thu: 0,
        tong_chi: 0,
        loi_nhuan: 0,
        so_du_ngan_hang: 0,
        tong_cong_no: 0,
        hoa_don_qua_han: 0,
        doanh_thu: 0,
        da_thu: 0,
        con_phai_thu: 0,
    });

    const [cashFlowData, setCashFlowData] = useState<CashFlowItem[]>([]);
    const [congNoData, setCongNoData] = useState<CongNoItem[]>([]);
    const [chartThuChi, setChartThuChi] = useState<ChartDataItem[]>([]);
    const [chartTopKhachHang, setChartTopKhachHang] = useState<ChartDataItem[]>([]);
    const [chartTaiKhoan, setChartTaiKhoan] = useState<ChartDataItem[]>([]);

    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('month'),
    ]);

    useEffect(() => {
        fetchAllData();
    }, [dateRange]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const tu_ngay = dateRange[0].format('YYYY-MM-DD');
            const den_ngay = dateRange[1].format('YYYY-MM-DD');

            // Tổng quan
            const overviewRes = await axios.post(API.erpDashboardOverview, { tu_ngay, den_ngay });
            if (overviewRes.data.status_code === 200) {
                setOverview(overviewRes.data.data);
            }

            // Dòng tiền
            const cashFlowRes = await axios.post(API.erpDashboardCashFlow, {
                tu_ngay,
                den_ngay,
                group_by: 'day',
            });
            if (cashFlowRes.data.status_code === 200) {
                setCashFlowData(cashFlowRes.data.data || []);
            }

            // Công nợ
            const congNoRes = await axios.post(API.erpDashboardCongNo, { loai: 'phai_thu' });
            if (congNoRes.data.status_code === 200) {
                setCongNoData(congNoRes.data.data.danh_sach || []);
            }

            // Biểu đồ thu chi theo tháng
            const thuChiRes = await axios.post(API.erpDashboardChart, {
                type: 'thu_chi_theo_thang',
                nam: dayjs().year(),
            });
            if (thuChiRes.data.status_code === 200) {
                setChartThuChi(thuChiRes.data.data || []);
            }

            // Top khách hàng
            const topKhachRes = await axios.post(API.erpDashboardChart, {
                type: 'top_khach_hang',
            });
            if (topKhachRes.data.status_code === 200) {
                setChartTopKhachHang(topKhachRes.data.data || []);
            }

            // Tài khoản ngân hàng
            const taiKhoanRes = await axios.post(API.erpDashboardChart, {
                type: 'tai_khoan_ngan_hang',
            });
            if (taiKhoanRes.data.status_code === 200) {
                setChartTaiKhoan(taiKhoanRes.data.data || []);
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const congNoColumns = [
        {
            title: 'Khách hàng',
            dataIndex: 'ten_khach_hang',
            key: 'ten_khach_hang',
        },
        {
            title: 'Số hóa đơn',
            dataIndex: 'so_hoa_don',
            key: 'so_hoa_don',
            width: 100,
            align: 'center' as const,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'tong_tien',
            key: 'tong_tien',
            width: 150,
            align: 'right' as const,
            render: (value: number) => `${value.toLocaleString('vi-VN')} đ`,
        },
        {
            title: 'Đã thanh toán',
            dataIndex: 'da_thanh_toan',
            key: 'da_thanh_toan',
            width: 150,
            align: 'right' as const,
            render: (value: number) => (
                <span style={{ color: '#52c41a' }}>{value.toLocaleString('vi-VN')} đ</span>
            ),
        },
        {
            title: 'Còn lại',
            dataIndex: 'con_lai',
            key: 'con_lai',
            width: 150,
            align: 'right' as const,
            render: (value: number) => (
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                    {value.toLocaleString('vi-VN')} đ
                </span>
            ),
        },
        {
            title: 'Ngày gần nhất',
            dataIndex: 'ngay_gan_nhat',
            key: 'ngay_gan_nhat',
            width: 120,
            render: (text: string) => (text ? dayjs(text).format('DD/MM/YYYY') : '-'),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <h2 style={{ margin: 0 }}>
                        <DollarOutlined style={{ marginRight: 8 }} />
                        Dashboard Tài chính
                    </h2>
                </Col>
                <Col>
                    <Space>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => {
                                if (dates && dates[0] && dates[1]) {
                                    setDateRange([dates[0], dates[1]]);
                                }
                            }}
                            format="DD/MM/YYYY"
                        />
                        <Button icon={<ReloadOutlined />} onClick={fetchAllData}>
                            Làm mới
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Cards tổng quan */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Tổng thu"
                            value={overview.tong_thu}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<RiseOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Tổng chi"
                            value={overview.tong_chi}
                            precision={0}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<FallOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Lợi nhuận"
                            value={overview.loi_nhuan}
                            precision={0}
                            valueStyle={{
                                color: overview.loi_nhuan >= 0 ? '#3f8600' : '#cf1322',
                            }}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Số dư ngân hàng"
                            value={overview.so_du_ngan_hang}
                            precision={0}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<BankOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Tổng công nợ"
                            value={overview.tong_cong_no}
                            precision={0}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<FileTextOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic
                            title="Hóa đơn quá hạn"
                            value={overview.hoa_don_qua_han}
                            valueStyle={{ color: '#cf1322' }}
                            suffix="hóa đơn"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ */}
            <Tabs defaultActiveKey="1">
                <TabPane tab="Dòng tiền" key="1">
                    <Card title="Biểu đồ dòng tiền theo ngày">
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={cashFlowData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="ngay"
                                    tickFormatter={(value) => dayjs(value).format('DD/MM')}
                                />
                                <YAxis
                                    tickFormatter={(value) =>
                                        `${(value / 1000000).toFixed(0)}M`
                                    }
                                />
                                <Tooltip
                                    formatter={(value: number) =>
                                        `${value.toLocaleString('vi-VN')} đ`
                                    }
                                    labelFormatter={(label) => dayjs(label).format('DD/MM/YYYY')}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="thu"
                                    stroke="#52c41a"
                                    name="Thu"
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="chi"
                                    stroke="#ff4d4f"
                                    name="Chi"
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="chenh_lech"
                                    stroke="#1890ff"
                                    name="Chênh lệch"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </TabPane>

                <TabPane tab="Thu chi theo tháng" key="2">
                    <Card title={`Thu chi năm ${dayjs().year()}`}>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={chartThuChi}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="thang" />
                                <YAxis
                                    tickFormatter={(value) =>
                                        `${(value / 1000000).toFixed(0)}M`
                                    }
                                />
                                <Tooltip
                                    formatter={(value: number) =>
                                        `${value.toLocaleString('vi-VN')} đ`
                                    }
                                />
                                <Legend />
                                <Bar dataKey="thu" fill="#52c41a" name="Thu" />
                                <Bar dataKey="chi" fill="#ff4d4f" name="Chi" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </TabPane>

                <TabPane tab="Top khách hàng" key="3">
                    <Card title="Top 10 khách hàng theo doanh thu">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={chartTopKhachHang} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    type="number"
                                    tickFormatter={(value) =>
                                        `${(value / 1000000).toFixed(0)}M`
                                    }
                                />
                                <YAxis dataKey="ten_khach_hang" type="category" width={150} />
                                <Tooltip
                                    formatter={(value: number) =>
                                        `${value.toLocaleString('vi-VN')} đ`
                                    }
                                />
                                <Bar dataKey="doanh_thu" fill="#1890ff" name="Doanh thu" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </TabPane>

                <TabPane tab="Tài khoản ngân hàng" key="4">
                    <Card title="Phân bổ số dư tài khoản ngân hàng">
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie
                                    data={chartTaiKhoan}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                                    }
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="so_du"
                                >
                                    {chartTaiKhoan.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) =>
                                        `${value.toLocaleString('vi-VN')} đ`
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </TabPane>

                <TabPane tab="Công nợ" key="5">
                    <Card title="Danh sách công nợ khách hàng">
                        <Table
                            columns={congNoColumns}
                            dataSource={congNoData}
                            rowKey="ten_khach_hang"
                            pagination={{ pageSize: 10 }}
                            loading={loading}
                            summary={(pageData) => {
                                let tongTien = 0;
                                let daThanhToan = 0;
                                let conLai = 0;

                                pageData.forEach(({ tong_tien, da_thanh_toan, con_lai }) => {
                                    tongTien += tong_tien;
                                    daThanhToan += da_thanh_toan;
                                    conLai += con_lai;
                                });

                                return (
                                    <Table.Summary.Row style={{ fontWeight: 'bold' }}>
                                        <Table.Summary.Cell index={0}>Tổng cộng</Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} align="center">
                                            {pageData.length}
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={2} align="right">
                                            {tongTien.toLocaleString('vi-VN')} đ
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={3} align="right">
                                            <span style={{ color: '#52c41a' }}>
                                                {daThanhToan.toLocaleString('vi-VN')} đ
                                            </span>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={4} align="right">
                                            <span style={{ color: '#ff4d4f' }}>
                                                {conLai.toLocaleString('vi-VN')} đ
                                            </span>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={5} />
                                    </Table.Summary.Row>
                                );
                            }}
                        />
                    </Card>
                </TabPane>
            </Tabs>
        </div>
    );
};

// Mount component
const rootElement = document.getElementById('erp-dashboard-root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<ERPDashboard />);
}

export default ERPDashboard;
