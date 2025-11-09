import React, { useState, useEffect } from 'react';
import {
    Table, Card, Button, Space, Tag, message, Modal, Form, Input, Select, DatePicker,
    InputNumber, Upload, Row, Col, Statistic, Divider
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
    FileTextOutlined, DollarOutlined, UploadOutlined, EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import axios from 'axios';
import { numberFormat } from '../../function/common';
import API from '../../common/api';

const { Option } = Select;
const { TextArea } = Input;

interface SoQuy {
    id: number;
    code: string;
    name: string;
    so_tien: number;
    so_quy_type_id: number;
    so_quy_type_name: string;
    loai_thu_id?: number;
    loai_thu_name?: string;
    loai_chi_id?: number;
    loai_chi_name?: string;
    apartment_id?: number;
    apartment_name?: string;
    room_id?: number;
    room_name?: string;
    khach_hang_id?: number;
    khach_hang_name?: string;
    nguoi_nhan_id?: number;
    nguoi_nhan_name?: string;
    nguoi_nhan_phone?: string;
    thoi_gian: string;
    note?: string;
    so_quy_status_id: number;
    so_quy_status_name: string;
    ma_chung_tu?: string;
    loai_chung_tu?: string;
    created_at: string;
}

interface SearchParams {
    keyword?: string;
    so_quy_type_id?: number;
    loai_thu_id?: number;
    loai_chi_id?: number;
    apartment_id?: number;
    room_id?: number;
    from_date?: string;
    to_date?: string;
}

const SoQuyList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<SoQuy[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 30,
        total: 0,
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingRecord, setEditingRecord] = useState<SoQuy | null>(null);
    const [form] = Form.useForm();

    // Statistics
    const [statistics, setStatistics] = useState({
        total_thu: 0,
        total_chi: 0,
        balance: 0,
    });

    // Master data
    const [soQuyTypes, setSoQuyTypes] = useState<any[]>([]);
    const [loaiThuList, setLoaiThuList] = useState<any[]>([]);
    const [loaiChiList, setLoaiChiList] = useState<any[]>([]);
    const [apartmentList, setApartmentList] = useState<any[]>([]);
    const [roomList, setRoomList] = useState<any[]>([]);
    const [filteredRoomList, setFilteredRoomList] = useState<any[]>([]);
    const [statusList, setStatusList] = useState<any[]>([]);
    const [adminUsersList, setAdminUsersList] = useState<any[]>([]);
    const [currentPhieuType, setCurrentPhieuType] = useState<number>(1); // 1=Thu, 2=Chi

    const [searchParams, setSearchParams] = useState<SearchParams>({});

    useEffect(() => {
        loadMasterData();
        fetchData();
    }, [pagination.current, searchParams]);

    const loadMasterData = async () => {
        try {
            // Load các bảng master data
            const [typeRes, loaiThuRes, loaiChiRes, apartmentRes, statusRes, adminUsersRes] = await Promise.all([
                axios.post(API.soQuyTypeList, {}),
                axios.post(API.loaiThuList, {}),
                axios.post(API.loaiChiList, {}),
                axios.post(API.aitilen_apartmentList, {}),
                axios.post(API.soQuyStatusList, {}),
                axios.post(API.adminUsersList, {}),
            ]);

            if (typeRes?.data?.status_code === 200) {
                setSoQuyTypes(typeRes.data.data.datas || []);
            }
            if (loaiThuRes?.data?.status_code === 200) {
                setLoaiThuList(loaiThuRes.data.data.datas || []);
            }
            if (loaiChiRes?.data?.status_code === 200) {
                setLoaiChiList(loaiChiRes.data.data.datas || []);
            }
            if (apartmentRes?.data?.status_code === 200) {
                setApartmentList(apartmentRes.data.data.datas || []);
            }
            if (statusRes?.data?.status_code === 200) {
                setStatusList(statusRes.data.data.datas || []);
            }
            if (adminUsersRes?.data?.status_code === 200) {
                setAdminUsersList(adminUsersRes.data.data.datas || []);
            }
        } catch (error) {
            console.error('Error loading master data:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.post(API.soQuyList, {
                searchData: {
                    ...searchParams,
                    page: pagination.current,
                    per_page: pagination.pageSize,
                }
            });

            if (res?.data?.status_code === 200) {
                setDataSource(res.data.data.datas || []);
                setPagination(prev => ({
                    ...prev,
                    total: res.data.data.total || 0,
                }));

                // Update statistics
                if (res.data.data.statistics) {
                    setStatistics(res.data.data.statistics);
                }
            }
        } catch (error: any) {
            console.error('Error fetching data:', error);
            message.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const loadRoomsByApartment = async (apartmentId: number) => {
        try {
            const res = await axios.post(API.aitilen_apartmentRooms, {
                searchData: { apartment_id: apartmentId }
            });
            if (res?.data?.status_code === 200) {
                const rooms = res.data.data || [];
                setRoomList(rooms);
                setFilteredRoomList(rooms);
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
        }
    };

    const handleApartmentChange = (apartmentId: number) => {
        form.setFieldValue('apartment_id', apartmentId);
        form.setFieldValue('room_id', undefined); // Reset room
        if (apartmentId) {
            loadRoomsByApartment(apartmentId);
        } else {
            setFilteredRoomList([]);
        }
    };

    const handleAddPhieuThu = () => {
        setModalMode('add');
        setCurrentPhieuType(1); // Thu
        setEditingRecord(null);
        form.resetFields();
        form.setFieldsValue({
            so_quy_type_id: 1,
            thoi_gian: dayjs(),
            so_quy_status_id: 1,
        });
        setFilteredRoomList([]);
        setIsModalVisible(true);
    };

    const handleAddPhieuChi = () => {
        setModalMode('add');
        setCurrentPhieuType(2); // Chi
        setEditingRecord(null);
        form.resetFields();
        form.setFieldsValue({
            so_quy_type_id: 2,
            thoi_gian: dayjs(),
            so_quy_status_id: 1,
        });
        setFilteredRoomList([]);
        setIsModalVisible(true);
    };

    const handleEdit = (record: SoQuy) => {
        setModalMode('edit');
        setCurrentPhieuType(record.so_quy_type_id);
        setEditingRecord(record);
        form.setFieldsValue({
            ...record,
            thoi_gian: record.thoi_gian ? dayjs(record.thoi_gian) : undefined,
        });

        // Load rooms if apartment is selected
        if (record.apartment_id) {
            loadRoomsByApartment(record.apartment_id);
        }

        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa phiếu này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await axios.post(API.soQuyDelete, { ids: [id] });
                    if (res?.data?.status_code === 200) {
                        message.success('Xóa thành công');
                        fetchData();
                    } else {
                        message.error(res?.data?.message || 'Xóa thất bại');
                    }
                } catch (error) {
                    console.error('Error deleting:', error);
                    message.error('Có lỗi xảy ra');
                }
            },
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            const formData = {
                ...values,
                thoi_gian: values.thoi_gian ? values.thoi_gian.format('YYYY-MM-DD') : undefined,
                id: editingRecord?.id,
            };

            const res = await axios.post(
                modalMode === 'add' ? API.soQuyAdd : API.soQuyUpdate,
                formData
            );

            if (res?.data?.status_code === 200) {
                message.success(modalMode === 'add' ? 'Thêm mới thành công' : 'Cập nhật thành công');
                setIsModalVisible(false);
                form.resetFields();
                fetchData();
            } else {
                message.error(res?.data?.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            console.error('Error submitting:', error);
            message.error('Có lỗi xảy ra');
        }
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchData();
    };

    const handleReset = () => {
        setSearchParams({});
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const columns: ColumnsType<SoQuy> = [
        {
            title: 'Mã phiếu',
            dataIndex: 'code',
            key: 'code',
            width: 120,
            fixed: 'left',
        },
        {
            title: 'Loại',
            dataIndex: 'so_quy_type_name',
            key: 'so_quy_type_name',
            width: 80,
            render: (text: string, record: SoQuy) => (
                <Tag color={record.so_quy_type_id === 1 ? 'green' : 'red'}>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Số tiền',
            dataIndex: 'so_tien',
            key: 'so_tien',
            width: 150,
            align: 'right',
            render: (value: number) => (
                <span style={{ fontWeight: 'bold' }}>
                    {numberFormat(value)} ₫
                </span>
            ),
        },
        {
            title: 'Loại thu/chi',
            key: 'loai',
            width: 150,
            render: (_, record) => record.loai_thu_name || record.loai_chi_name || '-',
        },
        {
            title: 'Tòa nhà',
            dataIndex: 'apartment_name',
            key: 'apartment_name',
            width: 120,
            render: (text: string) => text || '-',
        },
        {
            title: 'Phòng',
            dataIndex: 'room_name',
            key: 'room_name',
            width: 100,
            render: (text: string) => text || '-',
        },
        {
            title: 'Người nhận/nộp',
            dataIndex: 'nguoi_nhan_name',
            key: 'nguoi_nhan_name',
            width: 150,
            render: (text, record) => text || record.khach_hang_name || '-',
        },
        {
            title: 'Thời gian',
            dataIndex: 'thoi_gian',
            key: 'thoi_gian',
            width: 110,
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Chứng từ',
            dataIndex: 'ma_chung_tu',
            key: 'ma_chung_tu',
            width: 120,
            render: (text: string) => text || '-',
        },
        {
            title: 'Nội dung',
            dataIndex: 'note',
            key: 'note',
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'so_quy_status_name',
            key: 'so_quy_status_name',
            width: 100,
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Divider orientation="left" style={{ fontSize: 20, fontWeight: 'bold' }}>
                Quản lý Sổ quỹ
            </Divider>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Tổng thu"
                            value={statistics.total_thu}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            formatter={(value) => numberFormat(value as number)}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Tổng chi"
                            value={statistics.total_chi}
                            precision={0}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            formatter={(value) => numberFormat(value as number)}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Số dư"
                            value={statistics.balance}
                            precision={0}
                            valueStyle={{ color: statistics.balance >= 0 ? '#3f8600' : '#cf1322' }}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            formatter={(value) => numberFormat(value as number)}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Search & Filters */}
            <Card title={<><SearchOutlined /> Tìm kiếm</>} style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Input
                            placeholder="Tìm theo mã, nội dung..."
                            value={searchParams.keyword}
                            onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                            onPressEnter={handleSearch}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Loại sổ quỹ"
                            allowClear
                            style={{ width: '100%' }}
                            value={searchParams.so_quy_type_id}
                            onChange={(value) => setSearchParams({ ...searchParams, so_quy_type_id: value })}
                        >
                            {soQuyTypes.map(type => (
                                <Option key={type.id} value={type.id}>{type.name}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Tòa nhà"
                            allowClear
                            style={{ width: '100%' }}
                            value={searchParams.apartment_id}
                            onChange={(value) => setSearchParams({ ...searchParams, apartment_id: value })}
                        >
                            {apartmentList.map(apt => (
                                <Option key={apt.id} value={apt.id}>{apt.name}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Space>
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={handleSearch}
                            >
                                Tìm kiếm
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleReset}
                            >
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card
                title={<><FileTextOutlined /> Danh sách sổ quỹ</>}
                extra={
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddPhieuThu}
                            style={{ backgroundColor: '#52c41a' }}
                        >
                            Phiếu thu
                        </Button>
                        <Button
                            type="primary"
                            danger
                            icon={<PlusOutlined />}
                            onClick={handleAddPhieuChi}
                        >
                            Phiếu chi
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bản ghi`,
                        onChange: (page, pageSize) => {
                            setPagination(prev => ({ ...prev, current: page, pageSize }));
                        },
                    }}
                    scroll={{ x: 1500 }}
                />
            </Card>

            {/* Add/Edit Modal - Phiếu Thu */}
            <Modal
                title={
                    modalMode === 'add'
                        ? (currentPhieuType === 1 ? 'Thêm phiếu thu' : 'Thêm phiếu chi')
                        : (currentPhieuType === 1 ? 'Sửa phiếu thu' : 'Sửa phiếu chi')
                }
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                    setFilteredRoomList([]);
                }}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    {/* Hidden field for so_quy_type_id */}
                    <Form.Item name="so_quy_type_id" hidden>
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="so_tien"
                                label="Số tiền"
                                rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    placeholder="Nhập số tiền"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="thoi_gian"
                                label="Thời gian"
                                rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Loại thu hoặc loại chi */}
                    <Row gutter={16}>
                        {currentPhieuType === 1 ? (
                            <Col span={12}>
                                <Form.Item
                                    name="loai_thu_id"
                                    label="Loại thu"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại thu' }]}
                                >
                                    <Select placeholder="Chọn loại thu">
                                        {loaiThuList.map(item => (
                                            <Option key={item.id} value={item.id}>{item.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        ) : (
                            <Col span={12}>
                                <Form.Item
                                    name="loai_chi_id"
                                    label="Loại chi"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại chi' }]}
                                >
                                    <Select placeholder="Chọn loại chi">
                                        {loaiChiList.map(item => (
                                            <Option key={item.id} value={item.id}>{item.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        )}
                        <Col span={12}>
                            <Form.Item name="so_quy_status_id" label="Trạng thái">
                                <Select placeholder="Chọn trạng thái">
                                    {statusList.map(status => (
                                        <Option key={status.id} value={status.id}>{status.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Tòa nhà và Phòng */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="apartment_id"
                                label="Tòa nhà"
                            >
                                <Select
                                    placeholder="Chọn tòa nhà"
                                    allowClear
                                    onChange={handleApartmentChange}
                                >
                                    {apartmentList.map(apt => (
                                        <Option key={apt.id} value={apt.id}>{apt.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="room_id"
                                label="Phòng"
                            >
                                <Select
                                    placeholder={form.getFieldValue('apartment_id') ? "Chọn phòng" : "Vui lòng chọn tòa nhà trước"}
                                    allowClear
                                    disabled={!form.getFieldValue('apartment_id')}
                                    loading={filteredRoomList.length === 0 && form.getFieldValue('apartment_id')}
                                >
                                    {filteredRoomList.map(room => (
                                        <Option key={room.id} value={room.id}>{room.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Người nhận/nộp */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="nguoi_nhan_id"
                                label={currentPhieuType === 1 ? "Người nộp" : "Người nhận"}
                                rules={[{ required: true, message: 'Vui lòng chọn người ' + (currentPhieuType === 1 ? 'nộp' : 'nhận') }]}
                            >
                                <Select
                                    showSearch
                                    placeholder={currentPhieuType === 1 ? "Chọn người nộp tiền" : "Chọn người nhận tiền"}
                                    filterOption={(input, option) =>
                                        String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {adminUsersList.map(user => (
                                        <Option key={user.id} value={user.id} label={user.name}>
                                            {user.name} {user.phone ? `(${user.phone})` : ''}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="nguoi_nhan_phone" label="Số điện thoại">
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="note" label="Nội dung">
                        <TextArea rows={3} placeholder="Nhập nội dung ghi chú" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {modalMode === 'add' ? 'Thêm mới' : 'Cập nhật'}
                            </Button>
                            <Button onClick={() => {
                                setIsModalVisible(false);
                                form.resetFields();
                                setFilteredRoomList([]);
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SoQuyList;
