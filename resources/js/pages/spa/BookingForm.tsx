import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Card, Form, Input, Select, DatePicker, TimePicker, Button, Steps, Row, Col,
    message, Space, Divider, Avatar, Tag, Radio, InputNumber, Switch, Alert,
    Checkbox, Badge, Empty, Spin, Modal, Table, Tooltip, Image, List
} from 'antd';
import {
    UserOutlined, CalendarOutlined, ScissorOutlined, ClockCircleOutlined,
    DollarOutlined, CheckCircleOutlined, PhoneOutlined, EnvironmentOutlined,
    StarOutlined, CrownOutlined, ExclamationCircleOutlined, SearchOutlined,
    TeamOutlined, FileTextOutlined, GiftOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

interface Customer {
    id: number;
    ma_khach_hang: string;
    ho_ten: string;
    so_dien_thoai: string;
    email?: string;
    diem_tich_luy: number;
    membershipCard?: {
        tier: {
            ten_cap_bac: string;
            ti_le_giam_gia: number;
        };
    };
    hoSoSucKhoe?: any;
}

interface Service {
    id: number;
    ma_dich_vu: string;
    ten_dich_vu: string;
    gia: number;
    thoi_gian_thuc_hien: number;
    mo_ta?: string;
    hinh_anh?: string;
    danh_muc?: {
        ten_danh_muc: string;
    };
}

interface Staff {
    id: number;
    ma_ktv: string;
    ten_ktv: string;
    chuyen_mon: string[];
    avatar?: string;
    danh_gia_trung_binh: number;
    trang_thai: string;
}

interface TimeSlot {
    time: string;
    available: boolean;
    staff_available: number;
}

const BookingForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();

    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Data states
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [branches, setBranches] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

    // Selection states
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

    // UI states
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [customerSearchText, setCustomerSearchText] = useState('');

    useEffect(() => {
        loadInitialData();
        if (id) {
            loadBookingData(id);
        }
    }, [id]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [customersRes, servicesRes, branchesRes] = await Promise.all([
                axios.post('/aio/api/admin/spa/customers/list'),
                axios.post('/aio/api/admin/spa/services/list'),
                axios.post('/aio/api/admin/spa/branches/list'),
            ]);

            if (customersRes.data.success) {
                setCustomers(customersRes.data.data.data || []);
            }
            if (servicesRes.data.success) {
                setServices(servicesRes.data.data.data || []);
            }
            if (branchesRes.data.success) {
                setBranches(branchesRes.data.data.data || []);
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu ban đầu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadBookingData = async (bookingId: string) => {
        try {
            const response = await axios.post(`/aio/api/admin/spa/bookings/${bookingId}/show`);
            if (response.data.success) {
                const booking = response.data.data;
                // Populate form with existing booking data
                form.setFieldsValue({
                    khach_hang_id: booking.khach_hang_id,
                    chi_nhanh_id: booking.chi_nhanh_id,
                    phong_id: booking.phong_id,
                    ngay_hen: dayjs(booking.ngay_hen),
                    gio_hen: booking.gio_hen,
                    ktv_id: booking.ktv_id,
                    ghi_chu: booking.ghi_chu,
                });
                setSelectedCustomer(booking.khachHang);
                setSelectedServices(booking.dichVus || []);
                setSelectedDate(dayjs(booking.ngay_hen));
                setSelectedTime(booking.gio_hen);
                setSelectedStaff(booking.ktv);
                setSelectedBranch(booking.chi_nhanh_id);
                setSelectedRoom(booking.phong_id);
            }
        } catch (error) {
            message.error('Không thể tải thông tin đặt lịch');
        }
    };

    const handleCustomerSelect = async (customerId: number) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setSelectedCustomer(customer);

            // Check health warnings
            if (customer.hoSoSucKhoe?.di_ung && customer.hoSoSucKhoe.di_ung.length > 0) {
                Modal.warning({
                    title: 'Cảnh báo dị ứng',
                    content: (
                        <div>
                            <p>Khách hàng có tiền sử dị ứng:</p>
                            <ul>
                                {customer.hoSoSucKhoe.di_ung.map((item: string, idx: number) => (
                                    <li key={idx} style={{ color: 'red' }}>{item}</li>
                                ))}
                            </ul>
                            <p><strong>Vui lòng tham khảo ý kiến chuyên gia trước khi thực hiện dịch vụ.</strong></p>
                        </div>
                    ),
                });
            }
        }
    };

    const handleServiceSelect = (service: Service) => {
        if (selectedServices.find(s => s.id === service.id)) {
            setSelectedServices(selectedServices.filter(s => s.id !== service.id));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    const handleDateChange = async (date: Dayjs | null) => {
        setSelectedDate(date);
        setSelectedTime(null);
        setSelectedStaff(null);

        if (date && selectedServices.length > 0 && selectedBranch) {
            await loadTimeSlots(date, selectedServices, selectedBranch);
        }
    };

    const loadTimeSlots = async (date: Dayjs, services: Service[], branchId: number) => {
        try {
            const response = await axios.post('/aio/api/admin/spa/bookings/available-slots', {
                ngay: date.format('YYYY-MM-DD'),
                dich_vu_ids: services.map(s => s.id),
                chi_nhanh_id: branchId,
            });

            if (response.data.success) {
                setTimeSlots(response.data.data || []);
            }
        } catch (error) {
            message.error('Không thể tải khung giờ khả dụng');
        }
    };

    const handleTimeSelect = async (time: string) => {
        setSelectedTime(time);
        setSelectedStaff(null);

        if (selectedDate && selectedServices.length > 0 && selectedBranch) {
            await loadAvailableStaff(selectedDate, time, selectedServices, selectedBranch);
        }
    };

    const loadAvailableStaff = async (date: Dayjs, time: string, services: Service[], branchId: number) => {
        try {
            const response = await axios.post('/aio/api/admin/spa/bookings/available-staff', {
                ngay: date.format('YYYY-MM-DD'),
                gio: time,
                dich_vu_ids: services.map(s => s.id),
                chi_nhanh_id: branchId,
            });

            if (response.data.success) {
                setAvailableStaff(response.data.data || []);
            }
        } catch (error) {
            message.error('Không thể tải danh sách nhân viên khả dụng');
        }
    };

    const loadRooms = async (branchId: number) => {
        try {
            const response = await axios.post('/aio/api/admin/spa/rooms/list', {
                chi_nhanh_id: branchId,
                trang_thai: 'hoat_dong',
            });

            if (response.data.success) {
                setRooms(response.data.data.data || []);
            }
        } catch (error) {
            message.error('Không thể tải danh sách phòng');
        }
    };

    const handleBranchChange = (branchId: number) => {
        setSelectedBranch(branchId);
        setSelectedRoom(null);
        loadRooms(branchId);

        if (selectedDate && selectedServices.length > 0) {
            loadTimeSlots(selectedDate, selectedServices, branchId);
        }
    };

    const calculateTotalDuration = () => {
        return selectedServices.reduce((total, service) => total + service.thoi_gian_thuc_hien, 0);
    };

    const calculateTotalPrice = () => {
        const subtotal = selectedServices.reduce((total, service) => total + service.gia, 0);
        const discount = selectedCustomer?.membershipCard?.tier.ti_le_giam_gia || 0;
        const discountAmount = (subtotal * discount) / 100;
        return {
            subtotal,
            discount: discountAmount,
            total: subtotal - discountAmount,
        };
    };

    const handleCreateNewCustomer = async (values: any) => {
        try {
            const response = await axios.post('/aio/api/admin/spa/customers/create-or-update', values);
            if (response.data.success) {
                message.success('Tạo khách hàng mới thành công');
                const newCustomer = response.data.data;
                setCustomers([newCustomer, ...customers]);
                setSelectedCustomer(newCustomer);
                form.setFieldValue('khach_hang_id', newCustomer.id);
                setShowNewCustomerForm(false);
            }
        } catch (error) {
            message.error('Tạo khách hàng thất bại');
        }
    };

    const handleSubmit = async () => {
        try {
            await form.validateFields();

            if (!selectedCustomer) {
                message.error('Vui lòng chọn khách hàng');
                return;
            }
            if (selectedServices.length === 0) {
                message.error('Vui lòng chọn ít nhất một dịch vụ');
                return;
            }
            if (!selectedDate || !selectedTime) {
                message.error('Vui lòng chọn ngày và giờ hẹn');
                return;
            }

            setSubmitting(true);

            const values = form.getFieldsValue();
            const payload = {
                id: id ? parseInt(id) : undefined,
                khach_hang_id: selectedCustomer.id,
                chi_nhanh_id: selectedBranch,
                phong_id: selectedRoom,
                ngay_hen: selectedDate.format('YYYY-MM-DD'),
                gio_hen: selectedTime,
                ktv_id: selectedStaff?.id,
                dich_vu_ids: selectedServices.map(s => s.id),
                ghi_chu: values.ghi_chu,
                nguoi_dat: values.nguoi_dat,
                sdt_nguoi_dat: values.sdt_nguoi_dat,
                trang_thai: values.trang_thai || 'cho_xac_nhan',
            };

            const response = await axios.post('/aio/api/admin/spa/bookings/create-or-update', payload);

            if (response.data.success) {
                message.success(id ? 'Cập nhật lịch hẹn thành công' : 'Tạo lịch hẹn thành công');
                navigate('/admin/spa/booking-calendar');
            }
        } catch (error: any) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Có lỗi xảy ra khi lưu lịch hẹn');
            }
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep === 0 && !selectedCustomer) {
            message.warning('Vui lòng chọn khách hàng');
            return;
        }
        if (currentStep === 1 && selectedServices.length === 0) {
            message.warning('Vui lòng chọn ít nhất một dịch vụ');
            return;
        }
        if (currentStep === 2 && (!selectedDate || !selectedTime)) {
            message.warning('Vui lòng chọn ngày và giờ hẹn');
            return;
        }
        setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    // Render Step 1: Customer Selection
    const renderCustomerStep = () => (
        <Card title="Chọn khách hàng">
            {showNewCustomerForm ? (
                <div>
                    <Form layout="vertical" onFinish={handleCreateNewCustomer}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="ho_ten" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                    <Input prefix={<UserOutlined />} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="so_dien_thoai" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
                                    <Input prefix={<PhoneOutlined />} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="email" label="Email">
                                    <Input type="email" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="gioi_tinh" label="Giới tính">
                                    <Radio.Group>
                                        <Radio value="Nam">Nam</Radio>
                                        <Radio value="Nữ">Nữ</Radio>
                                        <Radio value="Khác">Khác</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="dia_chi" label="Địa chỉ">
                                    <TextArea rows={2} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Space>
                            <Button type="primary" htmlType="submit">Tạo khách hàng</Button>
                            <Button onClick={() => setShowNewCustomerForm(false)}>Hủy</Button>
                        </Space>
                    </Form>
                </div>
            ) : (
                <div>
                    <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
                        <Input.Search
                            placeholder="Tìm kiếm theo tên, số điện thoại, mã KH..."
                            allowClear
                            size="large"
                            value={customerSearchText}
                            onChange={(e) => setCustomerSearchText(e.target.value)}
                            prefix={<SearchOutlined />}
                        />
                        <Button type="dashed" block onClick={() => setShowNewCustomerForm(true)}>
                            + Tạo khách hàng mới
                        </Button>
                    </Space>

                    {selectedCustomer && (
                        <Alert
                            message="Khách hàng đã chọn"
                            description={
                                <Space>
                                    <Avatar src={selectedCustomer.avatar} icon={<UserOutlined />} />
                                    <div>
                                        <strong>{selectedCustomer.ho_ten}</strong>
                                        {selectedCustomer.membershipCard && (
                                            <Tag color="gold" style={{ marginLeft: 8 }}>
                                                <CrownOutlined /> {selectedCustomer.membershipCard.tier.ten_cap_bac}
                                            </Tag>
                                        )}
                                        <div>
                                            <span>{selectedCustomer.so_dien_thoai}</span>
                                            <Divider type="vertical" />
                                            <span>Điểm: {selectedCustomer.diem_tich_luy}</span>
                                        </div>
                                    </div>
                                </Space>
                            }
                            type="success"
                            closable
                            onClose={() => {
                                setSelectedCustomer(null);
                                form.setFieldValue('khach_hang_id', null);
                            }}
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Form form={form} layout="vertical">
                        <Form.Item name="khach_hang_id" label="Chọn từ danh sách">
                            <Select
                                showSearch
                                size="large"
                                placeholder="Chọn khách hàng"
                                optionFilterProp="children"
                                onChange={handleCustomerSelect}
                                filterOption={(input, option: any) => {
                                    const customer = customers.find(c => c.id === option.value);
                                    if (!customer) return false;
                                    const searchStr = `${customer.ho_ten} ${customer.so_dien_thoai} ${customer.ma_khach_hang}`.toLowerCase();
                                    return searchStr.includes(input.toLowerCase());
                                }}
                            >
                                {customers
                                    .filter(c => {
                                        if (!customerSearchText) return true;
                                        const searchStr = `${c.ho_ten} ${c.so_dien_thoai} ${c.ma_khach_hang}`.toLowerCase();
                                        return searchStr.includes(customerSearchText.toLowerCase());
                                    })
                                    .map(customer => (
                                        <Option key={customer.id} value={customer.id}>
                                            <Space>
                                                <Avatar size="small" src={customer.avatar} icon={<UserOutlined />} />
                                                <span>{customer.ho_ten}</span>
                                                <Tag size="small">{customer.so_dien_thoai}</Tag>
                                                {customer.membershipCard && (
                                                    <Tag color="gold" size="small">
                                                        {customer.membershipCard.tier.ten_cap_bac}
                                                    </Tag>
                                                )}
                                            </Space>
                                        </Option>
                                    ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </div>
            )}
        </Card>
    );

    // Render Step 2: Service Selection
    const renderServiceStep = () => {
        const servicesByCategory = services.reduce((acc: any, service) => {
            const categoryName = service.danh_muc?.ten_danh_muc || 'Khác';
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(service);
            return acc;
        }, {});

        return (
            <Card title="Chọn dịch vụ">
                {selectedServices.length > 0 && (
                    <Alert
                        message={`Đã chọn ${selectedServices.length} dịch vụ`}
                        description={
                            <Space wrap>
                                {selectedServices.map(service => (
                                    <Tag
                                        key={service.id}
                                        closable
                                        onClose={() => handleServiceSelect(service)}
                                        color="blue"
                                    >
                                        {service.ten_dich_vu} - {service.gia.toLocaleString()} VNĐ
                                    </Tag>
                                ))}
                            </Space>
                        }
                        type="info"
                        style={{ marginBottom: 16 }}
                    />
                )}

                {Object.keys(servicesByCategory).map(category => (
                    <div key={category} style={{ marginBottom: 24 }}>
                        <h3>{category}</h3>
                        <Row gutter={[16, 16]}>
                            {servicesByCategory[category].map((service: Service) => {
                                const isSelected = selectedServices.find(s => s.id === service.id);
                                return (
                                    <Col span={8} key={service.id}>
                                        <Card
                                            hoverable
                                            onClick={() => handleServiceSelect(service)}
                                            style={{
                                                border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                                background: isSelected ? '#e6f7ff' : 'white',
                                            }}
                                            cover={
                                                service.hinh_anh ? (
                                                    <Image
                                                        src={service.hinh_anh}
                                                        height={150}
                                                        style={{ objectFit: 'cover' }}
                                                        preview={false}
                                                    />
                                                ) : (
                                                    <div style={{ height: 150, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <ScissorOutlined style={{ fontSize: 48, color: '#999' }} />
                                                    </div>
                                                )
                                            }
                                        >
                                            <Card.Meta
                                                title={
                                                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                        <span>{service.ten_dich_vu}</span>
                                                        {isSelected && <CheckCircleOutlined style={{ color: '#1890ff' }} />}
                                                    </Space>
                                                }
                                                description={
                                                    <div>
                                                        <div style={{ marginBottom: 8 }}>
                                                            <DollarOutlined /> <strong>{service.gia.toLocaleString()} VNĐ</strong>
                                                        </div>
                                                        <div>
                                                            <ClockCircleOutlined /> {service.thoi_gian_thuc_hien} phút
                                                        </div>
                                                        {service.mo_ta && (
                                                            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                                                                {service.mo_ta.substring(0, 50)}...
                                                            </div>
                                                        )}
                                                    </div>
                                                }
                                            />
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    </div>
                ))}
            </Card>
        );
    };

    // Render Step 3: Date & Time Selection
    const renderDateTimeStep = () => (
        <Row gutter={16}>
            <Col span={12}>
                <Card title="Chọn chi nhánh & ngày">
                    <Form form={form} layout="vertical">
                        <Form.Item name="chi_nhanh_id" label="Chi nhánh" rules={[{ required: true }]}>
                            <Select
                                size="large"
                                placeholder="Chọn chi nhánh"
                                onChange={handleBranchChange}
                            >
                                {branches.map((branch: any) => (
                                    <Option key={branch.id} value={branch.id}>
                                        <EnvironmentOutlined /> {branch.ten_chi_nhanh}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="ngay_hen" label="Ngày hẹn" rules={[{ required: true }]}>
                            <DatePicker
                                size="large"
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                                onChange={handleDateChange}
                            />
                        </Form.Item>
                    </Form>

                    {selectedDate && selectedBranch && (
                        <div>
                            <Divider>Khung giờ khả dụng</Divider>
                            {timeSlots.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                    {timeSlots.map((slot) => (
                                        <Button
                                            key={slot.time}
                                            type={selectedTime === slot.time ? 'primary' : 'default'}
                                            disabled={!slot.available}
                                            onClick={() => handleTimeSelect(slot.time)}
                                            style={{ height: 'auto', padding: '8px 4px' }}
                                        >
                                            <div style={{ fontSize: 16 }}>{slot.time}</div>
                                            <div style={{ fontSize: 11 }}>
                                                {slot.available ? (
                                                    <span style={{ color: 'green' }}>
                                                        <CheckCircleOutlined /> {slot.staff_available} KTV
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'red' }}>Đã full</span>
                                                )}
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <Empty description="Không có khung giờ khả dụng" />
                            )}
                        </div>
                    )}
                </Card>
            </Col>

            <Col span={12}>
                <Card title="Chọn nhân viên & phòng">
                    <Form form={form} layout="vertical">
                        <Form.Item name="ktv_id" label="Nhân viên kỹ thuật">
                            <Select
                                size="large"
                                placeholder="Chọn KTV hoặc để trống (auto assign)"
                                allowClear
                                onChange={(value) => {
                                    const staff = availableStaff.find(s => s.id === value);
                                    setSelectedStaff(staff || null);
                                }}
                            >
                                {availableStaff.map((staff) => (
                                    <Option key={staff.id} value={staff.id}>
                                        <Space>
                                            <Avatar src={staff.avatar} size="small" icon={<TeamOutlined />} />
                                            <span>{staff.ten_ktv}</span>
                                            <Tag color="blue">{staff.chuyen_mon.join(', ')}</Tag>
                                            <span>
                                                <StarOutlined style={{ color: '#faad14' }} />
                                                {staff.danh_gia_trung_binh.toFixed(1)}
                                            </span>
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {selectedStaff && (
                            <Alert
                                message={
                                    <Space>
                                        <Avatar src={selectedStaff.avatar} />
                                        <div>
                                            <strong>{selectedStaff.ten_ktv}</strong>
                                            <div style={{ fontSize: 12 }}>
                                                Chuyên môn: {selectedStaff.chuyen_mon.join(', ')}
                                            </div>
                                            <div style={{ fontSize: 12 }}>
                                                Đánh giá: <StarOutlined /> {selectedStaff.danh_gia_trung_binh.toFixed(1)}/5
                                            </div>
                                        </div>
                                    </Space>
                                }
                                type="info"
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        <Form.Item name="phong_id" label="Phòng">
                            <Select
                                size="large"
                                placeholder="Chọn phòng"
                                allowClear
                                disabled={!selectedBranch}
                            >
                                {rooms.map((room: any) => (
                                    <Option key={room.id} value={room.id}>
                                        {room.ten_phong} (Sức chứa: {room.suc_chua})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>

                    <Divider>Thời gian dự kiến</Divider>
                    <div style={{ textAlign: 'center' }}>
                        <Statistic
                            title="Tổng thời gian"
                            value={calculateTotalDuration()}
                            suffix="phút"
                            prefix={<ClockCircleOutlined />}
                        />
                        {selectedTime && (
                            <div style={{ marginTop: 16 }}>
                                <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                                    {selectedTime} - {dayjs(`2000-01-01 ${selectedTime}`).add(calculateTotalDuration(), 'minute').format('HH:mm')}
                                </Tag>
                            </div>
                        )}
                    </div>
                </Card>
            </Col>
        </Row>
    );

    // Render Step 4: Confirmation
    const renderConfirmationStep = () => {
        const { subtotal, discount, total } = calculateTotalPrice();

        return (
            <Row gutter={16}>
                <Col span={16}>
                    <Card title="Xác nhận thông tin đặt lịch">
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Khách hàng" span={2}>
                                <Space>
                                    <Avatar src={selectedCustomer?.avatar} icon={<UserOutlined />} />
                                    <div>
                                        <strong>{selectedCustomer?.ho_ten}</strong>
                                        <div>{selectedCustomer?.so_dien_thoai}</div>
                                    </div>
                                    {selectedCustomer?.membershipCard && (
                                        <Tag color="gold">
                                            <CrownOutlined /> {selectedCustomer.membershipCard.tier.ten_cap_bac}
                                        </Tag>
                                    )}
                                </Space>
                            </Descriptions.Item>

                            <Descriptions.Item label="Chi nhánh">
                                {branches.find((b: any) => b.id === selectedBranch)?.ten_chi_nhanh}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phòng">
                                {selectedRoom ? rooms.find((r: any) => r.id === selectedRoom)?.ten_phong : 'Chưa chọn'}
                            </Descriptions.Item>

                            <Descriptions.Item label="Ngày hẹn">
                                <CalendarOutlined /> {selectedDate?.format('DD/MM/YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giờ hẹn">
                                <ClockCircleOutlined /> {selectedTime}
                            </Descriptions.Item>

                            <Descriptions.Item label="Nhân viên KT" span={2}>
                                {selectedStaff ? (
                                    <Space>
                                        <Avatar src={selectedStaff.avatar} size="small" />
                                        {selectedStaff.ten_ktv}
                                        <Tag>{selectedStaff.chuyen_mon.join(', ')}</Tag>
                                    </Space>
                                ) : (
                                    <Tag color="orange">Tự động phân công</Tag>
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label="Dịch vụ" span={2}>
                                <List
                                    dataSource={selectedServices}
                                    renderItem={(service) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<ScissorOutlined />}
                                                title={service.ten_dich_vu}
                                                description={`${service.thoi_gian_thuc_hien} phút - ${service.gia.toLocaleString()} VNĐ`}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Form form={form} layout="vertical">
                            <Form.Item name="nguoi_dat" label="Người đặt (nếu khác khách hàng)">
                                <Input placeholder="Tên người đặt hộ" />
                            </Form.Item>

                            <Form.Item name="sdt_nguoi_dat" label="SĐT người đặt">
                                <Input placeholder="Số điện thoại người đặt hộ" />
                            </Form.Item>

                            <Form.Item name="ghi_chu" label="Ghi chú">
                                <TextArea rows={3} placeholder="Ghi chú thêm về lịch hẹn..." />
                            </Form.Item>

                            <Form.Item name="trang_thai" label="Trạng thái" initialValue="cho_xac_nhan">
                                <Radio.Group>
                                    <Radio value="cho_xac_nhan">Chờ xác nhận</Radio>
                                    <Radio value="da_xac_nhan">Đã xác nhận</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title="Tổng kết thanh toán" style={{ position: 'sticky', top: 24 }}>
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Tạm tính">
                                {subtotal.toLocaleString()} VNĐ
                            </Descriptions.Item>
                            <Descriptions.Item label="Giảm giá thành viên">
                                {selectedCustomer?.membershipCard ? (
                                    <span style={{ color: 'red' }}>
                                        -{discount.toLocaleString()} VNĐ ({selectedCustomer.membershipCard.tier.ti_le_giam_gia}%)
                                    </span>
                                ) : (
                                    '0 VNĐ'
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label={<strong>Tổng cộng</strong>}>
                                <strong style={{ fontSize: 20, color: '#52c41a' }}>
                                    {total.toLocaleString()} VNĐ
                                </strong>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <div style={{ textAlign: 'center' }}>
                            <p><ClockCircleOutlined /> Thời gian: {calculateTotalDuration()} phút</p>
                            <p>
                                Kết thúc dự kiến:{' '}
                                {selectedTime && (
                                    <Tag color="blue">
                                        {dayjs(`2000-01-01 ${selectedTime}`).add(calculateTotalDuration(), 'minute').format('HH:mm')}
                                    </Tag>
                                )}
                            </p>
                        </div>

                        {selectedCustomer && (
                            <Alert
                                message="Điểm thưởng"
                                description={
                                    <div>
                                        <p>Điểm hiện tại: <strong>{selectedCustomer.diem_tich_luy}</strong></p>
                                        <p>
                                            Điểm sẽ được cộng:{' '}
                                            <strong style={{ color: 'green' }}>
                                                +{Math.floor(total / 10000)} điểm
                                            </strong>
                                        </p>
                                    </div>
                                }
                                type="success"
                                icon={<GiftOutlined />}
                                style={{ marginTop: 16 }}
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        );
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
    }

    const steps = [
        { title: 'Khách hàng', icon: <UserOutlined /> },
        { title: 'Dịch vụ', icon: <ScissorOutlined /> },
        { title: 'Ngày giờ', icon: <CalendarOutlined /> },
        { title: 'Xác nhận', icon: <CheckCircleOutlined /> },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card title={id ? 'Chỉnh sửa lịch hẹn' : 'Tạo lịch hẹn mới'} style={{ marginBottom: 24 }}>
                <Steps current={currentStep} style={{ marginBottom: 32 }}>
                    {steps.map((step, index) => (
                        <Step key={index} title={step.title} icon={step.icon} />
                    ))}
                </Steps>

                <div style={{ minHeight: 400 }}>
                    {currentStep === 0 && renderCustomerStep()}
                    {currentStep === 1 && renderServiceStep()}
                    {currentStep === 2 && renderDateTimeStep()}
                    {currentStep === 3 && renderConfirmationStep()}
                </div>

                <Divider />

                <div style={{ textAlign: 'center' }}>
                    <Space size="large">
                        <Button size="large" onClick={() => navigate('/admin/spa/booking-calendar')}>
                            Hủy
                        </Button>
                        {currentStep > 0 && (
                            <Button size="large" onClick={prevStep}>
                                Quay lại
                            </Button>
                        )}
                        {currentStep < 3 && (
                            <Button type="primary" size="large" onClick={nextStep}>
                                Tiếp theo
                            </Button>
                        )}
                        {currentStep === 3 && (
                            <Button type="primary" size="large" loading={submitting} onClick={handleSubmit}>
                                {id ? 'Cập nhật lịch hẹn' : 'Tạo lịch hẹn'}
                            </Button>
                        )}
                    </Space>
                </div>
            </Card>
        </div>
    );
};

export default BookingForm;
