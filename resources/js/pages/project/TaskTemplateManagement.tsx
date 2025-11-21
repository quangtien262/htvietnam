import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm, Switch, InputNumber, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;

interface Template {
    id: number;
    name: string;
    tasks: any;
    sort_order: number;
    is_active: number;
    created_at: string;
}

interface TaskRow {
    key: number;
    name: string;
    description: string;
}

const TaskTemplateManagement: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [form] = Form.useForm();
    const [taskRows, setTaskRows] = useState<TaskRow[]>([
        { key: 1, name: '', description: '' },
        { key: 2, name: '', description: '' },
        { key: 3, name: '', description: '' },
    ]);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/project/api/templates');
            if (response.data.success) {
                setTemplates(response.data.data);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách mẫu');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingTemplate(null);
        form.resetFields();
        setTaskRows([
            { key: 1, name: '', description: '' },
            { key: 2, name: '', description: '' },
            { key: 3, name: '', description: '' },
        ]);
        setModalVisible(true);
    };

    const handleEdit = (record: Template) => {
        setEditingTemplate(record);
        
        // Parse tasks from JSON to array of TaskRow
        let parsedTasks: TaskRow[] = [];
        try {
            const tasks = typeof record.tasks === 'string' 
                ? JSON.parse(record.tasks)
                : record.tasks;
            
            if (Array.isArray(tasks)) {
                parsedTasks = tasks.map((task, index) => ({
                    key: index + 1,
                    name: task.name || '',
                    description: task.description || '',
                }));
            }
        } catch (e) {
            console.error('Error parsing tasks:', e);
            parsedTasks = [
                { key: 1, name: '', description: '' },
                { key: 2, name: '', description: '' },
                { key: 3, name: '', description: '' },
            ];
        }
        
        setTaskRows(parsedTasks.length > 0 ? parsedTasks : [
            { key: 1, name: '', description: '' },
            { key: 2, name: '', description: '' },
            { key: 3, name: '', description: '' },
        ]);
        
        form.setFieldsValue({
            name: record.name,
            sort_order: record.sort_order,
            is_active: record.is_active === 1,
        });
        setModalVisible(true);
    };    const handleDelete = async (id: number) => {
        try {
            const response = await axios.delete(`/project/api/templates/${id}`);
            if (response.data.success) {
                message.success('Xóa mẫu thành công');
                fetchTemplates();
            }
        } catch (error) {
            message.error('Lỗi khi xóa mẫu');
        }
    };

    const handleSubmit = async (values: any) => {
        // Validate at least one task with name
        const validTasks = taskRows.filter(row => row.name && row.name.trim() !== '');
        
        if (validTasks.length === 0) {
            message.error('Vui lòng nhập ít nhất một nhiệm vụ');
            return;
        }

        // Convert taskRows to JSON string
        const tasksJson = JSON.stringify(validTasks.map(row => ({
            name: row.name,
            description: row.description,
        })));

        const data = {
            name: values.name,
            tasks: tasksJson,
            sort_order: values.sort_order || 0,
            is_active: values.is_active ? 1 : 0,
        };

        try {
            if (editingTemplate) {
                const response = await axios.put(`/project/api/templates/${editingTemplate.id}`, data);
                if (response.data.success) {
                    message.success('Cập nhật mẫu thành công');
                    setModalVisible(false);
                    fetchTemplates();
                }
            } else {
                const response = await axios.post('/project/api/templates', data);
                if (response.data.success) {
                    message.success('Tạo mẫu thành công');
                    setModalVisible(false);
                    fetchTemplates();
                }
            }
        } catch (error) {
            message.error('Lỗi khi lưu mẫu');
        }
    };

    const updateTaskRow = (key: number, field: 'name' | 'description', value: string) => {
        setTaskRows(taskRows.map(row => 
            row.key === key ? { ...row, [field]: value } : row
        ));
    };

    const addTaskRow = () => {
        const newKey = Math.max(...taskRows.map(r => r.key), 0) + 1;
        setTaskRows([...taskRows, { key: newKey, name: '', description: '' }]);
    };

    const removeTaskRow = (key: number) => {
        if (taskRows.length > 1) {
            setTaskRows(taskRows.filter(row => row.key !== key));
        } else {
            message.warning('Phải có ít nhất một hàng');
        }
    };

    const columns = [
        {
            title: 'Tên mẫu',
            dataIndex: 'name',
            key: 'name',
            width: 250,
        },
        {
            title: 'Số lượng task',
            key: 'task_count',
            width: 120,
            render: (record: Template) => {
                try {
                    const tasks = typeof record.tasks === 'string'
                        ? JSON.parse(record.tasks)
                        : record.tasks;
                    return <Tag color="blue">{Array.isArray(tasks) ? tasks.length : 0} tasks</Tag>;
                } catch (e) {
                    return <Tag color="red">Invalid</Tag>;
                }
            },
        },
        {
            title: 'Thứ tự',
            dataIndex: 'sort_order',
            key: 'sort_order',
            width: 100,
            align: 'center' as const,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 120,
            render: (is_active: number) => (
                <Tag color={is_active === 1 ? 'green' : 'red'}>
                    {is_active === 1 ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            fixed: 'right' as const,
            render: (_: any, record: Template) => (
                <Space>
                    <Button
                        type="primary"
                        ghost
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa mẫu này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Quản lý mẫu nhiệm vụ</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Thêm mẫu mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={templates}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSize: 20,
                    showTotal: (total) => `Tổng ${total} mẫu`,
                }}
            />

            <Modal
                title={editingTemplate ? 'Chỉnh sửa mẫu' : 'Thêm mẫu mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                width={900}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        sort_order: 0,
                        is_active: true,
                    }}
                >
                    <Form.Item
                        label="Tên mẫu"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên mẫu' }]}
                    >
                        <Input placeholder="Ví dụ: Quy trình kiểm tra căn hộ" />
                    </Form.Item>

                    <Form.Item
                        label="Danh sách nhiệm vụ"
                    >
                        <Table
                            dataSource={taskRows}
                            pagination={false}
                            size="small"
                            bordered
                            columns={[
                                {
                                    title: 'STT',
                                    key: 'index',
                                    width: 60,
                                    align: 'center',
                                    render: (_, __, index) => index + 1,
                                },
                                {
                                    title: <span>Tên nhiệm vụ <span style={{ color: 'red' }}>*</span></span>,
                                    dataIndex: 'name',
                                    key: 'name',
                                    render: (text, record) => (
                                        <Input
                                            value={text}
                                            onChange={(e) => updateTaskRow(record.key, 'name', e.target.value)}
                                            placeholder="Nhập tên nhiệm vụ"
                                        />
                                    ),
                                },
                                {
                                    title: 'Mô tả',
                                    dataIndex: 'description',
                                    key: 'description',
                                    render: (text, record) => (
                                        <Input.TextArea
                                            value={text}
                                            onChange={(e) => updateTaskRow(record.key, 'description', e.target.value)}
                                            placeholder="Nhập mô tả"
                                            autoSize={{ minRows: 1, maxRows: 3 }}
                                        />
                                    ),
                                },
                                {
                                    title: 'Thao tác',
                                    key: 'action',
                                    width: 80,
                                    align: 'center',
                                    render: (_, record) => (
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={() => removeTaskRow(record.key)}
                                            disabled={taskRows.length === 1}
                                        />
                                    ),
                                },
                            ]}
                        />
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={addTaskRow}
                            style={{ marginTop: 8, width: '100%' }}
                        >
                            Thêm hàng
                        </Button>
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            label="Thứ tự sắp xếp"
                            name="sort_order"
                            style={{ width: 200 }}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            label="Trạng thái"
                            name="is_active"
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tắt" />
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>
        </div>
    );
};

export default TaskTemplateManagement;
