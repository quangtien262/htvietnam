import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
    Table,
    Card,
    Button,
    Space,
    message,
    Modal,
    Form,
    Input,
    InputNumber,
    Row,
    Col,
    Select,
    DatePicker,
    Radio,
    Popconfirm,
    Tag,
    Statistic,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    BankOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import API from '../../common/api';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface BankAccount {
    id: number;
    ten_ngan_hang: string;
    chi_nhanh: string;
    so_tai_khoan: string;
    chu_tai_khoan: string;
    so_du_hien_tai: number;
    loai_tien: string;
}

interface BankTransaction {
    id: number;
    tai_khoan_ngan_hang_id: number;
    tai_khoan_ngan_hang?: BankAccount;
    ngay_giao_dich: string;
    loai_giao_dich: 'thu' | 'chi' | 'chuyen_khoan';
    so_tien: number;
    doi_tac_id?: number;
    doi_tac_type?: string;
    loai_thu_id?: number;
    loai_chi_id?: number;
    ma_giao_dich?: string;
    noi_dung?: string;
    ghi_chu?: string;
    is_doi_soat: boolean;
}

interface SearchParams {
    keyword?: string;
    tai_khoan_ngan_hang_id?: number;
    loai_giao_dich?: string;
    tu_ngay?: string;
    den_ngay?: string;
}

interface Totals {
    tong_thu: number;
    tong_chi: number;
    chenh_lech: number;
}

