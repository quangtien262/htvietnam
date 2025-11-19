# Cập nhật Checklist Feature

## ✅ Đã hoàn thành Backend:

1. **Migration** - Thêm cột `assigned_to` vào bảng `pro___task_checklists`
2. **Model TaskChecklist** - Thêm fillable `assigned_to` và relationship `assignedUser()`
3. **Service** - Cập nhật TaskService để load relationship `assignedUser` và hỗ trợ `assigned_to` khi create/update

## 📝 Cần cập nhật Frontend:

### File: `resources/js/pages/project/TaskDetail.tsx`

#### 1. Import thêm Avatar component
```typescript
import { Avatar } from 'antd';
```

#### 2. Thêm state cho edit checklist
```typescript
const [editingChecklist, setEditingChecklist] = useState<number | null>(null);
const [checklistEditForm] = Form.useForm();
```

#### 3. Cập nhật `renderChecklistTab()` function:

```typescript
const renderChecklistTab = () => {
    const completedCount = task?.checklists?.filter(item => item.is_completed).length || 0;
    const totalCount = task?.checklists?.length || 0;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div>
            {totalCount > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Progress percent={progress} status={progress === 100 ? 'success' : 'active'} />
                    <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
                        {completedCount}/{totalCount} hoàn thành
                    </div>
                </div>
            )}

            <List
                dataSource={task?.checklists || []}
                locale={{ emptyText: <Empty description="Chưa có checklist" /> }}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Button 
                                type="link" 
                                size="small" 
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setEditingChecklist(item.id);
                                    checklistEditForm.setFieldsValue({
                                        noi_dung: item.noi_dung,
                                        assigned_to: item.assigned_to
                                    });
                                }}
                            />,
                            <Popconfirm
                                title="Xác nhận xóa?"
                                onConfirm={() => handleDeleteChecklist(item.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        ]}
                    >
                        {editingChecklist === item.id ? (
                            <Form form={checklistEditForm} layout="inline" style={{ width: '100%' }}>
                                <Form.Item name="noi_dung" style={{ flex: 1 }}>
                                    <Input placeholder="Nội dung" />
                                </Form.Item>
                                <Form.Item name="assigned_to" style={{ width: 200 }}>
                                    <Select placeholder="Chọn người" allowClear>
                                        {projectMembers.map(member => (
                                            <Select.Option key={member.admin_user_id} value={member.admin_user_id}>
                                                {member.admin_user?.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item>
                                    <Space>
                                        <Button 
                                            type="primary" 
                                            size="small" 
                                            onClick={() => handleUpdateChecklist(item.id)}
                                        >
                                            Lưu
                                        </Button>
                                        <Button 
                                            size="small" 
                                            onClick={() => setEditingChecklist(null)}
                                        >
                                            Hủy
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                                <Checkbox
                                    checked={item.is_completed}
                                    onChange={() => handleToggleChecklist(item.id, item.is_completed)}
                                />
                                <span style={{
                                    flex: 1,
                                    textDecoration: item.is_completed ? 'line-through' : 'none',
                                    color: item.is_completed ? '#8c8c8c' : 'inherit'
                                }}>
                                    {item.noi_dung}
                                </span>
                                {item.assigned_user && (
                                    <Tooltip title={item.assigned_user.name}>
                                        <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                                            {item.assigned_user.name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Tooltip>
                                )}
                            </div>
                        )}
                    </List.Item>
                )}
            />

            <Divider />

            {/* Form thêm nhanh 4 checklist */}
            {addingChecklist ? (
                <Form form={checklistForm}>
                    <Form.List name="checklists" initialValue={[{}, {}, {}, {}]}>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} style={{ display: 'flex', marginBottom: 8, gap: 8 }}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'noi_dung']}
                                            style={{ flex: 1, marginBottom: 0 }}
                                        >
                                            <Input placeholder="Nhập nội dung checklist" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'assigned_to']}
                                            style={{ width: 200, marginBottom: 0 }}
                                        >
                                            <Select placeholder="Chọn người" allowClear>
                                                {projectMembers.map(member => (
                                                    <Select.Option key={member.admin_user_id} value={member.admin_user_id}>
                                                        {member.admin_user?.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Button 
                                            type="text" 
                                            danger 
                                            icon={<DeleteOutlined />} 
                                            onClick={() => remove(name)}
                                        />
                                    </div>
                                ))}
                                <Form.Item>
                                    <Button 
                                        type="dashed" 
                                        onClick={() => add()} 
                                        block 
                                        icon={<PlusOutlined />}
                                    >
                                        Thêm checklist
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                    <Form.Item>
                        <Space>
                            <Button type="primary" icon={<CheckOutlined />} onClick={handleBatchAddChecklist}>
                                Lưu tất cả
                            </Button>
                            <Button onClick={() => {
                                setAddingChecklist(false);
                                checklistForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            ) : (
                <Button type="dashed" icon={<PlusOutlined />} onClick={() => setAddingChecklist(true)} block>
                    Thêm checklist
                </Button>
            )}
        </div>
    );
};
```

#### 4. Thêm function handleBatchAddChecklist và handleUpdateChecklist:

```typescript
const handleBatchAddChecklist = async () => {
    try {
        const values = await checklistForm.validateFields();
        
        // Filter out empty checklists
        const newChecklists = (values.checklists || []).filter((item: any) => item.noi_dung);
        
        if (newChecklists.length === 0) {
            message.warning('Vui lòng nhập ít nhất 1 checklist');
            return;
        }

        // Map existing checklists
        const existingChecklists = (task.checklists || []).map((item, index) => ({
            noi_dung: item.noi_dung,
            is_completed: item.is_completed,
            assigned_to: item.assigned_to,
            sort_order: index,
        }));

        // Add new checklists
        const updatedChecklists = [
            ...existingChecklists,
            ...newChecklists.map((item: any, index: number) => ({
                noi_dung: item.noi_dung,
                assigned_to: item.assigned_to,
                is_completed: false,
                sort_order: existingChecklists.length + index,
            }))
        ];

        await taskApi.update(taskId!, {
            checklists: updatedChecklists,
        });

        message.success(`Đã thêm ${newChecklists.length} checklist`);
        checklistForm.resetFields();
        setAddingChecklist(false);
        onUpdate();
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
};

const handleUpdateChecklist = async (checklistId: number) => {
    try {
        const values = await checklistEditForm.validateFields();
        
        const updatedChecklists = (task.checklists || []).map((item) => {
            if (item.id === checklistId) {
                return {
                    noi_dung: values.noi_dung,
                    is_completed: item.is_completed,
                    assigned_to: values.assigned_to,
                    sort_order: item.sort_order,
                };
            }
            return {
                noi_dung: item.noi_dung,
                is_completed: item.is_completed,
                assigned_to: item.assigned_to,
                sort_order: item.sort_order,
            };
        });

        await taskApi.update(taskId!, {
            checklists: updatedChecklists,
        });

        message.success('Cập nhật checklist thành công');
        setEditingChecklist(null);
        onUpdate();
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
};
```

## ⚠️ Lưu ý:
- Cần import thêm: `Tooltip` từ antd
- `projectMembers` phải được load trước khi hiển thị form
- Validation rule có thể tùy chỉnh theo yêu cầu
