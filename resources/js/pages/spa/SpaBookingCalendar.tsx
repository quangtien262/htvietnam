import React, { useState } from 'react';
import { Calendar, Badge, Modal, Form, Select, TimePicker, Button, Space, Tag, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const SpaBookingCalendar: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const getListData = (value: Dayjs) => {
        // Mock data - replace with API call
        const dateStr = value.format('YYYY-MM-DD');
        return bookings.filter((b: any) => b.date === dateStr);
    };

    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);
        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {listData.map((item: any) => (
                    <li key={item.id}>
                        <Badge
                            status={item.status === 'confirmed' ? 'success' : 'processing'}
                            text={`${item.time} - ${item.customerName}`}
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
            console.log('Booking data:', values);
            // TODO: Call API to create booking
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
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
                onCancel={() => setIsModalVisible(false)}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="khach_hang_id"
                        label="Khách hàng"
                        rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
                    >
                        <Select placeholder="Chọn khách hàng" showSearch>
                            {/* Mock data - fetch from API */}
                            <Select.Option value={1}>Nguyễn Văn A - 0901234567</Select.Option>
                            <Select.Option value={2}>Trần Thị B - 0907654321</Select.Option>
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
                            <Select.Option value={1}>Massage toàn thân (90 phút)</Select.Option>
                            <Select.Option value={2}>Chăm sóc da mặt (60 phút)</Select.Option>
                            <Select.Option value={3}>Tắm trắng (120 phút)</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="ktv_id" label="Kỹ thuật viên">
                        <Select placeholder="Chọn KTV" allowClear>
                            <Select.Option value={1}>KTV Linh</Select.Option>
                            <Select.Option value={2}>KTV Hoa</Select.Option>
                            <Select.Option value={3}>KTV Mai</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="phong_id" label="Phòng">
                        <Select placeholder="Chọn phòng" allowClear>
                            <Select.Option value={1}>Phòng VIP 1</Select.Option>
                            <Select.Option value={2}>Phòng VIP 2</Select.Option>
                            <Select.Option value={3}>Phòng Standard 1</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SpaBookingCalendar;
