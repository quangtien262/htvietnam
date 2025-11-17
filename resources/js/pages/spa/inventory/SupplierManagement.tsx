import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Tag, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

interface Supplier {
    id: number;
    ma_nha_cung_cap: string;
    ten_nha_cung_cap: string;
    dia_chi?: string;
    so_dien_thoai?: string;
    email?: string;
    nguoi_lien_he?: string;
    ma_so_thue?: string;
    trang_thai: string;
    ghi_chu?: string;
}

const SupplierManagement: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [form] = Form.useForm();

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async (search?: string, status?: string) => {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            if (status !== undefined && status !== '') params.trang_thai = status;

            const response = await axios.get('/spa/nha-cung-cap', { params });
            setSuppliers(response.data.data || response.data);
        } catch (error) {
            message.error('Không thể tải danh sách nhà cung cấp');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        loadSuppliers(searchText, statusFilter);
    };

    const handleReset = () => {
        setSearchText('');
        setStatusFilter('');
        loadSuppliers();
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingSupplier) {
                await axios.put(`/spa/nha-cung-cap/${editingSupplier.id}`, values);
                message.success('Cập nhật nhà cung cấp thành công');
            } else {
                await axios.post('/spa/nha-cung-cap', values);
                message.success('Thêm nhà cung cấp thành công');
            }
            setModalVisible(false);
            form.resetFields();
            setEditingSupplier(null);
            loadSuppliers();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lưu thất bại');
        }
    };

    const handleEdit = (record: Supplier) => {
        setEditingSupplier(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc muốn xóa nhà cung cấp này?',
            okType: 'danger',
            onOk: async () => {
                try {
                    await axios.delete(`/spa/nha-cung-cap/${id}`);
                    message.success('Xóa nhà cung cấp thành công');
                    loadSuppliers();
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Xóa thất bại');
                }
            }
        });
    };

    const handleToggleStatus = async (id: number, currentStatus: string) => {
        try {
            await axios.post(`/spa/nha-cung-cap/${id}/toggle-status`);
            message.success('Cập nhật trạng thái thành công');
            loadSuppliers();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Cập nhật thất bại');
        }
    };

    const columns = [
        {
            title: 'Mã NCC',
            dataIndex: 'ma_nha_cung_cap',
            key: 'ma_nha_cung_cap',
            width: 120,
            fixed: 'left' as const,
            render: (text: string) => <strong>{text}</strong>
        },
        {
            title: 'Tên nhà cung cấp',
            dataIndex: 'ten_nha_cung_cap',
            key: 'ten_nha_cung_cap',
            width: 200,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'so_dien_thoai',
            key: 'so_dien_thoai',
            width: 130,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 200,
            ellipsis: true
        },
        {
            title: 'Người liên hệ',
            dataIndex: 'nguoi_lien_he',
            key: 'nguoi_lien_he',
            width: 150,
        },
        {
            title: 'Mã số thuế',
            dataIndex: 'ma_so_thue',
            key: 'ma_so_thue',
            width: 150,
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'dia_chi',
            key: 'dia_chi',
            width: 250,
            ellipsis: true
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 120,
            render: (status: string) => (
                status === 'active' ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">Hoạt động</Tag>
                ) : (
                    <Tag icon={<CloseCircleOutlined />} color="error">Ngừng</Tag>
                )
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            fixed: 'right' as const,
            render: (_, record: Supplier) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        size="small"
                        type={record.trang_thai === 'active' ? 'default' : 'primary'}
                        onClick={() => handleToggleStatus(record.id, record.trang_thai)}
                    >
                        {record.trang_thai === 'active' ? 'Tắt' : 'Bật'}
                    </Button>
                    <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    >
                        Xóa
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Quản lý nhà cung cấp"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingSupplier(null);
                            form.resetFields();
                            setModalVisible(true);
                        }}
                    >
                        Thêm nhà cung cấp
                    </Button>
                }
            >
                {/* Search filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Input
                            placeholder="Tìm theo tên, mã, SĐT, email..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={handleSearch}
                            allowClear
                        />
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="Trạng thái"
                            style={{ width: '100%' }}
                            value={statusFilter}
                            onChange={(value) => setStatusFilter(value)}
                            allowClear
                        >
                            <Option value="active">Hoạt động</Option>
                            <Option value="inactive">Ngừng hoạt động</Option>
                        </Select>
                    </Col>
                    <Col span={10}>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                                Tìm kiếm
                            </Button>
                            <Button onClick={handleReset}>
                                Đặt lại
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={suppliers}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1600 }}
                    pagination={{
                        pageSize: 20,
                        showTotal: (total) => `Tổng ${total} nhà cung cấp`
                    }}
                />
            </Card>

            {/* Modal thêm/sửa */}
            <Modal
                title={editingSupplier ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingSupplier(null);
                }}
                width={700}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ trang_thai: 'active' }}
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ma_nha_cung_cap"
                                label="Mã nhà cung cấp"
                                tooltip="Để trống để tự động tạo mã (VD: NCC001)"
                            >
                                <Input
                                    placeholder="Tự động tạo nếu để trống"
                                    disabled
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ten_nha_cung_cap"
                                label="Tên nhà cung cấp"
                                rules={[{ required: true, message: 'Vui lòng nhập tên NCC' }]}
                            >
                                <Input placeholder="Nhập tên đầy đủ của nhà cung cấp" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ma_so_thue"
                                label="Mã số thuế"
                                rules={[
                                    { pattern: /^[0-9]{10,13}$/, message: 'MST phải là 10-13 chữ số' }
                                ]}
                            >
                                <Input placeholder="Mã số thuế (10-13 số)" maxLength={13} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="so_dien_thoai"
                                label="Số điện thoại chính"
                                rules={[
                                    { pattern: /^[0-9]{10,11}$/, message: 'SĐT phải là 10-11 chữ số' }
                                ]}
                            >
                                <Input placeholder="Số điện thoại công ty" maxLength={11} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { type: 'email', message: 'Email không hợp lệ' }
                                ]}
                            >
                                <Input placeholder="Email liên hệ" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="nguoi_lien_he"
                                label="Người liên hệ"
                            >
                                <Input placeholder="Tên người liên hệ" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="trang_thai"
                                label="Trạng thái"
                            >
                                <Select>
                                    <Option value="active">Hoạt động</Option>
                                    <Option value="inactive">Ngừng hoạt động</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24}>
                            <Form.Item
                                name="dia_chi"
                                label="Địa chỉ"
                            >
                                <Input placeholder="Địa chỉ trụ sở chính" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="ghi_chu"
                        label="Ghi chú"
                    >
                        <TextArea rows={3} placeholder="Ghi chú thêm về nhà cung cấp..." />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingSupplier ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                            <Button onClick={() => {
                                setModalVisible(false);
                                form.resetFields();
                                setEditingSupplier(null);
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

export default SupplierManagement;
