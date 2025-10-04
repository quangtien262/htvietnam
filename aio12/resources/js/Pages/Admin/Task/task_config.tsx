import React, { useState, useEffect, useContext, useMemo } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
    Button,
    message,
    Modal,
    Form, Input,
    Popconfirm, ColorPicker,
    TableColumnsType,
    Table
} from "antd";
import axios from "axios";
import {
    CopyOutlined, PlusCircleOutlined, HolderOutlined, 
    EditOutlined, DeleteOutlined
} from "@ant-design/icons";

// start import DND
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// END DND

import "../../../../css/list02.css";
import "../../../../css/task.css";
import "../../../../css/form.css";

const { TextArea } = Input;
interface columnType {
    name?: string;
    description?: string;
    color?: string;
    [key: string]: any;
}

interface TblType {
    parentName: string;
    currentName: string;
    searchData: any;
    pid: number;
}

const dataActionDefault = {
    id: 0,
    name: '',
    description: '',
    color: '#FFFFFF',
    background: '#64748B',
};

export function taskConfig(
    datas: any,
    tbl: TblType,
    columns: columnType,
    onSuccess: (data: any) => void
) {
    const [isModalAddExpress, setIsModalAddExpress] = useState(false);
    const [dataSource, setDataSource] = React.useState<DataType[]>(datas);
    const [formExpress] = Form.useForm();
    const [dataAction, setDataAction] = useState<any>(dataActionDefault);

    let name = 'Tiêu đề';
    let description = 'Mô tả';
    let color = 'Màu đánh dấu';
    if (columns.name) {
        name = columns.name;
    }
    if (columns.description) {
        description = columns.description;
    }
    if (columns.color) {
        color = columns.color;
    }

    const onfinish = (values: any) => {
        if (values.background && typeof values.background === 'object') {
            values.background = values.background.toHexString();;
        }
        if (values.color && typeof values.color === 'object') {
            values.color = values.color.toHexString();;
        }
        values.id = dataAction.id;
        values.pid = tbl.pid;
        console.log('values', values);
        axios.post(route('task.editConfig', [tbl.parentName, tbl.currentName]), values).then((response) => {
            if(dataAction.id > 0) {
                message.success('Cập nhật thành công');
            } else {
                message.success('Thêm mới thành công');
            }
            setDataSource(response.data.data.datas);
            setIsModalAddExpress(false);
            formExpress.resetFields();
            onSuccess(response.data.data);
        }).catch((error) => {
            console.error('Error:', error);
        });
    }

    //////////////////////////////////////

    interface RowContextProps {
        setActivatorNodeRef?: (element: HTMLElement | null) => void;
        listeners?: SyntheticListenerMap;
    }

    const RowContext = React.createContext<RowContextProps>({});

    const DragHandle: React.FC = () => {
        const { setActivatorNodeRef, listeners } = useContext(RowContext);
        return (
            <Button
                type="text"
                size="small"
                icon={<HolderOutlined />}
                style={{ cursor: 'move' }}
                ref={setActivatorNodeRef}
                {...listeners}
            />
        );
    };

    const handleDelete = (key: React.Key) => {
        axios.post(route('task.deleteConfig', [tbl.parentName, tbl.currentName]), { id: key }).then((response) => {
            message.success('Xóa thành công');
            setDataSource(response.data.data.data);
            onSuccess(response.data.data);
        }).catch((error) => {
            console.error('Error:', error);
        });
    };

    const columns2: TableColumnsType = [
        { key: 'sort', align: 'center', width: 80, render: () => <DragHandle /> },
        {
            title: 'Name', dataIndex: 'name', render: (text, record: any) => {
                return <span style={{ background: record.background, color: record.color, padding: '2px 5px', borderRadius: 3 }}>{text}</span>
            }
        },
        { title: 'Description', dataIndex: 'description' },
        {
            title: 'operation',
            dataIndex: 'operation',
            render: (_, record) =>
                dataSource.length >= 1 ? (
                    <>
                        <a onClick={() => {
                            console.log('record', record);
                            setIsModalAddExpress(true);
                            setDataAction(record);
                            formExpress.setFieldsValue(record);
                        }}><EditOutlined /></a>
                        <span> | </span>
                        <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.key)}>
                            <a><DeleteOutlined /></a>
                        </Popconfirm>
                    </>
                ) : null,
        },
    ];

    interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
        'data-row-key': string;
    }

    const Row: React.FC<RowProps> = (props) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            setActivatorNodeRef,
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

        const contextValue = useMemo<RowContextProps>(
            () => ({ setActivatorNodeRef, listeners }),
            [setActivatorNodeRef, listeners],
        );

        return (
            <RowContext.Provider value={contextValue}>
                <tr {...props} ref={setNodeRef} style={style} {...attributes} />
            </RowContext.Provider>
        );
    };

    const onDragEnd2 = ({ active, over }: DragEndEvent) => {
        if (active.id !== over?.id) {
            setDataSource((prevState) => {
                const activeIndex = prevState.findIndex((record) => record.key === active?.id);
                const overIndex = prevState.findIndex((record) => record.key === over?.id);
                const newOrder = arrayMove(prevState, activeIndex, overIndex);

                // Lấy danh sách key/id theo thứ tự mới
                const orderKeys = newOrder.map(item => item.key);
                console.log('orderKeys', orderKeys);

                // send 2 server:
                const param = {
                    order: orderKeys,
                    parentName: tbl.parentName,
                    currentName: tbl.currentName,
                    searchData: tbl.searchData,
                    pid: tbl.pid,
                };
                console.log('param', param);

                axios.post(route('task.updateSortOrder_taskStatus'), param).then((response) => {
                    message.success('Cập nhật thứ tự thành công');
                    console.log('sss', response.data.data);

                    onSuccess(response.data.data);
                }).catch((error) => {
                    message.error('Cập nhật thứ tự thất bại');
                });

                return newOrder;
            });
        }
    };

    return (
        <div>
            <Modal title={dataAction.id > 0 ? 'Sửa dữ liệu' : 'Thêm mới dữ liệu'}
                open={isModalAddExpress}
                footer={null}
                onCancel={() => setIsModalAddExpress(false)}
            >
                <Form layout="vertical" onFinish={onfinish} form={formExpress}>
                    <Form.Item label={name} name="name" rules={[{ required: true, message: 'Vui lòng nhập ' + name }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label='Mô tả' name="description">
                        <TextArea />
                    </Form.Item>
                    <Form.Item label='Màu nền' name="background">
                        <ColorPicker showText />
                    </Form.Item>
                    <Form.Item label='Màu chữ' name="color">
                        <ColorPicker showText />
                    </Form.Item>

                    <Button type="primary" htmlType="submit">
                        <CopyOutlined />
                        Lưu
                    </Button>
                </Form>
            </Modal>
            <Button type="dashed" onClick={() => setIsModalAddExpress(true)} style={{ marginBottom: 16 }}>
                <PlusCircleOutlined /> Thêm mới
            </Button>
            <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd2}>
                <SortableContext items={dataSource.map((i) => i.key)} strategy={verticalListSortingStrategy}>
                    <Table<DataType>
                        rowKey="key"
                        components={{ body: { row: Row } }}
                        columns={columns2}
                        dataSource={dataSource}
                    />
                </SortableContext>
            </DndContext>
        </div>
    );
}
