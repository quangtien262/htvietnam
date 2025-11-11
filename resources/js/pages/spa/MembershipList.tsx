import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Tag, Modal, Form, InputNumber,
    message, Popconfirm, Row, Col, Divider, Drawer, Descriptions,
    Switch, Badge, Statistic, Progress, ColorPicker, Select
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CrownOutlined,
    EyeOutlined, UserOutlined, GiftOutlined, PercentageOutlined,
    TrophyOutlined, DollarOutlined, RiseOutlined, StarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Color } from 'antd/es/color-picker';
import axios from 'axios';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface MembershipTier {
    id: number;
    ten_hang: string;
    ma_hang: string;
    mau_sac?: string;
    chi_tieu_toi_thieu: number;
    chi_tieu_toi_da?: number;
    ty_le_giam_gia: number;
    ty_le_tich_diem: number;
    uu_dai_dac_biet?: string;
    mo_ta?: string;
    thu_tu: number;
    trang_thai: string;
    so_thanh_vien: number;
    tong_chi_tieu: number;
    created_at: string;
}

const MembershipList: React.FC = () => {
    // State
    const [tiers, setTiers] = useState<MembershipTier[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);

    // Filters
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    // Pagination
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Form
    const [form] = Form.useForm();
    const [selectedColor, setSelectedColor] = useState<string>('#1890ff');

    // Stats
    const [stats, setStats] = useState({
        totalTiers: 0,
        totalMembers: 0,
        totalSpending: 0,
        avgDiscount: 0,
    });

    // Load data
    useEffect(() => {
        loadTiers();
    }, [pagination.current, pagination.pageSize, searchText, selectedStatus]);

    const loadTiers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/spa/membership-tiers', {
                params: {
                    page: pagination.current,
                    limit: pagination.pageSize,
                    search: searchText,
                    trang_thai: selectedStatus,
                }
            });

            if (response.data.success) {
                const data = response.data.data;
                setTiers(data.data || []);
                setPagination({
                    ...pagination,
                    total: data.total || 0,
                });

                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            message.error('Không thể tải danh sách hạng thành viên');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleCreate = () => {
        form.resetFields();
        setSelectedColor('#1890ff');
        setSelectedTier(null);
        setModalVisible(true);
    };

    const handleEdit = (record: MembershipTier) => {
        setSelectedTier(record);
        form.setFieldsValue(record);
        setSelectedColor(record.mau_sac || '#1890ff');
        setModalVisible(true);
    };

    const handleView = (record: MembershipTier) => {
        setSelectedTier(record);
        setDetailDrawerVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                mau_the: selectedColor,
            };

            let response;
            if (selectedTier?.id) {
                // Update existing tier
                response = await axios.put(`/aio/api/spa/membership-tiers/${selectedTier.id}`, payload);
            } else {
                // Create new tier
                response = await axios.post('/aio/api/spa/membership-tiers', payload);
            }

            if (response.data.success) {
                message.success(selectedTier ? 'Cập nhật hạng thành viên thành công' : 'Tạo hạng thành viên mới thành công');
                setModalVisible(false);
                loadTiers();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await axios.delete(`/aio/api/spa/membership-tiers/${id}`);
            if (response.data.success) {
                message.success('Xóa hạng thành viên thành công');
                loadTiers();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa hạng thành viên');
        }
    };

    const handleStatusToggle = async (record: MembershipTier) => {
        try {
            const newStatus = record.trang_thai === 'hoat_dong' ? 'tam_dung' : 'hoat_dong';
            const response = await axios.put(`/aio/api/spa/membership-tiers/${record.id}`, {
                trang_thai: newStatus,
            });

            if (response.data.success) {
                message.success('Cập nhật trạng thái thành công');
                loadTiers();
            }
        } catch (error) {
            message.error('Không thể cập nhật trạng thái');
        }
    };

    const formatCurrency = (value: number) => {
        return `${value.toLocaleString()} VNĐ`;
    };

    const getTierIcon = (tier: MembershipTier) => {
        const spending = tier.chi_tieu_toi_thieu;
        if (spending >= 100000000) return <CrownOutlined style={{ color: '#faad14' }} />;
        if (spending >= 50000000) return <TrophyOutlined style={{ color: '#722ed1' }} />;
        if (spending >= 20000000) return <StarOutlined style={{ color: '#1890ff' }} />;
        return <UserOutlined style={{ color: '#52c41a' }} />;
    };

    // Table columns
    const columns: ColumnsType<MembershipTier> = [
        {
            title: 'Thứ tự',
            dataIndex: 'thu_tu',
            key: 'thu_tu',
            width: 80,
            align: 'center',
            sorter: (a, b) => a.thu_tu - b.thu_tu,
        },
        {
            title: 'Hạng thành viên',
            key: 'tier_info',
            width: 250,
            fixed: 'left',
            render: (_, record: MembershipTier) => (
                <Space>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            background: record.mau_sac || '#1890ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 18,
                        }}
                    >
                        {getTierIcon(record)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 500, fontSize: 15 }}>
                            {record.ten_hang}
                        </div>
                        <Tag color="blue">{record.ma_hang}</Tag>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Chi tiêu tối thiểu',
            dataIndex: 'chi_tieu_toi_thieu',
            key: 'chi_tieu_toi_thieu',
            width: 150,
            align: 'right',
            render: (value: number) => (
                <span style={{ fontWeight: 500, color: '#1890ff' }}>
                    {formatCurrency(value)}
                </span>
            ),
            sorter: (a, b) => a.chi_tieu_toi_thieu - b.chi_tieu_toi_thieu,
        },
        {
            title: 'Chi tiêu tối đa',
            dataIndex: 'chi_tieu_toi_da',
            key: 'chi_tieu_toi_da',
            width: 150,
            align: 'right',
            render: (value?: number) => value ? formatCurrency(value) : 'Không giới hạn',
        },
        {
            title: 'Giảm giá',
            dataIndex: 'ty_le_giam_gia',
            key: 'ty_le_giam_gia',
            width: 100,
            align: 'center',
            render: (value: number) => (
                <Tag color="green" icon={<PercentageOutlined />} style={{ fontSize: 13 }}>
                    {value}%
                </Tag>
            ),
            sorter: (a, b) => a.ty_le_giam_gia - b.ty_le_giam_gia,
        },
        {
            title: 'Tích điểm',
            dataIndex: 'ty_le_tich_diem',
            key: 'ty_le_tich_diem',
            width: 100,
            align: 'center',
            render: (value: number) => (
                <Tag color="orange" icon={<GiftOutlined />} style={{ fontSize: 13 }}>
                    {value}%
                </Tag>
            ),
            sorter: (a, b) => a.ty_le_tich_diem - b.ty_le_tich_diem,
        },
        {
            title: 'Số thành viên',
            dataIndex: 'so_thanh_vien',
            key: 'so_thanh_vien',
            width: 120,
            align: 'center',
            render: (value: number) => (
                <Badge count={value} showZero color="blue" overflowCount={9999} />
            ),
            sorter: (a, b) => a.so_thanh_vien - b.so_thanh_vien,
        },
        {
            title: 'Tổng chi tiêu',
            dataIndex: 'tong_chi_tieu',
            key: 'tong_chi_tieu',
            width: 180,
            align: 'right',
            render: (value: number) => (
                <span style={{ fontWeight: 500, color: '#52c41a' }}>
                    {formatCurrency(value)}
                </span>
            ),
            sorter: (a, b) => a.tong_chi_tieu - b.tong_chi_tieu,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 130,
            align: 'center',
            render: (_, record: MembershipTier) => (
                <Switch
                    checked={record.trang_thai === 'hoat_dong'}
                    onChange={() => handleStatusToggle(record)}
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Tạm dừng"
                />
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
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
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa hạng thành viên này?"
                        description="Thành viên thuộc hạng này sẽ bị ảnh hưởng!"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
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
                            title="Tổng hạng TV"
                            value={stats.totalTiers}
                            prefix={<CrownOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng thành viên"
                            value={stats.totalMembers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng chi tiêu"
                            value={stats.totalSpending}
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Giảm giá TB"
                            value={stats.avgDiscount}
                            prefix={<PercentageOutlined />}
                            suffix="%"
                            valueStyle={{ color: '#f5222d' }}
                            precision={1}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title={
                    <Space>
                        <CrownOutlined />
                        <span>Quản lý Hạng thành viên</span>
                        <Badge count={pagination.total} showZero />
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Thêm hạng thành viên
                    </Button>
                }
            >
                {/* Filters */}
                <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8}>
                            <Input.Search
                                placeholder="Tìm kiếm tên, mã hạng..."
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Select
                                placeholder="Trạng thái"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                            >
                                <Option value="hoat_dong">Hoạt động</Option>
                                <Option value="tam_dung">Tạm dừng</Option>
                            </Select>
                        </Col>
                    </Row>
                </Space>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={tiers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} hạng`,
                        onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize });
                        },
                    }}
                    scroll={{ x: 1400 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={selectedTier ? 'Chỉnh sửa hạng thành viên' : 'Thêm hạng thành viên mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                width={800}
                okText={selectedTier ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="cap_do"
                                label="Cấp độ"
                                rules={[{ required: true, message: 'Vui lòng nhập cấp độ' }]}
                                tooltip="Số thứ tự cấp bậc (1, 2, 3...)"
                            >
                                <InputNumber placeholder="VD: 1" min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                name="ten_cap_bac"
                                label="Tên cấp bậc"
                                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                            >
                                <Input placeholder="VD: Hạng Kim cương" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Màu thẻ">
                                <ColorPicker
                                    value={selectedColor}
                                    onChange={(color: Color) => setSelectedColor(color.toHexString())}
                                    showText
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="chi_tieu_yeu_cau"
                                label="Chi tiêu yêu cầu (VNĐ)"
                                rules={[{ required: true, message: 'Vui lòng nhập chi tiêu yêu cầu' }]}
                                tooltip="Tổng chi tiêu tối thiểu để đạt hạng này"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ti_le_giam_gia"
                                label="Tỷ lệ giảm giá (%)"
                                rules={[{ required: true, message: 'Vui lòng nhập tỷ lệ giảm giá' }]}
                                initialValue={0}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={100}
                                    addonAfter="%"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ti_le_tich_diem"
                                label="Tỷ lệ tích điểm (%)"
                                rules={[{ required: true, message: 'Vui lòng nhập tỷ lệ tích điểm' }]}
                                initialValue={1}
                                tooltip="% giá trị đơn hàng được quy đổi thành điểm"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={100}
                                    addonAfter="%"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="uu_dai_khac" label="Ưu đãi khác">
                                <TextArea
                                    rows={3}
                                    placeholder="VD: Miễn phí 1 dịch vụ spa hàng tháng, Tặng quà sinh nhật, Ưu tiên đặt lịch..."
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết hạng thành viên"
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={600}
            >
                {selectedTier && (
                    <div>
                        {/* Tier Badge */}
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 50,
                                    background: selectedTier.mau_sac || '#1890ff',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: 40,
                                    marginBottom: 16,
                                }}
                            >
                                {getTierIcon(selectedTier)}
                            </div>
                            <h2 style={{ marginBottom: 8 }}>{selectedTier.ten_hang}</h2>
                            <Tag color="blue" style={{ fontSize: 14 }}>{selectedTier.ma_hang}</Tag>
                            <div style={{ marginTop: 8 }}>
                                <Tag color={selectedTier.trang_thai === 'hoat_dong' ? 'green' : 'red'}>
                                    {selectedTier.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Tạm dừng'}
                                </Tag>
                            </div>
                        </div>

                        {/* Member Stats */}
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Số thành viên"
                                        value={selectedTier.so_thanh_vien}
                                        prefix={<UserOutlined />}
                                        valueStyle={{ fontSize: 24 }}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Tổng chi tiêu"
                                        value={selectedTier.tong_chi_tieu}
                                        prefix={<RiseOutlined />}
                                        suffix="VNĐ"
                                        valueStyle={{ fontSize: 20 }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Divider>Thông tin hạng</Divider>

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Mã hạng">{selectedTier.ma_hang}</Descriptions.Item>
                            <Descriptions.Item label="Tên hạng">{selectedTier.ten_hang}</Descriptions.Item>
                            <Descriptions.Item label="Thứ tự">{selectedTier.thu_tu}</Descriptions.Item>
                            <Descriptions.Item label="Màu sắc">
                                <Space>
                                    <div
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 4,
                                            background: selectedTier.mau_sac || '#1890ff',
                                            border: '1px solid #d9d9d9',
                                        }}
                                    />
                                    <span>{selectedTier.mau_sac || '#1890ff'}</span>
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider>Điều kiện & Quyền lợi</Divider>

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Chi tiêu tối thiểu">
                                <strong style={{ color: '#1890ff', fontSize: 15 }}>
                                    {formatCurrency(selectedTier.chi_tieu_toi_thieu)}
                                </strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Chi tiêu tối đa">
                                {selectedTier.chi_tieu_toi_da ? formatCurrency(selectedTier.chi_tieu_toi_da) : 'Không giới hạn'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giảm giá">
                                <Tag color="green" icon={<PercentageOutlined />} style={{ fontSize: 14 }}>
                                    {selectedTier.ty_le_giam_gia}%
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tỷ lệ tích điểm">
                                <Tag color="orange" icon={<GiftOutlined />} style={{ fontSize: 14 }}>
                                    {selectedTier.ty_le_tich_diem}%
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedTier.uu_dai_dac_biet && (
                            <div style={{ marginTop: 16 }}>
                                <Divider>Ưu đãi đặc biệt</Divider>
                                <p style={{ whiteSpace: 'pre-line', background: '#f0f5ff', padding: 12, borderRadius: 4 }}>
                                    {selectedTier.uu_dai_dac_biet}
                                </p>
                            </div>
                        )}

                        {selectedTier.mo_ta && (
                            <div style={{ marginTop: 16 }}>
                                <Divider>Mô tả</Divider>
                                <p>{selectedTier.mo_ta}</p>
                            </div>
                        )}

                        <Divider />

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Ngày tạo">
                                {dayjs(selectedTier.created_at).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default MembershipList;
