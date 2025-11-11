import React, { useState, useEffect } from 'react';
import {
    Card, Tabs, Form, Input, InputNumber, Select, Switch, Button, message, Space, Divider,
    Row, Col, TimePicker, Upload, Typography
} from 'antd';
import {
    SaveOutlined, SettingOutlined, DollarOutlined, CalendarOutlined,
    BellOutlined, MailOutlined, PhoneOutlined, UploadOutlined, GlobalOutlined
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface GeneralSettings {
    ten_cong_ty: string;
    slogan?: string;
    dia_chi: string;
    so_dien_thoai: string;
    email: string;
    website?: string;
    logo?: string;
    timezone: string;
    language: string;
}

interface BusinessSettings {
    gio_mo_cua: string;
    gio_dong_cua: string;
    thoi_gian_slot: number; // phút
    thoi_gian_nghi_giua_slot: number; // phút
    cho_phep_booking_online: boolean;
    yeu_cau_xac_nhan_booking: boolean;
    thoi_gian_huy_booking: number; // giờ
    phi_huy_booking: number;
}

interface PaymentSettings {
    phuong_thuc_thanh_toan: string[];
    yeu_cau_dat_coc: boolean;
    ty_le_dat_coc: number; // %
    cho_phep_tra_gop: boolean;
    ngay_cong_no_toi_da: number;
}

interface NotificationSettings {
    gui_email_booking_moi: boolean;
    gui_sms_nho_lich: boolean;
    thoi_gian_gui_nho_lich: number; // giờ
    gui_email_sinh_nhat: boolean;
    gui_sms_khuyen_mai: boolean;
}

interface LoyaltySettings {
    bat_diem_thuong: boolean;
    ti_le_tich_diem: number; // VNĐ = 1 điểm
    ti_le_doi_diem: number; // điểm = 1 VNĐ
    han_su_dung_diem: number; // tháng
    diem_sinh_nhat: number;
}

const Settings: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    // Forms
    const [generalForm] = Form.useForm();
    const [businessForm] = Form.useForm();
    const [paymentForm] = Form.useForm();
    const [notificationForm] = Form.useForm();
    const [loyaltyForm] = Form.useForm();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/aio/api/admin/spa/settings/get');

            if (response.data.success) {
                const data = response.data.data;

                if (data.general) {
                    generalForm.setFieldsValue(data.general);
                }

                if (data.business) {
                    businessForm.setFieldsValue({
                        ...data.business,
                        gio_mo_cua: data.business.gio_mo_cua ? dayjs(data.business.gio_mo_cua, 'HH:mm') : null,
                        gio_dong_cua: data.business.gio_dong_cua ? dayjs(data.business.gio_dong_cua, 'HH:mm') : null,
                    });
                }

                if (data.payment) {
                    paymentForm.setFieldsValue(data.payment);
                }

                if (data.notification) {
                    notificationForm.setFieldsValue(data.notification);
                }

                if (data.loyalty) {
                    loyaltyForm.setFieldsValue(data.loyalty);
                }
            }
        } catch (error) {
            message.error('Không thể tải cấu hình');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (category: string, form: any) => {
        try {
            const values = await form.validateFields();

            // Format time fields if business settings
            if (category === 'business') {
                values.gio_mo_cua = values.gio_mo_cua?.format('HH:mm');
                values.gio_dong_cua = values.gio_dong_cua?.format('HH:mm');
            }

            const response = await axios.post('/aio/api/admin/spa/settings/update', {
                category,
                settings: values,
            });

            if (response.data.success) {
                message.success('Lưu cài đặt thành công');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleUploadLogo = async (file: any) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post('/aio/api/admin/spa/upload-image', formData);
            if (response.data.success) {
                generalForm.setFieldValue('logo', response.data.url);
                message.success('Upload logo thành công');
            }
        } catch (error) {
            message.error('Upload thất bại');
        }

        return false; // Prevent default upload
    };

    const tabItems = [
        {
            key: 'general',
            label: (
                <span>
                    <SettingOutlined /> Cài đặt chung
                </span>
            ),
            children: (
                <Card>
                    <Form form={generalForm} layout="vertical">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="ten_cong_ty"
                                    label="Tên công ty"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="slogan" label="Slogan">
                                    <Input placeholder="VD: Spa chăm sóc sắc đẹp toàn diện" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="dia_chi"
                                    label="Địa chỉ"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="so_dien_thoai"
                                    label="Số điện thoại"
                                    rules={[{ required: true }]}
                                >
                                    <Input prefix={<PhoneOutlined />} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[{ required: true, type: 'email' }]}
                                >
                                    <Input prefix={<MailOutlined />} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="website" label="Website">
                                    <Input prefix={<GlobalOutlined />} placeholder="https://..." />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="timezone" label="Múi giờ" initialValue="Asia/Ho_Chi_Minh">
                                    <Select>
                                        <Option value="Asia/Ho_Chi_Minh">GMT+7 (Việt Nam)</Option>
                                        <Option value="Asia/Bangkok">GMT+7 (Bangkok)</Option>
                                        <Option value="Asia/Singapore">GMT+8 (Singapore)</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="language" label="Ngôn ngữ" initialValue="vi">
                                    <Select>
                                        <Option value="vi">Tiếng Việt</Option>
                                        <Option value="en">English</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="logo" label="Logo">
                                    <Upload
                                        beforeUpload={handleUploadLogo}
                                        showUploadList={false}
                                        accept="image/*"
                                    >
                                        <Button icon={<UploadOutlined />}>Upload Logo</Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Divider />
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => handleSave('general', generalForm)}
                        >
                            Lưu cài đặt
                        </Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'business',
            label: (
                <span>
                    <CalendarOutlined /> Quy tắc kinh doanh
                </span>
            ),
            children: (
                <Card>
                    <Form form={businessForm} layout="vertical">
                        <Title level={5}>Giờ hoạt động</Title>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="gio_mo_cua"
                                    label="Giờ mở cửa"
                                    rules={[{ required: true }]}
                                >
                                    <TimePicker format="HH:mm" style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="gio_dong_cua"
                                    label="Giờ đóng cửa"
                                    rules={[{ required: true }]}
                                >
                                    <TimePicker format="HH:mm" style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider />
                        <Title level={5}>Cài đặt Booking</Title>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="thoi_gian_slot"
                                    label="Thời gian mỗi slot (phút)"
                                    initialValue={30}
                                >
                                    <InputNumber min={15} max={120} step={15} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="thoi_gian_nghi_giua_slot"
                                    label="Thời gian nghỉ giữa slot (phút)"
                                    initialValue={5}
                                >
                                    <InputNumber min={0} max={30} step={5} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="cho_phep_booking_online"
                                    label="Cho phép booking online"
                                    valuePropName="checked"
                                    initialValue={true}
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="yeu_cau_xac_nhan_booking"
                                    label="Yêu cầu xác nhận booking"
                                    valuePropName="checked"
                                    initialValue={true}
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="thoi_gian_huy_booking"
                                    label="Thời gian được hủy booking (giờ trước)"
                                    initialValue={24}
                                >
                                    <InputNumber min={1} max={72} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="phi_huy_booking"
                                    label="Phí hủy booking (VNĐ)"
                                    initialValue={0}
                                >
                                    <InputNumber min={0} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider />
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => handleSave('business', businessForm)}
                        >
                            Lưu cài đặt
                        </Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'payment',
            label: (
                <span>
                    <DollarOutlined /> Thanh toán
                </span>
            ),
            children: (
                <Card>
                    <Form form={paymentForm} layout="vertical">
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    name="phuong_thuc_thanh_toan"
                                    label="Phương thức thanh toán"
                                    initialValue={['tien_mat', 'chuyen_khoan', 'the']}
                                >
                                    <Select mode="multiple">
                                        <Option value="tien_mat">Tiền mặt</Option>
                                        <Option value="chuyen_khoan">Chuyển khoản</Option>
                                        <Option value="the">Thẻ</Option>
                                        <Option value="vi_dien_tu">Ví điện tử</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="yeu_cau_dat_coc"
                                    label="Yêu cầu đặt cọc"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="ty_le_dat_coc"
                                    label="Tỷ lệ đặt cọc (%)"
                                    initialValue={30}
                                >
                                    <InputNumber min={0} max={100} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="cho_phep_tra_gop"
                                    label="Cho phép trả góp"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="ngay_cong_no_toi_da"
                                    label="Số ngày công nợ tối đa"
                                    initialValue={30}
                                >
                                    <InputNumber min={1} max={365} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider />
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => handleSave('payment', paymentForm)}
                        >
                            Lưu cài đặt
                        </Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'notification',
            label: (
                <span>
                    <BellOutlined /> Thông báo
                </span>
            ),
            children: (
                <Card>
                    <Form form={notificationForm} layout="vertical">
                        <Title level={5}>Email</Title>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="gui_email_booking_moi"
                                    label="Gửi email khi có booking mới"
                                    valuePropName="checked"
                                    initialValue={true}
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="gui_email_sinh_nhat"
                                    label="Gửi email chúc mừng sinh nhật"
                                    valuePropName="checked"
                                    initialValue={true}
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider />
                        <Title level={5}>SMS</Title>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="gui_sms_nho_lich"
                                    label="Gửi SMS nhắc lịch"
                                    valuePropName="checked"
                                    initialValue={true}
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="thoi_gian_gui_nho_lich"
                                    label="Thời gian gửi trước (giờ)"
                                    initialValue={2}
                                >
                                    <InputNumber min={1} max={48} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="gui_sms_khuyen_mai"
                                    label="Gửi SMS khuyến mại"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider />
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => handleSave('notification', notificationForm)}
                        >
                            Lưu cài đặt
                        </Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'loyalty',
            label: (
                <span>
                    <StarOutlined /> Điểm thưởng
                </span>
            ),
            children: (
                <Card>
                    <Form form={loyaltyForm} layout="vertical">
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    name="bat_diem_thuong"
                                    label="Bật tính năng điểm thưởng"
                                    valuePropName="checked"
                                    initialValue={true}
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="ti_le_tich_diem"
                                    label="Tỷ lệ tích điểm (VNĐ = 1 điểm)"
                                    initialValue={10000}
                                    tooltip="Ví dụ: 10,000 VNĐ = 1 điểm"
                                >
                                    <InputNumber min={1000} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="ti_le_doi_diem"
                                    label="Tỷ lệ đổi điểm (điểm = VNĐ)"
                                    initialValue={1000}
                                    tooltip="Ví dụ: 1 điểm = 1,000 VNĐ"
                                >
                                    <InputNumber min={100} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="han_su_dung_diem"
                                    label="Hạn sử dụng điểm (tháng)"
                                    initialValue={12}
                                    tooltip="0 = Không giới hạn"
                                >
                                    <InputNumber min={0} max={60} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="diem_sinh_nhat"
                                    label="Điểm tặng sinh nhật"
                                    initialValue={50}
                                >
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider />
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => handleSave('loyalty', loyaltyForm)}
                        >
                            Lưu cài đặt
                        </Button>
                    </Form>
                </Card>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title={
                    <Space>
                        <SettingOutlined />
                        <span>Cài đặt hệ thống</span>
                    </Space>
                }
                loading={loading}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                />
            </Card>
        </div>
    );
};

// Missing import
import { StarOutlined } from '@ant-design/icons';

export default Settings;
