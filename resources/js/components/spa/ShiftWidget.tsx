import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, InputNumber, Input, Statistic, Space, Tag, message, Descriptions, Alert, Select, Row, Col } from 'antd';
import { ClockCircleOutlined, DollarOutlined, FileTextOutlined, CheckCircleOutlined, WarningOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API } from '../../common/api';
import dayjs from 'dayjs';
import { filterSelectOption } from '../../utils/stringUtils';

const { TextArea } = Input;

interface Shift {
    id: number;
    ma_ca: string;
    nhan_vien_mo_ca_id: number;
    thoi_gian_bat_dau: string;
    tien_mat_dau_ca: number;
    ghi_chu_mo_ca?: string;
    trang_thai: string;
    nhan_vien_mo_ca?: {
        name: string;
    };
    chi_nhanh?: {
        ten_chi_nhanh: string;
    };
    doanh_thu_realtime?: {
        so_hoa_don: number;
        doanh_thu_tien_mat: number;
        doanh_thu_chuyen_khoan: number;
        doanh_thu_the: number;
        doanh_thu_vi: number;
        tong_doanh_thu: number;
    };
}

interface ShiftWidgetProps {
    onShiftChange?: () => void;
    chiNhanhId?: number;
    staff?: any[];
    branches?: any[];
}

