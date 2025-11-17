import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, Space, message, Steps, Alert, Row, Col } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

interface StockTransfer {
    id: number;
    ma_phieu: string;
    chi_nhanh_xuat_id: number;
    chi_nhanh_nhap_id: number;
    ngay_xuat: string;
    ngay_nhap?: string;
    trang_thai: string;
    tong_so_luong_xuat: number;
    tong_gia_tri: number;
    ghi_chu?: string;
    chi_nhanh_xuat?: any;
    chi_nhanh_nhap?: any;
    chi_tiets?: any[];
}

const StockTransferList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [transfers, setTransfers] = useState<StockTransfer[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);
    const [receiveVisible, setReceiveVisible] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [form] = Form.useForm();
    const [receiveForm] = Form.useForm();

    useEffect(() => {
        loadTransfers();
        loadBranches();
    }, []);

    useEffect(() => {
        if (receiveVisible && selectedTransfer) {
            receiveForm.setFieldsValue({
                chi_tiets: selectedTransfer.chi_tiets?.map(item => ({
                    id: item.id,
                    san_pham_id: item.san_pham_id,
                    ten_san_pham: item.san_pham?.ten_san_pham,
                    so_luong_xuat: item.so_luong_xuat,
                    so_luong_nhan: item.so_luong_xuat,
                    so_luong_hong: 0,
                    ly_do_hong: ''
                }))
            });
        }
    }, [receiveVisible, selectedTransfer]);

    const loadTransfers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/spa/chuyen-kho');
            setTransfers(response.data.data || response.data);
        } catch (error) {
            message.error('Không thể tải danh sách phiếu chuyển kho');
        } finally {
            setLoading(false);
        }
    };

    const loadBranches = async () => {
        try {
            const response = await axios.get('/spa/ton-kho-chi-nhanh/branches');
            setBranches(response.data);
        } catch (error) {
            console.error('Không thể tải chi nhánh');
        }
    };

    const loadProducts = async (branchId: number) => {
        try {
            const response = await axios.get(`/spa/ton-kho-chi-nhanh/branch/${branchId}`);
            setProducts(response.data.data || response.data);
        } catch (error) {
            console.error('Không thể tải sản phẩm');
        }
    };

    const handleCreate = async (values: any) => {
        try {
            // Validate chi nhánh xuất và nhập phải khác nhau
            if (values.chi_nhanh_xuat_id === values.chi_nhanh_nhap_id) {
                message.error('Chi nhánh xuất và chi nhánh nhập phải khác nhau!');
                return;
            }

            await axios.post('/spa/chuyen-kho', {
                ...values,
                ngay_xuat: values.ngay_xuat.format('YYYY-MM-DD'),
                ngay_du_kien_nhan: values.ngay_du_kien_nhan?.format('YYYY-MM-DD')
            });
            message.success('Tạo phiếu chuyển kho thành công');
            setModalVisible(false);
            form.resetFields();
            loadTransfers();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message ||
                           error.response?.data?.errors?.chi_nhanh_nhap_id?.[0] ||
                           'Tạo phiếu thất bại';
            message.error(errorMsg);
        }
    };

    const handleApprove = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận duyệt',
            content: 'Bạn có chắc muốn duyệt phiếu chuyển kho này? Hàng sẽ được trừ khỏi kho xuất.',
            onOk: async () => {
                try {
                    await axios.post(`/spa/chuyen-kho/${id}/approve`);
                    message.success('Duyệt phiếu thành công');
                    loadTransfers();
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Duyệt phiếu thất bại');
                }
            }
        });
    };

    const handleReceive = async (values: any) => {
        try {
            await axios.post(`/spa/chuyen-kho/${selectedTransfer?.id}/receive`, {
                chi_tiets: values.chi_tiets
            });
            message.success('Nhận hàng thành công');
            setReceiveVisible(false);
            receiveForm.resetFields();
            loadTransfers();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Nhận hàng thất bại');
        }
    };

    const handleCancel = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận hủy',
            content: 'Bạn có chắc muốn hủy phiếu chuyển kho này?',
            onOk: async () => {
                try {
                    await axios.post(`/spa/chuyen-kho/${id}/cancel`);
                    message.success('Hủy phiếu thành công');
                    loadTransfers();
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Hủy phiếu thất bại');
                }
            }
        });
    };

    const getStatusTag = (status: string) => {
        const statusMap: any = {
            'cho_duyet': { color: 'gold', text: 'Chờ duyệt' },
            'dang_chuyen': { color: 'blue', text: 'Đang chuyển' },
            'da_nhan': { color: 'green', text: 'Đã nhận' },
            'huy': { color: 'red', text: 'Đã hủy' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const getStatusStep = (status: string) => {
        const steps = ['cho_duyet', 'dang_chuyen', 'da_nhan'];
        return steps.indexOf(status);
    };

    const columns = [
        {
            title: 'Mã phiếu',
            dataIndex: 'ma_phieu',
            key: 'ma_phieu',
            width: 120,
            fixed: 'left' as const,
            render: (text: string) => <strong>{text}</strong>
        },
        {
            title: 'Chi nhánh xuất',
            dataIndex: ['chi_nhanh_xuat', 'name'],
            key: 'chi_nhanh_xuat',
            width: 150,
        },
        {
            title: 'Chi nhánh nhập',
            dataIndex: ['chi_nhanh_nhap', 'name'],
            key: 'chi_nhanh_nhap',
            width: 150,
        },
        {
            title: 'Ngày xuất',
            dataIndex: 'ngay_xuat',
            key: 'ngay_xuat',
            width: 120,
            render: (date: string) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 120,
            render: (status: string) => getStatusTag(status)
        },
        {
            title: 'SL xuất',
            dataIndex: 'tong_so_luong_xuat',
            key: 'tong_so_luong_xuat',
            width: 100,
            align: 'right' as const,
            render: (value: number) => value?.toLocaleString() || 0
        },
        {
            title: 'Tổng giá trị',
            dataIndex: 'tong_gia_tri',
            key: 'tong_gia_tri',
            width: 150,
            align: 'right' as const,
            render: (value: number) => `${value?.toLocaleString() || 0} đ`
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            fixed: 'right' as const,
            render: (_, record: StockTransfer) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedTransfer(record);
                            setDetailVisible(true);
                        }}
                    >
                        Chi tiết
                    </Button>
                    {record.trang_thai === 'cho_duyet' && (
                        <>
                            <Button
                                size="small"
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => handleApprove(record.id)}
                            >
                                Duyệt
                            </Button>
                            <Button
                                size="small"
                                danger
                                icon={<CloseOutlined />}
                                onClick={() => handleCancel(record.id)}
                            >
                                Hủy
                            </Button>
                        </>
                    )}
                    {record.trang_thai === 'dang_chuyen' && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={() => {
                                setSelectedTransfer(record);
                                setReceiveVisible(true);
                            }}
                        >
                            Nhận hàng
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Quản lý chuyển kho"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setModalVisible(true)}
                    >
                        Tạo phiếu chuyển
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={transfers}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{
                        pageSize: 20,
                        showTotal: (total) => `Tổng ${total} phiếu`
                    }}
                />
            </Card>

            {/* Modal tạo phiếu */}
            <Modal
                title="Tạo phiếu chuyển kho"
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                width={800}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreate}
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="chi_nhanh_xuat_id"
                                label="Chi nhánh xuất"
                                rules={[{ required: true, message: 'Vui lòng chọn chi nhánh xuất' }]}
                            >
                                <Select
                                    placeholder="Chọn chi nhánh xuất"
                                    onChange={(value) => {
                                        loadProducts(value);
                                        // Re-validate chi nhánh nhập khi thay đổi chi nhánh xuất
                                        form.validateFields(['chi_nhanh_nhap_id']);
                                    }}
                                >
                                    {branches.map(b => (
                                        <Option key={b.id} value={b.id}>{b.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="chi_nhanh_nhap_id"
                                label="Chi nhánh nhập"
                                dependencies={['chi_nhanh_xuat_id']}
                                rules={[
                                    { required: true, message: 'Vui lòng chọn chi nhánh nhập' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('chi_nhanh_xuat_id') !== value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Chi nhánh nhập phải khác chi nhánh xuất!'));
                                        },
                                    }),
                                ]}
                            >
                                <Select placeholder="Chọn chi nhánh nhập">
                                    {branches.map(b => (
                                        <Option key={b.id} value={b.id}>{b.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ngay_xuat"
                                label="Ngày xuất"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày xuất' }]}
                                initialValue={dayjs()}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ngay_du_kien_nhan"
                                label="Ngày dự kiến nhận"
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ly_do"
                                label="Lý do chuyển"
                            >
                                <Input placeholder="Nhập lý do chuyển kho" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ghi_chu"
                                label="Ghi chú"
                            >
                                <Input placeholder="Ghi chú thêm..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.List name="chi_tiets">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map((field, index) => (
                                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'san_pham_id']}
                                            rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                                        >
                                            <Select placeholder="Sản phẩm" style={{ width: 250 }}>
                                                {products.map(p => (
                                                    <Option key={p.san_pham_id} value={p.san_pham_id}>
                                                        {p.san_pham?.ten_san_pham} (Tồn: {p.so_luong_ton})
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'so_luong_xuat']}
                                            rules={[{ required: true, message: 'Nhập SL' }]}
                                        >
                                            <InputNumber placeholder="Số lượng" min={1} />
                                        </Form.Item>
                                        <Button onClick={() => remove(field.name)} danger>Xóa</Button>
                                    </Space>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Thêm sản phẩm
                                </Button>
                            </>
                        )}
                    </Form.List>

                    <Form.Item style={{ marginTop: 16 }}>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Tạo phiếu
                            </Button>
                            <Button onClick={() => {
                                setModalVisible(false);
                                form.resetFields();
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal chi tiết */}
            <Modal
                title={`Chi tiết phiếu ${selectedTransfer?.ma_phieu}`}
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                width={900}
                footer={null}
            >
                {selectedTransfer && (
                    <>
                        <Steps current={getStatusStep(selectedTransfer.trang_thai)} style={{ marginBottom: 24 }}>
                            <Step title="Chờ duyệt" />
                            <Step title="Đang chuyển" />
                            <Step title="Đã nhận" />
                        </Steps>

                        <Table
                            dataSource={selectedTransfer.chi_tiets}
                            rowKey="id"
                            pagination={false}
                            columns={[
                                { title: 'Sản phẩm', dataIndex: ['san_pham', 'ten_san_pham'], key: 'san_pham' },
                                { title: 'SL xuất', dataIndex: 'so_luong_xuat', key: 'xuat', align: 'right' },
                                { title: 'SL nhận', dataIndex: 'so_luong_nhan', key: 'nhan', align: 'right' },
                                { title: 'SL hỏng', dataIndex: 'so_luong_hong', key: 'hong', align: 'right' },
                                { title: 'Đơn giá', dataIndex: 'gia_von', key: 'gia', align: 'right', render: (v: number) => `${v?.toLocaleString()} đ` }
                            ]}
                        />
                    </>
                )}
            </Modal>

            {/* Modal nhận hàng */}
            <Modal
                title={`Nhận hàng - ${selectedTransfer?.ma_phieu}`}
                open={receiveVisible}
                onCancel={() => {
                    setReceiveVisible(false);
                    receiveForm.resetFields();
                }}
                width={800}
                footer={null}
            >
                <Form
                    form={receiveForm}
                    layout="vertical"
                    onFinish={handleReceive}
                >
                    <Alert
                        message="Xác nhận số lượng thực nhận"
                        description="Vui lòng nhập số lượng thực tế nhận được và số lượng hỏng (nếu có)"
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <Form.List name="chi_tiets">
                        {(fields) => (
                            <>
                                {fields.map((field, index) => {
                                    const item = selectedTransfer?.chi_tiets?.[index];
                                    return (
                                        <Card key={field.key} size="small" style={{ marginBottom: 16 }}>
                                            <Form.Item name={[field.name, 'id']} hidden>
                                                <Input />
                                            </Form.Item>
                                            <Form.Item name={[field.name, 'san_pham_id']} hidden>
                                                <Input />
                                            </Form.Item>

                                            <div style={{ marginBottom: 8 }}>
                                                <strong>{item?.san_pham?.ten_san_pham}</strong>
                                                <br />
                                                <span style={{ color: '#999' }}>
                                                    Số lượng xuất: {item?.so_luong_xuat}
                                                </span>
                                            </div>

                                            <Space style={{ width: '100%' }} direction="vertical">
                                                <Space>
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'so_luong_nhan']}
                                                        label="Số lượng nhận"
                                                        rules={[
                                                            { required: true, message: 'Nhập SL nhận' },
                                                            { type: 'number', min: 0, message: 'SL >= 0' }
                                                        ]}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <InputNumber
                                                            min={0}
                                                            max={item?.so_luong_xuat}
                                                            style={{ width: 120 }}
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'so_luong_hong']}
                                                        label="Số lượng hỏng"
                                                        rules={[
                                                            { required: true, message: 'Nhập SL hỏng' },
                                                            { type: 'number', min: 0, message: 'SL >= 0' }
                                                        ]}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <InputNumber
                                                            min={0}
                                                            max={item?.so_luong_xuat}
                                                            style={{ width: 120 }}
                                                        />
                                                    </Form.Item>
                                                </Space>

                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, 'ly_do_hong']}
                                                    label="Lý do hỏng (nếu có)"
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Input.TextArea
                                                        rows={2}
                                                        placeholder="Mô tả tình trạng hỏng hóc..."
                                                    />
                                                </Form.Item>
                                            </Space>
                                        </Card>
                                    );
                                })}
                            </>
                        )}
                    </Form.List>

                    <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Xác nhận nhận hàng
                            </Button>
                            <Button onClick={() => {
                                setReceiveVisible(false);
                                receiveForm.resetFields();
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

export default StockTransferList;
