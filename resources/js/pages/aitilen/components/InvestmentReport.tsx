import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Select, Spin, Statistic, Table, Modal, Space, Tag
} from 'antd';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { DollarOutlined, HomeOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import API from '../../../common/api';
import { numberFormat } from '../../../function/common';

const { Option } = Select;

// Màu sắc cho biểu đồ
const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];

// Hàm normalize string: loại bỏ dấu và chuyển về lowercase
const normalizeString = (str: string): string => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd');
};

// Hàm filter option cho Select
const filterOption = (input: string, option: any): boolean => {
    const normalizedInput = normalizeString(input);
    const normalizedLabel = normalizeString(option?.children || option?.label || '');
    return normalizedLabel.includes(normalizedInput);
};

interface ApartmentData {
    apartment_id: number;
    apartment_name: string;
    total_items: number;
    total_amount: number;
}

interface DetailData {
    id: number;
    name: string;
    price: number;
    apartment_id: number;
    apartment_name: string;
    loai_chi_id: number;
    loai_chi_name: string;
    supplier_name: string;
    created_at: string;
}

const InvestmentReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [apartmentList, setApartmentList] = useState<any[]>([]);
    const [selectedApartments, setSelectedApartments] = useState<number[]>([]);
    const [reportData, setReportData] = useState<ApartmentData[]>([]);
    const [detailData, setDetailData] = useState<DetailData[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedApartmentDetails, setSelectedApartmentDetails] = useState<DetailData[]>([]);
    const [selectedApartmentName, setSelectedApartmentName] = useState('');

    useEffect(() => {
        loadApartments();
    }, []);

    useEffect(() => {
        fetchReport();
    }, [selectedApartments]);

    const loadApartments = async () => {
        try {
            const res = await axios.post(API.dauTuSelectData, {});
            if (res?.data?.status_code === 200) {
                setApartmentList(res.data.data.apartments || []);
            }
        } catch (error) {
            console.error('Error loading apartments:', error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await axios.post(API.dauTuReport, {
                apartment_ids: selectedApartments.length > 0 ? selectedApartments : undefined,
            });

            if (res?.data?.status_code === 200) {
                const data = res.data.data;
                setReportData(data.summary || []);
                setDetailData(data.details || []);
                setTotalAmount(data.total_amount || 0);
                setTotalItems(data.total_items || 0);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const showApartmentDetails = (apartmentId: number, apartmentName: string) => {
        const details = detailData.filter(item => item.apartment_id === apartmentId);
        setSelectedApartmentDetails(details);
        setSelectedApartmentName(apartmentName);
        setDetailModalVisible(true);
    };

    // Columns cho bảng chi tiết popup
    const detailColumns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center' as const,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Tên chi phí',
            dataIndex: 'name',
            key: 'name',
            width: 200,
        },
        {
            title: 'Loại chi',
            dataIndex: 'loai_chi_name',
            key: 'loai_chi_name',
            width: 150,
            render: (text: string) => text || '-',
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplier_name',
            key: 'supplier_name',
            width: 150,
            render: (text: string) => text || '-',
        },
        {
            title: 'Số tiền',
            dataIndex: 'price',
            key: 'price',
            width: 150,
            align: 'right' as const,
            render: (value: number) => (
                <span style={{ fontWeight: 'bold', color: '#cf1322' }}>
                    {numberFormat(value ?? 0)} ₫
                </span>
            ),
        },
    ];

    // Columns cho bảng tổng hợp
    const summaryColumns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center' as const,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Tòa nhà',
            dataIndex: 'apartment_name',
            key: 'apartment_name',
            render: (text: string) => (
                <Space>
                    <HomeOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'total_items',
            key: 'total_items',
            width: 120,
            align: 'center' as const,
            render: (value: number) => <Tag color="blue">{value} chi phí</Tag>,
        },
        {
            title: 'Tổng tiền đầu tư',
            dataIndex: 'total_amount',
            key: 'total_amount',
            width: 200,
            align: 'right' as const,
            render: (value: number, record: ApartmentData) => (
                <a
                    onClick={() => showApartmentDetails(record.apartment_id, record.apartment_name)}
                    style={{ fontWeight: 'bold', color: '#1890ff', fontSize: 16 }}
                >
                    {numberFormat(value ?? 0)} ₫
                </a>
            ),
        },
    ];

    // Dữ liệu cho biểu đồ cột
    const barChartData = reportData.map(item => ({
        name: item.apartment_name,
        amount: item.total_amount,
        count: item.total_items,
    }));

    // Dữ liệu cho biểu đồ tròn
    const pieChartData = reportData.map(item => ({
        name: item.apartment_name,
        value: item.total_amount,
    }));

    return (
        <Spin spinning={loading}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Bộ lọc */}
                <Card size="small">
                    <Row gutter={16} align="middle">
                        <Col span={4}>
                            <strong>Chọn tòa nhà:</strong>
                        </Col>
                        <Col span={20}>
                            <Select
                                mode="multiple"
                                showSearch
                                filterOption={filterOption}
                                placeholder="Chọn tòa nhà để lọc (có thể chọn nhiều)"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedApartments}
                                onChange={(value) => setSelectedApartments(value)}
                                maxTagCount="responsive"
                            >
                                {apartmentList.map(item => (
                                    <Option key={item.id} value={item.id}>{item.name}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </Card>

                {/* Thống kê tổng quan */}
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                        <Card>
                            <Statistic
                                title="Tổng số tòa nhà"
                                value={reportData.length}
                                prefix={<HomeOutlined />}
                                suffix="tòa"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card>
                            <Statistic
                                title="Tổng số chi phí"
                                value={totalItems}
                                prefix={<FileTextOutlined />}
                                suffix="khoản"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                        <Card>
                            <Statistic
                                title="Tổng tiền đầu tư"
                                value={totalAmount}
                                prefix={<DollarOutlined />}
                                formatter={(value) => numberFormat(Number(value))}
                                suffix="₫"
                                valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Biểu đồ */}
                <Row gutter={16}>
                    <Col xs={24} lg={14}>
                        <Card title="Biểu đồ chi phí đầu tư theo tòa nhà" bordered={false}>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={barChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: number) => numberFormat(value) + ' ₫'}
                                    />
                                    <Legend />
                                    <Bar dataKey="amount" fill="#1890ff" name="Tổng tiền đầu tư" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col xs={24} lg={10}>
                        <Card title="Tỷ trọng chi phí theo tòa nhà" bordered={false}>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => `${entry.name}: ${(((entry.value ?? 0) / totalAmount) * 100).toFixed(1)}%`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => numberFormat(value) + ' ₫'} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                {/* Bảng tổng hợp */}
                <Card title="Bảng tổng hợp chi phí theo tòa nhà" bordered={false}>
                    <Table
                        columns={summaryColumns}
                        dataSource={reportData}
                        rowKey="apartment_id"
                        pagination={false}
                        summary={() => (
                            <Table.Summary fixed>
                                <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                                    <Table.Summary.Cell index={0} colSpan={2} align="center">
                                        <strong>TỔNG CỘNG</strong>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="center">
                                        <Tag color="blue" style={{ fontSize: 14 }}>{totalItems} chi phí</Tag>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} align="right">
                                        <strong style={{ color: '#cf1322', fontSize: 16 }}>
                                            {numberFormat(totalAmount)} ₫
                                        </strong>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        )}
                    />
                </Card>

                {/* Modal chi tiết */}
                <Modal
                    title={
                        <Space>
                            <HomeOutlined />
                            <span>Chi tiết chi phí - {selectedApartmentName}</span>
                        </Space>
                    }
                    open={detailModalVisible}
                    onCancel={() => setDetailModalVisible(false)}
                    width={1000}
                    footer={null}
                >
                    <Table
                        columns={detailColumns}
                        dataSource={selectedApartmentDetails}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        summary={() => (
                            <Table.Summary fixed>
                                <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                                        <strong>Tổng cộng:</strong>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right">
                                        <strong style={{ color: '#cf1322', fontSize: 16 }}>
                                            {numberFormat(selectedApartmentDetails.reduce((sum, item) => sum + item.price, 0))} ₫
                                        </strong>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        )}
                    />
                </Modal>
            </Space>
        </Spin>
    );
};

export default InvestmentReport;
