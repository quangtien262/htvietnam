import React, { useState, useEffect } from 'react';
import {
    Card, Button, Space, Select, message, Badge, Modal, Form, TimePicker,
    Row, Col, Tag, Tooltip, Avatar, Calendar, List, Drawer, Descriptions,
    Alert, Statistic, Empty
} from 'antd';
import {
    CalendarOutlined, PlusOutlined, ClockCircleOutlined, UserOutlined,
    TeamOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined,
    CloseCircleOutlined, WarningOutlined
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import API from '@/common/api';

const { Option } = Select;

interface Staff {
    id: number;
    ma_nhan_vien: string;
    ho_ten: string;
    hinh_anh?: string;
    chuc_vu: string;
}

interface Branch {
    id: number;
    ten_chi_nhanh: string;
}

interface Shift {
    id: number;
    nhan_vien_id: number;
    nhan_vien?: Staff;
    chi_nhanh_id?: number;
    chi_nhanh?: Branch;
    ngay_lam_viec: string;
    gio_bat_dau: string;
    gio_ket_thuc: string;
    loai_ca: string; // 'sang', 'chieu', 'toi', 'full'
    trang_thai: string; // 'dang_ky', 'xac_nhan', 'huy', 'hoan_thanh'
    ghi_chu?: string;
    created_at: string;
}

interface DaySchedule {
    date: string;
    shifts: Shift[];
    totalStaff: number;
}

const StaffSchedule: React.FC = () => {
    // State
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [schedules, setSchedules] = useState<Record<string, Shift[]>>({});
    const [staff, setStaff] = useState<Staff[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

    // Filters
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'month' | 'day'>('month');

    // Form
    const [form] = Form.useForm();

    // Stats
    const [stats, setStats] = useState({
        totalShifts: 0,
        confirmedShifts: 0,
        totalStaff: 0,
        coverage: 0,
    });

    // Load data
    useEffect(() => {
        loadSchedules();
        loadStaff();
        loadBranches();
    }, [selectedDate, selectedBranch, selectedStaff]);

    const loadSchedules = async () => {
        setLoading(true);
        try {
            const startDate = selectedDate.startOf('month').format('YYYY-MM-DD');
            const endDate = selectedDate.endOf('month').format('YYYY-MM-DD');

            const response = await axios.post(API_SPA.spaStaffScheduleList, {
                start_date: startDate,
                end_date: endDate,
                chi_nhanh_id: selectedBranch,
                nhan_vien_id: selectedStaff,
            });

            if (response.data.success) {
                const data = response.data.data;

                // Group shifts by date
                const grouped: Record<string, Shift[]> = {};
                (data.data || []).forEach((shift: Shift) => {
                    const date = shift.ngay_lam_viec;
                    if (!grouped[date]) {
                        grouped[date] = [];
                    }
                    grouped[date].push(shift);
                });

                setSchedules(grouped);

                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            message.error('Không thể tải lịch làm việc');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadStaff = async () => {
        try {
            const response = await axios.post(API_SPA.spaStaffList, {
                limit: 1000,
                trang_thai: 'dang_lam_viec',
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
    const handleCreateShift = (date?: Dayjs) => {
        form.resetFields();
        if (date) {
            form.setFieldValue('ngay_lam_viec', date.format('YYYY-MM-DD'));
        }
        setSelectedShift(null);
        setModalVisible(true);
    };

    const handleEditShift = (shift: Shift) => {
        setSelectedShift(shift);
        form.setFieldsValue({
            ...shift,
            gio_bat_dau: dayjs(shift.gio_bat_dau, 'HH:mm'),
            gio_ket_thuc: dayjs(shift.gio_ket_thuc, 'HH:mm'),
        });
        setModalVisible(true);
    };

    const handleViewShift = (shift: Shift) => {
        setSelectedShift(shift);
        setDetailDrawerVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                id: selectedShift?.id,
                ...values,
                gio_bat_dau: values.gio_bat_dau.format('HH:mm'),
                gio_ket_thuc: values.gio_ket_thuc.format('HH:mm'),
            };

            const response = await axios.post(API_SPA.spaStaffScheduleCreateOrUpdate, payload);

            if (response.data.success) {
                message.success(selectedShift ? 'Cập nhật ca làm việc thành công' : 'Tạo ca làm việc mới thành công');
                setModalVisible(false);
                loadSchedules();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteShift = async (id: number) => {
        try {
            const response = await axios.post(API_SPA.spaStaffScheduleDelete, { id });
            if (response.data.success) {
                message.success('Xóa ca làm việc thành công');
                loadSchedules();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa ca làm việc');
        }
    };

    const handleConfirmShift = async (shift: Shift) => {
        try {
            const response = await axios.post('/spa/staff-schedules/create-or-update', {
                id: shift.id,
                trang_thai: 'xac_nhan',
            });

            if (response.data.success) {
                message.success('Xác nhận ca làm việc thành công');
                loadSchedules();
            }
        } catch (error) {
            message.error('Không thể xác nhận ca làm việc');
        }
    };

    const handleCancelShift = async (shift: Shift) => {
        try {
            const response = await axios.post('/spa/staff-schedules/create-or-update', {
                id: shift.id,
                trang_thai: 'huy',
            });

            if (response.data.success) {
                message.success('Hủy ca làm việc thành công');
                loadSchedules();
            }
        } catch (error) {
            message.error('Không thể hủy ca làm việc');
        }
    };

    const getShiftTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'sang': 'blue',
            'chieu': 'orange',
            'toi': 'purple',
            'full': 'green',
        };
        return colors[type] || 'default';
    };

    const getShiftTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'sang': 'Ca sáng',
            'chieu': 'Ca chiều',
            'toi': 'Ca tối',
            'full': 'Cả ngày',
        };
        return labels[type] || type;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'dang_ky': 'default',
            'xac_nhan': 'green',
            'huy': 'red',
            'hoan_thanh': 'blue',
        };
        return colors[status] || 'default';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'dang_ky': 'Đăng ký',
            'xac_nhan': 'Xác nhận',
            'huy': 'Đã hủy',
            'hoan_thanh': 'Hoàn thành',
        };
        return labels[status] || status;
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, React.ReactNode> = {
            'dang_ky': <ClockCircleOutlined />,
            'xac_nhan': <CheckCircleOutlined />,
            'huy': <CloseCircleOutlined />,
            'hoan_thanh': <CheckCircleOutlined />,
        };
        return icons[status] || <ClockCircleOutlined />;
    };

    // Calendar cell render
    const dateCellRender = (value: Dayjs) => {
        const dateStr = value.format('YYYY-MM-DD');
        const dayShifts = schedules[dateStr] || [];

        if (dayShifts.length === 0) {
            return null;
        }

        const confirmedCount = dayShifts.filter(s => s.trang_thai === 'xac_nhan').length;
        const pendingCount = dayShifts.filter(s => s.trang_thai === 'dang_ky').length;

        return (
            <div style={{ fontSize: 11 }}>
                {confirmedCount > 0 && (
                    <Tag color="green" style={{ marginBottom: 2, fontSize: 10 }}>
                        {confirmedCount} NV
                    </Tag>
                )}
                {pendingCount > 0 && (
                    <Tag color="orange" style={{ marginBottom: 2, fontSize: 10 }}>
                        {pendingCount} chờ
                    </Tag>
                )}
            </div>
        );
    };

    // Render day schedule
    const renderDaySchedule = (date: Dayjs) => {
        const dateStr = date.format('YYYY-MM-DD');
        const dayShifts = schedules[dateStr] || [];

        // Group by shift type
        const shiftsByType: Record<string, Shift[]> = {
            'sang': [],
            'chieu': [],
            'toi': [],
            'full': [],
        };

        dayShifts.forEach(shift => {
            if (shiftsByType[shift.loai_ca]) {
                shiftsByType[shift.loai_ca].push(shift);
            }
        });

        return (
            <Card
                title={
                    <Space>
                        <CalendarOutlined />
                        <span>Lịch làm việc - {date.format('DD/MM/YYYY (dddd)')}</span>
                        <Badge count={dayShifts.length} showZero />
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleCreateShift(date)}
                    >
                        Thêm ca làm
                    </Button>
                }
            >
                {dayShifts.length === 0 ? (
                    <Empty description="Chưa có ca làm việc nào" />
                ) : (
                    <Row gutter={16}>
                        {Object.entries(shiftsByType).map(([type, shifts]) => {
                            if (shifts.length === 0) return null;

                            return (
                                <Col key={type} xs={24} sm={12} md={6}>
                                    <Card
                                        size="small"
                                        title={
                                            <Tag color={getShiftTypeColor(type)}>
                                                {getShiftTypeLabel(type)}
                                            </Tag>
                                        }
                                    >
                                        <List
                                            size="small"
                                            dataSource={shifts}
                                            renderItem={(shift) => (
                                                <List.Item
                                                    actions={[
                                                        <Button
                                                            type="link"
                                                            size="small"
                                                            icon={<EyeOutlined />}
                                                            onClick={() => handleViewShift(shift)}
                                                        />,
                                                        shift.trang_thai === 'dang_ky' && (
                                                            <Button
                                                                type="link"
                                                                size="small"
                                                                icon={<CheckCircleOutlined />}
                                                                onClick={() => handleConfirmShift(shift)}
                                                            />
                                                        ),
                                                        <Button
                                                            type="link"
                                                            size="small"
                                                            icon={<EditOutlined />}
                                                            onClick={() => handleEditShift(shift)}
                                                        />,
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={
                                                            <Avatar
                                                                size="small"
                                                                src={shift.nhan_vien?.hinh_anh}
                                                                icon={<UserOutlined />}
                                                            />
                                                        }
                                                        title={
                                                            <Space size="small">
                                                                <span style={{ fontSize: 13 }}>
                                                                    {shift.nhan_vien?.ho_ten}
                                                                </span>
                                                                <Tag
                                                                    color={getStatusColor(shift.trang_thai)}
                                                                    style={{ fontSize: 10 }}
                                                                >
                                                                    {getStatusLabel(shift.trang_thai)}
                                                                </Tag>
                                                            </Space>
                                                        }
                                                        description={
                                                            <div style={{ fontSize: 11 }}>
                                                                <ClockCircleOutlined /> {shift.gio_bat_dau} - {shift.gio_ket_thuc}
                                                            </div>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </Card>
        );
    };

    return (
        <div style={{ padding: 24 }}>
            {/* Stats Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng ca làm việc"
                            value={stats.totalShifts}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đã xác nhận"
                            value={stats.confirmedShifts}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Nhân viên làm việc"
                            value={stats.totalStaff}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tỷ lệ phủ"
                            value={stats.coverage}
                            suffix="%"
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: stats.coverage >= 80 ? '#52c41a' : '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters & View Mode */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                    <Col xs={24} sm={8} md={6}>
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
                    <Col xs={24} sm={8} md={6}>
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
                                    {s.ho_ten} - {s.ma_nhan_vien}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <Select
                            value={viewMode}
                            onChange={setViewMode}
                            style={{ width: '100%' }}
                        >
                            <Option value="month">Xem theo tháng</Option>
                            <Option value="day">Xem theo ngày</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={6}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleCreateShift()}
                            block
                        >
                            Thêm ca làm việc
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Calendar or Day View */}
            {viewMode === 'month' ? (
                <Card>
                    <Calendar
                        value={selectedDate}
                        onSelect={setSelectedDate}
                        dateCellRender={dateCellRender}
                        onPanelChange={(date) => setSelectedDate(date)}
                    />
                </Card>
            ) : (
                renderDaySchedule(selectedDate)
            )}

            {/* Create/Edit Modal */}
            <Modal
                title={selectedShift ? 'Chỉnh sửa ca làm việc' : 'Thêm ca làm việc mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                width={700}
                okText={selectedShift ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="nhan_vien_id"
                                label="Nhân viên"
                                rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
                            >
                                <Select
                                    placeholder="Chọn nhân viên"
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as string).toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {staff.map(s => (
                                        <Option key={s.id} value={s.id}>
                                            <Space>
                                                <Avatar size="small" src={s.hinh_anh} icon={<UserOutlined />} />
                                                {s.ho_ten}
                                            </Space>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="chi_nhanh_id" label="Chi nhánh">
                                <Select placeholder="Chọn chi nhánh">
                                    {branches.map(branch => (
                                        <Option key={branch.id} value={branch.id}>
                                            {branch.ten_chi_nhanh}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="ngay_lam_viec"
                                label="Ngày làm việc"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                            >
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="gio_bat_dau"
                                label="Giờ bắt đầu"
                                rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="gio_ket_thuc"
                                label="Giờ kết thúc"
                                rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="loai_ca"
                                label="Loại ca"
                                rules={[{ required: true, message: 'Vui lòng chọn loại ca' }]}
                            >
                                <Select placeholder="Chọn loại ca">
                                    <Option value="sang">
                                        <Tag color="blue">Ca sáng</Tag>
                                    </Option>
                                    <Option value="chieu">
                                        <Tag color="orange">Ca chiều</Tag>
                                    </Option>
                                    <Option value="toi">
                                        <Tag color="purple">Ca tối</Tag>
                                    </Option>
                                    <Option value="full">
                                        <Tag color="green">Cả ngày</Tag>
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="trang_thai"
                                label="Trạng thái"
                                initialValue="dang_ky"
                            >
                                <Select>
                                    <Option value="dang_ky">Đăng ký</Option>
                                    <Option value="xac_nhan">Xác nhận</Option>
                                    <Option value="huy">Hủy</Option>
                                    <Option value="hoan_thanh">Hoàn thành</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="ghi_chu" label="Ghi chú">
                                <Input.TextArea rows={3} placeholder="Ghi chú về ca làm việc..." />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết ca làm việc"
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={500}
                extra={
                    selectedShift && (
                        <Space>
                            {selectedShift.trang_thai === 'dang_ky' && (
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => {
                                        handleConfirmShift(selectedShift);
                                        setDetailDrawerVisible(false);
                                    }}
                                >
                                    Xác nhận
                                </Button>
                            )}
                            {selectedShift.trang_thai !== 'huy' && (
                                <Button
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => {
                                        handleCancelShift(selectedShift);
                                        setDetailDrawerVisible(false);
                                    }}
                                >
                                    Hủy ca
                                </Button>
                            )}
                        </Space>
                    )
                }
            >
                {selectedShift && (
                    <div>
                        <Alert
                            message={
                                <Space>
                                    {getStatusIcon(selectedShift.trang_thai)}
                                    {getStatusLabel(selectedShift.trang_thai)}
                                </Space>
                            }
                            type={
                                selectedShift.trang_thai === 'xac_nhan' || selectedShift.trang_thai === 'hoan_thanh'
                                    ? 'success'
                                    : selectedShift.trang_thai === 'huy'
                                    ? 'error'
                                    : 'warning'
                            }
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        {selectedShift.nhan_vien && (
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <Avatar
                                    size={80}
                                    src={selectedShift.nhan_vien.hinh_anh}
                                    icon={<UserOutlined />}
                                />
                                <h3 style={{ marginTop: 12, marginBottom: 4 }}>
                                    {selectedShift.nhan_vien.ho_ten}
                                </h3>
                                <Tag color="blue">{selectedShift.nhan_vien.ma_nhan_vien}</Tag>
                                <div style={{ marginTop: 8 }}>
                                    <Tag color={getShiftTypeColor(selectedShift.loai_ca)}>
                                        {getShiftTypeLabel(selectedShift.loai_ca)}
                                    </Tag>
                                </div>
                            </div>
                        )}

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Ngày làm việc">
                                <CalendarOutlined /> {dayjs(selectedShift.ngay_lam_viec).format('DD/MM/YYYY (dddd)')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giờ làm việc">
                                <ClockCircleOutlined /> {selectedShift.gio_bat_dau} - {selectedShift.gio_ket_thuc}
                            </Descriptions.Item>
                            {selectedShift.chi_nhanh && (
                                <Descriptions.Item label="Chi nhánh">
                                    {selectedShift.chi_nhanh.ten_chi_nhanh}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Loại ca">
                                <Tag color={getShiftTypeColor(selectedShift.loai_ca)}>
                                    {getShiftTypeLabel(selectedShift.loai_ca)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={getStatusColor(selectedShift.trang_thai)}>
                                    {getStatusLabel(selectedShift.trang_thai)}
                                </Tag>
                            </Descriptions.Item>
                            {selectedShift.ghi_chu && (
                                <Descriptions.Item label="Ghi chú">
                                    {selectedShift.ghi_chu}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Ngày tạo">
                                {dayjs(selectedShift.created_at).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Space style={{ width: '100%', justifyContent: 'center' }}>
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => {
                                    handleEditShift(selectedShift);
                                    setDetailDrawerVisible(false);
                                }}
                            >
                                Chỉnh sửa
                            </Button>
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                    Modal.confirm({
                                        title: 'Xác nhận xóa ca làm việc?',
                                        onOk: () => {
                                            handleDeleteShift(selectedShift.id);
                                            setDetailDrawerVisible(false);
                                        },
                                    });
                                }}
                            >
                                Xóa ca
                            </Button>
                        </Space>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default StaffSchedule;
