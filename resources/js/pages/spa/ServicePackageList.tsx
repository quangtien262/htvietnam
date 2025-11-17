import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Select, Tag, Modal, Form, InputNumber,
    message, Popconfirm, Row, Col, Drawer, Descriptions, Statistic
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined,
    GiftOutlined, CalendarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';
import { API } from '../../common/api';

const { TextArea } = Input;
const { Option } = Select;

interface ServicePackage {
    id: number;
    ma_goi: string;
    ten_goi?: string;
    nhom_hang_id?: number;
    gia_ban: number;
    so_luong: number;
    lich_trinh_su_dung_id?: number;
    lich_trinh_ten?: string;
    lich_trinh_color?: string;
    mo_ta?: string;
    hinh_anh?: string;
    is_active: boolean;
    dich_vu?: DichVuTrongGoi[];
    dich_vu_trong_goi?: DichVuTrongGoi[];
    created_at: string;
}

interface DichVuTrongGoi {
    id?: number;
    dich_vu_id: number;
    ma_dich_vu?: string;
    ten_dich_vu?: string;
    gia_ban_le: number;
    gia_goc?: number;
    so_luong?: number;
    ghi_chu?: string;
}

interface Service {
    id: number;
    ma_dich_vu: string;
    ten_dich_vu: string;
    gia_ban: number;
    gia: number;
}

interface Schedule {
    id: number;
    name: string;
    color: string;
    sort_order: number;
}

