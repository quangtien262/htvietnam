import React, { useState, useEffect } from 'react';
import {
    Card,
    Tabs,
    Form,
    Input,
    Button,
    Space,
    message,
    Select,
    Upload,
    Row,
    Col,
    TimePicker,
    InputNumber,
    Switch,
    Divider,
    Typography,
} from 'antd';
import {
    SettingOutlined,
    SaveOutlined,
    UploadOutlined,
    CalendarOutlined,
    DollarOutlined,
    BellOutlined,
    GiftOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';
import dayjs from 'dayjs';
import API from '@/common/api';

const { Title } = Typography;
const { TextArea } = Input;

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);

    // State cho từng tab
    const [generalSettings, setGeneralSettings] = useState<any>({
        ten_cong_ty: '',
        dia_chi: '',
        so_dien_thoai: '',
        email: '',
        website: '',
        logo: '',
        timezone: 'Asia/Ho_Chi_Minh',
        language: 'vi'
    });

    const [businessSettings, setBusinessSettings] = useState<any>({
        gio_mo_cua: null,
        gio_dong_cua: null,
        thoi_gian_slot: 30,
        thoi_gian_nghi_giua_slot: 5,
        cho_phep_booking_online: true,
        yeu_cau_xac_nhan_booking: true,
        thoi_gian_huy_booking: 24,
        phi_huy_booking: 0
    });

    const [paymentSettings, setPaymentSettings] = useState<any>({
        phuong_thuc_thanh_toan: [],
        cho_phep_thanh_toan_sau: false,
        han_thanh_toan: 7,
        phi_tre_han: 0,
        tu_dong_gui_nhac_no: true
    });

    const [notificationSettings, setNotificationSettings] = useState<any>({
        gui_email_xac_nhan: true,
        gui_sms_xac_nhan: false,
        gui_email_nhac_lich: true,
        gui_sms_nhac_lich: false,
        thoi_gian_nhac_truoc: 24
    });

    const [loyaltySettings, setLoyaltySettings] = useState<any>({
        kich_hoat_tich_diem: true,
        ti_le_tich_diem: 1,
        ti_le_doi_diem: 1000,
        han_su_dung_diem: 365,
        diem_toi_thieu_su_dung: 100
    });

    const loadSettings = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API.spaSettingGet);
            if (response.data.success) {
                const data = response.data.data;

                if (data.general) {
                    setGeneralSettings({ ...generalSettings, ...data.general });
                }
                if (data.business) {
                    setBusinessSettings({
                        ...businessSettings,
                        ...data.business,
                        gio_mo_cua: data.business.gio_mo_cua ? dayjs(data.business.gio_mo_cua, 'HH:mm') : null,
                        gio_dong_cua: data.business.gio_dong_cua ? dayjs(data.business.gio_dong_cua, 'HH:mm') : null,
                    });
                }
                if (data.payment) {
                    setPaymentSettings({ ...paymentSettings, ...data.payment });
                }
                if (data.notification) {
                    setNotificationSettings({ ...notificationSettings, ...data.notification });
                }
                if (data.loyalty) {
                    setLoyaltySettings({ ...loyaltySettings, ...data.loyalty });
                }
            }
        } catch (error) {
            message.error('Không thể tải cấu hình');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleSaveGeneral = async () => {
        try {
            const response = await axios.post(API.spaSettingUpdate, {
                category: 'general',
                settings: generalSettings
            });
            if (response.data.success) {
                message.success('Lưu cài đặt chung thành công');
            }
        } catch (error) {
            message.error('Lưu cài đặt thất bại');
        }
    };

    const handleSaveBusiness = async () => {
        try {
            const values = {
                ...businessSettings,
                gio_mo_cua: businessSettings.gio_mo_cua?.format('HH:mm'),
                gio_dong_cua: businessSettings.gio_dong_cua?.format('HH:mm'),
            };
            const response = await axios.post(API.spaSettingUpdate, {
                category: 'business',
                settings: values
            });
            if (response.data.success) {
                message.success('Lưu quy tắc kinh doanh thành công');
            }
        } catch (error) {
            message.error('Lưu cài đặt thất bại');
        }
    };

    const handleSavePayment = async () => {
        try {
            const response = await axios.post(API.spaSettingUpdate, {
                category: 'payment',
                settings: paymentSettings
            });
            if (response.data.success) {
                message.success('Lưu cài đặt thanh toán thành công');
            }
        } catch (error) {
            message.error('Lưu cài đặt thất bại');
        }
    };

    const handleSaveNotification = async () => {
        try {
            const response = await axios.post(API.spaSettingUpdate, {
                category: 'notification',
                settings: notificationSettings
            });
            if (response.data.success) {
                message.success('Lưu cài đặt thông báo thành công');
            }
        } catch (error) {
            message.error('Lưu cài đặt thất bại');
        }
    };

    const handleSaveLoyalty = async () => {
        try {
            const response = await axios.post(API.spaSettingUpdate, {
                category: 'loyalty',
                settings: loyaltySettings
            });
            if (response.data.success) {
                message.success('Lưu chương trình khách hàng thân thiết thành công');
            }
        } catch (error) {
            message.error('Lưu cài đặt thất bại');
        }
    };

    const handleUploadLogo = async (file: any) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(API.spaUploadImage, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setGeneralSettings({ ...generalSettings, logo: response.data.path });
                message.success('Upload logo thành công');
            }
        } catch (error) {
            message.error('Upload thất bại');
        }

        return false;
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
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Tên công ty *</label>
                                <Input
                                    value={generalSettings.ten_cong_ty}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, ten_cong_ty: e.target.value })}
                                    placeholder="Nhập tên công ty"
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Số điện thoại *</label>
                                <Input
                                    value={generalSettings.so_dien_thoai}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, so_dien_thoai: e.target.value })}
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Email *</label>
                                <Input
                                    value={generalSettings.email}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                                    placeholder="Nhập email"
                                    type="email"
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Website</label>
                                <Input
                                    value={generalSettings.website}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, website: e.target.value })}
                                    placeholder="Nhập website"
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Địa chỉ *</label>
                                <TextArea
                                    value={generalSettings.dia_chi}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, dia_chi: e.target.value })}
                                    placeholder="Nhập địa chỉ"
                                    rows={3}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Timezone</label>
                                <Select
                                    value={generalSettings.timezone}
                                    onChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh</Select.Option>
                                    <Select.Option value="Asia/Bangkok">Asia/Bangkok</Select.Option>
                                    <Select.Option value="Asia/Singapore">Asia/Singapore</Select.Option>
                                </Select>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Ngôn ngữ</label>
                                <Select
                                    value={generalSettings.language}
                                    onChange={(value) => setGeneralSettings({ ...generalSettings, language: value })}
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option value="vi">Tiếng Việt</Select.Option>
                                    <Select.Option value="en">English</Select.Option>
                                </Select>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Logo</label>
                                <div>
                                    <Upload
                                        beforeUpload={handleUploadLogo}
                                        showUploadList={false}
                                    >
                                        <Button icon={<UploadOutlined />}>Tải lên logo</Button>
                                    </Upload>
                                    {generalSettings.logo && (
                                        <img src={generalSettings.logo} alt="Logo" style={{ marginTop: 10, maxWidth: 200 }} />
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveGeneral}>
                        Lưu cài đặt
                    </Button>
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
                    <Title level={5}>Giờ hoạt động</Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Giờ mở cửa *</label>
                                <TimePicker
                                    value={businessSettings.gio_mo_cua}
                                    onChange={(value) => setBusinessSettings({ ...businessSettings, gio_mo_cua: value })}
                                    format="HH:mm"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Giờ đóng cửa *</label>
                                <TimePicker
                                    value={businessSettings.gio_dong_cua}
                                    onChange={(value) => setBusinessSettings({ ...businessSettings, gio_dong_cua: value })}
                                    format="HH:mm"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Col>
                    </Row>

                    <Divider />
                    <Title level={5}>Cài đặt booking</Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Thời gian slot (phút)</label>
                                <InputNumber
                                    value={businessSettings.thoi_gian_slot}
                                    onChange={(value) => setBusinessSettings({ ...businessSettings, thoi_gian_slot: value })}
                                    min={15}
                                    max={120}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Thời gian nghỉ giữa slot (phút)</label>
                                <InputNumber
                                    value={businessSettings.thoi_gian_nghi_giua_slot}
                                    onChange={(value) => setBusinessSettings({ ...businessSettings, thoi_gian_nghi_giua_slot: value })}
                                    min={0}
                                    max={60}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Cho phép booking online</label>
                                <div>
                                    <Switch
                                        checked={businessSettings.cho_phep_booking_online}
                                        onChange={(checked) => setBusinessSettings({ ...businessSettings, cho_phep_booking_online: checked })}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Yêu cầu xác nhận booking</label>
                                <div>
                                    <Switch
                                        checked={businessSettings.yeu_cau_xac_nhan_booking}
                                        onChange={(checked) => setBusinessSettings({ ...businessSettings, yeu_cau_xac_nhan_booking: checked })}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Thời gian hủy booking (giờ)</label>
                                <InputNumber
                                    value={businessSettings.thoi_gian_huy_booking}
                                    onChange={(value) => setBusinessSettings({ ...businessSettings, thoi_gian_huy_booking: value })}
                                    min={0}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Phí hủy booking (VNĐ)</label>
                                <InputNumber
                                    value={businessSettings.phi_huy_booking}
                                    onChange={(value) => setBusinessSettings({ ...businessSettings, phi_huy_booking: value })}
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveBusiness}>
                        Lưu cài đặt
                    </Button>
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
                    <Row gutter={16}>
                        <Col span={24}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Phương thức thanh toán</label>
                                <Select
                                    mode="multiple"
                                    value={paymentSettings.phuong_thuc_thanh_toan}
                                    onChange={(value) => setPaymentSettings({ ...paymentSettings, phuong_thuc_thanh_toan: value })}
                                    placeholder="Chọn phương thức thanh toán"
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option value="tien_mat">Tiền mặt</Select.Option>
                                    <Select.Option value="chuyen_khoan">Chuyển khoản</Select.Option>
                                    <Select.Option value="the">Thẻ</Select.Option>
                                    <Select.Option value="vi_dien_tu">Ví điện tử</Select.Option>
                                </Select>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Cho phép thanh toán sau</label>
                                <div>
                                    <Switch
                                        checked={paymentSettings.cho_phep_thanh_toan_sau}
                                        onChange={(checked) => setPaymentSettings({ ...paymentSettings, cho_phep_thanh_toan_sau: checked })}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Hạn thanh toán (ngày)</label>
                                <InputNumber
                                    value={paymentSettings.han_thanh_toan}
                                    onChange={(value) => setPaymentSettings({ ...paymentSettings, han_thanh_toan: value })}
                                    min={1}
                                    disabled={!paymentSettings.cho_phep_thanh_toan_sau}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Phí trễ hạn (%)</label>
                                <InputNumber
                                    value={paymentSettings.phi_tre_han}
                                    onChange={(value) => setPaymentSettings({ ...paymentSettings, phi_tre_han: value })}
                                    min={0}
                                    max={100}
                                    disabled={!paymentSettings.cho_phep_thanh_toan_sau}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Tự động gửi nhắc nợ</label>
                                <div>
                                    <Switch
                                        checked={paymentSettings.tu_dong_gui_nhac_no}
                                        onChange={(checked) => setPaymentSettings({ ...paymentSettings, tu_dong_gui_nhac_no: checked })}
                                        disabled={!paymentSettings.cho_phep_thanh_toan_sau}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSavePayment}>
                        Lưu cài đặt
                    </Button>
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
                    <Title level={5}>Email</Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Gửi email xác nhận booking</label>
                                <div>
                                    <Switch
                                        checked={notificationSettings.gui_email_xac_nhan}
                                        onChange={(checked) => setNotificationSettings({ ...notificationSettings, gui_email_xac_nhan: checked })}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Gửi email nhắc lịch</label>
                                <div>
                                    <Switch
                                        checked={notificationSettings.gui_email_nhac_lich}
                                        onChange={(checked) => setNotificationSettings({ ...notificationSettings, gui_email_nhac_lich: checked })}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Divider />
                    <Title level={5}>SMS</Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Gửi SMS xác nhận booking</label>
                                <div>
                                    <Switch
                                        checked={notificationSettings.gui_sms_xac_nhan}
                                        onChange={(checked) => setNotificationSettings({ ...notificationSettings, gui_sms_xac_nhan: checked })}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Gửi SMS nhắc lịch</label>
                                <div>
                                    <Switch
                                        checked={notificationSettings.gui_sms_nhac_lich}
                                        onChange={(checked) => setNotificationSettings({ ...notificationSettings, gui_sms_nhac_lich: checked })}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Divider />
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Thời gian nhắc trước (giờ)</label>
                                <InputNumber
                                    value={notificationSettings.thoi_gian_nhac_truoc}
                                    onChange={(value) => setNotificationSettings({ ...notificationSettings, thoi_gian_nhac_truoc: value })}
                                    min={1}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveNotification}>
                        Lưu cài đặt
                    </Button>
                </Card>
            ),
        },
        {
            key: 'loyalty',
            label: (
                <span>
                    <GiftOutlined /> Khách hàng thân thiết
                </span>
            ),
            children: (
                <Card>
                    <Row gutter={16}>
                        <Col span={24}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Kích hoạt chương trình tích điểm</label>
                                <div>
                                    <Switch
                                        checked={loyaltySettings.kich_hoat_tich_diem}
                                        onChange={(checked) => setLoyaltySettings({ ...loyaltySettings, kich_hoat_tich_diem: checked })}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Tỷ lệ tích điểm (%)</label>
                                <InputNumber
                                    value={loyaltySettings.ti_le_tich_diem}
                                    onChange={(value) => setLoyaltySettings({ ...loyaltySettings, ti_le_tich_diem: value })}
                                    min={0}
                                    max={100}
                                    disabled={!loyaltySettings.kich_hoat_tich_diem}
                                    style={{ width: '100%' }}
                                    addonAfter="%"
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Tỷ lệ đổi điểm (điểm/VNĐ)</label>
                                <InputNumber
                                    value={loyaltySettings.ti_le_doi_diem}
                                    onChange={(value) => setLoyaltySettings({ ...loyaltySettings, ti_le_doi_diem: value })}
                                    min={1}
                                    disabled={!loyaltySettings.kich_hoat_tich_diem}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Hạn sử dụng điểm (ngày)</label>
                                <InputNumber
                                    value={loyaltySettings.han_su_dung_diem}
                                    onChange={(value) => setLoyaltySettings({ ...loyaltySettings, han_su_dung_diem: value })}
                                    min={1}
                                    disabled={!loyaltySettings.kich_hoat_tich_diem}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Điểm tối thiểu để sử dụng</label>
                                <InputNumber
                                    value={loyaltySettings.diem_toi_thieu_su_dung}
                                    onChange={(value) => setLoyaltySettings({ ...loyaltySettings, diem_toi_thieu_su_dung: value })}
                                    min={1}
                                    disabled={!loyaltySettings.kich_hoat_tich_diem}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveLoyalty}>
                        Lưu cài đặt
                    </Button>
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

export default Settings;
