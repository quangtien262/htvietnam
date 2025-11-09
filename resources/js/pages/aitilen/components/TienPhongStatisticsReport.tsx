import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Select, DatePicker, Button, Divider, List, Tag, Spin, message, Modal, Table
} from 'antd';
import {
    HomeOutlined, CloudOutlined, SearchOutlined, ReloadOutlined, MehOutlined,
    BarChartOutlined, UnorderedListOutlined
} from '@ant-design/icons';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import axios from 'axios';
import { numberFormat } from '../../../function/common';
import API from '../../../common/api';

const { Option } = Select;

const TienPhongStatisticsReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [statisticsData, setStatisticsData] = useState<any>(null);
    const [apartmentChartData, setApartmentChartData] = useState<any[]>([]);
    const [apartments, setApartments] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [invoiceList, setInvoiceList] = useState<any[]>([]);
    const [loadingModal, setLoadingModal] = useState(false);

    const [searchParams, setSearchParams] = useState({
        month: dayjs().month() + 1,
        year: dayjs().year(),
        apartment_id: undefined,
        room_id: undefined,
    });
    const [selectedDate, setSelectedDate] = useState(dayjs());

    // Load danh sách tòa nhà
    useEffect(() => {
        loadApartments();
    }, []);

    // Load danh sách phòng khi chọn tòa nhà
    useEffect(() => {
        if (searchParams.apartment_id) {
            loadRooms(searchParams.apartment_id);
        } else {
            setRooms([]);
            setSearchParams(prev => ({ ...prev, room_id: undefined }));
        }
    }, [searchParams.apartment_id]);

    const loadApartments = async () => {
        try {
            const res = await axios.post(API.aitilen_apartmentList, {});
            if (res?.data?.status_code === 200) {
                setApartments(res.data.data.datas || []);
            }
        } catch (error) {
            console.error('Error loading apartments:', error);
        }
    };

    const loadRooms = async (apartmentId: number) => {
        try {
            const res = await axios.post(API.aitilen_apartmentRooms, { apartment_id: apartmentId });
            if (res?.data?.status_code === 200) {
                setRooms(res.data.data || []);
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
        }
    };

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            // Fetch general statistics
            const res = await axios.post(API.aitilen_invoiceStatistics, {
                searchData: searchParams
            });

            // Fetch apartment chart data
            const chartRes = await axios.post(API.aitilen_invoiceStatisticsByApartment, {
                searchData: {
                    month: searchParams.month,
                    year: searchParams.year,
                }
            });

            if (res?.data?.status_code === 200) {
                setStatisticsData(res.data.data);
            }

            if (chartRes?.data?.status_code === 200) {
                setApartmentChartData(chartRes.data.data || []);
            }

            if (res?.data?.status_code === 200 || chartRes?.data?.status_code === 200) {
                message.success('Tải thống kê thành công!');
            } else {
                message.error('Không thể tải thống kê');
            }
        } catch (error: any) {
            console.error('Error fetching statistics:', error);
            message.error('Có lỗi xảy ra khi tải thống kê');
        } finally {
            setLoading(false);
        }
    }; const handleSearch = () => {
        fetchStatistics();
    };

    const handleReset = () => {
        const now = dayjs();
        setSelectedDate(now);
        setSearchParams({
            month: now.month() + 1,
            year: now.year(),
            apartment_id: undefined,
            room_id: undefined,
        });
        setStatisticsData(null);
        setApartmentChartData([]);
    };

    const handleDateChange = (date: any) => {
        setSelectedDate(date);
        if (date) {
            setSearchParams({
                ...searchParams,
                month: date.month() + 1,
                year: date.year(),
            });
        }
    };

    const showInvoiceList = async (apartmentId: number, apartmentName: string) => {
        setModalTitle(`Danh sách hóa đơn - ${apartmentName}`);
        setIsModalVisible(true);
        setLoadingModal(true);

        try {
            const res = await axios.post(API.aitilen_invoiceIndexApi, {
                apartment_ids: [apartmentId],
                month: searchParams.month,
                year: searchParams.year
            });

            if (res?.data?.status_code === 200) {
                setInvoiceList(res.data.data.datas || []);
            }
        } catch (error) {
            console.error('Error loading invoices:', error);
            message.error('Không thể tải danh sách hóa đơn');
        } finally {
            setLoadingModal(false);
        }
    };

    const showInvoiceListByService = async (serviceName: string) => {
        setModalTitle(`Danh sách hóa đơn sử dụng dịch vụ: ${serviceName}`);
        setIsModalVisible(true);
        setLoadingModal(true);

        try {
            const res = await axios.post(API.aitilen_invoiceByService, {
                searchData: {
                    service_name: serviceName, // Đổi từ service_id sang service_name
                    month: searchParams.month,
                    year: searchParams.year
                }
            });

            if (res?.data?.status_code === 200) {
                setInvoiceList(res.data.data.datas || []);
            }
        } catch (error) {
            console.error('Error loading invoices by service:', error);
            message.error('Không thể tải danh sách hóa đơn');
        } finally {
            setLoadingModal(false);
        }
    };

    const invoiceColumns = [
        {
            title: 'Mã HĐ',
            dataIndex: 'code',
            key: 'code',
            width: 120,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer_name',
            key: 'customer_name',
        },
        {
            title: 'Phòng',
            dataIndex: 'room_name',
            key: 'room_name',
            width: 100,
        },
        {
            title: 'Tiền phòng',
            dataIndex: 'tien_phong',
            key: 'tien_phong',
            render: (value: number) => numberFormat(value) + ' ₫',
            width: 130,
        },
        {
            title: 'Tháng/Năm',
            key: 'month_year',
            render: (record: any) => `${record.month}/${record.year}`,
            width: 100,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status_name',
            key: 'status_name',
            width: 120,
        },
    ];

    return (
        <div>
            <Card title={<><SearchOutlined /> Bộ lọc</>} style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Tháng</div>
                        <Select
                            style={{ width: '100%' }}
                            value={searchParams.month}
                            onChange={(value) => setSearchParams({ ...searchParams, month: value })}
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                <Option key={month} value={month}>Tháng {month}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Năm</div>
                        <Select
                            style={{ width: '100%' }}
                            value={searchParams.year}
                            onChange={(value) => setSearchParams({ ...searchParams, year: value })}
                        >
                            {Array.from({ length: 5 }, (_, i) => dayjs().year() - i).map(year => (
                                <Option key={year} value={year}>{year}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Tòa nhà</div>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Tất cả tòa nhà"
                            allowClear
                            value={searchParams.apartment_id}
                            onChange={(value) => setSearchParams({ ...searchParams, apartment_id: value })}
                        >
                            {apartments.map(apt => (
                                <Option key={apt.id} value={apt.id}>{apt.name}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Phòng</div>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Tất cả phòng"
                            allowClear
                            disabled={!searchParams.apartment_id}
                            value={searchParams.room_id}
                            onChange={(value) => setSearchParams({ ...searchParams, room_id: value })}
                        >
                            {rooms.map(room => (
                                <Option key={room.id} value={room.id}>{room.name}</Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                            loading={loading}
                        >
                            Xem thống kê
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleReset}
                        >
                            Làm mới
                        </Button>
                    </Col>
                </Row>
            </Card>

            {loading ? (
                <Card>
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <CloudOutlined style={{ fontSize: '64px', color: '#1890ff' }} spin />
                        <p style={{ marginTop: 16, fontSize: 16 }}>Đang tải dữ liệu...</p>
                    </div>
                </Card>
            ) : statisticsData ? (
                <div>
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col xs={24} sm={12}>
                            <Card>
                                <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>Tổng số hóa đơn</div>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>
                                    {statisticsData.total_invoices}
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Card>
                                <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>Tổng giá trị</div>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#fa8c16' }}>
                                    {numberFormat(statisticsData.grand_total)} ₫
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col xs={24} sm={12}>
                            <Card>
                                <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
                                    <HomeOutlined /> Tiền phòng
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                                    {numberFormat(statisticsData.total_tien_phong)} ₫
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Card>
                                <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
                                    <CloudOutlined /> Dịch vụ
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#cf1322' }}>
                                    {numberFormat(statisticsData.total_service_amount)} ₫
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            {apartmentChartData && apartmentChartData.length > 0 && (
                                <Card title={<><BarChartOutlined /> Thống kê theo tòa nhà</>} style={{ marginBottom: 16 }}>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={apartmentChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="apartment_code" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value: any) => numberFormat(value) + ' ₫'}
                                            />
                                            <Legend />
                                            <Bar dataKey="total_tien_phong" fill="#52c41a" name="Tiền phòng" />
                                            <Bar dataKey="total_service_amount" fill="#1890ff" name="Dịch vụ" />
                                            <Bar dataKey="grand_total" fill="#fa8c16" name="Tổng cộng" />
                                        </BarChart>
                                    </ResponsiveContainer>

                                    <Divider />

                                    <Row>
                                        <Col span={16}>

                                            <List
                                                dataSource={apartmentChartData}
                                                renderItem={(item: any) => (
                                                    <List.Item>
                                                        <List.Item.Meta
                                                            title={<span style={{ fontSize: 16, fontWeight: 'bold' }}>{item.apartment_name}</span>}
                                                            description={
                                                                <div>
                                                                    <Tag
                                                                        color="blue"
                                                                        style={{ cursor: 'pointer' }}
                                                                        onClick={() => showInvoiceList(item.apartment_id, item.apartment_name)}
                                                                    >
                                                                        <UnorderedListOutlined /> {item.total_invoices} hóa đơn
                                                                    </Tag>
                                                                    <Tag color="green">Phòng: {numberFormat(item.total_tien_phong)} ₫</Tag>
                                                                    <Tag color="cyan">Dịch vụ: {numberFormat(item.total_service_amount)} ₫</Tag>
                                                                </div>
                                                            }
                                                        />
                                                        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fa8c16' }}>
                                                            {numberFormat(item.grand_total)} ₫
                                                        </div>
                                                    </List.Item>
                                                )}
                                                bordered
                                            />
                                        </Col>

                                        <Col span={8}>
                                            <Card title={<><CloudOutlined /> Chi tiết dịch vụ</>}>
                                                {statisticsData.service_breakdown && statisticsData.service_breakdown.length > 0 ? (
                                                    <List
                                                        dataSource={statisticsData.service_breakdown}
                                                        renderItem={(item: any) => (
                                                            <List.Item>
                                                                <List.Item.Meta
                                                                    title={<span style={{ fontSize: 16 }}>{item.name}</span>}
                                                                    description={
                                                                        <div>
                                                                            <Tag
                                                                                color="blue"
                                                                                style={{ cursor: 'pointer' }}
                                                                                onClick={() => showInvoiceListByService(item.name)}
                                                                            >
                                                                                <UnorderedListOutlined /> {item.count} hóa đơn
                                                                            </Tag>
                                                                        </div>
                                                                    }
                                                                />
                                                                <div style={{ fontSize: 15, fontWeight: 'bold', color: '#1890ff' }}>
                                                                    {numberFormat(item.total_amount)} ₫
                                                                </div>
                                                            </List.Item>
                                                        )}
                                                        bordered
                                                    />
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                                                        <MehOutlined style={{ fontSize: 48 }} />
                                                        <p>Không có dịch vụ nào</p>
                                                    </div>
                                                )}
                                            </Card>
                                        </Col>
                                    </Row>
                                </Card>
                            )}
                        </Col>
                    </Row>

                    {statisticsData.filters && Object.keys(statisticsData.filters).length > 0 && (
                        <Card style={{ marginTop: 16 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Điều kiện lọc đã áp dụng:</div>
                            {statisticsData.filters.month && (
                                <Tag color="blue">Tháng: {statisticsData.filters.month}</Tag>
                            )}
                            {statisticsData.filters.year && (
                                <Tag color="blue">Năm: {statisticsData.filters.year}</Tag>
                            )}
                            {statisticsData.filters.apartment_id && (
                                <Tag color="green">Tòa nhà ID: {statisticsData.filters.apartment_id}</Tag>
                            )}
                            {statisticsData.filters.room_id && (
                                <Tag color="orange">Phòng ID: {statisticsData.filters.room_id}</Tag>
                            )}
                        </Card>
                    )}
                </div>
            ) : (
                <Card>
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        <MehOutlined style={{ fontSize: 64 }} />
                        <p style={{ marginTop: 16, fontSize: 16 }}>Chọn điều kiện và nhấn "Xem thống kê" để xem báo cáo</p>
                    </div>
                </Card>
            )}

            {/* Modal danh sách hóa đơn */}
            <Modal
                title={modalTitle}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={1000}
            >
                <Table
                    dataSource={invoiceList}
                    columns={invoiceColumns}
                    loading={loadingModal}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                />
            </Modal>
        </div>
    );
};

export default TienPhongStatisticsReport;
