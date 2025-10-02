import React, { useState, useEffect, useContext, useMemo } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import {
    Button,
    message,
    Modal,
    Form, Input,
    Popconfirm, ColorPicker,
    TableColumnsType,
    Table, Row, Col, Divider, Space,
    Radio, Select, DatePicker
} from "antd";
import axios from "axios";
import {
    CopyOutlined, PlusCircleOutlined, HolderOutlined, CloseSquareOutlined, CheckOutlined
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

import { optionEntries } from "../../../Function/common";
import { o } from "node_modules/framer-motion/dist/types.d-Cjd591yU";


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

const dataActionDefault = {
    id: 0,
    name: '',
    description: '',
    color: '#FFFFFF',
    background: '#64748B',
};
const { RangePicker } = DatePicker;

export function projectConfig(
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
        axios.post(route('project.editConfig', [tbl.parentName, tbl.currentName]), values).then((response) => {
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
        axios.post(route('project.deleteConfig', [tbl.parentName, tbl.currentName]), { id: key }).then((response) => {
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
            title: 'Thao tác',
            dataIndex: 'operation',
            render: (_, record) =>
                dataSource.length >= 1 ? (
                    <>
                        <a onClick={() => {
                            console.log('record', record);
                            setIsModalAddExpress(true)
                            setDataAction(record);
                            formExpress.setFieldsValue(record);
                        }}>Sửa</a>
                        <span> | </span>
                        <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.key)}>
                            <a>Xóa</a>
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
                return arrayMove(prevState, activeIndex, overIndex);
            });
        }
    };

    return (
        <div>
            <Modal title="Thêm mới"
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
            </Modal>
            <Button type="dashed"
                onClick={() => {
                    setIsModalAddExpress(true)
                    setDataAction(dataActionDefault);
                    formExpress.setFieldsValue(dataActionDefault);
                    formExpress.setFieldsValue(dataActionDefault);
                }}
                style={{ marginBottom: 16 }}>
                <PlusCircleOutlined /> Thêm mới
            </Button>
            <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd2}>
                <SortableContext items={dataSource.map((i) => i.key)} strategy={verticalListSortingStrategy}>
                    <Table
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

export function formProject(statusData: any, props: any, onSuccess: (data: any) => void) {

    const [formData] = Form.useForm();
    const [isLoadingBtn, setIsLoadingBtn] = useState(false);
    const [typeSubmit, setTypeSubmit] = useState('save');
    // form data
    const onFinishData = async (values) => {
        // setIsLoadingBtn(true);
        values.typeSubmit = typeSubmit;
        if (values.start) {
            values.start = values.start.format('YYYY-MM-DD');
        }
        if (values.end) {
            values.end = values.end.format('YYYY-MM-DD');
        }
        // 
        // return;
        values.display = props.display;

        // const res = await createTask(values);
        axios.post(route('project.add', { parentName: props.parentName }), values)
            .then(response => {
                setIsLoadingBtn(false);

                message.success("Đã lưu dữ liệu thành công");
                // reset form
                formData.resetFields();
                console.log('displayxxxxxxxxxxxxxxxxx', props.display);
                console.log('zzzzzzzzzz', response.data.data);
                onSuccess(response.data.data);

            })
            .catch(error => {
                setIsLoadingBtn(false);
            });

    }
    return <Form
        name="htvn"
        form={formData}
        layout="vertical"
        onFinish={onFinishData}
        autoComplete="off"
        className="form-popup"
    >

        <Row>
            <Col sm={24}>
                <Form.Item name='project_status_id' label='Chọn trạng thái' rules={[{ required: true, message: 'Vui lòng nhập trạng thái công việc', }]}>
                    <Radio.Group
                        block
                        optionType="button"
                        buttonStyle="solid"
                        defaultValue={1}
                        options={Object.entries(statusData).map(([key, value]) => {
                            return {
                                value: value.id,
                                label: value.name,
                                key: value.id,
                            }
                        })}
                    />
                </Form.Item>
            </Col>
        </Row>

        <Row>
            {/* Nội dung chi tiết */}
            <Col sm={{ span: 16 }}>
                <Row>
                    <Col sm={{ span: 24 }} className="main-item-form">
                        <div>
                            <Divider orientation="left"><Space>Nội dung chi tiết</Space></Divider>
                        </div>
                    </Col>

                    <Col sm={{ span: 24 }}>
                        {/* Tên công việc */}
                        <Form.Item className="item-form-textarea" name='name' label="Tên công việc" rules={[{ required: true, message: 'Vui lòng nhập tên công việc', }]}>
                            <Input />
                        </Form.Item>
                    </Col>


                    <Col sm={{ span: 24 }}>
                        <Form.Item className="item-form" name='project_manager' label="Người quản lý">
                            <Select
                                showSearch
                                style={{ width: "100%" }}
                                placeholder="Chọn quản lý"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={optionEntries(props.users)}
                            />
                        </Form.Item>
                    </Col>

                    <Col sm={{ span: 24 }}>
                        <Form.Item className="item-form" name='nguoi_theo_doi' label="Người phối hợp thực hiện hoặc theo dõi">
                            <Select showSearch
                                mode="multiple"
                                style={{ width: "100%" }}
                                placeholder="Người phối hợp thực hiện hoặc theo dõi"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={optionEntries(props.users)}
                            />
                        </Form.Item>
                    </Col>

                    <Col sm={{ span: 24 }}>
                        {/* Mô tả chi tiết */}
                        <Form.Item className="item-form-textarea" name='description' label="Mô tả thêm">
                            <Input.TextArea rows={4} />
                        </Form.Item>
                    </Col>
                </Row>
            </Col>

            {/* Cài đặt */}
            <Col sm={{ span: 8 }}>
                <Row>
                    <Col sm={{ span: 24 }} className="main-item-form">
                        <div>
                            <Divider orientation="left"><Space>Cài đặt</Space></Divider>
                        </div>
                    </Col>
                    {/* Độ ưu tiên */}
                    <Col sm={{ span: 24 }}>
                        <Form.Item className="item-form" name='task_prority_id' label="Độ ưu tiên">
                            <Select showSearch
                                style={{ width: "100%" }}
                                placeholder="Chọn mức độ ưu tiên"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={optionEntries(props.prority)}
                            />
                        </Form.Item>
                    </Col>
                    {/* Loại công việc */}
                    <Col sm={{ span: 24 }}>
                        <Form.Item className="item-form" name='task_type_ids' label="Loại công việc">
                            <Select showSearch
                                style={{ width: "100%" }}
                                placeholder="Chọn loại công việc"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={optionEntries(props.type)}
                            />
                        </Form.Item>
                    </Col>

                    {/* Ngày bắt đầu */}
                    <Col sm={{ span: 24 }} className="main-item-form">
                        <Form.Item className="item-form" name='start' label="Ngày bắt đầu">
                            <DatePicker format='DD/MM/YYYY' />
                        </Form.Item>
                    </Col>

                    {/* Ngày hoàn thành */}
                    <Col sm={{ span: 24 }} className="main-item-form">
                        <Form.Item className="item-form" name='end' label="Ngày hoàn thành">
                            <DatePicker format='DD/MM/YYYY' />
                        </Form.Item>
                    </Col>

                    {/* Người giao việc */}
                    <Col sm={{ span: 24 }} className="main-item-form">
                        <Form.Item className="item-form" name='nguoi_tạo' label="Người giao việc">
                            <Select showSearch
                                style={{ width: "100%" }}
                                placeholder="Chọn mức độ ưu tiên"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={optionEntries(props.users)}
                            />
                        </Form.Item>
                    </Col>

                    <Col sm={{ span: 24 }}></Col>
                </Row>
            </Col>

            {/* footer */}
            <Col sm={{ span: 24 }}>
                <Col span={24} className="main-btn-popup">
                    <Button className="btn-popup btn-success" type="primary" loading={isLoadingBtn}
                        onClick={() => {
                            setTypeSubmit('save');
                            formData.submit();
                        }}
                    >
                        <CheckOutlined />
                        Lưu và đóng
                    </Button>
                    <span> </span>
                    <Button className="btn-popup" type="primary"
                        loading={isLoadingBtn}
                        onClick={() => {
                            setTypeSubmit('save_continue');
                            formData.submit();
                        }}
                    >
                        <PlusCircleOutlined />
                        Lưu và thêm mới
                    </Button>
                </Col>
            </Col>
        </Row>
    </Form>
}
