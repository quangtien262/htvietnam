import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Select, DatePicker, message, Row, Col,
    Statistic, Tag, Descriptions, Drawer, Badge, Progress, Alert, Tooltip
} from 'antd';
import {
    DollarOutlined, TeamOutlined, TrophyOutlined, DownloadOutlined,
    EyeOutlined, CalendarOutlined, RiseOutlined, FallOutlined,
    FileExcelOutlined, UserOutlined, StarOutlined, BarChartOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import API from '@/common/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Staff {
    id: number;
    ma_nhan_vien: string;
    ho_ten: string;
    chuc_vu: string;
    hinh_anh?: string;
}

interface Branch {
    id: number;
    ten_chi_nhanh: string;
}

interface CommissionRecord {
    id: number;
    nhan_vien_id: number;
    nhan_vien?: Staff;
    chi_nhanh_id?: number;
    chi_nhanh?: Branch;
    thang: string; // YYYY-MM
    luong_co_ban: number;
    doanh_thu: number;
    ty_le_hoa_hong: number;
    hoa_hong_doanh_thu: number;
    thuong_hieu_suat?: number;
    phat?: number;
    tong_hoa_hong: number;
    trang_thai: string; // 'chua_tra', 'da_tra', 'tam_ung'
    ngay_tra?: string;
    ghi_chu?: string;
    so_don_hang: number;
    so_khach_hang: number;
    dich_vu_thuc_hien: number;
    rating_trung_binh?: number;
    created_at: string;
}

