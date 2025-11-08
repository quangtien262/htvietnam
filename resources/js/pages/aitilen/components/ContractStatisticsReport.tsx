import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Select, Button, Divider, List, Tag, Spin, message, Modal, Table
} from 'antd';
import {
    HomeOutlined, CloudOutlined, SearchOutlined, ReloadOutlined, MehOutlined,
    CheckCircleOutlined, RiseOutlined, BarChartOutlined, UnorderedListOutlined
} from '@ant-design/icons';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { numberFormat } from '../../../function/common';
import API from '../../../common/api';

const { Option } = Select;

const ContractStatisticsReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [statisticsData, setStatisticsData] = useState<any>(null);
    const [apartmentChartData, setApartmentChartData] = useState<any[]>([]);
    const [apartments, setApartments] = useState<any[]>([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [contractList, setContractList] = useState<any[]>([]);
    const [loadingModal, setLoadingModal] = useState(false);

    const [searchParams, setSearchParams] = useState({
        apartment_id: undefined,
    });

    // Load danh sách tòa nhà
    useEffect(() => {
        loadApartments();
    }, []);

    // Load danh sách tòa nhà
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

    // Fetch thống kê
    const fetchStatistics = async () => {
        setLoading(true);
        try {
            // Fetch general statistics
            const res = await axios.post(API.contractStatistics, {
                searchData: searchParams
            });

            // Fetch apartment chart data
            const chartRes = await axios.post(API.contractStatisticsByApartment, {
                searchData: {}
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
    };    const handleSearch = () => {
        fetchStatistics();
    };

    // Reset bộ lọc
    const handleReset = () => {
        setSearchParams({
            apartment_id: undefined,
        });
        setStatisticsData(null);
        setApartmentChartData([]);
    };

    const showContractList = async (apartmentId: number, apartmentName: string) => {
        setModalTitle(`Danh sách hợp đồng - ${apartmentName}`);
        setIsModalVisible(true);
        setLoadingModal(true);

        try {
            const res = await axios.post(API.contractBDSIndexApi, {
                searchData: { apartment_ids: [apartmentId] }
            });

            if (res?.data?.status_code === 200) {
                setContractList(res.data.data.datas || []);
            }
        } catch (error) {
            console.error('Error loading contracts:', error);
            message.error('Không thể tải danh sách hợp đồng');
        } finally {
            setLoadingModal(false);
        }
    };

    const showContractListByService = async (serviceId: number, serviceName: string) => {
        setModalTitle(`Danh sách hợp đồng sử dụng dịch vụ: ${serviceName}`);
        setIsModalVisible(true);
        setLoadingModal(true);

        try {
            const res = await axios.post(API.contractByService, {
                searchData: { service_id: serviceId }
            });

            if (res?.data?.status_code === 200) {
                setContractList(res.data.data.datas || []);
            }
        } catch (error) {
            console.error('Error loading contracts by service:', error);
            message.error('Không thể tải danh sách hợp đồng');
        } finally {
            setLoadingModal(false);
        }
    };

    const contractColumns = [
        {
            title: 'Mã HĐ',
            dataIndex: 'code',
            key: 'code',
            width: 120,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'ho_ten',
            key: 'ho_ten',
        },
        {
            title: 'Phòng',
            dataIndex: 'room_name',
            key: 'room_name',
            width: 100,
        },
        {
            title: 'Giá thuê',
            dataIndex: 'gia_thue',
            key: 'gia_thue',
            render: (value: number) => numberFormat(value) + ' ₫',
            width: 130,
        },
        {
            title: 'Tiền cọc',
            dataIndex: 'tien_coc',
            key: 'tien_coc',
            render: (value: number) => numberFormat(value) + ' ₫',
            width: 130,
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'start_date',
            key: 'start_date',
            width: 110,
        },
    ];

    return (
        <div>
            <Card title={<><SearchOutlined /> Bộ lọc</>} style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
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
                                <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>Tổng số hợp đồng</div>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>
                                    {statisticsData.total_contracts}
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
                        <Col xs={24} sm={8}>
                            <Card>
                                <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
                                    <HomeOutlined /> Tiền phòng
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                                    {numberFormat(statisticsData.total_gia_thue)} ₫
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card>
                                <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
                                    <CloudOutlined /> Dịch vụ
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#cf1322' }}>
                                    {numberFormat(statisticsData.total_service_amount)} ₫
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card>
                                <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
                                    <CheckCircleOutlined /> Tiền cọc
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                                    {numberFormat(statisticsData.total_tien_coc)} ₫
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {apartmentChartData && apartmentChartData.length > 0 && (
                        <Card title={<><BarChartOutlined /> Thống kê theo tòa nhà</>} style={{ marginBottom: 16 }}>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={apartmentChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="apartment_name" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: any) => numberFormat(value) + ' ₫'}
                                    />
                                    <Legend />
                                    <Bar dataKey="total_gia_thue" fill="#52c41a" name="Tiền thuê" />
                                    <Bar dataKey="total_service_amount" fill="#1890ff" name="Dịch vụ" />
                                    <Bar dataKey="total_tien_coc" fill="#faad14" name="Tiền cọc" />
                                    <Bar dataKey="grand_total" fill="#fa8c16" name="Tổng cộng" />
                                </BarChart>
                            </ResponsiveContainer>

                            <Divider />

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
                                                        onClick={() => showContractList(item.apartment_id, item.apartment_name)}
                                                    >
                                                        <UnorderedListOutlined /> {item.total_contracts} hợp đồng
                                                    </Tag>
                                                    <Tag color="green">Thuê: {numberFormat(item.total_gia_thue)} ₫</Tag>
                                                    <Tag color="cyan">Dịch vụ: {numberFormat(item.total_service_amount)} ₫</Tag>
                                                    <Tag color="gold">Cọc: {numberFormat(item.total_tien_coc)} ₫</Tag>
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
                        </Card>
                    )}

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
                                                        onClick={() => showContractListByService(item.service_id, item.name)}
                                                    >
                                                        <UnorderedListOutlined /> {item.count} hợp đồng
                                                    </Tag>
                                                </div>
                                            }
                                        />
                                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
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

                    {statisticsData.filters && Object.keys(statisticsData.filters).length > 0 && (
                        <Card style={{ marginTop: 16 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Điều kiện lọc đã áp dụng:</div>
                            {statisticsData.filters.apartment_id && (
                                <Tag color="green">Tòa nhà ID: {statisticsData.filters.apartment_id}</Tag>
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

            {/* Modal danh sách hợp đồng */}
            <Modal
                title={modalTitle}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={1000}
            >
                <Table
                    dataSource={contractList}
                    columns={contractColumns}
                    loading={loadingModal}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                />
            </Modal>
        </div>
    );
};

export default ContractStatisticsReport;
