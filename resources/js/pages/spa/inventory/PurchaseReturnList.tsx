import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, Space, message, Upload, Row, Col } from 'antd';
import { PlusOutlined, CheckOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface PurchaseReturn {
    id: number;
    ma_phieu: string;
    phieu_nhap_id: number;
    nha_cung_cap_id: number;
    ngay_tra: string;
    ly_do: string;
    trang_thai: string;
    tong_gia_tri: number;
    ghi_chu?: string;
    hinh_anh_minh_chung?: string;
    nha_cung_cap?: any;
    phieu_nhap?: any;
    chi_tiets?: any[];
}

const PurchaseReturnList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [returns, setReturns] = useState<PurchaseReturn[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<PurchaseReturn | null>(null);
    const [receipts, setReceipts] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm();

    useEffect(() => {
        loadReturns();
        loadSuppliers();
    }, []);

    const loadReturns = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/spa/tra-hang-nhap');
            setReturns(response.data.data || response.data);
        } catch (error) {
            message.error('Không thể tải danh sách phiếu trả hàng');
        } finally {
            setLoading(false);
        }
    };

    const loadSuppliers = async () => {
        try {
            const response = await axios.get('/spa/nha-cung-cap');
            setSuppliers(response.data.data || response.data);
        } catch (error) {
            console.error('Không thể tải nhà cung cấp');
        }
    };

    const loadReceipts = async (supplierId: number) => {
        try {
            const response = await axios.get(`/spa/tra-hang-nhap/supplier/${supplierId}/receipts`);
            setReceipts(response.data);
        } catch (error) {
            console.error('Không thể tải phiếu nhập');
        }
    };

    const loadReceiptProducts = async (receiptId: number) => {
        try {
            const response = await axios.get(`/spa/tra-hang-nhap/receipt/${receiptId}/products`);
            setProducts(response.data);
        } catch (error) {
            console.error('Không thể tải sản phẩm');
        }
    };

    const handleCreate = async (values: any) => {
        try {
            const formData = new FormData();
            formData.append('phieu_nhap_id', values.phieu_nhap_id);
            formData.append('nha_cung_cap_id', values.nha_cung_cap_id);
            formData.append('ngay_tra', values.ngay_tra.format('YYYY-MM-DD'));
            formData.append('ly_do', values.ly_do);
            formData.append('ghi_chu', values.ghi_chu || '');
            formData.append('chi_tiets', JSON.stringify(values.chi_tiets || []));

            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('hinh_anh_minh_chung', fileList[0].originFileObj);
            }

            await axios.post('/spa/tra-hang-nhap', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            message.success('Tạo phiếu trả hàng thành công');
            setModalVisible(false);
            form.resetFields();
            setFileList([]);
            loadReturns();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Tạo phiếu thất bại');
        }
    };

    const handleApprove = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận duyệt',
            content: 'Bạn có chắc muốn duyệt phiếu trả hàng này? Hàng sẽ được trừ khỏi kho.',
            onOk: async () => {
                try {
                    await axios.post(`/spa/tra-hang-nhap/${id}/approve`);
                    message.success('Duyệt phiếu thành công');
                    loadReturns();
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Duyệt phiếu thất bại');
                }
            }
        });
    };

    const getReasonTag = (reason: string) => {
        const reasonMap: any = {
            'hang_loi': { color: 'red', text: 'Hàng lỗi' },
            'het_han': { color: 'orange', text: 'Hết hạn' },
            'sai_quy_cach': { color: 'purple', text: 'Sai quy cách' },
            'khong_dung_don_hang': { color: 'blue', text: 'Không đúng đơn' },
            'khac': { color: 'default', text: 'Khác' }
        };
        const config = reasonMap[reason] || { color: 'default', text: reason };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const getStatusTag = (status: string) => {
        const statusMap: any = {
            'cho_duyet': { color: 'gold', text: 'Chờ duyệt' },
            'da_duyet': { color: 'green', text: 'Đã duyệt' },
            'huy': { color: 'red', text: 'Đã hủy' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
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
            title: 'Nhà cung cấp',
            dataIndex: ['nha_cung_cap', 'ten_ncc'],
            key: 'nha_cung_cap',
            width: 180,
        },
        {
            title: 'Phiếu nhập',
            dataIndex: ['phieu_nhap', 'ma_phieu'],
            key: 'phieu_nhap',
            width: 120,
        },
        {
            title: 'Ngày trả',
            dataIndex: 'ngay_tra',
            key: 'ngay_tra',
            width: 120,
            render: (date: string) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Lý do',
            dataIndex: 'ly_do',
            key: 'ly_do',
            width: 150,
            render: (reason: string) => getReasonTag(reason)
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 120,
            render: (status: string) => getStatusTag(status)
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
            render: (_, record: PurchaseReturn) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedReturn(record);
                            setDetailVisible(true);
                        }}
                    >
                        Chi tiết
                    </Button>
                    {record.trang_thai === 'cho_duyet' && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={() => handleApprove(record.id)}
                        >
                            Duyệt
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Quản lý trả hàng nhập"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setModalVisible(true)}
                    >
                        Tạo phiếu trả hàng
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={returns}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1300 }}
                    pagination={{
                        pageSize: 20,
                        showTotal: (total) => `Tổng ${total} phiếu`
                    }}
                />
            </Card>

            {/* Modal tạo phiếu */}
            <Modal
                title="Tạo phiếu trả hàng nhập"
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setFileList([]);
                }}
                width={900}
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
                                name="nha_cung_cap_id"
                                label="Nhà cung cấp"
                                rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
                            >
                                <Select
                                    placeholder="Chọn nhà cung cấp"
                                    onChange={(value) => loadReceipts(value)}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {suppliers.map(s => (
                                        <Option key={s.id} value={s.id}>
                                            {s.ten_ncc} - {s.sdt}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="phieu_nhap_id"
                                label="Phiếu nhập gốc"
                                rules={[{ required: true, message: 'Vui lòng chọn phiếu nhập' }]}
                            >
                                <Select
                                    placeholder="Chọn phiếu nhập cần trả"
                                    onChange={(value) => loadReceiptProducts(value)}
                                >
                                    {receipts.map(r => (
                                        <Option key={r.id} value={r.id}>
                                            {r.ma_phieu} - {dayjs(r.ngay_nhap).format('DD/MM/YYYY')}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ngay_tra"
                                label="Ngày trả"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày trả' }]}
                                initialValue={dayjs()}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ly_do"
                                label="Lý do trả hàng"
                                rules={[{ required: true, message: 'Vui lòng chọn lý do' }]}
                            >
                                <Select placeholder="Chọn lý do trả hàng">
                                    <Option value="hang_loi">Hàng lỗi</Option>
                                    <Option value="het_han">Hết hạn</Option>
                                    <Option value="sai_quy_cach">Sai quy cách</Option>
                                    <Option value="khong_dung_don_hang">Không đúng đơn hàng</Option>
                                    <Option value="khac">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ghi_chu"
                                label="Ghi chú"
                            >
                                <Input placeholder="Ghi chú chi tiết về lý do trả hàng..." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Hình ảnh minh chứng"
                            >
                                <Upload
                                    listType="picture-card"
                                    fileList={fileList}
                                    onChange={({ fileList }) => setFileList(fileList)}
                                    beforeUpload={() => false}
                                    maxCount={1}
                                >
                                    {fileList.length < 1 && (
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                        </div>
                                    )}
                                </Upload>
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
                                            rules={[{ required: true, message: 'Chọn SP' }]}
                                        >
                                            <Select placeholder="Sản phẩm" style={{ width: 300 }}>
                                                {products.map(p => (
                                                    <Option key={p.san_pham_id} value={p.san_pham_id}>
                                                        {p.san_pham?.ten_san_pham} (Đã nhập: {p.so_luong})
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'so_luong_tra']}
                                            rules={[{ required: true, message: 'Nhập SL' }]}
                                        >
                                            <InputNumber placeholder="SL trả" min={1} />
                                        </Form.Item>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'ghi_chu']}
                                        >
                                            <Input placeholder="Ghi chú" style={{ width: 200 }} />
                                        </Form.Item>
                                        <Button onClick={() => remove(field.name)} danger>Xóa</Button>
                                    </Space>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Thêm sản phẩm trả
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
                                setFileList([]);
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal chi tiết */}
            <Modal
                title={`Chi tiết phiếu ${selectedReturn?.ma_phieu}`}
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                width={900}
                footer={null}
            >
                {selectedReturn && (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <p><strong>NCC:</strong> {selectedReturn.nha_cung_cap?.ten_ncc}</p>
                            <p><strong>Phiếu nhập:</strong> {selectedReturn.phieu_nhap?.ma_phieu}</p>
                            <p><strong>Ngày trả:</strong> {dayjs(selectedReturn.ngay_tra).format('DD/MM/YYYY')}</p>
                            <p><strong>Lý do:</strong> {getReasonTag(selectedReturn.ly_do)}</p>
                            <p><strong>Ghi chú:</strong> {selectedReturn.ghi_chu}</p>
                            {selectedReturn.hinh_anh_minh_chung && (
                                <p>
                                    <strong>Hình ảnh:</strong>{' '}
                                    <a href={selectedReturn.hinh_anh_minh_chung} target="_blank" rel="noopener noreferrer">
                                        Xem ảnh minh chứng
                                    </a>
                                </p>
                            )}
                        </div>

                        <Table
                            dataSource={selectedReturn.chi_tiets}
                            rowKey="id"
                            pagination={false}
                            columns={[
                                { title: 'Sản phẩm', dataIndex: ['san_pham', 'ten_san_pham'], key: 'san_pham' },
                                { title: 'SL trả', dataIndex: 'so_luong_tra', key: 'sl', align: 'right', render: (v: number) => v?.toLocaleString() },
                                { title: 'Đơn giá', dataIndex: 'don_gia', key: 'gia', align: 'right', render: (v: number) => `${v?.toLocaleString()} đ` },
                                { title: 'Thành tiền', dataIndex: 'thanh_tien', key: 'tt', align: 'right', render: (v: number) => `${v?.toLocaleString()} đ` },
                                { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'note', ellipsis: true }
                            ]}
                        />
                    </>
                )}
            </Modal>
        </div>
    );
};

export default PurchaseReturnList;
