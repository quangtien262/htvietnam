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

// Mock data theo tòa nhà
const buildingData = [
    { building: "Tòa A", profit: 45000000, label: "Tòa nhà A", color: "#1890ff", rooms: 12 },
    { building: "Tòa B", profit: 38000000, label: "Tòa nhà B", color: "#52c41a", rooms: 10 },
    { building: "Tòa C", profit: 52000000, label: "Tòa nhà C", color: "#faad14", rooms: 15 },
    { building: "Tòa D", profit: 30000000, label: "Tòa nhà D", color: "#f5222d", rooms: 8 },
    { building: "Tòa E", profit: 41000000, label: "Tòa nhà E", color: "#722ed1", rooms: 11 },
];

const tableData = [
    { key: 1, building: "Tòa A", profit: 45000000, rooms: 12, rate: 15.2, occupancy: 92 },
    { key: 2, building: "Tòa B", profit: 38000000, rooms: 10, rate: 12.8, occupancy: 85 },
    { key: 3, building: "Tòa C", profit: 52000000, rooms: 15, rate: 18.5, occupancy: 95 },
    { key: 4, building: "Tòa D", profit: 30000000, rooms: 8, rate: 10.2, occupancy: 78 },
    { key: 5, building: "Tòa E", profit: 41000000, rooms: 11, rate: 14.1, occupancy: 88 },
];

const COLORS = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1", "#13c2c2"];

const TotalReport: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
    const [loading, setLoading] = useState(false);

    // function fetchData(request = {}) {
    //     setLoading(true);
    //     axios.post(API.ai_tongLoiNhuan, request)
    //         .then((res: any) => {
    //             const propsTmp = res.data.data;
    //             setLoading(false);
    //         })
    //         .catch((err: any) => console.error(err));

    // }
    // useEffect(() => {
    //     fetchData();
    // }, []);

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

    const data = {
        totalProfit: 206000000,
        monthProfit: 52000000,
        growth: 18.5,
        buildingCount: 5,
        totalRooms: 56,
        avgOccupancy: 87.6,
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
            render: (value: number) => (
                <Text>{value} phòng</Text>
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
                        <ApartmentOutlined /> {record.building} ({record.rooms} phòng)
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
        // TODO: Call API để lấy dữ liệu theo tháng đã chọn
        console.log('Tìm kiếm dữ liệu tháng:', selectedMonth.format('MM/YYYY'));

        setTimeout(() => {
            setLoading(false);
        }, 500);
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
                        <TrophyOutlined /> Báo cáo lợi nhuận theo tòa nhà
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
                                    onChange={(date) => setSelectedMonth(date || dayjs())}
                                    format="MM/YYYY"
                                    placeholder="Chọn tháng"
                                    style={{ width: '100%' }}
                                    size="middle"
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
                        <Card size="small" style={{ textAlign: 'center', background: '#f0f9ff' }}>
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
                        <Card size="small" style={{ textAlign: 'center', background: '#f6ffed' }}>
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
                        <Card size="small" style={{ textAlign: 'center', background: '#fff7e6' }}>
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
                        <Card size="small" style={{ textAlign: 'center', background: '#fff0f6' }}>
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
                                        {buildingData.map((entry, index) => (
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

export default TotalReport;
