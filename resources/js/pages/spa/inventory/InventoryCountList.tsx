import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, Space, message, Alert, Row, Col } from 'antd';
import { PlusOutlined, CheckOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import API_SPA from '../../../common/api_spa';
import { API } from '../../../common/api';

const { Option } = Select;
const { TextArea } = Input;

interface InventoryCount {
    id: number;
    ma_phieu: string;
    chi_nhanh_id: number;
    loai_kiem_kho: string;
    ngay_kiem: string;
    trang_thai: string;
    ghi_chu?: string;
    chi_nhanh?: any;
    chi_tiets?: any[];
}

const InventoryCountList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [counts, setCounts] = useState<InventoryCount[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);
    const [approveVisible, setApproveVisible] = useState(false);
    const [selectedCount, setSelectedCount] = useState<InventoryCount | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [form] = Form.useForm();
    const [approveForm] = Form.useForm();

    useEffect(() => {
        loadCounts();
        loadBranches();
    }, []);

    const loadCounts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API.kiemKhoList);
            const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            setCounts(data);
        } catch (error) {
            console.error('Không thể tải danh sách kiểm kê', error);
            message.error('Không thể tải danh sách kiểm kê');
            setCounts([]);
        } finally {
            setLoading(false);
        }
    };

    const loadBranches = async () => {
        try {
            const response = await axios.get(API.spaBranchList);
            const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            setBranches(data.filter((b: any) => b.is_active));
        } catch (error) {
            console.error('Không thể tải chi nhánh', error);
            message.error('Không thể tải danh sách chi nhánh');
            setBranches([]);
        }
    };

    const loadProducts = async (branchId: number) => {
        try {
            const response = await axios.get(API.tonKhoChiNhanhByBranch(branchId));
            console.log('API response:', response.data);
            // API returns { data: [], statistics: {} }
            const tonKhoList = response.data?.data || [];
            console.log('TonKho list:', tonKhoList);

            // Map TonKhoChiNhanh to product format expected by form
            const mappedProducts = tonKhoList.map((tk: any) => ({
                id: tk.san_pham_id,
                san_pham_id: tk.san_pham_id,
                ten_san_pham: tk.san_pham?.ten_san_pham || tk.ten_san_pham,
                ma_san_pham: tk.san_pham?.ma_san_pham || tk.ma_san_pham,
                ton_kho: tk.so_luong_ton,
                so_luong_ton: tk.so_luong_ton,
                don_vi_tinh: tk.san_pham?.don_vi_tinh,
            }));
            console.log('Mapped products:', mappedProducts);
            setProducts(mappedProducts);
        } catch (error) {
            console.error('Không thể tải sản phẩm', error);
            message.error('Không thể tải danh sách sản phẩm');
            setProducts([]);
        }
    };

    const handleCreate = async (values: any) => {
        try {
            await axios.post(API.kiemKhoCreate, {
                ...values,
                ngay_kiem: values.ngay_kiem.format('YYYY-MM-DD')
            });
            message.success('Tạo phiếu kiểm kê thành công');
            setModalVisible(false);
            form.resetFields();
            loadCounts();
        } catch (error: any) {
            console.error('Lỗi tạo phiếu kiểm kê:', error);
            message.error(error.response?.data?.message || 'Tạo phiếu thất bại');
        }
    };

    const handleSubmit = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận trình duyệt',
            content: 'Bạn có chắc muốn trình duyệt phiếu kiểm kê này?',
            onOk: async () => {
                try {
                    await axios.post(API.kiemKhoSubmit(id));
                    message.success('Trình duyệt phiếu thành công');
                    loadCounts();
                } catch (error: any) {
                    console.error('Lỗi trình duyệt phiếu:', error);
                    message.error(error.response?.data?.message || 'Trình duyệt thất bại');
                }
            }
        });
    };

    const handleApprove = async (values: any) => {
        try {
            await axios.post(API_SPA.spaInventoryCountApprove(selectedCount?.id), {
                chi_tiets: selectedCount?.chi_tiets?.map(item => ({
                    id: item.id,
                    so_luong_thuc_te: item.so_luong_thuc_te,
                    ghi_chu: item.ghi_chu
                }))
            });
            message.success('Duyệt kiểm kê thành công - Tồn kho đã được điều chỉnh');
            setApproveVisible(false);
            loadCounts();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Duyệt phiếu thất bại');
        }
    };

    const getTypeTag = (type: string) => {
        const typeMap: any = {
            'dinh_ky': { color: 'blue', text: 'Định kỳ' },
            'dot_xuat': { color: 'orange', text: 'Đột xuất' },
            'theo_danh_muc': { color: 'purple', text: 'Theo danh mục' },
            'toan_bo': { color: 'cyan', text: 'Toàn bộ' }
        };
        const config = typeMap[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const getStatusTag = (status: string) => {
        const statusMap: any = {
            'nhap': { color: 'default', text: 'Đang nhập' },
            'cho_duyet': { color: 'gold', text: 'Chờ duyệt' },
            'da_duyet': { color: 'green', text: 'Đã duyệt' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const calculateDiscrepancy = (systemQty: number, actualQty: number) => {
        const diff = actualQty - systemQty;
        if (diff === 0) return <Tag color="default">Đúng</Tag>;
        if (diff > 0) return <Tag color="green">+{diff}</Tag>;
        return <Tag color="red">{diff}</Tag>;
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
            title: 'Chi nhánh',
            dataIndex: ['chi_nhanh', 'ten_chi_nhanh'],
            key: 'chi_nhanh',
            width: 150,
        },
        {
            title: 'Loại kiểm kê',
            dataIndex: 'loai_kiem_kho',
            key: 'loai_kiem_kho',
            width: 130,
            render: (type: string) => getTypeTag(type)
        },
        {
            title: 'Ngày kiểm',
            dataIndex: 'ngay_kiem',
            key: 'ngay_kiem',
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
            title: 'Ghi chú',
            dataIndex: 'ghi_chu',
            key: 'ghi_chu',
            width: 200,
            ellipsis: true
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            fixed: 'right' as const,
            render: (_, record: InventoryCount) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedCount(record);
                            setDetailVisible(true);
                        }}
                    >
                        Chi tiết
                    </Button>
                    {record.trang_thai === 'nhap' && (
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => handleSubmit(record.id)}
                        >
                            Trình duyệt
                        </Button>
                    )}
                    {record.trang_thai === 'cho_duyet' && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={() => {
                                setSelectedCount(record);
                                setApproveVisible(true);
                            }}
                        >
                            Duyệt
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    const detailColumns = [
        {
            title: 'Sản phẩm',
            dataIndex: ['san_pham', 'ten_san_pham'],
            key: 'san_pham',
        },
        {
            title: 'SL hệ thống',
            dataIndex: 'so_luong_he_thong',
            key: 'he_thong',
            align: 'right' as const,
            render: (value: number) => value?.toLocaleString()
        },
        {
            title: 'SL thực tế',
            dataIndex: 'so_luong_thuc_te',
            key: 'thuc_te',
            align: 'right' as const,
            render: (value: number) => <strong>{value?.toLocaleString()}</strong>
        },
        {
            title: 'Chênh lệch',
            key: 'diff',
            align: 'center' as const,
            render: (_, record: any) => calculateDiscrepancy(record.so_luong_he_thong, record.so_luong_thuc_te)
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghi_chu',
            key: 'ghi_chu',
            ellipsis: true
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Quản lý kiểm kê"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setModalVisible(true)}
                    >
                        Tạo phiếu kiểm kê
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={counts}
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
                title="Tạo phiếu kiểm kê"
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
                                name="chi_nhanh_id"
                                label="Chi nhánh"
                                rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
                            >
                                <Select
                                    placeholder="Chọn chi nhánh"
                                    onChange={(value) => loadProducts(value)}
                                >
                                    {branches.map(b => (
                                        <Option key={b.id} value={b.id}>{b.ten_chi_nhanh}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="loai_kiem_kho"
                                label="Loại kiểm kê"
                                rules={[{ required: true, message: 'Vui lòng chọn loại kiểm kê' }]}
                            >
                                <Select placeholder="Chọn loại kiểm kê">
                                    <Option value="dinh_ky">Định kỳ</Option>
                                    <Option value="dot_xuat">Đột xuất</Option>
                                    <Option value="theo_danh_muc">Theo danh mục</Option>
                                    <Option value="toan_bo">Toàn bộ</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ngay_kiem"
                                label="Ngày kiểm kê"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày kiểm kê' }]}
                                initialValue={dayjs()}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ghi_chu"
                                label="Ghi chú"
                            >
                                <Input placeholder="Ghi chú về đợt kiểm kê..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Alert
                        message="Hướng dẫn"
                        description="Sau khi tạo phiếu, bạn cần nhập số lượng thực tế cho từng sản phẩm trong chi tiết phiếu. Hệ thống sẽ tự động tính chênh lệch và điều chỉnh tồn kho khi duyệt."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

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
                                            <Select placeholder="Sản phẩm" style={{ width: 300 }}>
                                                {products.map(p => (
                                                    <Option key={p.id} value={p.id}>
                                                        {p.ten_san_pham} (Tồn: {p.ton_kho || 0})
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'so_luong_thuc_te']}
                                            rules={[{ required: true, message: 'Nhập SL' }]}
                                        >
                                            <InputNumber placeholder="SL thực tế" min={0} />
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
                                    Thêm sản phẩm kiểm kê
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
                title={`Chi tiết phiếu ${selectedCount?.ma_phieu}`}
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                width={900}
                footer={null}
            >
                {selectedCount && (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <p><strong>Chi nhánh:</strong> {selectedCount.chi_nhanh?.ten_chi_nhanh}</p>
                            <p><strong>Loại:</strong> {getTypeTag(selectedCount.loai_kiem_kho)}</p>
                            <p><strong>Ngày kiểm:</strong> {dayjs(selectedCount.ngay_kiem).format('DD/MM/YYYY')}</p>
                            <p><strong>Trạng thái:</strong> {getStatusTag(selectedCount.trang_thai)}</p>
                        </div>

                        {selectedCount.chi_tiets && selectedCount.chi_tiets.some((item: any) =>
                            item.so_luong_thuc_te !== item.so_luong_he_thong
                        ) && (
                            <Alert
                                message="Có chênh lệch"
                                description={`Phát hiện ${selectedCount.chi_tiets.filter((item: any) =>
                                    item.so_luong_thuc_te !== item.so_luong_he_thong
                                ).length} sản phẩm có chênh lệch giữa thực tế và hệ thống`}
                                type="warning"
                                showIcon
                                icon={<WarningOutlined />}
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        <Table
                            dataSource={selectedCount.chi_tiets}
                            columns={detailColumns}
                            rowKey="id"
                            pagination={false}
                        />
                    </>
                )}
            </Modal>

            {/* Modal duyệt */}
            <Modal
                title="Duyệt phiếu kiểm kê"
                open={approveVisible}
                onOk={() => approveForm.submit()}
                onCancel={() => setApproveVisible(false)}
                width={900}
                okText="Duyệt và điều chỉnh tồn kho"
                okButtonProps={{ danger: true }}
            >
                <Alert
                    message="Xác nhận duyệt"
                    description="Khi duyệt, hệ thống sẽ tự động điều chỉnh tồn kho theo số lượng thực tế. Hãy kiểm tra kỹ trước khi duyệt!"
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Form form={approveForm} onFinish={handleApprove}>
                    {selectedCount && (
                        <Table
                            dataSource={selectedCount.chi_tiets}
                            columns={detailColumns}
                            rowKey="id"
                            pagination={false}
                        />
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default InventoryCountList;
