import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../../common/api";
import { Card, Statistic, Row, Col, Table, Typography, DatePicker, Space, Button } from "antd";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, Cell
} from "recharts";
import {
    DollarOutlined, RiseOutlined, FallOutlined,
    TrophyOutlined, HomeOutlined, SearchOutlined,
    ReloadOutlined, ApartmentOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

import { showInfo } from "../../../function/common";

const { Text } = Typography;
const { MonthPicker } = DatePicker;

const COLORS = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1", "#13c2c2"];

interface ReportData {
    apartment_id: number;
    apartment_name: string;
    apartment_code: string;
    rooms_rented: number;
    total_rooms: number;
    total_income: number;
    total_cost: number;
    profit: number;
    rate_percent: number | null;
    occupancy_percent: number;
}

interface SummaryData {
    total_income: number;
    total_cost: number;
    total_profit: number;
    avg_occupancy: number;
    total_apartments: number;
}

const TienPhongReport: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<ReportData[]>([]);
    const [summary, setSummary] = useState<SummaryData>({
        total_income: 0,
        total_cost: 0,
        total_profit: 0,
        avg_occupancy: 0,
        total_apartments: 0
    });

    function fetchData(month?: number, year?: number) {
        setLoading(true);
        const request = {
            month: month || selectedMonth.month() + 1,
            year: year || selectedMonth.year()
        };

        axios.post(API.ai_loiNhuanTheoTienPhong, request)
            .then((res: any) => {
                const data = res.data.data;
                console.log('reportData: ', data);
                setReportData(data.report || []);
                setSummary(data.summary || {
                    total_income: 0,
                    total_cost: 0,
                    total_profit: 0,
                    avg_occupancy: 0,
                    total_apartments: 0
                });
                setLoading(false);
            })
            .catch((err: any) => {
                console.error(err);
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchData();
    }, []);

    function descriptionTySuat() {
        const des = <div>
            <p><b>Tỷ suất (ROI - Return on Investment)</b></p>
            <p><b>Ý nghĩa:</b> Đo lường hiệu quả kinh doanh, cho biết lợi nhuận thu được so với vốn đầu tư</p>
            <p><b>Tỷ suất =</b> (Lợi nhuận <b>/</b> Vốn đầu tư) <b>×</b> 100%</p>
            <p><b>Đánh giá:</b> </p>
            <ul>
                <li>15% trở lên: Rất tốt (màu xanh)</li>
                <li>10% - 15%: Tốt (màu xanh)</li>
                <li>dưới 10%: Cần cải thiện (màu đỏ)</li>
            </ul>
            <p><b>Mục đích:</b> Đánh giá hiệu quả tài chính, từ đó đưa ra các quyết định đầu tư hợp lý, có nên đầu tư và mở rộng tiếp hay không</p>
        </div>;
        return showInfo(<>{des}</>);
    }

    function descriptionCCongSuat() {
        const des = <div>
            <p><b>Công suất (Occupancy Rate) - %</b></p>
            <p><b>Ý nghĩa:</b> Đo lường hiệu quả kinh doanh, cho biết tỷ lệ phòng được thuê so với tổng số phòng</p>
            <p><b>Công suất =</b> (Số phòng đã cho thuê <b>/</b> Tổng số phòng) <b>×</b> 100%</p>
            <p><b>Đánh giá:</b> </p>
            <ul>
                <li>90% trở lên: Rất tốt (màu xanh)</li>
                <li>80% - 90%: Tốt (màu xanh)</li>
                <li>dưới 80%: Cần cải thiện (màu đỏ)</li>
            </ul>
            <p><b>Mục đích:</b> Đánh giá hiệu quả sử dụng phòng, từ đó đưa ra các chiến lược marketing, khuyến mãi để tăng tỷ lệ lấp đầy phòng</p>
        </div>;
        return showInfo(<>{des}</>);
    }

    // Transform reportData to chart format
    const buildingData = reportData.map((item) => ({
        building: item.apartment_code || item.apartment_name,
        profit: item.profit,
        label: item.apartment_code || item.apartment_name,
        rooms: item.rooms_rented,
    }));

    // Transform reportData to table format
    const tableData = reportData.map((item, index) => ({
        key: item.apartment_id || index,
        building: item.apartment_code || item.apartment_name,
        profit: item.profit,
        rooms: item.rooms_rented,
        total_rooms: item.total_rooms,
        rate: item.rate_percent || 0,
        occupancy: item.occupancy_percent || 0,
    }));

    // Calculate summary stats from reportData
    const maxProfit = reportData.length > 0
        ? Math.max(...reportData.map(r => r.profit))
        : 0;

    const data = {
        totalProfit: summary.total_profit,
        monthProfit: maxProfit,
        growth: 0, // TODO: Calculate growth if historical data available
        buildingCount: summary.total_apartments,
        totalRooms: reportData.reduce((sum, item) => sum + item.rooms_rented, 0),
        avgOccupancy: summary.avg_occupancy,
    };

    // Desktop columns
    const desktopColumns = [
        {
            title: 'Tòa nhà',
            dataIndex: 'building',
            key: 'building',
            render: (text: string) => (
                <Text strong><ApartmentOutlined /> {text}</Text>
            )
        },
        {
            title: 'Số phòng',
            dataIndex: 'rooms',
            key: 'rooms',
            align: 'center' as const,
            render: (value: number, record: any) => (
                <Text>{value}/{record.total_rooms} phòng</Text>
            ),
        },
        {
            title: 'Lợi nhuận',
            dataIndex: 'profit',
            key: 'profit',
            align: 'right' as const,
            render: (value: number) => (
                <Text strong style={{ color: '#52c41a' }}>
                    {value.toLocaleString('vi-VN')} ₫
                </Text>
            ),
            sorter: (a: any, b: any) => a.profit - b.profit,
        },
        {
            title: <div>Tỷ suất (%) {descriptionTySuat()}</div>,
            dataIndex: 'rate',
            key: 'rate',
            align: 'center' as const,
            render: (value: number) => (
                <Text style={{ color: value > 15 ? '#52c41a' : '#faad14' }}>
                    {value > 15 ? <RiseOutlined /> : <FallOutlined />} {value}%
                </Text>
            ),
            sorter: (a: any, b: any) => a.rate - b.rate,
        },
        {
            title: <div>Công suất (%) {descriptionCCongSuat()}</div>,
            dataIndex: 'occupancy',
            key: 'occupancy',
            align: 'center' as const,
            render: (value: number) => (
                <Text style={{ color: value > 90 ? '#52c41a' : value > 80 ? '#faad14' : '#f5222d' }}>
                    {value}%
                </Text>
            ),
            sorter: (a: any, b: any) => a.occupancy - b.occupancy,
        },
    ];

    // Mobile card render
    const renderMobileCard = (record: any) => (
        <Card
            key={record.key}
            size="small"
            style={{ marginBottom: 8 }}
        >
            <Row gutter={[8, 8]}>
                <Col span={24}>
                    <Text strong style={{ fontSize: '14px' }}>
                        <ApartmentOutlined /> {record.building} ({record.rooms}/{record.total_rooms} phòng)
                    </Text>
                </Col>
                <Col span={12}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Lợi nhuận:</Text>
                    <br />
                    <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
                        {record.profit.toLocaleString('vi-VN')} ₫
                    </Text>
                </Col>
                <Col span={12}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Tỷ suất:</Text>
                    <br />
                    <Text strong style={{ color: record.rate > 15 ? '#52c41a' : '#faad14', fontSize: '14px' }}>
                        {record.rate > 15 ? <RiseOutlined /> : <FallOutlined />} {record.rate}%
                    </Text>
                </Col>
                <Col span={12}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Công suất:</Text>
                    <br />
                    <Text strong style={{
                        color: record.occupancy > 90 ? '#52c41a' : record.occupancy > 80 ? '#faad14' : '#f5222d',
                        fontSize: '14px'
                    }}>
                        {record.occupancy}%
                    </Text>
                </Col>
            </Row>
        </Card>
    );

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '4px' }}>
                        {payload[0].payload.label}
                    </p>
                    <p style={{ margin: 0, color: '#52c41a' }}>
                        Lợi nhuận: {payload[0].value.toLocaleString('vi-VN')} ₫
                    </p>
                    <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                        Số phòng: {payload[0].payload.rooms} phòng
                    </p>
                </div>
            );
        }
        return null;
    };

    const handleSearch = () => {
        setLoading(true);
        const month = selectedMonth.month() + 1; // dayjs month is 0-indexed
        const year = selectedMonth.year();
        fetchData(month, year);
    };

    const handleMonthChange = (date: Dayjs | null) => {
        const newMonth = date || dayjs();
        setSelectedMonth(newMonth);
        // Auto-fetch on month change
        const month = newMonth.month() + 1;
        const year = newMonth.year();
        fetchData(month, year);
    };

    return (
        <div>
            <style>
                {`
                    @media (max-width: 768px) {
                        .ant-statistic-title {
                            font-size: 11px !important;
                        }
                        .ant-statistic-content {
                            font-size: 14px !important;
                        }
                        .ant-card-head-title {
                            font-size: 13px !important;
                        }
                        .d-none {
                            display: none !important;
                        }
                        .d-block {
                            display: block !important;
                        }
                    }
                    @media (min-width: 769px) {
                        .d-md-block {
                            display: block !important;
                        }
                        .d-md-none {
                            display: none !important;
                        }
                    }
                `}
            </style>

            <Card
                title={
                    <span style={{ fontSize: '16px' }}>
                        <TrophyOutlined /> Báo cáo lợi nhuận tiền phòng theo tòa nhà
                    </span>
                }
                bordered={false}
                size="small"
            >
                {/* Filter Section */}
                <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                    <Row gutter={[8, 8]} align="middle">
                        <Col xs={24} sm={12} md={8}>
                            <Space direction="vertical" size={2} style={{ width: '100%' }}>
                                <Text type="secondary" style={{ fontSize: '12px' }}>Chọn tháng/năm:</Text>
                                <MonthPicker
                                    value={selectedMonth}
                                    onChange={handleMonthChange}
                                    format="MM/YYYY"
                                    placeholder="Chọn tháng"
                                    style={{ width: '100%' }}
                                    size="middle"
                                    disabled={loading}
                                />
                            </Space>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Space style={{ width: '100%' }} size={8}>
                            </Space>
                        </Col>
                        <Col xs={24} sm={24} md={8}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                Đang xem: <Text strong style={{ color: '#1890ff' }}>
                                    Tháng {selectedMonth.format('MM/YYYY')}
                                </Text>
                            </Text>
                        </Col>
                    </Row>
                </Card>

                {/* Statistics Cards */}
                <Row gutter={[8, 16]}>
                    <Col xs={12} sm={12} md={6}>
                        <Card size="small" style={{ textAlign: 'center', background: '#f0f9ff' }} loading={loading}>
                            <Statistic
                                title="Tổng lợi nhuận"
                                value={data.totalProfit}
                                suffix="₫"
                                valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                                prefix={<DollarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                        <Card size="small" style={{ textAlign: 'center', background: '#f6ffed' }} loading={loading}>
                            <Statistic
                                title="Cao nhất"
                                value={data.monthProfit}
                                suffix="₫"
                                valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                                prefix={<RiseOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                        <Card size="small" style={{ textAlign: 'center', background: '#fff7e6' }} loading={loading}>
                            <Statistic
                                title="Số tòa nhà"
                                value={data.buildingCount}
                                suffix="tòa"
                                valueStyle={{ color: '#faad14', fontSize: '16px' }}
                                prefix={<ApartmentOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                        <Card size="small" style={{ textAlign: 'center', background: '#fff0f6' }} loading={loading}>
                            <Statistic
                                title="Công suất TB"
                                value={data.avgOccupancy}
                                suffix="%"
                                precision={1}
                                valueStyle={{ color: '#eb2f96', fontSize: '16px' }}
                                prefix={<HomeOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                <br />

                {/* Chart and Table */}
                <Row gutter={[8, 16]}>
                    {/* Bar Chart */}
                    <Col xs={24} sm={24} md={24}>
                        <Card
                            title={
                                <span style={{ fontSize: '14px' }}>
                                    Biểu đồ lợi nhuận theo tòa nhà - {selectedMonth.format('MM/YYYY')}
                                </span>
                            }
                            size="small"
                            loading={loading}
                        >
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart
                                    data={buildingData}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="building"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        style={{ fontSize: '12px' }}
                                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ fontSize: '12px' }}
                                        formatter={() => 'Lợi nhuận (VNĐ)'}
                                    />
                                    <Bar
                                        dataKey="profit"
                                        fill="#1890ff"
                                        radius={[8, 8, 0, 0]}
                                    >
                                        {buildingData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>

                    {/* Table */}
                    <Col xs={24} sm={24} md={24}>
                        <Card
                            title={<span style={{ fontSize: '14px' }}>Chi tiết lợi nhuận từng tòa nhà</span>}
                            size="small"
                            loading={loading}
                        >
                            {/* Desktop Table */}
                            <div className="d-none d-md-block">
                                <Table
                                    columns={desktopColumns}
                                    dataSource={tableData}
                                    pagination={false}
                                    size="small"
                                    scroll={{ x: 'max-content' }}
                                />
                            </div>

                            {/* Mobile Cards */}
                            <div className="d-block d-md-none">
                                {tableData.map(renderMobileCard)}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default TienPhongReport;
