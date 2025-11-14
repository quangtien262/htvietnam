import React, { useState, useEffect } from 'react';
import {
    Table, Card, Button, Space, Tag, message, Modal, Form, Input, Select, InputNumber,
    Row, Col, Checkbox, Popconfirm
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
    DollarOutlined, PlusCircleOutlined, MinusCircleOutlined, AppstoreAddOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { numberFormat } from '../../function/common';
import API from '../../common/api';

const { Option } = Select;
const { TextArea } = Input;

// Hàm normalize string: loại bỏ dấu và chuyển về lowercase
const normalizeString = (str: string): string => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd');
};

// Hàm filter option cho Select
const filterOption = (input: string, option: any): boolean => {
    const normalizedInput = normalizeString(input);
    const normalizedLabel = normalizeString(option?.children || option?.label || '');
    return normalizedLabel.includes(normalizedInput);
};

interface DauTu {
    id: number;
    name: string;
    content?: string;
    supplier_id?: number;
    supplier_name?: string;
    loai_chi_id?: number;
    loai_chi_name?: string;
    apartment_id?: number;
    apartment_name?: string;
    room_id?: number;
    room_name?: string;
    price: number;
    is_save2soquy: boolean;
    is_save_purchase_orders: boolean;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

interface SearchParams {
    keyword?: string;
    apartment_id?: number;
    room_id?: number;
    loai_chi_id?: number;
}

const AitilenDauTu: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<DauTu[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 30,
        total: 0,
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingRecord, setEditingRecord] = useState<DauTu | null>(null);
    const [form] = Form.useForm();
    const [bulkForm] = Form.useForm();

    // Master data
    const [supplierList, setSupplierList] = useState<any[]>([]);
    const [loaiChiList, setLoaiChiList] = useState<any[]>([]);
    const [apartmentList, setApartmentList] = useState<any[]>([]);
    const [roomList, setRoomList] = useState<any[]>([]);
    const [filteredRoomList, setFilteredRoomList] = useState<any[]>([]);

    const [searchParams, setSearchParams] = useState<SearchParams>({});

    // Bulk form states
    const [applyAllApartment, setApplyAllApartment] = useState(false);
    const [applyAllLoaiChi, setApplyAllLoaiChi] = useState(false);
    const [commonApartmentId, setCommonApartmentId] = useState<number | undefined>(undefined);
    const [commonLoaiChiId, setCommonLoaiChiId] = useState<number | undefined>(undefined);

    useEffect(() => {
        loadMasterData();
        fetchData();
    }, [pagination.current, searchParams]);

