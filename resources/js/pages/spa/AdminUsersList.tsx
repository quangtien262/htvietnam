import React, { useState, useEffect } from 'react';
import {
    Table, Card, Button, Space, message, Modal, Form, Input, Row, Col, Select, DatePicker,
    Tag, Popconfirm, Avatar, Tabs
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
    UserOutlined, PhoneOutlined, MailOutlined, IdcardOutlined, BankOutlined,
    SafetyOutlined, FileTextOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';
import API from '../../common/api';

const { Option } = Select;

interface AdminUser {
    id: number;
    code?: string;
    name: string;
    username?: string;
    email?: string;
    phone: string;
    cmnd: string;
    ngay_cap: string;
    noi_cap?: string;
    birthday?: string;
    gioi_tinh_id?: number;
    chi_nhanh_id: number;
    chuc_vu_id: number;
    admin_user_status_id: number;
    ngay_vao_lam: string;
    address?: string;
    description?: string;
    image?: string;
    permission_group_id?: number;
    chi_nhanh?: { id: number; name: string };
    chuc_vu?: { id: number; name: string };
    admin_user_status?: { id: number; name: string };
}

interface SearchParams {
    search?: string;
    chi_nhanh_id?: number;
    admin_user_status_id?: number;
    chuc_vu_id?: number;
    ngay_vao_lam_from?: string;
    ngay_vao_lam_to?: string;
}

const AdminUsersList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<AdminUser[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingRecord, setEditingRecord] = useState<AdminUser | null>(null);
    const [form] = Form.useForm();
    const [searchParams, setSearchParams] = useState<SearchParams>({});

    // Danh sách select options
    const [chiNhanhList, setChiNhanhList] = useState<any[]>([]);
    const [chucVuList, setChucVuList] = useState<any[]>([]);
    const [statusList, setStatusList] = useState<any[]>([]);
    const [gioiTinhList, setGioiTinhList] = useState<any[]>([]);
    const [permissionGroupList, setPermissionGroupList] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
        fetchSelectOptions();
    }, [pagination.current, searchParams]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.post('/aio/api/api/setting/admin_users/list', {
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

    const fetchSelectOptions = async () => {
        try {
            const [chiNhanhRes, chucVuRes, statusRes, gioiTinhRes, permissionRes] = await Promise.all([
                axios.post('/aio/api/api/setting/admin_users/select-options', { type: 'chi_nhanh' }),
                axios.post('/aio/api/api/setting/admin_users/select-options', { type: 'chuc_vu' }),
                axios.post('/aio/api/api/setting/admin_users/select-options', { type: 'admin_user_status' }),
                axios.post('/aio/api/api/setting/admin_users/select-options', { type: 'gioi_tinh' }),
                axios.post('/aio/api/api/setting/admin_users/select-options', { type: 'permission_group' }),
            ]);

            setChiNhanhList(chiNhanhRes.data.data || []);
            setChucVuList(chucVuRes.data.data || []);
            setStatusList(statusRes.data.data || []);
            setGioiTinhList(gioiTinhRes.data.data || []);
            setPermissionGroupList(permissionRes.data.data || []);
        } catch (error) {
            console.error('Error fetching select options:', error);
        }
    };

    const handleAdd = () => {
        setModalMode('add');
        setEditingRecord(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: AdminUser) => {
        setModalMode('edit');
        setEditingRecord(record);
        form.setFieldsValue({
            ...record,
            birthday: record.birthday ? dayjs(record.birthday) : null,
            ngay_cap: record.ngay_cap ? dayjs(record.ngay_cap) : null,
            ngay_vao_lam: record.ngay_vao_lam ? dayjs(record.ngay_vao_lam) : null,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (ids: number[]) => {
        try {
            const res = await axios.post('/aio/api/api/setting/admin_users/delete', { ids });

            if (res?.data?.status_code === 200) {
                message.success('Xóa thành công');
                fetchData();
            } else {
                message.error(res?.data?.message || 'Có lỗi xảy ra khi xóa');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            // Format dates
            const data = {
                ...values,
                birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null,
                ngay_cap: values.ngay_cap ? values.ngay_cap.format('YYYY-MM-DD') : null,
                ngay_vao_lam: values.ngay_vao_lam ? values.ngay_vao_lam.format('YYYY-MM-DD') : null,
            };

            const endpoint = modalMode === 'add'
                ? '/aio/api/api/setting/admin_users/create'
                : `/aio/api/api/setting/admin_users/update/${editingRecord?.id}`;

            const res = await axios.post(endpoint, data);

            if (res?.data?.status_code === 200) {
                message.success(modalMode === 'add' ? 'Thêm mới thành công' : 'Cập nhật thành công');
                setIsModalVisible(false);
                form.resetFields();
                fetchData();
            } else {
                message.error(res?.data?.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                Object.keys(errors).forEach(key => {
                    message.error(errors[key][0]);
                });
            } else {
                message.error(error.response?.data?.message || 'Có lỗi xảy ra');
            }
        }
    };

    const handleTableChange = (newPagination: any) => {
        setPagination(newPagination);
    };

    const handleSearch = () => {
        setPagination({ ...pagination, current: 1 });
        fetchData();
    };

    const handleReset = () => {
        setSearchParams({});
        setPagination({ ...pagination, current: 1 });
    };

    const columns: ColumnsType<AdminUser> = [
        {
            title: 'Mã NV',
            dataIndex: 'code',
            key: 'code',
            width: 100,
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Họ tên',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} src={record.image} />
                    <span style={{ fontWeight: 500 }}>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            render: (text) => (
                <Space>
                    <PhoneOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => text ? (
                <Space>
                    <MailOutlined />
                    {text}
                </Space>
            ) : '-',
        },
        {
            title: 'Chi nhánh',
            dataIndex: ['chi_nhanh', 'name'],
            key: 'chi_nhanh',
            render: (text) => text || '-',
        },
        {
            title: 'Chức vụ',
            dataIndex: ['chuc_vu', 'name'],
            key: 'chuc_vu',
            render: (text) => text || '-',
        },
        {
            title: 'Trạng thái',
            dataIndex: ['admin_user_status', 'name'],
            key: 'status',
            render: (text, record) => {
                const color = record.admin_user_status_id === 1 ? 'green' : 'red';
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Ngày vào làm',
            dataIndex: 'ngay_vao_lam',
            key: 'ngay_vao_lam',
            render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Thao tác',
            width: 150,
            fixed: 'right' as const,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete([record.id])}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title={
                    <Space>
                        <UserOutlined />
                        <span>Quản lý Nhân viên</span>
                    </Space>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm nhân viên
                    </Button>
                }
            >
                {/* Search */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Input
                            placeholder="Tìm theo tên, SĐT, email, mã NV..."
                            value={searchParams.search}
                            onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
                            onPressEnter={handleSearch}
                            prefix={<SearchOutlined />}
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Chi nhánh"
                            value={searchParams.chi_nhanh_id}
                            onChange={(value) => setSearchParams({ ...searchParams, chi_nhanh_id: value })}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {chiNhanhList.map(item => (
                                <Option key={item.id} value={item.id}>{item.name}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Chức vụ"
                            value={searchParams.chuc_vu_id}
                            onChange={(value) => setSearchParams({ ...searchParams, chuc_vu_id: value })}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {chucVuList.map(item => (
                                <Option key={item.id} value={item.id}>{item.name}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Trạng thái"
                            value={searchParams.admin_user_status_id}
                            onChange={(value) => setSearchParams({ ...searchParams, admin_user_status_id: value })}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {statusList.map(item => (
                                <Option key={item.id} value={item.id}>{item.name}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
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

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} nhân viên`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={modalMode === 'add' ? 'Thêm nhân viên' : 'Chỉnh sửa nhân viên'}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={900}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Tabs
                        defaultActiveKey="1"
                        items={[
                            {
                                key: '1',
                                label: (
                                    <span>
                                        <UserOutlined />
                                        Thông tin cá nhân
                                    </span>
                                ),
                                children: (
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Form.Item
                                                name="code"
                                                label="Mã nhân viên"
                                            >
                                                <Input placeholder="Tự động tạo nếu để trống" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={16}>
                                            <Form.Item
                                                name="name"
                                                label="Họ và tên"
                                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                                            >
                                                <Input placeholder="Nhập họ và tên" prefix={<UserOutlined />} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                name="phone"
                                                label="Số điện thoại"
                                                rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
                                            >
                                                <Input placeholder="Nhập SĐT" prefix={<PhoneOutlined />} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="email" label="Email">
                                                <Input placeholder="Nhập email" prefix={<MailOutlined />} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="birthday" label="Ngày sinh">
                                                <DatePicker
                                                    placeholder="Chọn ngày sinh"
                                                    format="DD/MM/YYYY"
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="gioi_tinh_id" label="Giới tính">
                                                <Select placeholder="Chọn giới tính">
                                                    {gioiTinhList.map(item => (
                                                        <Option key={item.id} value={item.id}>{item.name}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                name="cmnd"
                                                label="Số CCCD/CMND"
                                                rules={[{ required: true, message: 'Vui lòng nhập CCCD' }]}
                                            >
                                                <Input placeholder="Nhập số CCCD" prefix={<IdcardOutlined />} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                name="ngay_cap"
                                                label="Ngày cấp"
                                                rules={[{ required: true, message: 'Vui lòng chọn ngày cấp' }]}
                                            >
                                                <DatePicker
                                                    placeholder="Chọn ngày cấp"
                                                    format="DD/MM/YYYY"
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="noi_cap" label="Nơi cấp">
                                                <Input placeholder="Nhập nơi cấp" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item name="address" label="Địa chỉ">
                                                <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                ),
                            },
                            {
                                key: '2',
                                label: (
                                    <span>
                                        <FileTextOutlined />
                                        Thông tin công việc
                                    </span>
                                ),
                                children: (
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="chi_nhanh_id"
                                                label="Chi nhánh"
                                                rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
                                            >
                                                <Select placeholder="Chọn chi nhánh">
                                                    {chiNhanhList.map(item => (
                                                        <Option key={item.id} value={item.id}>{item.name}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="chuc_vu_id"
                                                label="Chức vụ"
                                                rules={[{ required: true, message: 'Vui lòng chọn chức vụ' }]}
                                            >
                                                <Select placeholder="Chọn chức vụ">
                                                    {chucVuList.map(item => (
                                                        <Option key={item.id} value={item.id}>{item.name}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="admin_user_status_id"
                                                label="Trạng thái"
                                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                                            >
                                                <Select placeholder="Chọn trạng thái">
                                                    {statusList.map(item => (
                                                        <Option key={item.id} value={item.id}>{item.name}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="ngay_vao_lam"
                                                label="Ngày vào làm"
                                                rules={[{ required: true, message: 'Vui lòng chọn ngày vào làm' }]}
                                            >
                                                <DatePicker
                                                    placeholder="Chọn ngày vào làm"
                                                    format="DD/MM/YYYY"
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item name="permission_group_id" label="Nhóm quyền">
                                                <Select placeholder="Chọn nhóm quyền" allowClear>
                                                    {permissionGroupList.map(item => (
                                                        <Option key={item.id} value={item.id}>{item.name}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item name="description" label="Ghi chú">
                                                <Input.TextArea rows={3} placeholder="Nhập ghi chú" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                ),
                            },
                            {
                                key: '3',
                                label: (
                                    <span>
                                        <SafetyOutlined />
                                        Thông tin đăng nhập
                                    </span>
                                ),
                                children: (
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name="username" label="Tên đăng nhập">
                                                <Input placeholder="Nhập tên đăng nhập" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="password"
                                                label="Mật khẩu"
                                                rules={modalMode === 'add' ? [] : []}
                                                help={modalMode === 'edit' ? 'Để trống nếu không muốn thay đổi' : ''}
                                            >
                                                <Input.Password placeholder="Nhập mật khẩu" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                ),
                            },
                        ]}
                    />

                    <Form.Item style={{ marginTop: 16 }}>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {modalMode === 'add' ? 'Thêm mới' : 'Cập nhật'}
                            </Button>
                            <Button onClick={() => setIsModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminUsersList;
