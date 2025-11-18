import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Row,
    Col,
    Statistic,
    message,
    Descriptions,
    Divider,
    Typography,
    Alert,
    Tooltip,
    Badge,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    PrinterOutlined,
    EyeOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    ShoppingOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Shift {
    id: number;
    ma_ca: string;
    chi_nhanh_id: number;
    chi_nhanh?: {
        id: number;
        ten_chi_nhanh: string;
    };
    nhan_vien_mo_ca_id: number;
    nhan_vien_mo_ca?: {
        id: number;
        name: string;
    };
    nhan_vien_dong_ca_id?: number;
    nhan_vien_dong_ca?: {
        id: number;
        name: string;
    };
    thoi_gian_bat_dau: string;
    thoi_gian_ket_thuc?: string;
    tien_mat_dau_ca: number;
    tien_mat_cuoi_ca?: number;
    tong_doanh_thu?: number;
    tong_hoa_don?: number;
    trang_thai: 'dang_mo' | 'da_dong';
    ghi_chu_mo_ca?: string;
    ghi_chu_dong_ca?: string;
    created_at: string;
    updated_at: string;
}

interface ShiftStats {
    so_hoa_don: number;
    doanh_thu_tien_mat: number;
    doanh_thu_chuyen_khoan: number;
    doanh_thu_the: number;
    doanh_thu_vi: number;
    tong_doanh_thu: number;
}

interface Branch {
    id: number;
    ten_chi_nhanh: string;
}

interface User {
    id: number;
    name: string;
}