    const loadMasterData = async () => {
        try {
            const res = await axios.post(API.dauTuSelectData, {});
            if (res?.data?.status_code === 200) {
                const data = res.data.data;
                setSupplierList(data.suppliers || []);
                setLoaiChiList(data.loai_chi || []);
                setApartmentList(data.apartments || []);
            }
        } catch (error) {
            console.error('Error loading master data:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.post(API.dauTuList, {
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
        form.setFieldValue('room_id', undefined);
        if (apartmentId) {
            loadRoomsByApartment(apartmentId);
        } else {
            setFilteredRoomList([]);
        }
    };

    const handleAdd = () => {
        setModalMode('add');
        setEditingRecord(null);
        form.resetFields();
        form.setFieldsValue({
            is_active: true,
            is_save2soquy: false,
            is_save_purchase_orders: false,
            sort_order: 0,
        });
        setFilteredRoomList([]);
        setIsModalVisible(true);
    };

    const handleBulkAdd = () => {
        bulkForm.resetFields();
        // Reset checkboxes and common values
        setApplyAllApartment(false);
        setApplyAllLoaiChi(false);
        setCommonApartmentId(undefined);
        setCommonLoaiChiId(undefined);
        // Mặc định 5 items
        bulkForm.setFieldsValue({
            items: Array(5).fill(null).map(() => ({
                name: '',
                price: undefined,
                apartment_id: undefined,
                loai_chi_id: undefined
            }))
        });
        setIsBulkModalVisible(true);
    };

    const handleEdit = (record: DauTu) => {
        setModalMode('edit');
        setEditingRecord(record);
        form.setFieldsValue({
            ...record,
        });

        if (record.apartment_id) {
            loadRoomsByApartment(record.apartment_id);
        }

        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa chi phí đầu tư này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await axios.post(API.dauTuDelete, { ids: [id] });
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
                id: editingRecord?.id,
            };

            const res = await axios.post(
                modalMode === 'add' ? API.dauTuAdd : API.dauTuUpdate,
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

    const handleBulkSubmit = async (values: any) => {
        try {
            // Filter out empty rows (rows without name)
            const validItems = values.items.filter((item: any) => item?.name && item.name.trim() !== '');

            if (validItems.length === 0) {
                message.warning('Vui lòng nhập ít nhất 1 chi phí');
                return;
            }

            // Validate: If name exists, price must exist
            const invalidItems = validItems.filter((item: any) => !item.price || item.price <= 0);
            if (invalidItems.length > 0) {
                message.error('Các dòng có tên chi phí phải có giá trị hợp lệ');
                return;
            }

            // Apply common values if checkboxes are checked
            const itemsToSubmit = validItems.map((item: any) => ({
                ...item,
                apartment_id: applyAllApartment ? commonApartmentId : item.apartment_id,
                loai_chi_id: applyAllLoaiChi ? commonLoaiChiId : item.loai_chi_id,
            }));

            const res = await axios.post(API.dauTuAddBulk, {
                items: itemsToSubmit
            });

            if (res?.data?.status_code === 200) {
                message.success(res.data.message || 'Thêm nhanh thành công');
                setIsBulkModalVisible(false);
                bulkForm.resetFields();
                setApplyAllApartment(false);
                setApplyAllLoaiChi(false);
                setCommonApartmentId(undefined);
                setCommonLoaiChiId(undefined);
                fetchData();
            } else {
                message.error(res?.data?.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            console.error('Error bulk adding:', error);
            message.error(error?.response?.data?.message || 'Có lỗi xảy ra');
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

    const columns: ColumnsType<DauTu> = [
        {
            title: 'Tên chi phí',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            render: (text: string, record: any) => {
                return <>
                    <span>{text}</span>
                    {record.content ? <p>{record.content}</p> : null}
                </>;
            },

        },
        {
            title: 'Tòa nhà',
            dataIndex: 'apartment_name',
            key: 'apartment_name',
            width: 150,
            render: (text: string, record: any) => {
                return <>
                    <span>{text}</span>
                    {record.room_name ? <span>{record.room_name}</span> : null}
                </>;
            },
        },
        {
            title: 'Giá trị',
            dataIndex: 'price',
            key: 'price',
            width: 150,
            align: 'right',
            render: (value: number, record: any) => (
                <div>
                    <span style={{ fontWeight: 'bold', color: '#cf1322' }}>
                        {numberFormat(value ?? 0)} ₫
                    </span>
                    <p>{record.loai_chi_name}</p>
                </div>
            ),
        },
        {
            title: 'Sổ quỹ',
            dataIndex: 'is_save2soquy',
            key: 'is_save2soquy',
            width: 80,
            align: 'center',
            render: (value: boolean) => (
                <Tag color={value ? 'green' : 'default'}>
                    {value ? 'Có' : 'Không'}
                </Tag>
            ),
        },
        {
            title: 'Đơn mua hàng',
            dataIndex: 'is_save_purchase_orders',
            key: 'is_save_purchase_orders',
            width: 120,
            align: 'center',
            render: (value: boolean) => (
                <Tag color={value ? 'blue' : 'default'}>
                    {value ? 'Có' : 'Không'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 100,
            align: 'center',
            render: (value: boolean) => (
                <Tag color={value ? 'success' : 'error'}>
                    {value ? 'Hoạt động' : 'Ngưng'}
                </Tag>
            ),
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplier_name',
            key: 'supplier_name',
            width: 150,
            render: (text: string) => text || '-',
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
            <Card
                title={
                    <Space>
                        <DollarOutlined />
                        <span>Quản lý Chi phí Đầu tư</span>
                    </Space>
                }
                extra={
                    <Space>
                        <Button type="default" icon={<AppstoreAddOutlined />} onClick={handleBulkAdd}>
                            Thêm nhanh
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Thêm chi phí
                        </Button>
                    </Space>
                }
            >
                {/* Search Filters */}
                <Card size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Input
                                placeholder="Tìm theo tên chi phí"
                                prefix={<SearchOutlined />}
                                value={searchParams.keyword}
                                onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                                onPressEnter={handleSearch}
                            />
                        </Col>
                        <Col span={5}>
                            <Select
                                showSearch
                                filterOption={filterOption}
                                placeholder="Chọn tòa nhà"
                                allowClear
                                style={{ width: '100%' }}
                                value={searchParams.apartment_id}
                                onChange={(value) => setSearchParams({ ...searchParams, apartment_id: value, room_id: undefined })}
                            >
                                {apartmentList.map(item => (
                                    <Option key={item.id} value={item.id}>{item.name}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={5}>
                            <Select
                                showSearch
                                filterOption={filterOption}
                                placeholder="Chọn loại chi"
                                allowClear
                                style={{ width: '100%' }}
                                value={searchParams.loai_chi_id}
                                onChange={(value) => setSearchParams({ ...searchParams, loai_chi_id: value })}
                            >
                                {loaiChiList.map(item => (
                                    <Option key={item.id} value={item.id}>{item.name}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={8}>
                            <Space>
                                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                                    Tìm kiếm
                                </Button>
                                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                                    Làm mới
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Data Table */}
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bản ghi`,
                        onChange: (page, pageSize) => {
                            setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 30 }));
                        },
                    }}
                    scroll={{ x: 1500 }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={modalMode === 'add' ? 'Thêm chi phí đầu tư' : 'Cập nhật chi phí đầu tư'}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                width={800}
                okText={modalMode === 'add' ? 'Thêm mới' : 'Cập nhật'}
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên chi phí"
                                rules={[{ required: true, message: 'Vui lòng nhập tên chi phí' }]}
                            >
                                <Input placeholder="Nhập tên chi phí" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Giá trị"
                                rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Nhập giá trị"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="content"
                        label="Nội dung chi phí"
                    >
                        <TextArea rows={3} placeholder="Nhập nội dung chi tiết" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="apartment_id"
                                label="Tòa nhà"
                            >
                                <Select
                                    showSearch
                                    filterOption={filterOption}
                                    placeholder="Chọn tòa nhà"
                                    allowClear
                                    onChange={handleApartmentChange}
                                >
                                    {apartmentList.map(item => (
                                        <Option key={item.id} value={item.id}>{item.name}</Option>
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
                                    showSearch
                                    filterOption={filterOption}
                                    placeholder="Chọn phòng"
                                    allowClear
                                    disabled={!form.getFieldValue('apartment_id')}
                                >
                                    {filteredRoomList.map(item => (
                                        <Option key={item.id} value={item.id}>{item.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="supplier_id"
                                label="Nhà cung cấp"
                            >
                                <Select
                                    showSearch
                                    filterOption={filterOption}
                                    placeholder="Chọn nhà cung cấp"
                                    allowClear
                                >
                                    {supplierList.map(item => (
                                        <Option key={item.id} value={item.id}>{item.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="loai_chi_id"
                                label="Loại chi"
                            >
                                <Select
                                    showSearch
                                    filterOption={filterOption}
                                    placeholder="Chọn loại chi"
                                    allowClear
                                >
                                    {loaiChiList.map(item => (
                                        <Option key={item.id} value={item.id}>{item.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="is_save2soquy"
                                valuePropName="checked"
                            >
                                <Checkbox>Lưu sang sổ quỹ</Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="is_save_purchase_orders"
                                valuePropName="checked"
                            >
                                <Checkbox>Lưu sang đơn mua hàng</Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="is_active"
                                valuePropName="checked"
                            >
                                <Checkbox>Hoạt động</Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="sort_order"
                        label="Thứ tự sắp xếp"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            placeholder="Nhập thứ tự"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Bulk Add Modal */}
            <Modal
                title={<><AppstoreAddOutlined /> Thêm nhanh nhiều chi phí</>}
                open={isBulkModalVisible}
                onCancel={() => {
                    setIsBulkModalVisible(false);
                    bulkForm.resetFields();
                }}
                onOk={() => bulkForm.submit()}
                width={1000}
                okText="Lưu tất cả"
                cancelText="Hủy"
            >
                <Form
                    form={bulkForm}
                    layout="vertical"
                    onFinish={handleBulkSubmit}
                >
                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                <Table
                                    dataSource={fields}
                                    pagination={false}
                                    size="small"
                                    scroll={{ x: 800 }}
                                    columns={[
                                        {
                                            title: '#',
                                            width: 50,
                                            render: (_, __, index) => index + 1,
                                        },
                                        {
                                            title: 'Tên chi phí',
                                            width: 250,
                                            render: (_, field) => (
                                                <Form.Item
                                                    name={[field.name, 'name']}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Input placeholder="Nhập tên chi phí" />
                                                </Form.Item>
                                            ),
                                        },
                                        {
                                            title: 'Giá trị',
                                            width: 150,
                                            render: (_, field) => (
                                                <Form.Item
                                                    name={[field.name, 'price']}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <InputNumber
                                                        style={{ width: '100%' }}
                                                        placeholder="Giá trị"
                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        min={0}
                                                    />
                                                </Form.Item>
                                            ),
                                        },
                                        {
                                            title: (
                                                <div>
                                                    <div>Tòa nhà</div>
                                                    <Checkbox
                                                        checked={applyAllApartment}
                                                        onChange={(e) => {
                                                            setApplyAllApartment(e.target.checked);
                                                            if (!e.target.checked) {
                                                                setCommonApartmentId(undefined);
                                                            }
                                                        }}
                                                        style={{ fontSize: 12 }}
                                                    >
                                                        Áp dụng tất cả
                                                    </Checkbox>
                                                    {applyAllApartment && (
                                                        <Select
                                                            placeholder="Chọn tòa nhà chung"
                                                            allowClear
                                                            showSearch
                                                            filterOption={filterOption}
                                                            style={{ width: '100%', marginTop: 4 }}
                                                            value={commonApartmentId}
                                                            onChange={(value) => setCommonApartmentId(value)}
                                                        >
                                                            {apartmentList.map(item => (
                                                                <Option key={item.id} value={item.id}>{item.name}</Option>
                                                            ))}
                                                        </Select>
                                                    )}
                                                </div>
                                            ),
                                            width: 200,
                                            render: (_, field) => (
                                                applyAllApartment ? (
                                                    <div style={{ textAlign: 'center', color: '#999' }}>
                                                        {commonApartmentId ? apartmentList.find(a => a.id === commonApartmentId)?.name : '-'}
                                                    </div>
                                                ) : (
                                                    <Form.Item
                                                        name={[field.name, 'apartment_id']}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <Select
                                                            placeholder="Chọn tòa nhà"
                                                            allowClear
                                                            showSearch
                                                            filterOption={filterOption}
                                                        >
                                                            {apartmentList.map(item => (
                                                                <Option key={item.id} value={item.id}>{item.name}</Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                )
                                            ),
                                        },
                                        {
                                            title: (
                                                <div>
                                                    <div>Loại chi</div>
                                                    <Checkbox
                                                        checked={applyAllLoaiChi}
                                                        onChange={(e) => {
                                                            setApplyAllLoaiChi(e.target.checked);
                                                            if (!e.target.checked) {
                                                                setCommonLoaiChiId(undefined);
                                                            }
                                                        }}
                                                        style={{ fontSize: 12 }}
                                                    >
                                                        Áp dụng tất cả
                                                    </Checkbox>
                                                    {applyAllLoaiChi && (
                                                        <Select
                                                            placeholder="Chọn loại chi chung"
                                                            allowClear
                                                            showSearch
                                                            filterOption={filterOption}
                                                            style={{ width: '100%', marginTop: 4 }}
                                                            value={commonLoaiChiId}
                                                            onChange={(value) => setCommonLoaiChiId(value)}
                                                        >
                                                            {loaiChiList.map(item => (
                                                                <Option key={item.id} value={item.id}>{item.name}</Option>
                                                            ))}
                                                        </Select>
                                                    )}
                                                </div>
                                            ),
                                            width: 180,
                                            render: (_, field) => (
                                                applyAllLoaiChi ? (
                                                    <div style={{ textAlign: 'center', color: '#999' }}>
                                                        {commonLoaiChiId ? loaiChiList.find(l => l.id === commonLoaiChiId)?.name : '-'}
                                                    </div>
                                                ) : (
                                                    <Form.Item
                                                        name={[field.name, 'loai_chi_id']}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <Select
                                                            placeholder="Chọn loại chi"
                                                            allowClear
                                                            showSearch
                                                            filterOption={filterOption}
                                                        >
                                                            {loaiChiList.map(item => (
                                                                <Option key={item.id} value={item.id}>{item.name}</Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                )
                                            ),
                                        },
                                        {
                                            title: 'Xóa',
                                            width: 60,
                                            align: 'center',
                                            render: (_, field) => (
                                                fields.length > 1 ? (
                                                    <Popconfirm
                                                        title="Xóa dòng này?"
                                                        onConfirm={() => remove(field.name)}
                                                        okText="Xóa"
                                                        cancelText="Hủy"
                                                    >
                                                        <Button
                                                            type="link"
                                                            danger
                                                            size="small"
                                                            icon={<MinusCircleOutlined />}
                                                        />
                                                    </Popconfirm>
                                                ) : null
                                            ),
                                        },
                                    ]}
                                />

                                <div style={{ marginTop: 16 }}>
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<PlusCircleOutlined />}
                                    >
                                        Thêm item
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </div>
    );
};

export default AitilenDauTu;
