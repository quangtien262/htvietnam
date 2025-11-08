import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../../common/api';
import {
    Card,
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Space,
    message,
    Popconfirm,
    Tag,
    Row,
    Col,
    Tooltip,
    Typography,
    Tabs,
    Descriptions,
    Badge
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    HomeOutlined,
    DollarOutlined,
    CalendarOutlined,
    InfoCircleOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface RoomData {
    id: number;
    name: string;
    price_base: number;
    price_expect: number;
    price_actual: number;
    room_status_id: number;
    apartment_id: number;
    description: string;
    contract_status: string;
    contract_id: number | null;
    contract_name: string | null;
    tenant_name: string | null;
}

interface ApartmentData {
    id: number;
    name: string;
    code: string;
    gia_thue: number;
    tien_coc: number;
    ky_thanh_toan: number;
    tien_moi_gioi: number;
    tien_mua_nhuong: number;
    gia_thue_tang: number;
    start: string;
    end: string;
    thoi_gian_tang_gia: string;
    password: string;
    description: string;
    color: string;
    total_rooms: number;
    active_contracts: number;
}

interface PageConfig {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
    count: number;
}

const Apartment: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<ApartmentData[]>([]);
    const [pageConfig, setPageConfig] = useState<PageConfig>({
        currentPage: 1,
        perPage: 20,
        total: 0,
        lastPage: 1,
        count: 0
    });
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [editingApartment, setEditingApartment] = useState<ApartmentData | null>(null);
    const [viewingApartment, setViewingApartment] = useState<ApartmentData | null>(null);
    const [apartmentRooms, setApartmentRooms] = useState<RoomData[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [form] = Form.useForm();
    const [roomModalVisible, setRoomModalVisible] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomData | null>(null);
    const [roomForm] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = (search = '') => {
        setLoading(true);
        axios.post(API.aitilen_apartmentList || '/aio/api/aitilen/apartment/list', {
            keyword: search,
            per_page: 20
        })
            .then((res: any) => {
                const data = res.data.data;
                setDataSource(data.datas || []);
                setPageConfig(data.pageConfig || {});
                setLoading(false);
            })
            .catch((err: any) => {
                console.error(err);
                message.error('Lỗi tải dữ liệu!');
                setLoading(false);
            });
    };

    const handleSearch = () => {
        fetchData(searchKeyword);
    };

    const handleAdd = () => {
        setEditingApartment(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: ApartmentData) => {
        setEditingApartment(record);
        form.setFieldsValue({
            ...record,
            start: record.start ? dayjs(record.start) : null,
            end: record.end ? dayjs(record.end) : null,
            thoi_gian_tang_gia: record.thoi_gian_tang_gia ? dayjs(record.thoi_gian_tang_gia) : null,
        });
        setIsModalVisible(true);
    };

    const handleDelete = (ids: number[]) => {
        axios.post(API.aitilen_deleteApartment || '/aio/api/aitilen/apartment/delete', { ids })
            .then((res: any) => {
                message.success(res.data.message || 'Xóa thành công!');
                fetchData(searchKeyword);
                setSelectedRowKeys([]);
            })
            .catch((err: any) => {
                message.error(err.response?.data?.message || 'Lỗi khi xóa!');
            });
    };

    const handleModalOk = () => {
        form.validateFields()
            .then((values) => {
                const postData = {
                    ...values,
                    id: editingApartment?.id || null,
                    start: values.start ? values.start.format('YYYY-MM-DD') : null,
                    end: values.end ? values.end.format('YYYY-MM-DD') : null,
                    thoi_gian_tang_gia: values.thoi_gian_tang_gia ? values.thoi_gian_tang_gia.format('YYYY-MM-DD') : null,
                };

                axios.post(API.aitilen_saveApartment || '/aio/api/aitilen/apartment/save', postData)
                    .then((res: any) => {
                        message.success(res.data.message || 'Lưu thành công!');
                        setIsModalVisible(false);
                        fetchData(searchKeyword);
                    })
                    .catch((err: any) => {
                        message.error(err.response?.data?.message || 'Lỗi khi lưu!');
                    });
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    const handleViewDetail = (record: ApartmentData) => {
        setViewingApartment(record);
        setIsDetailModalVisible(true);
        fetchApartmentRooms(record.id);
    };

    const fetchApartmentRooms = (apartmentId: number) => {
        setLoadingRooms(true);
        axios.post(API.aitilen_apartmentRooms, { apartment_id: apartmentId })
            .then((res: any) => {
                setApartmentRooms(res.data.data || []);
                setLoadingRooms(false);
            })
            .catch((err: any) => {
                console.error(err);
                message.error('Lỗi tải danh sách phòng!');
                setLoadingRooms(false);
            });
    };

    const handleAddRoom = () => {
        if (!viewingApartment) return;
        setEditingRoom(null);
        roomForm.resetFields();
        roomForm.setFieldsValue({ apartment_id: viewingApartment.id });
        setRoomModalVisible(true);
    };

    const handleEditRoom = (room: RoomData) => {
        setEditingRoom(room);
        roomForm.setFieldsValue(room);
        setRoomModalVisible(true);
    };

    const handleSaveRoom = () => {
        roomForm.validateFields().then((values) => {
            const data = {
                ...values,
                id: editingRoom?.id,
                apartment_id: viewingApartment?.id
            };

            axios.post(API.aitilen_saveRoom, data)
                .then((res: any) => {
                    console.log('res:', res);
                    if (res.data.status_code === 200) {
                        message.success(editingRoom ? 'Cập nhật phòng thành công!' : 'Thêm phòng thành công!');
                        setRoomModalVisible(false);
                        if (viewingApartment) {
                            fetchApartmentRooms(viewingApartment.id);
                        }
                    } else {
                        message.error(res.data.message || 'Có lỗi xảy ra!');
                    }
                })
                .catch((err: any) => {
                    console.error(err);
                    message.error('Lỗi lưu phòng!');
                });
        });
    };

    const handleDeleteRoom = (roomId: number) => {
        axios.post(API.aitilen_deleteRoom, { ids: [roomId] })
            .then((res: any) => {
                if (res.data.status_code === 200) {
                    message.success('Xóa phòng thành công!');
                    if (viewingApartment) {
                        fetchApartmentRooms(viewingApartment.id);
                    }
                } else {
                    message.error(res.data.message || 'Có lỗi xảy ra!');
                }
            })
            .catch((err: any) => {
                console.error(err);
                message.error('Lỗi xóa phòng!');
            });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
            sorter: (a: ApartmentData, b: ApartmentData) => a.id - b.id,
        },
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            width: 100,
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Tên tòa nhà',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (text: string, record: ApartmentData) => (
                <Space direction="vertical" size={0}>
                    <Button
                        type="link"
                        style={{ padding: 0, height: 'auto', fontSize: '14px' }}
                        onClick={() => handleViewDetail(record)}
                    >
                        <HomeOutlined /> <Text strong>{text}</Text>
                    </Button>
                    {record.description && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.description.substring(0, 50)}{record.description.length > 50 ? '...' : ''}
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Giá thuê',
            dataIndex: 'gia_thue',
            key: 'gia_thue',
            width: 130,
            align: 'right' as const,
            render: (value: number) => (
                <Text strong style={{ color: '#1890ff' }}>
                    <DollarOutlined /> {value?.toLocaleString('vi-VN')} ₫
                </Text>
            ),
            sorter: (a: ApartmentData, b: ApartmentData) => a.gia_thue - b.gia_thue,
        },
        {
            title: 'Tiền cọc',
            dataIndex: 'tien_coc',
            key: 'tien_coc',
            width: 120,
            align: 'right' as const,
            render: (value: number) => <Text>{value?.toLocaleString('vi-VN')} ₫</Text>,
        },
        {
            title: 'Kỳ TT (tháng)',
            dataIndex: 'ky_thanh_toan',
            key: 'ky_thanh_toan',
            width: 100,
            align: 'center' as const,
            render: (value: number) => <Tag color="blue">{value} tháng</Tag>,
        },
        {
            title: 'Số phòng',
            dataIndex: 'total_rooms',
            key: 'total_rooms',
            width: 90,
            align: 'center' as const,
            render: (value: number) => <Tag color="green">{value} phòng</Tag>,
        },
        {
            title: 'HĐ active',
            dataIndex: 'active_contracts',
            key: 'active_contracts',
            width: 90,
            align: 'center' as const,
            render: (value: number) => <Tag color="orange">{value} HĐ</Tag>,
        },
        {
            title: 'Thời gian',
            key: 'time',
            width: 180,
            render: (_: any, record: ApartmentData) => (
                <Space direction="vertical" size={0}>
                    {record.start && (
                        <Text style={{ fontSize: '12px' }}>
                            <CalendarOutlined /> BĐ: {dayjs(record.start).format('DD/MM/YYYY')}
                        </Text>
                    )}
                    {record.end && (
                        <Text style={{ fontSize: '12px' }}>
                            <CalendarOutlined /> KT: {dayjs(record.end).format('DD/MM/YYYY')}
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            fixed: 'right' as const,
            render: (_: any, record: ApartmentData) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="default"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Sửa">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa?"
                            onConfirm={() => handleDelete([record.id])}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const roomColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: 'Tên phòng',
            dataIndex: 'name',
            key: 'name',
            width: 150,
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'contract_status',
            key: 'contract_status',
            width: 120,
            align: 'center' as const,
            render: (status: string) => {
                if (status === 'active') {
                    return <Badge status="success" text="Đang thuê" />;
                }
                return <Badge status="default" text="Trống" />;
            }
        },
        {
            title: 'Người thuê',
            dataIndex: 'tenant_name',
            key: 'tenant_name',
            width: 180,
            render: (text: string) => text || <Text type="secondary">-</Text>
        },
        {
            title: 'Giá cơ bản',
            dataIndex: 'price_base',
            key: 'price_base',
            width: 130,
            align: 'right' as const,
            render: (value: number) => value ? `${value.toLocaleString('vi-VN')} ₫` : '-'
        },
        {
            title: 'Giá thực tế',
            dataIndex: 'price_actual',
            key: 'price_actual',
            width: 130,
            align: 'right' as const,
            render: (value: number) => value ? (
                <Text strong style={{ color: '#52c41a' }}>
                    {value.toLocaleString('vi-VN')} ₫
                </Text>
            ) : '-'
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text: string) => text || <Text type="secondary">-</Text>
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'center' as const,
            fixed: 'right' as const,
            render: (_: any, record: RoomData) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEditRoom(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa phòng này?"
                        onConfirm={() => handleDeleteRoom(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Tooltip title="Xóa">
                            <Button type="link" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys: React.Key[]) => {
            setSelectedRowKeys(selectedKeys);
        },
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title={
                    <Space>
                        <HomeOutlined style={{ fontSize: '20px' }} />
                        <Title level={4} style={{ margin: 0 }}>Quản lý Tòa nhà</Title>
                    </Space>
                }
                extra={
                    <Space>
                        <Input
                            placeholder="Tìm kiếm tên, mã..."
                            prefix={<SearchOutlined />}
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onPressEnter={handleSearch}
                            style={{ width: 250 }}
                        />
                        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                            Tìm kiếm
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Thêm mới
                        </Button>
                        {selectedRowKeys.length > 0 && (
                            <Popconfirm
                                title={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} tòa nhà?`}
                                onConfirm={() => handleDelete(selectedRowKeys as number[])}
                                okText="Có"
                                cancelText="Không"
                            >
                                <Button danger icon={<DeleteOutlined />}>
                                    Xóa ({selectedRowKeys.length})
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                }
            >
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1400 }}
                    pagination={{
                        current: pageConfig.currentPage,
                        pageSize: pageConfig.perPage,
                        total: pageConfig.total,
                        showSizeChanger: false,
                        showTotal: (total) => `Tổng ${total} tòa nhà`,
                    }}
                />
            </Card>

            <Modal
                title={
                    <Space>
                        <HomeOutlined />
                        {editingApartment ? 'Sửa tòa nhà' : 'Thêm tòa nhà mới'}
                    </Space>
                }
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                width={900}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên tòa nhà"
                                rules={[{ required: true, message: 'Vui lòng nhập tên tòa nhà!' }]}
                            >
                                <Input placeholder="Nhập tên tòa nhà" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="code"
                                label="Mã tòa nhà"
                            >
                                <Input placeholder="Nhập mã tòa nhà" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="gia_thue"
                                label="Giá thuê"
                                rules={[{ required: true, message: 'Vui lòng nhập giá thuê!' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="Giá thuê"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="tien_coc"
                                label="Tiền cọc"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="Tiền cọc"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="ky_thanh_toan"
                                label="Kỳ thanh toán (tháng)"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Số tháng"
                                    min={1}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="tien_moi_gioi"
                                label="Tiền môi giới"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="Tiền môi giới"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="tien_mua_nhuong"
                                label="Tiền mua nhượng"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="Tiền mua nhượng"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="gia_thue_tang"
                                label="Giá thuê tăng"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="Giá thuê tăng"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="start"
                                label="Ngày bắt đầu"
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="end"
                                label="Ngày kết thúc"
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="thoi_gian_tang_gia"
                                label="Thời gian tăng giá"
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                            >
                                <Input.Password placeholder="Nhập mật khẩu" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="color"
                                label="Màu sắc"
                            >
                                <Input type="color" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <TextArea rows={4} placeholder="Nhập mô tả..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal xem chi tiết tòa nhà */}
            <Modal
                title={
                    <Space>
                        <HomeOutlined />
                        Chi tiết tòa nhà: {viewingApartment?.name}
                    </Space>
                }
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                width={1000}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
            >
                <Tabs defaultActiveKey="1">
                    <TabPane tab={<span><InfoCircleOutlined /> Thông tin tòa nhà</span>} key="1">
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Mã tòa nhà">
                                <Text strong>{viewingApartment?.code || '-'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tên tòa nhà">
                                <Text strong>{viewingApartment?.name}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Giá thuê">
                                <Text style={{ color: '#1890ff', fontWeight: 'bold' }}>
                                    {viewingApartment?.gia_thue?.toLocaleString('vi-VN')} ₫
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiền cọc">
                                {viewingApartment?.tien_coc?.toLocaleString('vi-VN')} ₫
                            </Descriptions.Item>

                            <Descriptions.Item label="Kỳ thanh toán">
                                {viewingApartment?.ky_thanh_toan} tháng
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiền môi giới">
                                {viewingApartment?.tien_moi_gioi?.toLocaleString('vi-VN')} ₫
                            </Descriptions.Item>

                            <Descriptions.Item label="Tiền mua nhượng">
                                {viewingApartment?.tien_mua_nhuong?.toLocaleString('vi-VN')} ₫
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá thuê tăng">
                                {viewingApartment?.gia_thue_tang?.toLocaleString('vi-VN')} ₫
                            </Descriptions.Item>

                            <Descriptions.Item label="Ngày bắt đầu">
                                {viewingApartment?.start ? dayjs(viewingApartment.start).format('DD/MM/YYYY') : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày kết thúc">
                                {viewingApartment?.end ? dayjs(viewingApartment.end).format('DD/MM/YYYY') : '-'}
                            </Descriptions.Item>

                            <Descriptions.Item label="Thời gian tăng giá">
                                {viewingApartment?.thoi_gian_tang_gia ? dayjs(viewingApartment.thoi_gian_tang_gia).format('DD/MM/YYYY') : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mật khẩu">
                                {viewingApartment?.password ? '••••••••' : '-'}
                            </Descriptions.Item>

                            <Descriptions.Item label="Tổng số phòng">
                                <Tag color="green">{viewingApartment?.total_rooms || 0} phòng</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="HĐ đang active">
                                <Tag color="orange">{viewingApartment?.active_contracts || 0} hợp đồng</Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Mô tả" span={2}>
                                {viewingApartment?.description || '-'}
                            </Descriptions.Item>
                        </Descriptions>
                    </TabPane>

                    <TabPane tab={<span><HomeOutlined /> Danh sách phòng ({apartmentRooms.length})</span>} key="2">
                        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRoom}>
                                Thêm phòng mới
                            </Button>
                        </Space>
                        <Table
                            columns={roomColumns}
                            dataSource={apartmentRooms}
                            rowKey="id"
                            loading={loadingRooms}
                            pagination={false}
                            size="small"
                            scroll={{ y: 400 }}
                        />
                    </TabPane>
                </Tabs>
            </Modal>

            {/* Modal thêm/sửa phòng */}
            <Modal
                title={editingRoom ? 'Sửa thông tin phòng' : 'Thêm phòng mới'}
                open={roomModalVisible}
                onOk={handleSaveRoom}
                onCancel={() => setRoomModalVisible(false)}
                width={700}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form
                    form={roomForm}
                    layout="vertical"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên phòng"
                                rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
                            >
                                <Input placeholder="Ví dụ: P101" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="room_status_id"
                                label="Trạng thái"
                            >
                                <InputNumber
                                    placeholder="ID trạng thái"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="price_base"
                                label="Giá cơ bản (₫)"
                            >
                                <InputNumber
                                    placeholder="0"
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="price_expect"
                                label="Giá kỳ vọng (₫)"
                            >
                                <InputNumber
                                    placeholder="0"
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="price_actual"
                                label="Giá thực tế (₫)"
                            >
                                <InputNumber
                                    placeholder="0"
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <TextArea rows={4} placeholder="Nhập mô tả phòng..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Apartment;
