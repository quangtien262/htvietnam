import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Modal, Form, Select, TimePicker, Button, Space, Tag, Spin, message, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import { API } from '../../common/api';

const SpaBookingCalendar: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    // Data states
    const [customers, setCustomers] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [ktvs, setKtvs] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);

    useEffect(() => {
        fetchBookings();
        fetchCustomers();
        fetchServices();
        fetchKTVs();
        fetchRooms();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API.spaBookingCalendar);
            const bookingData = response.data.data || [];
            setBookings(bookingData);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            message.error('Không thể tải lịch hẹn');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await axios.post(API.userSelect);
            console.log('Customers response:', response.data);

            if (response.data.status_code === 200) {
                const data = response.data.data || [];
                setCustomers(Array.isArray(data) ? data : []);
                console.log('Customers loaded:', data.length);
            } else {
                console.error('Failed to fetch customers:', response.data);
                message.error('Không thể tải danh sách khách hàng');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            message.error('Lỗi khi tải danh sách khách hàng');
        }
    };

    const fetchServices = async () => {
        try {
            const response = await axios.get(API.spaServiceList, {
                params: { per_page: 1000, trang_thai: 'active' }
            });
            const data = response.data.data?.data || response.data.data || [];
            setServices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const fetchKTVs = async () => {
        try {
            const response = await axios.get(API.spaStaffList, {
                params: { per_page: 1000 }
            });
            const data = response.data.data?.data || response.data.data || [];
            setKtvs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching KTVs:', error);
        }
    };

    const fetchRooms = async () => {
        try {
            const response = await axios.get('/aio/api/spa/rooms', {
                params: { per_page: 1000 }
            });
            const data = response.data.data?.data || response.data.data || [];
            setRooms(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const getListData = (value: Dayjs) => {
        const dateStr = value.format('YYYY-MM-DD');
        return bookings.filter((b: any) => {
            const bookingDate = dayjs(b.ngay_hen).format('YYYY-MM-DD');
            return bookingDate === dateStr;
        });
    };

    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);
        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {listData.map((item: any) => (
                    <li key={item.id}>
                        <Badge
                            status={item.trang_thai === 'da_xac_nhan' ? 'success' :
                                   item.trang_thai === 'dang_thuc_hien' ? 'processing' :
                                   item.trang_thai === 'hoan_thanh' ? 'default' : 'warning'}
                            text={`${item.gio_hen?.substring(0, 5) || ''} - ${item.khach_hang?.name || item.khach_hang?.ho_ten || ''}`}
                            style={{ fontSize: 11 }}
                        />
                    </li>
                ))}
            </ul>
        );
    };

    const handleDateSelect = (date: Dayjs) => {
        setSelectedDate(date);
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            // Format data for API
            const bookingData = {
                khach_hang_id: values.khach_hang_id,
                chi_nhanh_id: 1, // Default branch or get from user context
                nguon_booking: 'web',
                ngay_hen: selectedDate.format('YYYY-MM-DD'),
                gio_hen: values.gio_hen.format('HH:mm:ss'),
                dich_vu_ids: values.dich_vu_ids,
                ktv_id: values.ktv_id,
                phong_id: values.phong_id,
                ghi_chu_khach: values.ghi_chu_khach,
            };

            console.log('Creating booking:', bookingData);

            const response = await axios.post(API.spaBookingCreate, bookingData);

            if (response.data.success) {
                message.success('Tạo lịch hẹn thành công!');
                setIsModalVisible(false);
                form.resetFields();
                fetchBookings(); // Reload calendar
            } else {
                message.error(response.data.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            console.error('Validation/API failed:', error);
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                message.error(errors[0] as string);
            } else {
                message.error('Có lỗi xảy ra khi tạo lịch hẹn');
            }
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Lịch hẹn Spa</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Tạo lịch hẹn
                </Button>
            </div>

            <Calendar
                dateCellRender={dateCellRender}
                onSelect={handleDateSelect}
                mode="month"
            />

            <Modal
                title={`Tạo lịch hẹn - ${selectedDate.format('DD/MM/YYYY')}`}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="khach_hang_id"
                        label="Khách hàng"
                        rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
                    >
                        <Select
                            placeholder="Chọn khách hàng"
                            showSearch
                            filterOption={(input, option: any) => {
                                const label = option?.children?.toString() || '';
                                return label.toLowerCase().includes(input.toLowerCase());
                            }}
                        >
                            {customers.map(customer => (
                                <Select.Option key={customer.value} value={customer.value}>
                                    {customer.code} - {customer.label} {customer.phone ? `- ${customer.phone}` : ''}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="gio_hen"
                        label="Giờ hẹn"
                        rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
                    >
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="dich_vu_ids"
                        label="Dịch vụ"
                        rules={[{ required: true, message: 'Vui lòng chọn dịch vụ' }]}
                    >
                        <Select mode="multiple" placeholder="Chọn dịch vụ">
                            {services.map(service => (
                                <Select.Option key={service.id} value={service.id}>
                                    {service.ten_dich_vu} - {new Intl.NumberFormat('vi-VN').format(service.gia_ban)}đ
                                    {service.thoi_gian_thuc_hien && ` (${service.thoi_gian_thuc_hien} phút)`}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="ktv_id" label="Kỹ thuật viên">
                        <Select placeholder="Chọn KTV" allowClear>
                            {ktvs.map(ktv => (
                                <Select.Option key={ktv.id} value={ktv.id}>
                                    {ktv.admin_user?.name || ktv.ho_ten || `KTV ${ktv.id}`}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="phong_id" label="Phòng">
                        <Select placeholder="Chọn phòng" allowClear>
                            {rooms.map(room => (
                                <Select.Option key={room.id} value={room.id}>
                                    {room.ten_phong} ({room.loai_phong})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="ghi_chu_khach" label="Ghi chú">
                        <Input.TextArea rows={3} placeholder="Ghi chú từ khách hàng..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SpaBookingCalendar;
