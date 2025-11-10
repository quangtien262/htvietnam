import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
    Table, Card, Button, Space, message, Modal, Form, Input, InputNumber,
    Row, Col, Select, Popconfirm, Tag
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
    BankOutlined, DragOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import API from '../../common/api';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Option } = Select;

interface BankAccount {
    id: number;
    ten_ngan_hang: string;
    chi_nhanh?: string;
    so_tai_khoan: string;
    chu_tai_khoan: string;
    so_du_hien_tai: number;
    loai_tien: string;
    ghi_chu?: string;
    is_active: boolean;
    sort_order: number;
}

interface SearchParams {
    keyword?: string;
}

// Draggable Row
const DraggableRow = ({ children, ...props }: any) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props['data-row-key'] });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    return (
        <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </tr>
    );
};

const BankAccountList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<BankAccount[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingRecord, setEditingRecord] = useState<BankAccount | null>(null);
    const [form] = Form.useForm();
    const [searchParams, setSearchParams] = useState<SearchParams>({});

    // Drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchData();
    }, [pagination.current, searchParams]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.post(API.bankAccountList, {
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

    const handleAdd = () => {
        setModalMode('add');
        setEditingRecord(null);
        form.resetFields();
        form.setFieldsValue({
            loai_tien: 'VND',
            is_active: true,
            sort_order: 0,
            so_du_hien_tai: 0,
        });
        setIsModalVisible(true);
    };

    const handleEdit = (record: BankAccount) => {
        setModalMode('edit');
        setEditingRecord(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (ids: number[]) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa ${ids.length} tài khoản đã chọn?`,
            onOk: async () => {
                try {
                    const res = await axios.post(API.bankAccountDelete, { ids });
                    if (res?.data?.status_code === 200) {
                        message.success('Xóa thành công');
                        fetchData();
                    }
                } catch (error: any) {
                    message.error('Có lỗi xảy ra khi xóa');
                }
            },
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            const data = {
                ...values,
                id: editingRecord?.id,
            };

            const endpoint = modalMode === 'add' ? API.bankAccountAdd : API.bankAccountUpdate;
            const res = await axios.post(endpoint, data);

            if (res?.data?.status_code === 200) {
                message.success(modalMode === 'add' ? 'Thêm mới thành công' : 'Cập nhật thành công');
                setIsModalVisible(false);
                form.resetFields();
                fetchData();
            }
        } catch (error: any) {
            message.error('Có lỗi xảy ra');
        }
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = dataSource.findIndex((item) => item.id === active.id);
            const newIndex = dataSource.findIndex((item) => item.id === over.id);

            const newData = arrayMove(dataSource, oldIndex, newIndex);
            setDataSource(newData);

            const items = newData.map((item, index) => ({
                id: item.id,
                sort_order: index + 1,
            }));

            try {
                await axios.post(API.bankAccountUpdateSortOrder, { items });
                message.success('Cập nhật thứ tự thành công');
            } catch (error) {
                message.error('Có lỗi xảy ra khi cập nhật thứ tự');
                fetchData();
            }
        }
    };

    const columns: ColumnsType<BankAccount> = [
        {
            title: <DragOutlined />,
            dataIndex: 'drag',
            key: 'drag',
            width: 50,
            align: 'center',
            render: () => <DragOutlined />,
        },
        {
            title: 'Ngân hàng',
            dataIndex: 'ten_ngan_hang',
            key: 'ten_ngan_hang',
            render: (text, record) => (
                <Space>
                    <BankOutlined style={{ color: '#1890ff' }} />
                    <div>
                        <div><strong>{text}</strong></div>
                        {record.chi_nhanh && <div style={{ fontSize: 12, color: '#888' }}>{record.chi_nhanh}</div>}
                    </div>
                </Space>
            ),
        },
        {
            title: 'Số tài khoản',
            dataIndex: 'so_tai_khoan',
            key: 'so_tai_khoan',
            width: 180,
        },
        {
            title: 'Chủ tài khoản',
            dataIndex: 'chu_tai_khoan',
            key: 'chu_tai_khoan',
            width: 200,
        },
        {
            title: 'Số dư hiện tại',
            dataIndex: 'so_du_hien_tai',
            key: 'so_du_hien_tai',
            width: 150,
            align: 'right',
            render: (val: number) => (
                <span style={{ color: val >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                    {val?.toLocaleString('vi-VN')} {' VND'}
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 100,
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Đang dùng' : 'Tạm dừng'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa tài khoản này?"
                        onConfirm={() => handleDelete([record.id])}
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
                        <BankOutlined />
                        Quản lý tài khoản ngân hàng
                    </Space>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm tài khoản
                    </Button>
                }
            >
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Input
                            placeholder="Tìm kiếm tên ngân hàng, số tài khoản..."
                            value={searchParams.keyword}
                            onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                            onPressEnter={() => fetchData()}
                        />
                    </Col>
                    <Col span={8}>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} onClick={() => fetchData()}>
                                Tìm kiếm
                            </Button>
                            <Button icon={<ReloadOutlined />} onClick={() => {
                                setSearchParams({});
                                setPagination({ ...pagination, current: 1 });
                            }}>
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                >
                    <SortableContext
                        items={dataSource.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <Table
                            columns={columns}
                            dataSource={dataSource}
                            rowKey="id"
                            loading={loading}
                            pagination={false}
                            components={{
                                body: {
                                    row: DraggableRow,
                                },
                            }}
                        />
                    </SortableContext>
                </DndContext>
            </Card>

            <Modal
                title={modalMode === 'add' ? 'Thêm tài khoản ngân hàng' : 'Chỉnh sửa tài khoản'}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="ten_ngan_hang" label="Tên ngân hàng" rules={[{ required: true }]}>
                                <Input placeholder="VD: Vietcombank, ACB..." />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="chi_nhanh" label="Chi nhánh">
                                <Input placeholder="VD: Hà Nội, TP.HCM..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="so_tai_khoan" label="Số tài khoản" rules={[{ required: true }]}>
                                <Input placeholder="Nhập số tài khoản" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="chu_tai_khoan" label="Chủ tài khoản" rules={[{ required: true }]}>
                                <Input placeholder="Tên chủ tài khoản" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="so_du_hien_tai" label="Số dư hiện tại">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="loai_tien" label="Loại tiền">
                                <Select>
                                    <Option value="VND">VND</Option>
                                    <Option value="USD">USD</Option>
                                    <Option value="EUR">EUR</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="is_active" label="Trạng thái" valuePropName="checked">
                                <Select>
                                    <Option value={true}>Đang sử dụng</Option>
                                    <Option value={false}>Tạm dừng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="ghi_chu" label="Ghi chú">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item>
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

const rootElement = document.getElementById('bank-account-root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<BankAccountList />);
}

export default BankAccountList;
