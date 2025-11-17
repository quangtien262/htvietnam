import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, Space, message, Upload, Row, Col, Statistic } from 'antd';
import { PlusOutlined, CheckOutlined, EyeOutlined, UploadOutlined, PieChartOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface Disposal {
    id: number;
    ma_phieu: string;
    chi_nhanh_id: number;
    ngay_xuat_huy: string;
    ly_do: string;
    trang_thai: string;
    tong_gia_tri_mat: number;
    ghi_chu?: string;
    hinh_anh_minh_chung?: string;
    chi_nhanh?: any;
    chi_tiets?: any[];
}

const DisposalList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [disposals, setDisposals] = useState<Disposal[]>([]);
    const [statistics, setStatistics] = useState<any>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);
    const [statsVisible, setStatsVisible] = useState(false);
    const [selectedDisposal, setSelectedDisposal] = useState<Disposal | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm();

    useEffect(() => {
        loadDisposals();
        loadBranches();
        loadStatistics();
    }, []);

    const loadDisposals = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/spa/xuat-huy');
            setDisposals(response.data.data || response.data);
        } catch (error) {
            message.error('Không thể tải danh sách phiếu xuất hủy');
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
            console.log('Products response:', response.data);
            const productList = response.data.data || response.data;
            console.log('Products list:', productList);
            setProducts(productList);
        } catch (error) {
            console.error('Không thể tải sản phẩm', error);
            message.error('Không thể tải danh sách sản phẩm');
        }
    };

    const loadStatistics = async () => {
        try {
            const response = await axios.get('/spa/xuat-huy/statistics');
            setStatistics(response.data);
        } catch (error) {
            console.error('Không thể tải thống kê');
        }
    };

    const handleCreate = async (values: any) => {
        try {
            // Validate chi_tiets
            if (!values.chi_tiets || values.chi_tiets.length === 0) {
                message.error('Vui lòng thêm ít nhất 1 sản phẩm xuất hủy');
                return;
            }

            const formData = new FormData();
            formData.append('chi_nhanh_id', values.chi_nhanh_id);
            formData.append('ngay_xuat', values.ngay_xuat_huy.format('YYYY-MM-DD'));
            formData.append('ly_do_huy', values.ly_do);
            formData.append('mo_ta_ly_do', values.ghi_chu || '');

            // Append chi_tiets as array items
            values.chi_tiets.forEach((item: any, index: number) => {
                formData.append(`chi_tiets[${index}][san_pham_id]`, item.san_pham_id);
                formData.append(`chi_tiets[${index}][so_luong_huy]`, item.so_luong_huy);
                if (item.ghi_chu) {
                    formData.append(`chi_tiets[${index}][ghi_chu]`, item.ghi_chu);
                }
            });

            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('hinh_anh_minh_chung', fileList[0].originFileObj);
            }

            await axios.post('/spa/xuat-huy', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            message.success('Tạo phiếu xuất hủy thành công');
            setModalVisible(false);
            form.resetFields();
            setFileList([]);
            loadDisposals();
            loadStatistics();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Tạo phiếu thất bại');
        }
    };

    const handleApprove = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận duyệt',
            content: 'Bạn có chắc muốn duyệt phiếu xuất hủy này? Hàng sẽ được trừ khỏi kho và không thể hoàn tác.',
            okType: 'danger',
            onOk: async () => {
                try {
                    await axios.post(`/spa/xuat-huy/${id}/approve`);
                    message.success('Duyệt phiếu thành công');
                    loadDisposals();
                    loadStatistics();
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Duyệt phiếu thất bại');
                }
            }
        });
    };

    const getReasonTag = (reason: string) => {
        const reasonMap: any = {
            'het_han': { color: 'orange', text: 'Hết hạn' },
            'hong_hoc': { color: 'red', text: 'Hỏng hóc' },
            'mat_chat_luong': { color: 'volcano', text: 'Mất chất lượng' },
            'bi_o_nhiem': { color: 'purple', text: 'Bị ô nhiễm' },
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
            title: 'Chi nhánh',
            dataIndex: ['chi_nhanh', 'name'],
            key: 'chi_nhanh',
            width: 150,
        },
        {
            title: 'Ngày xuất hủy',
            dataIndex: 'ngay_xuat_huy',
            key: 'ngay_xuat_huy',
            width: 130,
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
            title: 'Giá trị mất',
            dataIndex: 'tong_gia_tri_mat',
            key: 'tong_gia_tri_mat',
            width: 150,
            align: 'right' as const,
            render: (value: number) => (
                <span style={{ color: 'red', fontWeight: 'bold' }}>
                    {value?.toLocaleString() || 0} đ
                </span>
            )
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
            render: (_, record: Disposal) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedDisposal(record);
                            setDetailVisible(true);
                        }}
                    >
                        Chi tiết
                    </Button>
                    {record.trang_thai === 'cho_duyet' && (
                        <Button
                            size="small"
                            type="primary"
                            danger
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
                title="Quản lý xuất hủy"
                extra={
                    <Space>
                        <Button
                            icon={<PieChartOutlined />}
                            onClick={() => setStatsVisible(true)}
                        >
                            Thống kê
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setModalVisible(true)}
                        >
                            Tạo phiếu xuất hủy
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={disposals}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1400 }}
                    pagination={{
                        pageSize: 20,
                        showTotal: (total) => `Tổng ${total} phiếu`
                    }}
                />
            </Card>

            {/* Modal tạo phiếu */}
            <Modal
                title="Tạo phiếu xuất hủy"
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
                                name="chi_nhanh_id"
                                label="Chi nhánh"
                                rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
                            >
                                <Select
                                    placeholder="Chọn chi nhánh"
                                    onChange={(value) => loadProducts(value)}
                                >
                                    {branches.map(b => (
                                        <Option key={b.id} value={b.id}>{b.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ngay_xuat_huy"
                                label="Ngày xuất hủy"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                                initialValue={dayjs()}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ly_do"
                                label="Lý do xuất hủy"
                                rules={[{ required: true, message: 'Vui lòng chọn lý do' }]}
                            >
                                <Select placeholder="Chọn lý do xuất hủy">
                                    <Option value="het_han">Hết hạn sử dụng</Option>
                                    <Option value="hong_hoc">Hỏng hóc</Option>
                                    <Option value="mat_chat_luong">Mất chất lượng</Option>
                                    <Option value="bi_o_nhiem">Bị ô nhiễm</Option>
                                    <Option value="khac">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ghi_chu"
                                label="Ghi chú"
                                rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết' }]}
                            >
                                <Input placeholder="Mô tả chi tiết lý do xuất hủy..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Hình ảnh minh chứng (bắt buộc)"
                        required
                        rules={[{ required: true, message: 'Vui lòng tải lên hình ảnh minh chứng' }]}
                    >
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            beforeUpload={() => false}
                            maxCount={3}
                        >
                            {fileList.length < 3 && (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                </div>
                            )}
                        </Upload>
                        <small style={{ color: '#999' }}>Tải lên tối đa 3 ảnh chụp hàng hóa cần xuất hủy</small>
                    </Form.Item>

                    <Form.List name="chi_tiets">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map((field) => {
                                    const { key, ...restField } = field;
                                    return (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                            <Form.Item
                                                {...restField}
                                                name={[field.name, 'san_pham_id']}
                                                rules={[{ required: true, message: 'Chọn SP' }]}
                                            >
                                                <Select placeholder="Sản phẩm" style={{ width: 280 }}>
                                                    {products.map(p => (
                                                        <Option key={p.san_pham_id} value={p.san_pham_id}>
                                                            {p.san_pham?.ten_san_pham} (Tồn: {p.so_luong_ton})
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[field.name, 'so_luong_huy']}
                                                rules={[{ required: true, message: 'Nhập SL' }]}
                                            >
                                                <InputNumber placeholder="SL hủy" min={1} />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[field.name, 'ghi_chu']}
                                            >
                                                <Input placeholder="Ghi chú" style={{ width: 200 }} />
                                            </Form.Item>
                                            <Button onClick={() => remove(field.name)} danger>Xóa</Button>
                                        </Space>
                                    );
                                })}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Thêm sản phẩm xuất hủy
                                </Button>
                            </>
                        )}
                    </Form.List>

                    <Form.Item style={{ marginTop: 16 }}>
                        <Space>
                            <Button type="primary" danger htmlType="submit">
                                Tạo phiếu xuất hủy
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
                title={`Chi tiết phiếu ${selectedDisposal?.ma_phieu}`}
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                width={900}
                footer={null}
            >
                {selectedDisposal && (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <p><strong>Chi nhánh:</strong> {selectedDisposal.chi_nhanh?.name}</p>
                            <p><strong>Ngày:</strong> {dayjs(selectedDisposal.ngay_xuat_huy).format('DD/MM/YYYY')}</p>
                            <p><strong>Lý do:</strong> {getReasonTag(selectedDisposal.ly_do)}</p>
                            <p><strong>Trạng thái:</strong> {getStatusTag(selectedDisposal.trang_thai)}</p>
                            <p><strong>Ghi chú:</strong> {selectedDisposal.ghi_chu}</p>
                            {selectedDisposal.hinh_anh_minh_chung && (
                                <p>
                                    <strong>Hình ảnh:</strong>{' '}
                                    <a href={selectedDisposal.hinh_anh_minh_chung} target="_blank" rel="noopener noreferrer">
                                        Xem ảnh minh chứng
                                    </a>
                                </p>
                            )}
                        </div>

                        <Table
                            dataSource={selectedDisposal.chi_tiets}
                            rowKey="id"
                            pagination={false}
                            columns={[
                                { title: 'Sản phẩm', dataIndex: ['san_pham', 'ten_san_pham'], key: 'san_pham' },
                                { title: 'SL hủy', dataIndex: 'so_luong_huy', key: 'sl', align: 'right', render: (v: number) => v?.toLocaleString() },
                                { title: 'Giá vốn', dataIndex: 'gia_von', key: 'gia', align: 'right', render: (v: number) => `${v?.toLocaleString()} đ` },
                                { title: 'Giá trị mất', dataIndex: 'gia_tri_mat', key: 'gt', align: 'right', render: (v: number) => <span style={{color:'red'}}>{v?.toLocaleString()} đ</span> },
                                { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'note', ellipsis: true }
                            ]}
                        />
                    </>
                )}
            </Modal>

            {/* Modal thống kê */}
            <Modal
                title="Thống kê xuất hủy"
                open={statsVisible}
                onCancel={() => setStatsVisible(false)}
                width={800}
                footer={null}
            >
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Tổng phiếu"
                                value={statistics.tong_phieu || 0}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Tổng SL hủy"
                                value={statistics.tong_so_luong || 0}
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Tổng giá trị mất"
                                value={statistics.tong_gia_tri || 0}
                                suffix="đ"
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {statistics.theo_ly_do && (
                    <>
                        <h4>Thống kê theo lý do:</h4>
                        <Table
                            dataSource={Object.entries(statistics.theo_ly_do).map(([ly_do, data]: any) => ({
                                ly_do,
                                ...data
                            }))}
                            rowKey="ly_do"
                            pagination={false}
                            columns={[
                                { title: 'Lý do', dataIndex: 'ly_do', key: 'ly_do', render: (v: string) => getReasonTag(v) },
                                { title: 'Số phiếu', dataIndex: 'so_phieu', key: 'phieu', align: 'right' },
                                { title: 'SL hủy', dataIndex: 'so_luong', key: 'sl', align: 'right' },
                                { title: 'Giá trị', dataIndex: 'gia_tri', key: 'gt', align: 'right', render: (v: number) => `${v?.toLocaleString()} đ` }
                            ]}
                        />
                    </>
                )}
            </Modal>
        </div>
    );
};

export default DisposalList;
