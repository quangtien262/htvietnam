import React, { useState, useEffect } from 'react';
import {
    Table, Card, Button, Space, message, Modal, Form, Input, Row, Col, Select,
    Tag, Popconfirm, Switch
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
    MenuOutlined, HolderOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import API from '../../common/api';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Option } = Select;

interface AdminMenu {
    id: number;
    name?: string;
    display_name: string;
    icon?: string;
    link?: string;
    is_active: number;
    sort_order: number;
    create_by?: number;
    created_at?: string;
    updated_at?: string;
}

interface DraggableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    'data-row-key': string;
}

const DraggableRow: React.FC<DraggableRowProps> = (props) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: props['data-row-key'],
    });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
        transition,
        cursor: 'move',
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    return (
        <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />
    );
};

const AdminMenuList: React.FC = () => {
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState<AdminMenu[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingRecord, setEditingRecord] = useState<AdminMenu | null>(null);
    const [searchParams, setSearchParams] = useState<any>({});
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 50,
        total: 0,
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 1,
            },
        })
    );

    useEffect(() => {
        fetchData();
    }, [pagination.current, searchParams]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.post(API.adminMenuList, {
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
        setIsModalVisible(true);
    };

    const handleEdit = (record: AdminMenu) => {
        setModalMode('edit');
        setEditingRecord(record);
        form.setFieldsValue({
            ...record,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (ids: number[]) => {
        try {
            const res = await axios.post(API.adminMenuDelete, { ids });

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
            const data = {
                ...values,
                is_active: values.is_active ?? 1,
            };

            const endpoint = modalMode === 'add'
                ? API.adminMenuCreate
                : API.adminMenuUpdate(editingRecord?.id!);

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

    const onDragEnd = async ({ active, over }: any) => {
        if (active.id !== over?.id) {
            const activeIndex = dataSource.findIndex((i) => i.id === active.id);
            const overIndex = dataSource.findIndex((i) => i.id === over?.id);

            const newData = arrayMove(dataSource, activeIndex, overIndex);
            setDataSource(newData);

            try {
                // Cập nhật sort_order lên server
                const items = newData.map((item, index) => ({
                    id: item.id,
                    sort_order: index + 1,
                }));

                const res = await axios.post(API.adminMenuUpdateSortOrder, { items });

                if (res?.data?.status_code === 200) {
                    message.success('Cập nhật thứ tự thành công');
                } else {
                    message.error('Có lỗi khi cập nhật thứ tự');
                    fetchData(); // Reload lại data nếu lỗi
                }
            } catch (error) {
                console.error('Error updating sort order:', error);
                message.error('Có lỗi khi cập nhật thứ tự');
                fetchData(); // Reload lại data nếu lỗi
            }
        }
    };

    const columns: ColumnsType<AdminMenu> = [
        {
            title: <HolderOutlined />,
            dataIndex: 'sort',
            width: 50,
            className: 'drag-handle',
            render: () => <HolderOutlined style={{ cursor: 'move', color: '#999' }} />,
        },
        {
            title: 'STT',
            dataIndex: 'sort_order',
            key: 'sort_order',
            width: 80,
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Tên hiển thị',
            dataIndex: 'display_name',
            key: 'display_name',
            render: (text, record) => (
                <Space>
                    {record.icon && <span>{record.icon}</span>}
                    <span style={{ fontWeight: 500 }}>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Tên bảng',
            dataIndex: 'name',
            key: 'name',
            render: (text) => text || '-',
        },
        {
            title: 'Icon',
            dataIndex: 'icon',
            key: 'icon',
            render: (text) => text || '-',
        },
        {
            title: 'Link',
            dataIndex: 'link',
            key: 'link',
            render: (text) => text ? (
                <a href={text} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>
                    {text.length > 30 ? text.substring(0, 30) + '...' : text}
                </a>
            ) : '-',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 120,
            render: (is_active) => (
                <Tag color={is_active === 1 ? 'green' : 'red'}>
                    {is_active === 1 ? 'Hoạt động' : 'Tạm dừng'}
                </Tag>
            ),
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
                        <MenuOutlined />
                        <span>Quản lý Menu Admin</span>
                    </Space>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm menu
                    </Button>
                }
            >
                {/* Search */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Input
                            placeholder="Tìm theo tên, link..."
                            value={searchParams.search}
                            onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
                            onPressEnter={handleSearch}
                            prefix={<SearchOutlined />}
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Trạng thái"
                            value={searchParams.is_active}
                            onChange={(value) => setSearchParams({ ...searchParams, is_active: value })}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            <Option value={1}>Hoạt động</Option>
                            <Option value={0}>Tạm dừng</Option>
                        </Select>
                    </Col>
                    <Col span={12}>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                                Tìm kiếm
                            </Button>
                            <Button icon={<ReloadOutlined />} onClick={handleReset}>
                                Đặt lại
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* Table with Drag & Drop */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={dataSource.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        <Table
                            columns={columns}
                            dataSource={dataSource}
                            loading={loading}
                            rowKey="id"
                            pagination={{
                                ...pagination,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} menu`,
                            }}
                            onChange={handleTableChange}
                            scroll={{ x: 1200 }}
                            components={{
                                body: {
                                    row: DraggableRow,
                                },
                            }}
                        />
                    </SortableContext>
                </DndContext>
            </Card>

            {/* Modal Add/Edit */}
            <Modal
                title={modalMode === 'add' ? 'Thêm menu' : 'Chỉnh sửa menu'}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="display_name"
                                label="Tên hiển thị"
                                rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị' }]}
                            >
                                <Input placeholder="Nhập tên hiển thị" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="name" label="Tên bảng">
                                <Input placeholder="Nhập tên bảng (table name)" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="icon" label="Icon">
                                <Input placeholder="Nhập icon (emoji hoặc icon class)" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="link" label="Link">
                                <Input placeholder="Nhập đường dẫn" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="sort_order" label="Thứ tự sắp xếp">
                                <Input type="number" placeholder="Để trống sẽ tự động thêm vào cuối" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="is_active" label="Trạng thái" initialValue={1}>
                                <Select>
                                    <Option value={1}>Hoạt động</Option>
                                    <Option value={0}>Tạm dừng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

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

export default AdminMenuList;