const ShiftWidget: React.FC<ShiftWidgetProps> = ({ onShiftChange, chiNhanhId, staff = [], branches = [] }) => {
    const [currentShift, setCurrentShift] = useState<Shift | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLoadingShift, setIsLoadingShift] = useState(true);
    const [openModalVisible, setOpenModalVisible] = useState(false);
    const [closeModalVisible, setCloseModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [hasTriedToOpen, setHasTriedToOpen] = useState(false); // Track if user has attempted to open shift
    const [openForm] = Form.useForm();
    const [closeForm] = Form.useForm();

    console.log('ShiftWidget rendered');
    console.log('- chiNhanhId:', chiNhanhId);
    console.log('- currentShift:', currentShift);
    console.log('- staff:', staff);
    console.log('- branches:', branches);

    useEffect(() => {
        console.log('=== ShiftWidget useEffect: Loading shift, chiNhanhId:', chiNhanhId);
        loadCurrentShift();
        // Refresh every 30 seconds
        const interval = setInterval(loadCurrentShift, 30000);
        return () => clearInterval(interval);
    }, [chiNhanhId]);

    // Auto-show modal if no shift (only on first load, not after failed attempts)
    useEffect(() => {
        if (!isLoadingShift && !currentShift && !hasTriedToOpen) {
            setOpenModalVisible(true);
        }
    }, [isLoadingShift, currentShift, hasTriedToOpen]);

    const loadCurrentShift = async () => {
        try {
            setIsLoadingShift(true);
            const params = chiNhanhId ? { chi_nhanh_id: chiNhanhId } : {};
            console.log('Loading shift with params:', params);
            const response = await axios.get(API.spaShiftCurrent, { params });
            console.log('Shift response:', response.data);
            if (response.data.success && response.data.data) {
                setCurrentShift(response.data.data);
            } else {
                setCurrentShift(null);
            }
        } catch (error) {
            console.error('Error loading shift:', error);
            setCurrentShift(null);
        } finally {
            setIsLoadingShift(false);
        }
    };

    const handleOpenShift = async () => {
        try {
            const values = await openForm.validateFields();
            setLoading(true);
            setHasTriedToOpen(true); // Mark that user has tried to open

            // Send data from form (includes chi_nhanh_id, nguoi_thu_id)
            const response = await axios.post(API.spaShiftOpen, values);

            if (response.data.success) {
                message.success('Mở ca thành công');
                openForm.resetFields();

                // Reload shift and wait for it to complete
                await loadCurrentShift();

                // Close modal after shift is loaded
                setOpenModalVisible(false);
                setHasTriedToOpen(false); // Reset for next time
                onShiftChange?.();
            }
        } catch (error: any) {
            console.error('Error opening shift:', error);
            message.error(error.response?.data?.message || 'Không thể mở ca');
            // Don't reset hasTriedToOpen on error, let user try again
        } finally {
            setLoading(false);
        }
    };    const handleCloseShift = async () => {
        if (!currentShift) return;

        try {
            const values = await closeForm.validateFields();

            const tienMatLyThuyet = currentShift.tien_mat_dau_ca + (currentShift.doanh_thu_realtime?.doanh_thu_tien_mat || 0);
            const chenhLech = values.tien_mat_cuoi_ca_thuc_te - tienMatLyThuyet;

            // Nếu có chênh lệch thì yêu cầu giải trình
            if (Math.abs(chenhLech) > 0 && !values.giai_trinh_chenh_lech) {
                message.error('Vui lòng giải trình chênh lệch tiền mặt');
                return;
            }

            setLoading(true);
            const response = await axios.post(API.spaShiftClose(currentShift.id), {
                ...values,
                has_difference: Math.abs(chenhLech) > 0
            });

            if (response.data.success) {
                message.success('Đóng ca thành công');
                setCloseModalVisible(false);
                closeForm.resetFields();
                loadCurrentShift();
                onShiftChange?.();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể đóng ca');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(Math.round(value));
    };

    const calculateTienMatLyThuyet = () => {
        if (!currentShift) return 0;
        return currentShift.tien_mat_dau_ca + (currentShift.doanh_thu_realtime?.doanh_thu_tien_mat || 0);
    };

    const calculateChenhLech = () => {
        const thucTe = closeForm.getFieldValue('tien_mat_cuoi_ca_thuc_te') || 0;
        const lyThuyet = calculateTienMatLyThuyet();
        return thucTe - lyThuyet;
    };

    // Show loading state
    if (isLoadingShift) {
        return (
            <Card size="small" style={{ marginBottom: 16 }}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    Đang tải thông tin ca...
                </div>
            </Card>
        );
    }

    if (!currentShift) {
        return (
            <>
                <Card size="small" style={{ marginBottom: 16 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ textAlign: 'center' }}>
                            <WarningOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
                            <div>Chưa mở ca</div>
                        </div>
                        <Button
                            type="primary"
                            block
                            onClick={() => setOpenModalVisible(true)}
                            icon={<ClockCircleOutlined />}
                        >
                            Mở ca mới
                        </Button>
                    </Space>
                </Card>

                <Modal
                    title="Mở ca mới"
                    open={openModalVisible}
                    onCancel={() => {
                        // Allow closing modal but set flag to prevent auto-reopen
                        setOpenModalVisible(false);
                        setHasTriedToOpen(true);
                    }}
                    onOk={handleOpenShift}
                    okText="Xác nhận mở ca"
                    cancelText="Hủy"
                    closable={true}
                    maskClosable={false}
                    confirmLoading={loading}
                >
                    <Form form={openForm} layout="vertical">
                        <Form.Item
                            name="chi_nhanh_id"
                            label="Chi nhánh"
                            rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
                        >
                            <Select
                                placeholder="Chọn chi nhánh"
                                showSearch
                                filterOption={filterSelectOption}
                                notFoundContent={branches.length === 0 ? "Đang tải..." : "Không có dữ liệu"}
                            >
                                {branches.map(branch => (
                                    <Select.Option key={branch.id} value={branch.id}>
                                        {branch.ten_chi_nhanh}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="nguoi_thu_id"
                            label="Người thu"
                            rules={[{ required: true, message: 'Vui lòng chọn người thu' }]}
                        >
                            <Select
                                placeholder="Chọn người thu"
                                showSearch
                                filterOption={filterSelectOption}
                                notFoundContent={staff.length === 0 ? "Đang tải..." : "Không có dữ liệu"}
                            >
                                {staff.map(user => (
                                    <Select.Option key={user.value} value={user.value}>
                                        {user.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="tien_mat_dau_ca"
                            label="Tiền mặt đầu ca (VNĐ)"
                            rules={[{ required: true, message: 'Vui lòng nhập tiền mặt đầu ca' }]}
                            tooltip="Tiền lẻ để thối cho khách"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                                placeholder="Ví dụ: 2,000,000"
                            />
                        </Form.Item>
                        <Form.Item
                            name="ghi_chu_mo_ca"
                            label="Ghi chú"
                        >
                            <TextArea rows={2} placeholder="Ví dụ: Ca sáng 8h-14h" />
                        </Form.Item>
                    </Form>
                </Modal>
            </>
        );
    }

    return (
        <>
            <Card
                size="small"
                style={{
                    marginBottom: 16,
                    background: 'linear-gradient(135deg, #8b9dc3 0%, #9e8fb2 100%)',
                    border: 'none',
                    boxShadow: '0 2px 8px 0 rgba(139, 157, 195, 0.15)'
                }}
                bodyStyle={{ padding: '16px' }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                    paddingBottom: 12,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <Space>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <ClockCircleOutlined style={{ color: '#fff', fontSize: 16, marginRight: 6 }} />
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
                                {currentShift.ma_ca}
                            </span>
                        </div>
                        <Tag
                            color="success"
                            style={{
                                borderRadius: 12,
                                padding: '2px 10px',
                                border: 'none',
                                background: 'rgba(135, 208, 104, 0.85)',
                                color: '#fff',
                                fontWeight: 500
                            }}
                        >
                            Đang mở
                        </Tag>
                    </Space>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 12 }}>
                        {dayjs(currentShift.thoi_gian_bat_dau).format('HH:mm')}
                    </div>
                </div>

                {/* Info Section */}
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    {/* Cashier Info */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: 8,
                        padding: '10px 12px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 11, marginBottom: 4 }}>
                            THU NGÂN
                        </div>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
                            <UserOutlined style={{ marginRight: 6 }} />
                            {currentShift.nhan_vien_mo_ca?.name || 'N/A'}
                        </div>
                    </div>

                    {/* Revenue Section */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 12,
                        padding: '16px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                        <Row gutter={16}>
                            <Col span={14}>
                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>
                                        DOANH THU CA
                                    </div>
                                    <div style={{
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: '#73d13d',
                                        lineHeight: 1.2
                                    }}>
                                        {formatCurrency(currentShift.doanh_thu_realtime?.tong_doanh_thu || 0)}
                                        <span style={{ fontSize: 14, marginLeft: 4 }}>₫</span>
                                    </div>
                                </div>
                            </Col>
                            <Col span={10} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderLeft: '1px solid #f0f0f0'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>
                                        SỐ ĐơN
                                    </div>
                                    <div style={{
                                        fontSize: 28,
                                        fontWeight: 700,
                                        color: '#40a9ff',
                                        lineHeight: 1
                                    }}>
                                        {currentShift.doanh_thu_realtime?.so_hoa_don || 0}
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* Revenue Breakdown */}
                        <div style={{
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: '1px solid #f0f0f0'
                        }}>
                            <Row gutter={[8, 8]}>
                                <Col span={6}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: '#8c8c8c' }}>Tiền mặt</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#595959' }}>
                                            {formatCurrency(currentShift.doanh_thu_realtime?.doanh_thu_tien_mat || 0)}
                                        </div>
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: '#8c8c8c' }}>C.Khoản</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#595959' }}>
                                            {formatCurrency(currentShift.doanh_thu_realtime?.doanh_thu_chuyen_khoan || 0)}
                                        </div>
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: '#8c8c8c' }}>Thẻ</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#595959' }}>
                                            {formatCurrency(currentShift.doanh_thu_realtime?.doanh_thu_the || 0)}
                                        </div>
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: '#8c8c8c' }}>Ví</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#595959' }}>
                                            {formatCurrency(currentShift.doanh_thu_realtime?.doanh_thu_vi || 0)}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <Row gutter={8}>
                        <Col span={12}>
                            <Button
                                block
                                icon={<FileTextOutlined />}
                                onClick={() => setDetailModalVisible(true)}
                                style={{
                                    borderRadius: 8,
                                    height: 36,
                                    background: 'rgba(255, 255, 255, 0.25)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: '#fff',
                                    fontWeight: 500,
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                Chi tiết
                            </Button>
                        </Col>
                        <Col span={12}>
                            <Button
                                block
                                danger
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => setCloseModalVisible(true)}
                                style={{
                                    borderRadius: 8,
                                    height: 36,
                                    fontWeight: 500,
                                    boxShadow: '0 2px 8px rgba(255, 77, 79, 0.3)'
                                }}
                            >
                                Đóng ca
                            </Button>
                        </Col>
                    </Row>
                </Space>
            </Card>

            {/* Chi tiết ca */}
            <Modal
                title={`Chi tiết ${currentShift.ma_ca}`}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={600}
            >
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Thu ngân">
                        {currentShift.nhan_vien_mo_ca?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mở ca">
                        {dayjs(currentShift.thoi_gian_bat_dau).format('HH:mm - DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tiền đầu ca">
                        {formatCurrency(currentShift.tien_mat_dau_ca)} đ
                    </Descriptions.Item>
                    <Descriptions.Item label="Tiền mặt">
                        {formatCurrency(currentShift.doanh_thu_realtime?.doanh_thu_tien_mat || 0)} đ
                    </Descriptions.Item>
                    <Descriptions.Item label="Chuyển khoản">
                        {formatCurrency(currentShift.doanh_thu_realtime?.doanh_thu_chuyen_khoan || 0)} đ
                    </Descriptions.Item>
                    <Descriptions.Item label="Thẻ">
                        {formatCurrency(currentShift.doanh_thu_realtime?.doanh_thu_the || 0)} đ
                    </Descriptions.Item>
                    <Descriptions.Item label="Ví">
                        {formatCurrency(currentShift.doanh_thu_realtime?.doanh_thu_vi || 0)} đ
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng doanh thu">
                        <strong style={{ color: '#3f8600', fontSize: 16 }}>
                            {formatCurrency(currentShift.doanh_thu_realtime?.tong_doanh_thu || 0)} đ
                        </strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số hóa đơn">
                        {currentShift.doanh_thu_realtime?.so_hoa_don || 0}
                    </Descriptions.Item>
                </Descriptions>
                {currentShift.ghi_chu_mo_ca && (
                    <div style={{ marginTop: 16 }}>
                        <small>Ghi chú mở ca:</small>
                        <div style={{ background: '#f0f0f0', padding: 8, borderRadius: 4, marginTop: 4 }}>
                            {currentShift.ghi_chu_mo_ca}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Đóng ca */}
            <Modal
                title="Đóng ca làm việc"
                open={closeModalVisible}
                onCancel={() => setCloseModalVisible(false)}
                onOk={handleCloseShift}
                okText="Xác nhận đóng ca"
                cancelText="Hủy"
                confirmLoading={loading}
                width={700}
            >
                <Alert
                    message="Lưu ý"
                    description="Vui lòng kiểm tra kỹ số tiền mặt thực tế trước khi đóng ca"
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
                    <Descriptions.Item label="Mã ca" span={2}>{currentShift.ma_ca}</Descriptions.Item>
                    <Descriptions.Item label="Tiền mặt đầu ca">
                        {formatCurrency(currentShift.tien_mat_dau_ca)} đ
                    </Descriptions.Item>
                    <Descriptions.Item label="Thu trong ca">
                        +{formatCurrency(currentShift.doanh_thu_realtime?.doanh_thu_tien_mat || 0)} đ
                    </Descriptions.Item>
                    <Descriptions.Item label="Lý thuyết cuối ca" span={2}>
                        <strong style={{ color: '#1890ff', fontSize: 16 }}>
                            {formatCurrency(calculateTienMatLyThuyet())} đ
                        </strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Chuyển khoản">
                        {formatCurrency(currentShift.doanh_thu_realtime?.doanh_thu_chuyen_khoan || 0)} đ
                    </Descriptions.Item>
                    <Descriptions.Item label="Thẻ">
                        {formatCurrency(currentShift.doanh_thu_realtime?.doanh_thu_the || 0)} đ
                    </Descriptions.Item>
                    <Descriptions.Item label="Ví" span={2}>
                        {formatCurrency(currentShift.doanh_thu_realtime?.doanh_thu_vi || 0)} đ
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng doanh thu" span={2}>
                        <strong style={{ color: '#52c41a', fontSize: 16 }}>
                            {formatCurrency(currentShift.doanh_thu_realtime?.tong_doanh_thu || 0)} đ
                        </strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số đơn" span={2}>
                        {currentShift.doanh_thu_realtime?.so_hoa_don || 0} hóa đơn
                    </Descriptions.Item>
                </Descriptions>

                <Form form={closeForm} layout="vertical">
                    <Form.Item
                        name="tien_mat_cuoi_ca_thuc_te"
                        label={<span style={{ fontSize: 15, fontWeight: 500 }}>Tiền mặt thực tế (đếm lại)</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập tiền mặt thực tế' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            size="large"
                            min={0}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                            placeholder="Nhập số tiền mặt đã đếm"
                            onChange={() => closeForm.validateFields()}
                        />
                    </Form.Item>

                    {closeForm.getFieldValue('tien_mat_cuoi_ca_thuc_te') && (
                        <Alert
                            message={
                                <Space>
                                    <span>Chênh lệch:</span>
                                    <strong style={{
                                        color: calculateChenhLech() === 0 ? '#52c41a' : (calculateChenhLech() > 0 ? '#1890ff' : '#ff4d4f'),
                                        fontSize: 16
                                    }}>
                                        {calculateChenhLech() > 0 ? '+' : ''}{formatCurrency(calculateChenhLech())} đ
                                    </strong>
                                    {calculateChenhLech() > 0 && <span>(Thừa)</span>}
                                    {calculateChenhLech() < 0 && <span>(Thiếu)</span>}
                                    {calculateChenhLech() === 0 && <CheckCircleOutlined />}
                                </Space>
                            }
                            type={calculateChenhLech() === 0 ? 'success' : 'warning'}
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    {Math.abs(calculateChenhLech()) > 0 && (
                        <Form.Item
                            name="giai_trinh_chenh_lech"
                            label="Giải trình chênh lệch (Bắt buộc)"
                            rules={[{ required: true, message: 'Vui lòng giải trình chênh lệch' }]}
                        >
                            <TextArea
                                rows={3}
                                placeholder="Ví dụ: Khách lẻ 20k, Làm tròn số, Mất tiền lẻ..."
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="ghi_chu_dong_ca"
                        label="Ghi chú đóng ca"
                    >
                        <TextArea rows={2} placeholder="Ghi chú nếu có..." />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default ShiftWidget;