const BankTransactionList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<BankTransaction[]>([]);
    const [taiKhoanList, setTaiKhoanList] = useState<BankAccount[]>([]);
    const [totals, setTotals] = useState<Totals>({ tong_thu: 0, tong_chi: 0, chenh_lech: 0 });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingRecord, setEditingRecord] = useState<BankTransaction | null>(null);
    const [form] = Form.useForm();

    const [searchParams, setSearchParams] = useState<SearchParams>({});
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

    useEffect(() => {
        fetchTaiKhoanList();
    }, []);

    useEffect(() => {
        fetchData();
    }, [pagination.current, searchParams]);

    const fetchTaiKhoanList = async () => {
        try {
            const response = await axios.post(API.bankTransactionTaiKhoanList, {});
            if (response.data.status_code === 200) {
                setTaiKhoanList(response.data.data || []);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách tài khoản:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.post(API.bankTransactionList, {
                searchData: {
                    ...searchParams,
                    page: pagination.current,
                    per_page: pagination.pageSize,
                },
            });

            if (response.data.status_code === 200) {
                const data = response.data.data;
                setDataSource(data.datas || []);
                setPagination((prev) => ({
                    ...prev,
                    total: data.total || 0,
                }));
                setTotals({
                    tong_thu: data.tong_thu || 0,
                    tong_chi: data.tong_chi || 0,
                    chenh_lech: data.chenh_lech || 0,
                });
            }
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setModalMode('add');
        setEditingRecord(null);
        form.resetFields();
        form.setFieldsValue({
            ngay_giao_dich: dayjs(),
            loai_giao_dich: 'thu',
            so_tien: 0,
            is_doi_soat: false,
        });
        setIsModalVisible(true);
    };

    const handleEdit = (record: BankTransaction) => {
        setModalMode('edit');
        setEditingRecord(record);
        form.setFieldsValue({
            ...record,
            ngay_giao_dich: dayjs(record.ngay_giao_dich),
        });
        setIsModalVisible(true);
    };

    const handleDelete = (ids: number[]) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc muốn xóa giao dịch này? Số dư tài khoản sẽ được cập nhật lại.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const response = await axios.post(API.bankTransactionDelete, { ids });
                    if (response.data.status_code === 200) {
                        message.success('Xóa thành công');
                        fetchData();
                        fetchTaiKhoanList(); // Cập nhật lại số dư
                    }
                } catch (error) {
                    message.error('Lỗi khi xóa');
                }
            },
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            const submitData = {
                ...values,
                ngay_giao_dich: values.ngay_giao_dich.format('YYYY-MM-DD'),
                id: editingRecord?.id,
            };

            const endpoint = modalMode === 'add' ? API.bankTransactionAdd : API.bankTransactionUpdate;
            const response = await axios.post(endpoint, submitData);

            if (response.data.status_code === 200) {
                message.success(modalMode === 'add' ? 'Thêm thành công' : 'Cập nhật thành công');
                setIsModalVisible(false);
                fetchData();
                fetchTaiKhoanList(); // Cập nhật lại số dư
            }
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const handleSearch = () => {
        const params: SearchParams = { ...searchParams };

        if (dateRange[0] && dateRange[1]) {
            params.tu_ngay = dateRange[0].format('YYYY-MM-DD');
            params.den_ngay = dateRange[1].format('YYYY-MM-DD');
        }

        setSearchParams(params);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleReset = () => {
        setSearchParams({});
        setDateRange([null, null]);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const columns = [
        {
            title: 'Ngày giao dịch',
            dataIndex: 'ngay_giao_dich',
            key: 'ngay_giao_dich',
            width: 120,
            render: (text: string) => dayjs(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Tài khoản ngân hàng',
            dataIndex: 'tai_khoan_ngan_hang',
            key: 'tai_khoan_ngan_hang',
            width: 250,
            render: (tk: BankAccount) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>
                        <BankOutlined style={{ marginRight: 8 }} />
                        {tk?.ten_ngan_hang}
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                        {tk?.so_tai_khoan} - {tk?.chu_tai_khoan}
                    </div>
                </div>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'loai_giao_dich',
            key: 'loai_giao_dich',
            width: 100,
            render: (loai: string) => {
                const config = {
                    thu: { color: 'green', text: 'Thu' },
                    chi: { color: 'red', text: 'Chi' },
                    chuyen_khoan: { color: 'blue', text: 'Chuyển khoản' },
                };
                const item = config[loai as keyof typeof config];
                return <Tag color={item?.color}>{item?.text}</Tag>;
            },
        },
        {
            title: 'Số tiền',
            dataIndex: 'so_tien',
            key: 'so_tien',
            width: 150,
            align: 'right' as const,
            render: (value: number, record: BankTransaction) => {
                const color = record.loai_giao_dich === 'thu' ? '#52c41a' : '#ff4d4f';
                const prefix = record.loai_giao_dich === 'thu' ? '+' : '-';
                return (
                    <span style={{ color, fontWeight: 'bold' }}>
                        {prefix}{value.toLocaleString('vi-VN')} đ
                    </span>
                );
            },
        },
        {
            title: 'Mã giao dịch',
            dataIndex: 'ma_giao_dich',
            key: 'ma_giao_dich',
            width: 150,
        },
        {
            title: 'Nội dung',
            dataIndex: 'noi_dung',
            key: 'noi_dung',
            ellipsis: true,
        },
        {
            title: 'Đối soát',
            dataIndex: 'is_doi_soat',
            key: 'is_doi_soat',
            width: 100,
            render: (value: boolean) => (
                <Tag color={value ? 'green' : 'default'}>
                    {value ? 'Đã đối soát' : 'Chưa đối soát'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            render: (_: any, record: BankTransaction) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        onConfirm={() => handleDelete([record.id])}
                        okText="Xóa"
                        cancelText="Hủy"
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
        <Card
            title={
                <span>
                    <DollarOutlined style={{ marginRight: 8 }} />
                    Quản lý giao dịch ngân hàng
                </span>
            }
            extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm giao dịch
                </Button>
            }
        >
            {/* Thống kê tổng */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng thu"
                            value={totals.tong_thu}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            suffix="đ"
                            prefix="+"
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng chi"
                            value={totals.tong_chi}
                            precision={0}
                            valueStyle={{ color: '#cf1322' }}
                            suffix="đ"
                            prefix="-"
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Chênh lệch"
                            value={totals.chenh_lech}
                            precision={0}
                            valueStyle={{ color: totals.chenh_lech >= 0 ? '#3f8600' : '#cf1322' }}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng số dư"
                            value={taiKhoanList.reduce((sum, tk) => sum + tk.so_du_hien_tai, 0)}
                            precision={0}
                            valueStyle={{ color: '#1890ff' }}
                            suffix="đ"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bộ lọc */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Input
                        placeholder="Tìm kiếm theo nội dung, mã GD..."
                        value={searchParams.keyword}
                        onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                        onPressEnter={handleSearch}
                    />
                </Col>
                <Col span={6}>
                    <Select
                        placeholder="Chọn tài khoản"
                        value={searchParams.tai_khoan_ngan_hang_id}
                        onChange={(value) => setSearchParams({ ...searchParams, tai_khoan_ngan_hang_id: value })}
                        allowClear
                        style={{ width: '100%' }}
                    >
                        {taiKhoanList.map((tk) => (
                            <Option key={tk.id} value={tk.id}>
                                {tk.ten_ngan_hang} - {tk.so_tai_khoan}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col span={6}>
                    <Select
                        placeholder="Loại giao dịch"
                        value={searchParams.loai_giao_dich}
                        onChange={(value) => setSearchParams({ ...searchParams, loai_giao_dich: value })}
                        allowClear
                        style={{ width: '100%' }}
                    >
                        <Option value="thu">Thu</Option>
                        <Option value="chi">Chi</Option>
                        <Option value="chuyen_khoan">Chuyển khoản</Option>
                    </Select>
                </Col>
                <Col span={6}>
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
                        format="DD/MM/YYYY"
                        style={{ width: '100%' }}
                    />
                </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col>
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

            {/* Bảng dữ liệu */}
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} giao dịch`,
                    onChange: (page, pageSize) => {
                        setPagination((prev) => ({ ...prev, current: page, pageSize }));
                    },
                }}
            />

            {/* Modal thêm/sửa */}
            <Modal
                title={modalMode === 'add' ? 'Thêm giao dịch ngân hàng' : 'Chỉnh sửa giao dịch'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="tai_khoan_ngan_hang_id"
                                label="Tài khoản ngân hàng"
                                rules={[{ required: true, message: 'Vui lòng chọn tài khoản' }]}
                            >
                                <Select placeholder="Chọn tài khoản">
                                    {taiKhoanList.map((tk) => (
                                        <Option key={tk.id} value={tk.id}>
                                            <div>
                                                <div>{tk.ten_ngan_hang} - {tk.so_tai_khoan}</div>
                                                <div style={{ fontSize: 12, color: '#888' }}>
                                                    Số dư: {tk.so_du_hien_tai.toLocaleString('vi-VN')} {tk.loai_tien}
                                                </div>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ngay_giao_dich"
                                label="Ngày giao dịch"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                            >
                                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="loai_giao_dich"
                                label="Loại giao dịch"
                                rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
                            >
                                <Radio.Group>
                                    <Radio value="thu">Thu</Radio>
                                    <Radio value="chi">Chi</Radio>
                                    <Radio value="chuyen_khoan">Chuyển khoản</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="so_tien"
                                label="Số tiền"
                                rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                    addonAfter="đ"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="ma_giao_dich" label="Mã giao dịch">
                                <Input placeholder="Nhập mã giao dịch" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="is_doi_soat" label="Trạng thái đối soát" valuePropName="checked">
                                <Select>
                                    <Option value={false}>Chưa đối soát</Option>
                                    <Option value={true}>Đã đối soát</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="noi_dung" label="Nội dung">
                        <TextArea rows={2} placeholder="Nội dung giao dịch" />
                    </Form.Item>

                    <Form.Item name="ghi_chu" label="Ghi chú">
                        <TextArea rows={2} placeholder="Ghi chú thêm" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {modalMode === 'add' ? 'Thêm mới' : 'Cập nhật'}
                            </Button>
                            <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

// Mount component
const rootElement = document.getElementById('bank-transaction-root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<BankTransactionList />);
}

export default BankTransactionList;