const CommissionReport: React.FC = () => {
    // State
    const [records, setRecords] = useState<CommissionRecord[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<CommissionRecord | null>(null);

    // Filters
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('month')
    ]);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    // Pagination
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Stats
    const [stats, setStats] = useState({
        totalCommission: 0,
        totalRevenue: 0,
        paidCommission: 0,
        unpaidCommission: 0,
        avgCommissionRate: 0,
        topPerformer: null as Staff | null,
    });

    // Load data
    useEffect(() => {
        loadRecords();
        loadStaff();
        loadBranches();
    }, [pagination.current, pagination.pageSize, dateRange, selectedBranch, selectedStaff, selectedStatus]);

    const loadRecords = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/aio/api/admin/spa/commissions/list', {
                page: pagination.current,
                limit: pagination.pageSize,
                start_date: dateRange[0].format('YYYY-MM-DD'),
                end_date: dateRange[1].format('YYYY-MM-DD'),
                chi_nhanh_id: selectedBranch,
                nhan_vien_id: selectedStaff,
                trang_thai: selectedStatus,
            });

            if (response.data.success) {
                const data = response.data.data;
                setRecords(data.data || []);
                setPagination({
                    ...pagination,
                    total: data.total || 0,
                });

                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            message.error('Không thể tải báo cáo hoa hồng');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadStaff = async () => {
        try {
            const response = await axios.post('/aio/api/admin/spa/staff/list', {
                limit: 1000,
            });
            if (response.data.success) {
                setStaff(response.data.data.data || []);
            }
        } catch (error) {
            console.error('Load staff error:', error);
        }
    };

    const loadBranches = async () => {
        try {
            const response = await axios.get(API.spaBranchList);
            if (response.data.success) {
                setBranches(response.data.data.data || []);
            }
        } catch (error) {
            console.error('Load branches error:', error);
        }
    };

    // Handlers
    const handleView = (record: CommissionRecord) => {
        setSelectedRecord(record);
        setDetailDrawerVisible(true);
    };

    const handleMarkAsPaid = async (record: CommissionRecord) => {
        try {
            const response = await axios.post('/aio/api/admin/spa/commissions/update-status', {
                id: record.id,
                trang_thai: 'da_tra',
                ngay_tra: dayjs().format('YYYY-MM-DD'),
            });

            if (response.data.success) {
                message.success('Đã cập nhật trạng thái thanh toán');
                loadRecords();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể cập nhật');
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.post('/aio/api/admin/spa/commissions/export', {
                start_date: dateRange[0].format('YYYY-MM-DD'),
                end_date: dateRange[1].format('YYYY-MM-DD'),
                chi_nhanh_id: selectedBranch,
                nhan_vien_id: selectedStaff,
                trang_thai: selectedStatus,
            }, {
                responseType: 'blob',
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `commission-report-${dayjs().format('YYYY-MM-DD')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            message.success('Xuất báo cáo thành công');
        } catch (error) {
            message.error('Không thể xuất báo cáo');
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'chua_tra': 'orange',
            'da_tra': 'green',
            'tam_ung': 'blue',
        };
        return colors[status] || 'default';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'chua_tra': 'Chưa trả',
            'da_tra': 'Đã trả',
            'tam_ung': 'Tạm ứng',
        };
        return labels[status] || status;
    };

    const calculateCommissionRate = (record: CommissionRecord) => {
        if (record.doanh_thu === 0) return 0;
        return (record.tong_hoa_hong / record.doanh_thu) * 100;
    };

    const getPerformanceLevel = (revenue: number) => {
        if (revenue >= 50000000) return { text: 'Xuất sắc', color: 'gold' };
        if (revenue >= 30000000) return { text: 'Giỏi', color: 'green' };
        if (revenue >= 15000000) return { text: 'Khá', color: 'blue' };
        return { text: 'Trung bình', color: 'default' };
    };

    // Table columns
    const columns: ColumnsType<CommissionRecord> = [
        {
            title: 'Tháng',
            dataIndex: 'thang',
            key: 'thang',
            width: 100,
            fixed: 'left',
            render: (value: string) => (
                <Tag color="blue" icon={<CalendarOutlined />}>
                    {dayjs(value).format('MM/YYYY')}
                </Tag>
            ),
            sorter: (a, b) => dayjs(a.thang).unix() - dayjs(b.thang).unix(),
        },
        {
            title: 'Nhân viên',
            key: 'staff',
            width: 200,
            fixed: 'left',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>
                        {record.nhan_vien?.ho_ten || 'N/A'}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                        {record.nhan_vien?.ma_nhan_vien}
                    </div>
                    {record.chi_nhanh && (
                        <Tag color="purple" style={{ marginTop: 4, fontSize: 11 }}>
                            {record.chi_nhanh.ten_chi_nhanh}
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Hiệu suất',
            key: 'performance',
            width: 180,
            render: (_, record) => {
                const perf = getPerformanceLevel(record.doanh_thu);
                return (
                    <div>
                        <Tag color={perf.color} icon={<StarOutlined />}>
                            {perf.text}
                        </Tag>
                        <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                            {record.so_don_hang} đơn • {record.so_khach_hang} KH
                        </div>
                        <div style={{ fontSize: 11, color: '#666' }}>
                            {record.dich_vu_thuc_hien} dịch vụ
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Lương CB',
            dataIndex: 'luong_co_ban',
            key: 'luong_co_ban',
            width: 130,
            align: 'right',
            render: (value: number) => `${value.toLocaleString()} VNĐ`,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'doanh_thu',
            key: 'doanh_thu',
            width: 150,
            align: 'right',
            render: (value: number) => (
                <span style={{ fontWeight: 500, color: '#1890ff' }}>
                    {value.toLocaleString()} VNĐ
                </span>
            ),
            sorter: (a, b) => a.doanh_thu - b.doanh_thu,
        },
        {
            title: 'Tỷ lệ HH',
            dataIndex: 'ty_le_hoa_hong',
            key: 'ty_le_hoa_hong',
            width: 90,
            align: 'center',
            render: (value: number) => <Tag color="green">{value}%</Tag>,
        },
        {
            title: 'HH Doanh thu',
            dataIndex: 'hoa_hong_doanh_thu',
            key: 'hoa_hong_doanh_thu',
            width: 140,
            align: 'right',
            render: (value: number) => (
                <span style={{ color: '#52c41a' }}>
                    {value.toLocaleString()} VNĐ
                </span>
            ),
        },
        {
            title: 'Thưởng',
            dataIndex: 'thuong_hieu_suat',
            key: 'thuong_hieu_suat',
            width: 120,
            align: 'right',
            render: (value?: number) => (
                <span style={{ color: '#faad14' }}>
                    +{(value || 0).toLocaleString()} VNĐ
                </span>
            ),
        },
        {
            title: 'Phạt',
            dataIndex: 'phat',
            key: 'phat',
            width: 120,
            align: 'right',
            render: (value?: number) => (
                <span style={{ color: '#f5222d' }}>
                    -{(value || 0).toLocaleString()} VNĐ
                </span>
            ),
        },
        {
            title: 'Tổng HH',
            dataIndex: 'tong_hoa_hong',
            key: 'tong_hoa_hong',
            width: 160,
            align: 'right',
            render: (value: number) => (
                <strong style={{ fontSize: 15, color: '#52c41a' }}>
                    {value.toLocaleString()} VNĐ
                </strong>
            ),
            sorter: (a, b) => a.tong_hoa_hong - b.tong_hoa_hong,
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating_trung_binh',
            key: 'rating_trung_binh',
            width: 100,
            align: 'center',
            render: (value?: number) => {
                if (!value) return 'N/A';
                return (
                    <Tooltip title={`${value.toFixed(1)} sao`}>
                        <Tag color={value >= 4.5 ? 'gold' : value >= 4 ? 'green' : 'blue'}>
                            <StarOutlined /> {value.toFixed(1)}
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 140,
            render: (_, record) => (
                <div>
                    <Tag color={getStatusColor(record.trang_thai)}>
                        {getStatusLabel(record.trang_thai)}
                    </Tag>
                    {record.ngay_tra && (
                        <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                            {dayjs(record.ngay_tra).format('DD/MM/YYYY')}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 180,
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
                    {record.trang_thai === 'chua_tra' && (
                        <Button
                            type="link"
                            size="small"
                            style={{ color: '#52c41a' }}
                            onClick={() => handleMarkAsPaid(record)}
                        >
                            Đã trả
                        </Button>
                    )}
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
                            title="Tổng hoa hồng"
                            value={stats.totalCommission}
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={stats.totalRevenue}
                            prefix={<RiseOutlined />}
                            suffix="VNĐ"
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đã thanh toán"
                            value={stats.paidCommission}
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                            valueStyle={{ color: '#52c41a' }}
                        />
                        <Progress
                            percent={stats.totalCommission > 0 ? Math.round((stats.paidCommission / stats.totalCommission) * 100) : 0}
                            size="small"
                            status="success"
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Chưa thanh toán"
                            value={stats.unpaidCommission}
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                            valueStyle={{ color: '#f5222d' }}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            Tỷ lệ TB: {stats.avgCommissionRate.toFixed(1)}%
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Top Performer Alert */}
            {stats.topPerformer && (
                <Alert
                    message={
                        <Space>
                            <TrophyOutlined style={{ color: '#faad14' }} />
                            <span>
                                Nhân viên xuất sắc nhất: <strong>{stats.topPerformer.ho_ten}</strong>
                            </span>
                        </Space>
                    }
                    type="success"
                    showIcon={false}
                    style={{ marginBottom: 16 }}
                />
            )}

            <Card
                title={
                    <Space>
                        <BarChartOutlined />
                        <span>Báo cáo Hoa hồng</span>
                        <Badge count={pagination.total} showZero />
                    </Space>
                }
                extra={
                    <Space>
                        <Button
                            type="primary"
                            icon={<FileExcelOutlined />}
                            onClick={handleExport}
                        >
                            Xuất Excel
                        </Button>
                    </Space>
                }
            >
                {/* Filters */}
                <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8}>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => {
                                    if (dates && dates[0] && dates[1]) {
                                        setDateRange([dates[0], dates[1]]);
                                    }
                                }}
                                format="DD/MM/YYYY"
                                style={{ width: '100%' }}
                                placeholder={['Từ ngày', 'Đến ngày']}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={5}>
                            <Select
                                placeholder="Chi nhánh"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedBranch}
                                onChange={setSelectedBranch}
                            >
                                {branches.map(branch => (
                                    <Option key={branch.id} value={branch.id}>
                                        {branch.ten_chi_nhanh}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Nhân viên"
                                allowClear
                                showSearch
                                style={{ width: '100%' }}
                                value={selectedStaff}
                                onChange={setSelectedStaff}
                                filterOption={(input, option) =>
                                    (option?.children as string).toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {staff.map(s => (
                                    <Option key={s.id} value={s.id}>
                                        {s.ho_ten}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={5}>
                            <Select
                                placeholder="Trạng thái"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                            >
                                <Option value="chua_tra">Chưa trả</Option>
                                <Option value="da_tra">Đã trả</Option>
                                <Option value="tam_ung">Tạm ứng</Option>
                            </Select>
                        </Col>
                    </Row>
                </Space>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={records}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bản ghi`,
                        onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize });
                        },
                    }}
                    scroll={{ x: 2000 }}
                    summary={(pageData) => {
                        let totalRevenue = 0;
                        let totalCommission = 0;
                        let totalBonus = 0;
                        let totalPenalty = 0;

                        pageData.forEach(({ doanh_thu, tong_hoa_hong, thuong_hieu_suat, phat }) => {
                            totalRevenue += doanh_thu;
                            totalCommission += tong_hoa_hong;
                            totalBonus += thuong_hieu_suat || 0;
                            totalPenalty += phat || 0;
                        });

                        return (
                            <Table.Summary fixed>
                                <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 'bold' }}>
                                    <Table.Summary.Cell index={0} colSpan={4}>
                                        TỔNG CỘNG (trang này)
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right">
                                        {totalRevenue.toLocaleString()} VNĐ
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} colSpan={2} />
                                    <Table.Summary.Cell index={3} align="right">
                                        +{totalBonus.toLocaleString()} VNĐ
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={4} align="right">
                                        -{totalPenalty.toLocaleString()} VNĐ
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={5} align="right">
                                        <span style={{ color: '#52c41a', fontSize: 15 }}>
                                            {totalCommission.toLocaleString()} VNĐ
                                        </span>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={6} colSpan={3} />
                                </Table.Summary.Row>
                            </Table.Summary>
                        );
                    }}
                />
            </Card>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết hoa hồng"
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={600}
            >
                {selectedRecord && (
                    <div>
                        <Alert
                            message={
                                <Space>
                                    <CalendarOutlined />
                                    Tháng {dayjs(selectedRecord.thang).format('MM/YYYY')}
                                </Space>
                            }
                            type="info"
                            style={{ marginBottom: 16 }}
                        />

                        {selectedRecord.nhan_vien && (
                            <Card size="small" style={{ marginBottom: 16 }}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Nhân viên">
                                        <strong>{selectedRecord.nhan_vien.ho_ten}</strong>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Mã NV">
                                        {selectedRecord.nhan_vien.ma_nhan_vien}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Chức vụ">
                                        <Tag color="blue">{selectedRecord.nhan_vien.chuc_vu}</Tag>
                                    </Descriptions.Item>
                                    {selectedRecord.chi_nhanh && (
                                        <Descriptions.Item label="Chi nhánh">
                                            {selectedRecord.chi_nhanh.ten_chi_nhanh}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </Card>
                        )}

                        {/* Performance Stats */}
                        <Card size="small" title="Hiệu suất làm việc" style={{ marginBottom: 16 }}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic
                                        title="Đơn hàng"
                                        value={selectedRecord.so_don_hang}
                                        valueStyle={{ fontSize: 20 }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Khách hàng"
                                        value={selectedRecord.so_khach_hang}
                                        valueStyle={{ fontSize: 20 }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Dịch vụ"
                                        value={selectedRecord.dich_vu_thuc_hien}
                                        valueStyle={{ fontSize: 20 }}
                                    />
                                </Col>
                            </Row>
                            {selectedRecord.rating_trung_binh && (
                                <div style={{ marginTop: 16, textAlign: 'center' }}>
                                    <Tag color="gold" icon={<StarOutlined />} style={{ fontSize: 14 }}>
                                        Đánh giá: {selectedRecord.rating_trung_binh.toFixed(1)}/5.0
                                    </Tag>
                                </div>
                            )}
                        </Card>

                        {/* Commission Calculation */}
                        <Card size="small" title="Chi tiết thu nhập" style={{ marginBottom: 16 }}>
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Lương cơ bản">
                                    {selectedRecord.luong_co_ban.toLocaleString()} VNĐ
                                </Descriptions.Item>
                                <Descriptions.Item label="Doanh thu">
                                    <strong style={{ color: '#1890ff', fontSize: 15 }}>
                                        {selectedRecord.doanh_thu.toLocaleString()} VNĐ
                                    </strong>
                                </Descriptions.Item>
                                <Descriptions.Item label="Tỷ lệ hoa hồng">
                                    <Tag color="green">{selectedRecord.ty_le_hoa_hong}%</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Hoa hồng doanh thu">
                                    <span style={{ color: '#52c41a' }}>
                                        {selectedRecord.hoa_hong_doanh_thu.toLocaleString()} VNĐ
                                    </span>
                                </Descriptions.Item>
                                {selectedRecord.thuong_hieu_suat && selectedRecord.thuong_hieu_suat > 0 && (
                                    <Descriptions.Item label="Thưởng hiệu suất">
                                        <span style={{ color: '#faad14' }}>
                                            +{selectedRecord.thuong_hieu_suat.toLocaleString()} VNĐ
                                        </span>
                                    </Descriptions.Item>
                                )}
                                {selectedRecord.phat && selectedRecord.phat > 0 && (
                                    <Descriptions.Item label="Phạt">
                                        <span style={{ color: '#f5222d' }}>
                                            -{selectedRecord.phat.toLocaleString()} VNĐ
                                        </span>
                                    </Descriptions.Item>
                                )}
                                <Descriptions.Item label="Tổng hoa hồng">
                                    <strong style={{ color: '#52c41a', fontSize: 18 }}>
                                        {selectedRecord.tong_hoa_hong.toLocaleString()} VNĐ
                                    </strong>
                                </Descriptions.Item>
                            </Descriptions>

                            <div style={{ marginTop: 16, padding: 12, background: '#f0f5ff', borderRadius: 4 }}>
                                <div style={{ fontSize: 13, color: '#666' }}>Tổng thu nhập dự kiến:</div>
                                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff', marginTop: 4 }}>
                                    {(selectedRecord.luong_co_ban + selectedRecord.tong_hoa_hong).toLocaleString()} VNĐ
                                </div>
                            </div>
                        </Card>

                        {/* Payment Status */}
                        <Card size="small" title="Trạng thái thanh toán">
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Trạng thái">
                                    <Tag color={getStatusColor(selectedRecord.trang_thai)}>
                                        {getStatusLabel(selectedRecord.trang_thai)}
                                    </Tag>
                                </Descriptions.Item>
                                {selectedRecord.ngay_tra && (
                                    <Descriptions.Item label="Ngày thanh toán">
                                        {dayjs(selectedRecord.ngay_tra).format('DD/MM/YYYY')}
                                    </Descriptions.Item>
                                )}
                                {selectedRecord.ghi_chu && (
                                    <Descriptions.Item label="Ghi chú">
                                        {selectedRecord.ghi_chu}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            {selectedRecord.trang_thai === 'chua_tra' && (
                                <Button
                                    type="primary"
                                    block
                                    style={{ marginTop: 16 }}
                                    onClick={() => {
                                        handleMarkAsPaid(selectedRecord);
                                        setDetailDrawerVisible(false);
                                    }}
                                >
                                    Xác nhận đã thanh toán
                                </Button>
                            )}
                        </Card>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default CommissionReport;
