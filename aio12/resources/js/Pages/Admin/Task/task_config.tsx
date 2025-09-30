import React, { useState, useEffect, useContext, useMemo } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
    Button,
    message,
    Modal,
    Form, Input, Timeline,
    Popconfirm, Popover,
    Select, Checkbox,
    Row,
    Space, Flex, ColorPicker,
    Tag,
    DatePicker,
    Empty,
    notification,
    Divider, Tree,
    Tabs,
    Col, Drawer,
    Radio, List,
    TableColumnsType,
    Table
} from "antd";
import axios from "axios";
import {
    CopyOutlined, FlagFilled,
    DownOutlined,
    ToolFilled, ProfileOutlined,
    DeleteOutlined,
    EditOutlined, EyeOutlined, CaretRightFilled,
    SettingOutlined,
    InfoCircleFilled, FireFilled,
    PlusSquareFilled, CheckSquareFilled,
    CheckOutlined, HddFilled,
    CloseSquareOutlined,
    ArrowRightOutlined, CheckCircleOutlined,
    SnippetsFilled,
    CheckSquareOutlined, UserOutlined, UsergroupAddOutlined,
    UserSwitchOutlined, PushpinFilled,
    SettingFilled, EditFilled,
    HomeOutlined, PlusCircleFilled, PlusCircleOutlined, HolderOutlined
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

import { optionEntries, formatGdata_column, onDrop, nl2br, objEntries, showInfo } from "../../../Function/common";
import { callApi } from "../../../Function/api";
import { DATE_TIME_FORMAT } from "../../../Function/constant";
import { icon } from "../../../components/comp_icon";
import { formAddExpress } from "../../../components/comp_data";

import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} from "../../../Function/api";
import { cloneDeep } from "lodash";
import dayjs from "dayjs";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { a } from "node_modules/framer-motion/dist/types.d-Cjd591yU";

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
    // [key: string]: any;
}

export function taskConfig(
    datas: any,
    tbl: TblType,
    columns: columnType,
    onSuccess: (data: any) => void
) {
    const [isModalAddExpress, setIsModalAddExpress] = useState(false);
    const [dataSource, setDataSource] = React.useState<DataType[]>(datas);
    const [formExpress] = Form.useForm();

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
        if(values.background && typeof values.background === 'object') {
            values.background = values.background.toHexString();;
        }
        if(values.color && typeof values.color === 'object') {
            values.color = values.color.toHexString();;
        }
        console.log('values', values);
        axios.post(route('task.addConfig', [tbl.parentName, tbl.currentName]), values).then((response) => {
            message.success('Thêm mới thành công');
            setDataSource(response.data.data.data);
            onSuccess(response.data.data);
            setIsModalAddExpress(false);
            formExpress.resetFields();
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
        // const newData = dataSource.filter((item) => item.key !== key);
        // setDataSource(newData);
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
                    <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.key)}>
                        <a>Xóa</a>
                    </Popconfirm>
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
                return arrayMove(prevState, activeIndex, overIndex);
            });
        }
    };

    return (
        <div>
            <Modal title="Thêm mới quy trình"
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
                        Thêm mới
                    </Button>
                </Form>
                {/* {formAddExpress('tasks', { name: 'Quy trình' }, route('task.addConfig', { parentName: 'tasks', tableName: 'task_status' }), (data: any) => {
                        setDataSource(data);
                        onSuccess(data);
                        message.success('Thêm mới thành công');
                    })} */}
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