const ServicePackageList: React.FC = () => {
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
    const [searchText, setSearchText] = useState('');
    const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [scheduleForm] = Form.useForm();

    useEffect(() => {
        loadPackages();
        loadServices();
        loadSchedules();
    }, []);

    const loadPackages = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API.spaServicePackageList, {
                params: { search: searchText }
            });
            if (response.data && response.data.status_code === 200) {
                const packagesData = response.data.data?.data || response.data.data || [];
                setPackages(packagesData);
            }
        } catch (error) {
            console.error('Load packages error:', error);
            message.error('Không thể tải danh sách gói dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    const loadServices = async () => {
        try {
            const response = await axios.get(API.spaServiceList, {
                params: { per_page: 1000 }
            });
            if (response.data && response.data.status_code === 200) {
                const servicesData = response.data.data?.data || response.data.data || [];
                setServices(servicesData);
            }
        } catch (error) {
            console.error('Load services error:', error);
            message.error('Không thể tải danh sách dịch vụ');
        }
    };

    const loadSchedules = async () => {
        try {
            const response = await axios.get(API.spaSchedulesList);
            if (response.data && response.data.status_code === 200) {
                const schedulesData = response.data.data || [];
                setSchedules(schedulesData);
            }
        } catch (error) {
            console.error('Load schedules error:', error);
        }
    };

    const handleCreate = () => {
        form.resetFields();
        setSelectedPackage(null);
        setModalVisible(true);
    };

    const handleEdit = async (record: ServicePackage) => {
        setSelectedPackage(record);

        try {
            const response = await axios.get(API.spaServicePackageDetail(record.id));
            const packageData = response.data;

            form.setFieldsValue({
                ...packageData,
                dich_vu_trong_goi: packageData.dich_vu_trong_goi || [],
            });
        } catch (error) {
            console.error('Failed to load package details:', error);
            form.setFieldsValue({
                ...record,
                dich_vu_trong_goi: [],
            });
        }

        setModalVisible(true);
    };

    const handleView = (record: ServicePackage) => {
        setSelectedPackage(record);
        setDetailDrawerVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Validate at least 1 service
            if (!values.dich_vu_trong_goi || values.dich_vu_trong_goi.length === 0) {
                message.error('Vui lòng chọn ít nhất 1 dịch vụ trong gói');
                return;
            }

            const payload = {
                ...values,
            };

            let response;
            if (selectedPackage?.id) {
                response = await axios.put(API.spaServicePackageUpdate(selectedPackage.id), payload);
            } else {
                response = await axios.post(API.spaServicePackageCreate, payload);
            }

            if (response.data && response.data.status_code === 200) {
                message.success(selectedPackage ? 'Cập nhật gói dịch vụ thành công' : 'Tạo gói dịch vụ mới thành công');
                setModalVisible(false);
                form.resetFields();
                setSelectedPackage(null);
                await loadPackages();
            } else {
                message.error(response.data?.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                const errors = error.response.data.errors;
                Object.keys(errors).forEach(key => {
                    message.error(errors[key][0]);
                });
            } else {
                message.error('Có lỗi xảy ra khi lưu dữ liệu');
            }
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await axios.delete(API.spaServicePackageDelete(id));
            if (response.data && response.data.status_code === 200) {
                message.success('Xóa gói dịch vụ thành công');
                await loadPackages();
            }
        } catch (error) {
            console.error('Delete error:', error);
            message.error('Không thể xóa gói dịch vụ');
        }
    };

    const handleCreateSchedule = async () => {
        try {
            const values = await scheduleForm.validateFields();
            const response = await axios.post('/spa/schedules', values);
            if (response.data && response.data.status_code === 200) {
                message.success('Thêm lịch trình thành công');
                setScheduleModalVisible(false);
                scheduleForm.resetFields();
                await loadSchedules();
                // Set giá trị mới vào form chính
                form.setFieldValue('lich_trinh_su_dung_id', response.data.data.id);
            }
        } catch (error) {
            console.error('Create schedule error:', error);
            message.error('Không thể thêm lịch trình');
        }
    };

    const columns: ColumnsType<ServicePackage> = [
        {
            title: 'Mã gói',
            dataIndex: 'ma_goi',
            key: 'ma_goi',
            width: 120,
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: 'Giá bán',
            dataIndex: 'gia_ban',
            key: 'gia_ban',
            width: 150,
            render: (value) => (
                <strong style={{ color: '#52c41a' }}>
                    {Number(value).toLocaleString()} VNĐ
                </strong>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'so_luong',
            key: 'so_luong',
            width: 100,
            align: 'center',
        },
        {
            title: 'Lịch trình',
            dataIndex: 'lich_trinh_ten',
            key: 'lich_trinh_ten',
            width: 150,
            render: (text, record) => (
                record.lich_trinh_ten ? (
                    <Tag color={record.lich_trinh_color}>{text}</Tag>
                ) : 'N/A'
            ),
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'dich_vu',
            key: 'dich_vu',
            render: (services: DichVuTrongGoi[]) => (
                <Space wrap>
                    {services && services.length > 0 ? (
                        services.slice(0, 3).map((svc, idx) => (
                            <Tag key={idx} color="blue">{svc.ten_dich_vu}</Tag>
                        ))
                    ) : 'Chưa có'}
                    {services && services.length > 3 && (
                        <Tag>+{services.length - 3} khác</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 120,
            render: (value) => (
                <Tag color={value ? 'green' : 'red'}>
                    {value ? 'Hoạt động' : 'Ngừng'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    />
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Bạn có chắc muốn xóa gói dịch vụ này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Row justify="space-between" align="middle">
                        <Col>
                            <h2 style={{ margin: 0 }}>
                                <GiftOutlined style={{ marginRight: 8 }} />
                                Quản lý Gói dịch vụ
                            </h2>
                        </Col>
                        <Col>
                            <Space>
                                <Input
                                    placeholder="Tìm kiếm mã gói..."
                                    prefix={<SearchOutlined />}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onPressEnter={loadPackages}
                                    style={{ width: 250 }}
                                />
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleCreate}
                                >
                                    Tạo gói mới
                                </Button>
                            </Space>
                        </Col>
                    </Row>

                    <Table
                        columns={columns}
                        dataSource={packages}
                        loading={loading}
                        rowKey="id"
                        pagination={{
                            pageSize: 20,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} gói`,
                        }}
                    />
                </Space>
            </Card>

            {/* Quick Add Schedule Modal */}
            <Modal
                title="Thêm lịch trình sử dụng"
                open={scheduleModalVisible}
                onCancel={() => {
                    setScheduleModalVisible(false);
                    scheduleForm.resetFields();
                }}
                onOk={handleCreateSchedule}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form form={scheduleForm} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên lịch trình"
                        rules={[{ required: true, message: 'Vui lòng nhập tên lịch trình' }]}
                    >
                        <Input placeholder="VD: Theo ngày, Theo tuần, Theo tháng..." />
                    </Form.Item>
                    <Form.Item
                        name="color"
                        label="Màu đánh dấu"
                        initialValue="blue"
                    >
                        <Select>
                            <Option value="blue"><Tag color="blue">Xanh dương</Tag></Option>
                            <Option value="green"><Tag color="green">Xanh lá</Tag></Option>
                            <Option value="red"><Tag color="red">Đỏ</Tag></Option>
                            <Option value="orange"><Tag color="orange">Cam</Tag></Option>
                            <Option value="purple"><Tag color="purple">Tím</Tag></Option>
                            <Option value="cyan"><Tag color="cyan">Xanh ngọc</Tag></Option>
                            <Option value="magenta"><Tag color="magenta">Hồng</Tag></Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="note"
                        label="Ghi chú"
                    >
                        <TextArea rows={2} placeholder="Ghi chú thêm về lịch trình..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Create/Edit Modal */}
            <Modal
                title={selectedPackage ? 'Cập nhật gói dịch vụ' : 'Tạo gói dịch vụ mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setSelectedPackage(null);
                }}
                onOk={handleSubmit}
                width={900}
                okText={selectedPackage ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                maskClosable={false}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="ma_goi"
                                label="Mã gói"
                                tooltip="Để trống để tự động sinh mã GOI00001"
                            >
                                <Input placeholder="GOI00001 (tự động)" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ten_goi"
                                label="Tên gói"
                                rules={[{ required: true, message: 'Vui lòng nhập tên gói' }]}
                            >
                                <Input placeholder="Nhập tên gói dịch vụ" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="lich_trinh_su_dung_id"
                                label={
                                    <Space>
                                        Lịch trình sử dụng
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={() => setScheduleModalVisible(true)}
                                            style={{ padding: 0, height: 'auto' }}
                                        >
                                            Thêm nhanh
                                        </Button>
                                    </Space>
                                }
                            >
                                <Select placeholder="Chọn lịch trình" allowClear>
                                    {schedules.map((schedule) => (
                                        <Option key={schedule.id} value={schedule.id}>
                                            <Tag color={schedule.color}>{schedule.name}</Tag>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="so_luong"
                                label="Số lượng"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="gia_ban"
                                label="Giá bán"
                                rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                    addonAfter="VNĐ"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="mo_ta"
                        label="Mô tả"
                    >
                        <TextArea rows={3} placeholder="Mô tả về gói dịch vụ..." />
                    </Form.Item>

                    {/* Services Table */}
                    <Form.Item label="Dịch vụ trong gói">
                        <Form.List name="dich_vu_trong_goi">
                            {(fields, { add, remove }) => (
                                <>
                                    <Table
                                        dataSource={fields}
                                        pagination={false}
                                        size="small"
                                        footer={() => (
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                            >
                                                Thêm dịch vụ
                                            </Button>
                                        )}
                                    >
                                        <Table.Column
                                            title="Mã/Tên dịch vụ"
                                            key="dich_vu_id"
                                            width="40%"
                                            render={(_, field: any) => (
                                                <Form.Item
                                                    name={[field.name, 'dich_vu_id']}
                                                    rules={[{ required: true, message: 'Chọn dịch vụ' }]}
                                                    style={{ margin: 0 }}
                                                >
                                                    <Select
                                                        showSearch
                                                        placeholder="Chọn dịch vụ"
                                                        optionFilterProp="label"
                                                        onChange={(value) => {
                                                            const service = services.find(s => s.id === value);
                                                            if (service) {
                                                                const currentValues = form.getFieldValue('dich_vu_trong_goi');
                                                                currentValues[field.name].gia_ban_le = service.gia_ban || service.gia;
                                                                form.setFieldValue('dich_vu_trong_goi', currentValues);
                                                            }
                                                        }}
                                                    >
                                                        {services.map((service) => (
                                                            <Option
                                                                key={service.id}
                                                                value={service.id}
                                                                label={`${service.ma_dich_vu} - ${service.ten_dich_vu}`}
                                                            >
                                                                <div>
                                                                    <div><strong>{service.ma_dich_vu}</strong> - {service.ten_dich_vu}</div>
                                                                    <div style={{ fontSize: 12, color: '#666' }}>
                                                                        Giá: {(service.gia_ban || service.gia || 0).toLocaleString()}đ
                                                                    </div>
                                                                </div>
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            )}
                                        />
                                        <Table.Column
                                            title="Giá bán lẻ"
                                            key="gia_ban_le"
                                            width="30%"
                                            render={(_, field: any) => (
                                                <Form.Item
                                                    name={[field.name, 'gia_ban_le']}
                                                    style={{ margin: 0 }}
                                                >
                                                    <InputNumber
                                                        style={{ width: '100%' }}
                                                        min={0}
                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                                        addonAfter="đ"
                                                        readOnly
                                                    />
                                                </Form.Item>
                                            )}
                                        />
                                        <Table.Column
                                            title="Số lần"
                                            key="so_luong"
                                            width="20%"
                                            render={(_, field: any) => (
                                                <Form.Item
                                                    name={[field.name, 'so_luong']}
                                                    initialValue={1}
                                                    style={{ margin: 0 }}
                                                >
                                                    <InputNumber
                                                        style={{ width: '100%' }}
                                                        min={1}
                                                    />
                                                </Form.Item>
                                            )}
                                        />
                                        <Table.Column
                                            title=""
                                            key="action"
                                            width="10%"
                                            render={(_, field: any) => (
                                                <Button
                                                    type="link"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => remove(field.name)}
                                                />
                                            )}
                                        />
                                    </Table>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết gói dịch vụ"
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={650}
            >
                {selectedPackage && (
                    <div style={{ marginTop: -24, marginLeft: -24, marginRight: -24 }}>
                        {/* Gradient Header */}
                        <Card
                            style={{
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                border: 'none',
                                borderRadius: 0,
                                marginBottom: 16
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 8,
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 40,
                                    color: 'white'
                                }}>
                                    🎁
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ color: 'white', margin: 0, fontSize: 20 }}>
                                        {selectedPackage.ten_goi || selectedPackage.ma_goi}
                                    </h2>
                                    <p style={{ color: 'rgba(255,255,255,0.9)', margin: '4px 0 0 0', fontSize: 14 }}>
                                        {selectedPackage.ma_goi}
                                    </p>
                                    {selectedPackage.lich_trinh_ten && (
                                        <Tag color={selectedPackage.lich_trinh_color} style={{ marginTop: 8 }}>
                                            <CalendarOutlined /> {selectedPackage.lich_trinh_ten}
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        </Card>

                        <div style={{ padding: '0 24px' }}>
                            {/* Price & Quantity */}
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={12}>
                                    <Card size="small">
                                        <Statistic
                                            title="Giá bán"
                                            value={selectedPackage.gia_ban}
                                            suffix="VNĐ"
                                            valueStyle={{ color: '#3f8600', fontSize: 18 }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card size="small">
                                        <Statistic
                                            title="Số lượng"
                                            value={selectedPackage.so_luong}
                                            valueStyle={{ color: '#1890ff', fontSize: 18 }}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            {/* Services in Package */}
                            {selectedPackage.dich_vu && selectedPackage.dich_vu.length > 0 && (
                                <Card
                                    title="Dịch vụ trong gói"
                                    size="small"
                                    style={{ marginBottom: 16 }}
                                >
                                    <Table
                                        dataSource={selectedPackage.dich_vu}
                                        pagination={false}
                                        size="small"
                                        rowKey={(record, index) => index || 0}
                                    >
                                        <Table.Column
                                            title="Dịch vụ"
                                            dataIndex="ten_dich_vu"
                                            key="ten_dich_vu"
                                            render={(text, record: any) => (
                                                <div>
                                                    <div>{record.ma_dich_vu}</div>
                                                    <div style={{ fontSize: 12, color: '#666' }}>{text}</div>
                                                </div>
                                            )}
                                        />
                                        <Table.Column
                                            title="Số lần"
                                            dataIndex="so_luong"
                                            key="so_luong"
                                            width={80}
                                            align="center"
                                        />
                                        <Table.Column
                                            title="Giá bán lẻ"
                                            dataIndex="gia_ban_le"
                                            key="gia_ban_le"
                                            width={120}
                                            render={(text) => (
                                                <strong style={{ color: '#52c41a' }}>
                                                    {Number(text || 0).toLocaleString()}đ
                                                </strong>
                                            )}
                                        />
                                    </Table>
                                </Card>
                            )}

                            {/* Description */}
                            {selectedPackage.mo_ta && (
                                <Card title="Mô tả" size="small">
                                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{selectedPackage.mo_ta}</p>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default ServicePackageList;