const ShiftManagement: React.FC = () => {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [currentShift, setCurrentShift] = useState<Shift | null>(null);

    // Filters
    const [filterBranch, setFilterBranch] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [filterDateRange, setFilterDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    // Modals
    const [openShiftModalVisible, setOpenShiftModalVisible] = useState(false);
    const [closeShiftModalVisible, setCloseShiftModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    const [shiftStats, setShiftStats] = useState<ShiftStats | null>(null);

    const [form] = Form.useForm();
    const [closeForm] = Form.useForm();

    useEffect(() => {
        fetchBranches();
        fetchUsers();
        fetchShifts();
        fetchCurrentShift();
    }, []);

    useEffect(() => {
        fetchShifts();
    }, [filterBranch, filterStatus, filterDateRange]);

    const fetchBranches = async () => {
        try {
            const response = await axios.get(`/aio/api/admin/spa/branches`);
            const data = response.data.data || response.data || [];
            setBranches(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching branches:', error);
            setBranches([]);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`/aio/api/user/list`);
            const data = response.data.data || response.data || [];
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        }
    };

    const fetchCurrentShift = async () => {
        try {
            const response = await axios.get(`/aio/api/admin/spa/ca-lam-viec/current`);
            if (response.data.success && response.data.data) {
                setCurrentShift(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching current shift:', error);
        }
    };

    const fetchShifts = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filterBranch) params.chi_nhanh_id = filterBranch;
            if (filterStatus) params.trang_thai = filterStatus;
            if (filterDateRange) {
                params.from_date = filterDateRange[0].format('YYYY-MM-DD');
                params.to_date = filterDateRange[1].format('YYYY-MM-DD');
            }

            const response = await axios.get(`/aio/api/admin/spa/ca-lam-viec`, { params });
            console.log('Shifts response:', response.data);

            // Handle both paginated and non-paginated responses
            let data;
            if (response.data.data) {
                // Paginated response
                if (response.data.data.data) {
                    data = response.data.data.data;
                } else if (Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else {
                    data = [];
                }
            } else if (Array.isArray(response.data)) {
                data = response.data;
            } else {
                data = [];
            }

            setShifts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching shifts:', error);
            message.error('Lỗi khi tải danh sách ca làm việc');
            setShifts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenShift = async (values: any) => {
        try {
            const response = await axios.post(`/aio/api/admin/spa/ca-lam-viec/open`, values);
            if (response.data.success) {
                message.success('Mở ca thành công');
                setOpenShiftModalVisible(false);
                form.resetFields();
                fetchShifts();
                fetchCurrentShift();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi mở ca');
        }
    };

    const handleCloseShift = async (values: any) => {
        if (!selectedShift) return;

        try {
            const response = await axios.post(`/aio/api/admin/spa/ca-lam-viec/${selectedShift.id}/close`, values);
            if (response.data.success) {
                message.success('Đóng ca thành công');
                setCloseShiftModalVisible(false);
                closeForm.resetFields();
                setSelectedShift(null);
                fetchShifts();
                fetchCurrentShift();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi đóng ca');
        }
    };

    const handleViewDetail = async (shift: Shift) => {
        setSelectedShift(shift);
        setDetailModalVisible(true);

        // Fetch shift stats if shift is open
        if (shift.trang_thai === 'dang_mo') {
            try {
                const response = await axios.get(`/aio/api/admin/spa/ca-lam-viec/current`, {
                    params: { chi_nhanh_id: shift.chi_nhanh_id }
                });
                if (response.data.success && response.data.data?.doanh_thu_realtime) {
                    setShiftStats(response.data.data.doanh_thu_realtime);
                }
            } catch (error) {
                console.error('Error fetching shift stats:', error);
            }
        }
    };

    const handlePrintHandover = async (shiftId: number) => {
        try {
            const response = await axios.get(`/aio/api/admin/spa/ca-lam-viec/${shiftId}/print`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bien-ban-ban-giao-ca-${shiftId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.success('Tải biên bản bàn giao thành công');
        } catch (error) {
            message.error('Lỗi khi tải biên bản');
        }
    };

    const showCloseShiftModal = (shift: Shift) => {
        setSelectedShift(shift);
        closeForm.setFieldsValue({
            nhan_vien_dong_ca_id: undefined,
            tien_mat_cuoi_ca: shift.tien_mat_dau_ca,
            ghi_chu_dong_ca: '',
        });
        setCloseShiftModalVisible(true);
    };

    const columns: ColumnsType<Shift> = [
        {
            title: 'Mã ca',
            dataIndex: 'ma_ca',
            key: 'ma_ca',
            width: 120,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Chi nhánh',
            dataIndex: ['chi_nhanh', 'ten_chi_nhanh'],
            key: 'chi_nhanh',
            width: 150,
        },
        {
            title: 'Người mở ca',
            dataIndex: ['nhan_vien_mo_ca', 'name'],
            key: 'nhan_vien_mo_ca',
            width: 150,
        },
        {
            title: 'Thời gian bắt đầu',
            dataIndex: 'thoi_gian_bat_dau',
            key: 'thoi_gian_bat_dau',
            width: 160,
            render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Thời gian kết thúc',
            dataIndex: 'thoi_gian_ket_thuc',
            key: 'thoi_gian_ket_thuc',
            width: 160,
            render: (text) => text ? dayjs(text).format('DD/MM/YYYY HH:mm') : '-',
        },
        {
            title: 'Tiền mặt đầu ca',
            dataIndex: 'tien_mat_dau_ca',
            key: 'tien_mat_dau_ca',
            width: 130,
            align: 'right',
            render: (value) => value?.toLocaleString('vi-VN') + ' đ',
        },
        {
            title: 'Doanh thu',
            dataIndex: 'tong_doanh_thu',
            key: 'tong_doanh_thu',
            width: 130,
            align: 'right',
            render: (value) => value ? value.toLocaleString('vi-VN') + ' đ' : '-',
        },
        {
            title: 'Số HĐ',
            dataIndex: 'tong_hoa_don',
            key: 'tong_hoa_don',
            width: 80,
            align: 'center',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 110,
            align: 'center',
            render: (status) => (
                <Tag color={status === 'dang_mo' ? 'green' : 'default'} icon={status === 'dang_mo' ? <ClockCircleOutlined /> : <CheckCircleOutlined />}>
                    {status === 'dang_mo' ? 'Đang mở' : 'Đã đóng'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 160,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                    {record.trang_thai === 'dang_mo' && (
                        <Tooltip title="Đóng ca">
                            <Button
                                type="link"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => showCloseShiftModal(record)}
                            />
                        </Tooltip>
                    )}
                    {record.trang_thai === 'da_dong' && (
                        <Tooltip title="In biên bản">
                            <Button
                                type="link"
                                icon={<PrinterOutlined />}
                                onClick={() => handlePrintHandover(record.id)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>
                            Quản lý ca làm việc
                        </Title>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setOpenShiftModalVisible(true)}
                                disabled={!!currentShift}
                            >
                                Mở ca mới
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchShifts}
                            >
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {currentShift && (
                    <Alert
                        message="Ca hiện tại đang mở"
                        description={
                            <Space direction="vertical" size="small">
                                <Text>Mã ca: <Text strong>{currentShift.ma_ca}</Text></Text>
                                <Text>Chi nhánh: <Text strong>{currentShift.chi_nhanh?.ten_chi_nhanh}</Text></Text>
                                <Text>Người mở ca: <Text strong>{currentShift.nhan_vien_mo_ca?.name}</Text></Text>
                                <Text>Bắt đầu: <Text strong>{dayjs(currentShift.thoi_gian_bat_dau).format('DD/MM/YYYY HH:mm')}</Text></Text>
                            </Space>
                        }
                        type="info"
                        showIcon
                        closable
                        style={{ marginBottom: 16 }}
                        action={
                            <Button size="small" danger onClick={() => showCloseShiftModal(currentShift)}>
                                Đóng ca
                            </Button>
                        }
                    />
                )}

                {/* Filters */}
                <Card size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Select
                                placeholder="Lọc theo chi nhánh"
                                allowClear
                                style={{ width: '100%' }}
                                onChange={(value) => setFilterBranch(value)}
                                value={filterBranch}
                            >
                                {branches.map((branch) => (
                                    <Select.Option key={branch.id} value={branch.id}>
                                        {branch.ten_chi_nhanh}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={6}>
                            <Select
                                placeholder="Lọc theo trạng thái"
                                allowClear
                                style={{ width: '100%' }}
                                onChange={(value) => setFilterStatus(value)}
                                value={filterStatus}
                            >
                                <Select.Option value="dang_mo">Đang mở</Select.Option>
                                <Select.Option value="da_dong">Đã đóng</Select.Option>
                            </Select>
                        </Col>
                        <Col span={12}>
                            <RangePicker
                                style={{ width: '100%' }}
                                placeholder={['Từ ngày', 'Đến ngày']}
                                format="DD/MM/YYYY"
                                onChange={(dates) => setFilterDateRange(dates as any)}
                                value={filterDateRange}
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Statistics */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Tổng số ca"
                                value={Array.isArray(shifts) ? shifts.length : 0}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Ca đang mở"
                                value={Array.isArray(shifts) ? shifts.filter(s => s.trang_thai === 'dang_mo').length : 0}
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Tổng doanh thu"
                                value={Array.isArray(shifts) ? shifts.reduce((sum, s) => sum + (s.tong_doanh_thu || 0), 0) : 0}
                                prefix={<DollarOutlined />}
                                suffix="đ"
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Tổng hóa đơn"
                                value={Array.isArray(shifts) ? shifts.reduce((sum, s) => sum + (s.tong_hoa_don || 0), 0) : 0}
                                prefix={<ShoppingOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={shifts}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1400 }}
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} ca`,
                    }}
                />
            </Card>

            {/* Open Shift Modal */}
            <Modal
                title="Mở ca làm việc mới"
                open={openShiftModalVisible}
                onCancel={() => {
                    setOpenShiftModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleOpenShift}
                >
                    <Form.Item
                        name="chi_nhanh_id"
                        label="Chi nhánh"
                        rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
                    >
                        <Select placeholder="Chọn chi nhánh">
                            {branches.map((branch) => (
                                <Select.Option key={branch.id} value={branch.id}>
                                    {branch.ten_chi_nhanh}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="nguoi_thu_id"
                        label="Người thu ngân"
                        rules={[{ required: true, message: 'Vui lòng chọn người thu ngân' }]}
                    >
                        <Select
                            placeholder="Chọn người thu ngân"
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children as string).toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {users.map((user) => (
                                <Select.Option key={user.id} value={user.id}>
                                    {user.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="tien_mat_dau_ca"
                        label="Tiền mặt đầu ca"
                        rules={[{ required: true, message: 'Vui lòng nhập tiền mặt đầu ca' }]}
                        initialValue={0}
                    >
                        <Input
                            type="number"
                            placeholder="Nhập số tiền"
                            suffix="đ"
                            min={0}
                        />
                    </Form.Item>

                    <Form.Item
                        name="ghi_chu_mo_ca"
                        label="Ghi chú"
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Ghi chú khi mở ca (nếu có)"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Close Shift Modal */}
            <Modal
                title="Đóng ca làm việc"
                open={closeShiftModalVisible}
                onCancel={() => {
                    setCloseShiftModalVisible(false);
                    closeForm.resetFields();
                    setSelectedShift(null);
                }}
                onOk={() => closeForm.submit()}
                width={700}
            >
                {selectedShift && (
                    <>
                        <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="Mã ca">{selectedShift.ma_ca}</Descriptions.Item>
                            <Descriptions.Item label="Chi nhánh">{selectedShift.chi_nhanh?.ten_chi_nhanh}</Descriptions.Item>
                            <Descriptions.Item label="Người mở ca">{selectedShift.nhan_vien_mo_ca?.name}</Descriptions.Item>
                            <Descriptions.Item label="Thời gian bắt đầu">
                                {dayjs(selectedShift.thoi_gian_bat_dau).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiền mặt đầu ca">
                                {selectedShift.tien_mat_dau_ca?.toLocaleString('vi-VN')} đ
                            </Descriptions.Item>
                        </Descriptions>

                        <Form
                            form={closeForm}
                            layout="vertical"
                            onFinish={handleCloseShift}
                        >
                            <Form.Item
                                name="nhan_vien_dong_ca_id"
                                label="Người đóng ca"
                                rules={[{ required: true, message: 'Vui lòng chọn người đóng ca' }]}
                            >
                                <Select
                                    placeholder="Chọn người đóng ca"
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as string).toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {users.map((user) => (
                                        <Select.Option key={user.id} value={user.id}>
                                            {user.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="tien_mat_cuoi_ca"
                                label="Tiền mặt cuối ca (đếm thực tế)"
                                rules={[{ required: true, message: 'Vui lòng nhập tiền mặt cuối ca' }]}
                            >
                                <Input
                                    type="number"
                                    placeholder="Nhập số tiền đếm được"
                                    suffix="đ"
                                    min={0}
                                />
                            </Form.Item>

                            <Form.Item
                                name="ghi_chu_dong_ca"
                                label="Ghi chú đóng ca"
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Ghi chú khi đóng ca (nếu có)"
                                />
                            </Form.Item>
                        </Form>
                    </>
                )}
            </Modal>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết ca làm việc"
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedShift(null);
                    setShiftStats(null);
                }}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                    selectedShift?.trang_thai === 'da_dong' && (
                        <Button
                            key="print"
                            type="primary"
                            icon={<PrinterOutlined />}
                            onClick={() => selectedShift && handlePrintHandover(selectedShift.id)}
                        >
                            In biên bản
                        </Button>
                    ),
                ]}
                width={800}
            >
                {selectedShift && (
                    <>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Mã ca" span={1}>{selectedShift.ma_ca}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái" span={1}>
                                <Tag color={selectedShift.trang_thai === 'dang_mo' ? 'green' : 'default'}>
                                    {selectedShift.trang_thai === 'dang_mo' ? 'Đang mở' : 'Đã đóng'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Chi nhánh" span={2}>
                                {selectedShift.chi_nhanh?.ten_chi_nhanh}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người mở ca" span={1}>
                                {selectedShift.nhan_vien_mo_ca?.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian mở ca" span={1}>
                                {dayjs(selectedShift.thoi_gian_bat_dau).format('DD/MM/YYYY HH:mm:ss')}
                            </Descriptions.Item>
                            {selectedShift.nhan_vien_dong_ca && (
                                <>
                                    <Descriptions.Item label="Người đóng ca" span={1}>
                                        {selectedShift.nhan_vien_dong_ca?.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Thời gian đóng ca" span={1}>
                                        {selectedShift.thoi_gian_ket_thuc ? dayjs(selectedShift.thoi_gian_ket_thuc).format('DD/MM/YYYY HH:mm:ss') : '-'}
                                    </Descriptions.Item>
                                </>
                            )}
                            <Descriptions.Item label="Tiền mặt đầu ca" span={1}>
                                {selectedShift.tien_mat_dau_ca?.toLocaleString('vi-VN')} đ
                            </Descriptions.Item>
                            {selectedShift.tien_mat_cuoi_ca !== null && (
                                <Descriptions.Item label="Tiền mặt cuối ca" span={1}>
                                    {selectedShift.tien_mat_cuoi_ca?.toLocaleString('vi-VN')} đ
                                </Descriptions.Item>
                            )}
                            {selectedShift.ghi_chu_mo_ca && (
                                <Descriptions.Item label="Ghi chú mở ca" span={2}>
                                    {selectedShift.ghi_chu_mo_ca}
                                </Descriptions.Item>
                            )}
                            {selectedShift.ghi_chu_dong_ca && (
                                <Descriptions.Item label="Ghi chú đóng ca" span={2}>
                                    {selectedShift.ghi_chu_dong_ca}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {shiftStats && (
                            <>
                                <Divider>Doanh thu ca làm việc</Divider>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Card>
                                            <Statistic
                                                title="Số hóa đơn"
                                                value={shiftStats.so_hoa_don}
                                                prefix={<ShoppingOutlined />}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card>
                                            <Statistic
                                                title="Tổng doanh thu"
                                                value={shiftStats.tong_doanh_thu}
                                                suffix="đ"
                                                prefix={<DollarOutlined />}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                                <Divider>Chi tiết thanh toán</Divider>
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Card size="small">
                                            <Statistic
                                                title="Tiền mặt"
                                                value={shiftStats.doanh_thu_tien_mat}
                                                suffix="đ"
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card size="small">
                                            <Statistic
                                                title="Chuyển khoản"
                                                value={shiftStats.doanh_thu_chuyen_khoan}
                                                suffix="đ"
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card size="small">
                                            <Statistic
                                                title="Thẻ"
                                                value={shiftStats.doanh_thu_the}
                                                suffix="đ"
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card size="small">
                                            <Statistic
                                                title="Ví"
                                                value={shiftStats.doanh_thu_vi}
                                                suffix="đ"
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </>
                )}
            </Modal>
        </div>
    );
};

export default ShiftManagement;
