import React, { useState, useEffect, useMemo } from 'react';
import {
    Table, Card, Button, Space, message, Modal, Form, Input, Row, Col, ColorPicker, Select, Tag
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined,
    SettingOutlined, DragOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import API from '../../common/api';
import icon from '../../components/comp_icon';
import { getTableDisplayName } from '../../common/settingTableConfig';


const { Option } = Select;

interface SettingItem {
    id: number;
    name: string;
    color?: string;
    icon?: string;
    note?: string;
    sort_order?: number;
    is_default?: number;
}

interface SearchParams {
    keyword?: string;
}

// Danh sách icon có sẵn
const iconList = Object.keys(icon);

// Draggable Row Component
const DraggableRow = ({ children, ...props }: any) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props['data-row-key'],
    });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: 'default',
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    return (
        <tr
            {...props}
            ref={setNodeRef}
            style={style}
        >
            {React.Children.map(children, (child, index) => {
                if (index === 0) {
                    // First column - add drag handle
                    return React.cloneElement(child, {
                        children: (
                            <div {...attributes} {...listeners} style={{ cursor: 'grab', padding: '4px' }}>
                                <DragOutlined />
                            </div>
                        ),
                    });
                }
                return child;
            })}
        </tr>
    );
};const CommonSettingList: React.FC = () => {
    const { tableName } = useParams<{ tableName: string }>();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<SettingItem[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 100,
        total: 0,
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingRecord, setEditingRecord] = useState<SettingItem | null>(null);
    const [form] = Form.useForm();
    const [searchParams, setSearchParams] = useState<SearchParams>({});
    const [selectedColor, setSelectedColor] = useState<string>('#1890ff');

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (tableName) {
            fetchData();
        }
    }, [tableName, pagination.current, searchParams]);

    const fetchData = async () => {
        if (!tableName) return;

        setLoading(true);
        try {
            const res = await axios.post(API.commonSettingList(tableName), {
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
        setSelectedColor('#1890ff');
        setIsModalVisible(true);
    };

    const handleEdit = (record: SettingItem) => {
        console.log('Editing record:', record);
        setModalMode('edit');
        setEditingRecord(record);
        form.setFieldsValue({
            name: record.name,
            color: record.color,
            icon: record.icon,
            note: record.note,
            is_default: record.is_default,
        });
        setSelectedColor(record.color || '#1890ff');
        setIsModalVisible(true);
    };

    const handleDelete = async (ids: number[]) => {
        if (!tableName) return;

        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa ${ids.length} mục đã chọn?`,
            onOk: async () => {
                try {
                    console.log('Deleting items:', ids, 'from table:', tableName);
                    const res = await axios.post(API.commonSettingDelete(tableName), { ids });
                    console.log('Delete response:', res.data);

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
            },
        });
    };

    const handleSubmit = async (values: any) => {
        if (!tableName) return;

        try {
            console.log('Submitting:', modalMode, values, 'editingRecord:', editingRecord);

            const data = {
                ...values,
                color: selectedColor,
                id: editingRecord?.id,
            };

            const endpoint = modalMode === 'add'
                ? API.commonSettingAdd(tableName)
                : API.commonSettingUpdate(tableName);

            console.log('Endpoint:', endpoint, 'Data:', data);

            const res = await axios.post(endpoint, data);
            console.log('Submit response:', res.data);

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
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = dataSource.findIndex((item) => item.id === active.id);
            const newIndex = dataSource.findIndex((item) => item.id === over.id);

            const newData = arrayMove(dataSource, oldIndex, newIndex);
            setDataSource(newData);

            // Update sort_order
            const items = newData.map((item, index) => ({
                id: item.id,
                sort_order: index + 1,
            }));

            try {
                await axios.post(API.commonSettingUpdateSortOrder(tableName!), { items });
                message.success('Cập nhật thứ tự thành công');
            } catch (error) {
                message.error('Có lỗi xảy ra khi cập nhật thứ tự');
                fetchData(); // Reload lại nếu lỗi
            }
        }
    };

    const handleSearch = () => {
        setPagination({ ...pagination, current: 1 });
        fetchData();
    };

    const handleReset = () => {
        setSearchParams({});
        setPagination({ ...pagination, current: 1 });
    };

    const columns: ColumnsType<SettingItem> = [
        {
            title: <DragOutlined />,
            dataIndex: 'drag',
            key: 'drag',
            width: 50,
            align: 'center' as const,
            render: () => null, // Rendered by DraggableRow
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    {record.icon && icon[record.icon as keyof typeof icon]}
                    {record.color && (
                        <div
                            style={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                backgroundColor: record.color,
                                display: 'inline-block',
                            }}
                        />
                    )}
                    <span>{text}</span>
                    {record.is_default === 1 && <Tag color="blue">Mặc định</Tag>}
                </Space>
            ),
        },
        {
            title: 'Màu sắc',
            dataIndex: 'color',
            width: 150,
            render: (color) => color ? (
                <Space>
                    <div
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            backgroundColor: color,
                            border: '1px solid #d9d9d9',
                        }}
                    />
                    <span>{color}</span>
                </Space>
            ) : '-',
        },
        {
            title: 'Icon',
            dataIndex: 'icon',
            width: 100,
            render: (iconName) => iconName && icon[iconName as keyof typeof icon] ? (
                <Space>
                    {icon[iconName as keyof typeof icon]}
                    <span style={{ fontSize: 12, color: '#888' }}>{iconName}</span>
                </Space>
            ) : '-',
        },
        {
            title: 'Thứ tự',
            dataIndex: 'sort_order',
            width: 100,
        },
        {
            title: 'Thao tác',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete([record.id])}
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
                        <SettingOutlined />
                        {getTableDisplayName(tableName || '')}
                    </Space>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm mới
                    </Button>
                }
            >
                {/* Search */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Input
                            placeholder="Tìm kiếm..."
                            value={searchParams.keyword}
                            onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                            onPressEnter={handleSearch}
                        />
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

                {/* Table with Drag & Drop */}
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

            {/* Add/Edit Modal */}
            <Modal
                title={modalMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Tên"
                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                    >
                        <Input placeholder="Nhập tên" />
                    </Form.Item>

                    <Form.Item name="note" label="Ghi chú">
                        <Input.TextArea rows={3} placeholder="Nhập ghi chú (tùy chọn)" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Màu sắc">
                                <ColorPicker
                                    value={selectedColor}
                                    onChange={(color) => setSelectedColor(color.toHexString())}
                                    showText
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="icon" label="Icon">
                                <Select
                                    showSearch
                                    placeholder="Chọn icon"
                                    allowClear
                                    optionFilterProp="children"
                                >
                                    {iconList.map((iconName) => (
                                        <Option key={iconName} value={iconName}>
                                            <Space>
                                                {icon[iconName as keyof typeof icon]}
                                                {iconName}
                                            </Space>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="is_default" label="Giá trị mặc định" valuePropName="checked">
                        <Select placeholder="Chọn">
                            <Option value={0}>Không</Option>
                            <Option value={1}>Có</Option>
                        </Select>
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

export default CommonSettingList;
