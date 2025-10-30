import React, { useState,  useContext, useMemo,useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
    Button, Row, Col, Timeline,
    message,
    Modal, Divider, Tag, Popover,
    Form, Input, Progress, Flex, Empty, Checkbox, List,
    Popconfirm, ColorPicker,
    TableColumnsType,
    Table, Select, DatePicker
} from "antd";
import {
    CopyOutlined, PlusCircleOutlined, HolderOutlined, DownOutlined,
    EditOutlined, DeleteOutlined, SnippetsFilled, EditFilled, CheckOutlined,
    CheckSquareFilled, PlusSquareFilled, InfoCircleFilled, PushpinFilled,
    HddFilled, UserOutlined, FireFilled, UsergroupAddOutlined,
    ClockCircleFilled, FlagFilled, ScheduleFilled, DiffFilled, FileSyncOutlined,
    FileSearchOutlined, FileMarkdownOutlined, ProfileOutlined, CaretRightFilled,
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

import { optionEntries, formatGdata_column, onDrop, nl2br, objEntries, showInfo } from "../../../Function/common";
import { DATE_TIME_SHOW, DATE_SHOW, DATE_TIME_FORMAT } from "../../../Function/constant";
import { icon } from "../../../components/comp_icon";


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
            if (dataAction.id > 0) {
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

export function taskInfo(props: any,
    users: any,
    dataAction: any,
    comments: any,
    checklist: any,
    checklistPercent: any,
    taskLog: any,
    priority: any,
    status: any,
    onSuccess: (data: any) => void) {
    const [formDesc] = Form.useForm();
    const [formTitle] = Form.useForm();
    const [formComment] = Form.useForm();
    const [isLoadingBtn, setIsLoadingBtn] = useState(false);
    const [isApplyAll, setIsApplyAll] = useState(false);
    const [isModalComment, setIsModalComment] = useState(false);
    const [commentAction, setCommentAction] = useState({ id: 0 });
    const [checkListAction, setCheckListAction] = useState({ id: 0 });

    const [isModalChecklist, setIsModalChecklist] = useState(false);


    console.log('checklist', checklist);
    // formChecklist
    const formChecklist_default = { name: '', content: '', admin_user_id: null };
    const [formChecklist, setFormChecklist] = useState([formChecklist_default, formChecklist_default, formChecklist_default]);


    const onFinishFormDesc = async (values: any) => {
        updateTaskByColumn(dataAction.id, 'description', values.description);
    }

    const onFinishFormComment = async (values: any) => {
        // setIsLoadingBtn(true);
        console.log(commentAction);
        // return
        axios.post(route('task.addComment'), {
            task_id: dataAction.id,
            content: values.content,
            id: commentAction.id
        }).then(response => {
            setIsModalComment(false);
            formComment.resetFields();
            setIsLoadingBtn(false);
            message.success('Đã thêm comment');
            onSuccess({ comments: response.data.data });
        }).catch(error => {
            message.error('Thêm comment thất bại');
        });
    }

    function editComment(id: number, columnName: string, value: any) {
        axios.post(route('data.fastEditByTableName'), {
            tbl_name: 'task_comments',
            id: id,
            value: value,
            task_id: dataAction.id,
            column_name: columnName,
        }).then(response => {
            setIsLoadingBtn(false);
            message.success('Cập nhật thành công');
            const dataSuccess = {
                checklist: response.data.data.list,
                checklist_percent: response.data.data.percent
            };
            onSuccess(dataSuccess);
        }).catch(error => {
            message.error('Cập nhật thất bại');
        });
    }

    const removeChecklistByIndex = (indexToRemove: number, id: number) => {
        axios.post(route('data.fastEditByTableName'), {
            column_name: 'is_recycle_bin',
            tbl_name: 'task_checklist',
            id: id,
            task_id: dataAction.id,
            value: 1
        }).then(response => {
            setIsLoadingBtn(false);
            message.success('Xóa checklist thành công');
            console.log('response.data.data', response.data.data);

            const successData = {
                checklist: response.data.data.list,
                checklist_percent: response.data.data.percent
            };
            onSuccess(successData);
        }).catch(error => {
            message.error('Xóa checklist thất bại');
        });
    };

    // xóa task
    const handleDelete = (id: number, status: number) => {
        const params = {
            parentName: props.parentName,
            pid: props.pid,
            searchData: props.searchData,
            p: props.p
        };
        axios.post(route('task.delete', id), params).then(response => {
            // setColumns(response.data.data);
        }).catch(error => {
            message.error('Xóa thất bại');
        });

        // setOpenDetail(false);
        message.success("Đã xóa thành công");
    };

    function updateTaskByColumn(id: number, columnName: string, value: any) {
        axios.post(route('task.fastEditTask'), {
            column_name: columnName,
            id: dataAction.id,
            value: value,
            parentName: props.parentName,
            searchData: props.searchData ? props.searchData : {},
            display: props.display
        }).then(response => {
            setIsLoadingBtn(false);
            // setColumns(response.data.data);
            message.success('Cập nhật thành công');
            onSuccess({
                dataAction_column: { col: columnName, val: value },
                columns: response.data.data.datas,
                data: response.data.data.data,
            });


        }).catch(error => {
            message.error('Cập nhật thất bại');
        });
    }

    function removeFormChecklist(key) {
        setFormChecklist(prev =>
            prev.filter((_, index) => index !== key)
        );
    }

    function createChecklist() {
        setIsLoadingBtn(true);
        axios.post(route("task.addChecklist"), {
            data: formChecklist,
            task_id: dataAction.id,
            checklist_id: checkListAction.id,
        }).then((response) => {
            console.log(response.data.data);

            setIsLoadingBtn(false);
            setIsModalChecklist(false);
            message.success("Tạo checklist thành công");

            // update state
            const successData = {
                checklist: response.data.data.checklist,
                checklist_percent: response.data.data.percent
            };
            onSuccess(successData);
        }).catch((error) => {
            message.error("Tạo checklist thất bại");
        });
    }


    {/* form Thêm checklist */ }
    function formAddTaskChecklist(users: any) {
        function addFormCheckList() {
            setFormChecklist(prev => [...prev, formChecklist_default]);
        }

        function updateChecklistByIndex(indexToUpdate: number, updatedData: any) {
            setFormChecklist(prev =>
                prev.map((item, index) =>
                    index === indexToUpdate ? { ...item, ...updatedData } : item
                )
            );
        }

        return <table className="table-sub">
            <thead>
                <tr>
                    <th>Tiêu đề</th>
                    <th>Mô tả</th>
                    <th>
                        Người thực hiện
                        <br />
                        <Checkbox checked={isApplyAll}
                            onChange={(e) => setIsApplyAll(e.target.checked)}
                        >
                            Áp dụng tất cả
                        </Checkbox>
                    </th>
                    <th>Xóa</th>
                </tr>
            </thead>
            {
                formChecklist.map((item, key) => {
                    return <tbody key={key}>
                        <tr>
                            <td>
                                <Input value={item.name} onChange={(e) => updateChecklistByIndex(key, { name: e.target.value })} />
                            </td>
                            <td>
                                <Input.TextArea value={item.content} onChange={(e) => updateChecklistByIndex(key, { content: e.target.value })} />
                            </td>
                            <td>
                                <Select
                                    showSearch
                                    style={{ width: "100%" }}
                                    placeholder="Chọn nhân viên thực hiện"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? "")
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    value={item.admin_user_id}
                                    options={optionEntries(users)}
                                    onChange={(value) => {
                                        if (!isApplyAll) {
                                            updateChecklistByIndex(key, { admin_user_id: value });
                                        }
                                        setFormChecklist(prev =>
                                            prev.map(item => ({
                                                ...item,
                                                admin_user_id: value
                                            }))
                                        );
                                        return;

                                    }}
                                />
                            </td>
                            {
                                checkListAction.id === 0 ? (
                                    <td>
                                        <span onClick={() => removeFormChecklist(key)}
                                            title="Xóa"
                                            className="icon-large cursor"
                                            key="list-loadmore-more">
                                            <DeleteOutlined />
                                        </span>
                                    </td>
                                ) : null
                            }

                        </tr>

                    </tbody>
                })
            }

            <tbody>
                {
                    checkListAction.id === 0 ? (
                        <tr>
                            <td colSpan={4}>
                                <a className="add-item01" onClick={() => addFormCheckList()}>
                                    <span className="icon-b"><PlusCircleOutlined /> Thêm Checklist</span>
                                </a>
                            </td>
                        </tr>
                    ) : null
                }

                <tr>
                    <td colSpan={4}>
                        <Row className="main-modal-footer01">
                            <Col span={24} className="main-btn-popup">
                                <span> </span>
                                <Button className="btn-popup"
                                    loading={isLoadingBtn}
                                    type="primary"
                                    onClick={() => createChecklist()}
                                >
                                    <CheckOutlined />
                                    Lưu Checklist
                                </Button>
                            </Col>
                        </Row>
                    </td>
                </tr>
            </tbody>

        </table>
    }


    return <Row>
        {/* Thêm checklist */}
        <Modal title="Thêm checklist"
            open={isModalChecklist}
            onCancel={() => setIsModalChecklist(false)}
            footer={[]}
            width={1000}
        >
            {formAddTaskChecklist(users)}
        </Modal>

        {/* form comment */}
        <Modal title="Thêm comment"
            open={isModalComment}
            onCancel={() => setIsModalComment(false)}
            footer={[]}
        >
            <Form
                name="formComment"
                form={formComment}
                layout="vertical"
                onFinish={onFinishFormComment}
                autoComplete="off"
            >
                <Form.Item className="edit-description" name='content' label=''>
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Button type="primary" htmlType="submit" loading={isLoadingBtn}>
                    <CopyOutlined />
                    Lưu comment
                </Button>
            </Form>
        </Modal>

        <Col sm={16}>
            {/* tiêu đề */}
            <h3>
                {dataAction.name}
                <Popconfirm placement="bottomLeft"
                    title="Sửa tiêu đề"
                    trigger="click"
                    onConfirm={() => {
                        formTitle.submit();
                    }}
                    description={
                        <Form
                            name="formTitle"
                            form={formTitle}
                            layout="vertical"
                            onFinish={(values) => {
                                updateTaskByColumn(dataAction.id, 'name', values.name);
                            }}
                            autoComplete="off"
                            initialValues={{ name: dataAction.name }}
                        >
                            <Form.Item className="edit-description" name='name' label=''>
                                <Input />
                            </Form.Item>
                        </Form>
                    }
                >
                    <a onClick={(e) => formTitle.setFieldValue('name', dataAction.name)} className="_right">
                        <EditOutlined />
                    </a>
                </Popconfirm>
            </h3>
            <p className="description01">Tạo bởi: {users[dataAction.create_by] ? users[dataAction.create_by].name : ''}</p>

            {/* Mô tả */}
            <Divider orientation="left">
                <span className="title-desc"><SnippetsFilled /> Mô tả</span>
                <span> | </span>
                <Popconfirm
                    icon={<EditFilled />}
                    title="Sửa mô tả"
                    okButtonProps={{ loading: isLoadingBtn }}
                    onConfirm={() => formDesc.submit()}
                    description={
                        <Form
                            name="formDesc"
                            form={formDesc}
                            layout="vertical"
                            onFinish={onFinishFormDesc}
                            autoComplete="off"
                            initialValues={{ description: dataAction.description }}
                        >
                            <Form.Item className="edit-description" name='description' label=''>
                                <Input.TextArea rows={4} />
                            </Form.Item>
                        </Form>
                    }
                >
                    <span className="desc cursor"> <EditFilled /> Sửa</span>
                </Popconfirm>

            </Divider>
            <div>
                <p className="description01">{dataAction.description === null ? <Empty image={null} description="Chưa có mô tả" /> : dataAction.description}</p>
            </div>

            {/* Checklist */}
            <div>
                <Divider orientation="left">
                    <span className="title-desc"><CheckSquareFilled /> Checklist</span>
                    <span> | </span>
                    <span className="desc cursor" onClick={() => {
                        setCheckListAction({ id: 0 });
                        setIsModalChecklist(true);
                        setFormChecklist([formChecklist_default, formChecklist_default, formChecklist_default]);
                    }}> <PlusSquareFilled /> Thêm</span>
                </Divider>
                <Flex gap="small" vertical>
                    <Progress percent={checklistPercent} status={checklistPercent === 100 ? "success" : "active"} />
                </Flex>

                <List
                    className="demo-loadmore-list"
                    itemLayout="horizontal"
                    pagination={{
                        pageSize: 10, //  số item mỗi trang
                    }}
                    
                    dataSource={!checklist ? [] : checklist.map((item: any) => { return item; })}
                    locale={{ emptyText: 'Danh sách checklist trống' }}
                    renderItem={(item, key) => (
                        <List.Item
                            actions={[
                                <span>{item.nguoi_thuc_hien_name ? <Tag color="cyan">{item.nguoi_thuc_hien_name}</Tag> : ''}</span>,

                                <a title="Sửa checklist này"
                                    onClick={() => {
                                        setIsModalChecklist(true);
                                        setCheckListAction(item);
                                        setFormChecklist([{ id: item.id, name: item.name, content: item.content, admin_user_id: item.nguoi_thuc_hien }]);
                                    }}
                                    className="icon-large"
                                    key="list-loadmore-edit">
                                    <EditOutlined />
                                </a>,

                                <Popconfirm
                                    icon={<DeleteOutlined />}
                                    title="Xác nhận xóa"
                                    description="Dữ liệu sẽ bị xóa hòa toàn, bạn xác nhận chứ?"
                                    onConfirm={() => {
                                        removeChecklistByIndex(key, item.id);
                                    }}
                                >
                                    <span title="Xóa" className="icon-large cursor" key="list-loadmore-more"><DeleteOutlined /></span>
                                </Popconfirm>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Checkbox checked={item.is_checked ? true : false}
                                        onChange={(e) => {
                                            let status = 0;
                                            if (e.target.checked) {
                                                status = 1;
                                            }
                                            axios.post(route('data.fastEditByTableName'), {
                                                column_name: 'is_checked',
                                                tbl_name: 'task_checklist',
                                                id: item.id,
                                                value: status,
                                                task_id: dataAction.id,
                                            }).then(response => {
                                                message.success('Cập nhật thứ tự thành công');
                                                onSuccess({ checklist: response.data.data.list, checklist_percent: response.data.data.percent });
                                            }).catch(error => {
                                                message.error('Cập nhật thứ tự thất bại');
                                            });
                                        }}
                                    />
                                }
                                title={
                                    <div>
                                        <b style={{ color: item.is_checked ? 'green' : '#000', fontWeight: item.is_checked ? 'normal' : 'bold' }}>
                                            {item.name}
                                        </b>
                                    </div>
                                }
                                description={item.content !== null || item.content !== '' ? <div dangerouslySetInnerHTML={{ __html: nl2br(item.content) }} /> : ''}
                            />
                        </List.Item>
                    )}
                />
            </div>

            {/* Comment */}
            <div>
                <Divider orientation="left">
                    <span className="title-desc"><CheckSquareFilled /> Comment</span>
                    <span> | </span>
                    <span className="desc cursor"
                        onClick={() => {
                            setCommentAction({ id: 0 });
                            setIsModalComment(true);
                            formComment.resetFields();
                        }}
                    >
                        <PlusSquareFilled />
                        Thêm
                    </span>

                </Divider>

                <List
                    className="demo-loadmore-list"
                    itemLayout="horizontal"
                    pagination={{
                        pageSize: 5, // 👉 số item mỗi trang
                    }}
                    dataSource={!comments ? [] : comments.map((item: any) => { return item; })}
                    renderItem={(item: any) => (
                        <List.Item
                            actions={[
                                <a title="Sửa comment này"
                                    className="icon-large"
                                    key="list-loadmore-edit"
                                    onClick={() => {
                                        setIsModalComment(true);
                                        setCommentAction(item);
                                        formComment.setFieldValue('content', item.content);
                                    }}
                                >
                                    <EditOutlined />
                                </a>,
                                <Popconfirm
                                    icon={<DeleteOutlined />}
                                    title="Xác nhận xóa"
                                    description="Dữ liệu sẽ bị xóa hòa toàn, bạn xác nhận chứ?"
                                    onConfirm={() => {
                                        axios.post(route('task.deleteComment'), { id: item.id }).then(response => {
                                            message.success('Xóa comment thành công');
                                            onSuccess({ comments: response.data.data });
                                        }).catch(error => {
                                            message.error('Xóa comment thất bại');
                                        });
                                    }}
                                >
                                    <span title="Xóa" className="icon-large cursor" key="list-loadmore-more"><DeleteOutlined /></span>
                                </Popconfirm>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<div>
                                </div>
                                }
                                title={<div>
                                    <b>{item.admin_users_name}</b>
                                    <em className="text-normal date01"> {dayjs(item.created_at).format(DATE_TIME_SHOW)}</em>
                                </div>
                                }
                                description={
                                    <div>
                                        <p>{item.content}</p>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </div>
        </Col>

        {/* right */}
        <Col sm={8}>
            <List
                header={<b><InfoCircleFilled /> Thông tin chi tiết</b>}
                footer={<div></div>}
                bordered
                dataSource={[
                    // status
                    <div className="item03">
                        <a><PushpinFilled /> </a>
                        <span>Trạng thái: </span>
                        {
                            !dataAction.task_status_id
                                ?
                                <span className="value-list">Chưa xác định</span>
                                :
                                <>
                                    <Tag style={{ color: status[dataAction.task_status_id].color, background: status[dataAction.task_status_id].background }}>
                                        <span>{icon[status[dataAction.task_status_id].icon]} </span>
                                        <span> {status[dataAction.task_status_id].name}</span>
                                    </Tag>
                                </>
                        }
                        <Popover placement="bottomLeft"
                            title="Chọn trạng thái"
                            trigger="click"
                            content={
                                <List
                                    itemLayout="horizontal"
                                    dataSource={objEntries(status)}
                                    renderItem={(item: any, key) => (
                                        <p style={{ color: item.background }}
                                            className="cursor"
                                            onClick={() => {
                                                updateTaskByColumn(dataAction.id, 'task_status_id', item.id);
                                            }}
                                        >
                                            {icon[item.icon]} {item.name}
                                        </p>
                                    )}
                                />
                            }
                        >
                            <a onClick={(e) => e.preventDefault()} className="_right">
                                <DownOutlined />
                            </a>
                        </Popover>
                    </div>,

                    // độ ưu tiên
                    <div className="item03">
                        <a><FireFilled /> </a>
                        <span>Độ ưu tiên: </span>
                        {
                            !dataAction.task_priority_id
                                ?
                                <span className="value-list">Chưa xác định</span>
                                :
                                <Tag style={{ color: priority[dataAction.task_priority_id].color }}>{priority[dataAction.task_priority_id].name} </Tag>

                        }
                        <Popover placement="bottomLeft"
                            title="Chọn mức độ ưu tiên"
                            trigger="click"
                            content={
                                <List
                                    itemLayout="horizontal"
                                    dataSource={objEntries(priority)}
                                    renderItem={(item: any, key: number) => (
                                        <p style={{ color: item.color }}
                                            className="cursor"
                                            onClick={() => {
                                                updateTaskByColumn(dataAction.id, 'task_priority_id', item.id);
                                            }}
                                        >
                                            <CaretRightFilled /> {item.name}
                                        </p>
                                    )}
                                />
                            }
                        >
                            <a onClick={(e) => e.preventDefault()} className="_right">
                                <DownOutlined />
                            </a>
                        </Popover>

                    </div>,

                    // người thực hiện
                    <div className="item03">
                        <a><UserOutlined /> </a>
                        <span>Người thực hiện: </span>
                        <Popover placement="bottomLeft"
                            title="Chọn người thực hiện"
                            trigger="click"
                            content={
                                <Select
                                    showSearch
                                    style={{ width: "100%" }}
                                    value={dataAction.nguoi_thuc_hien}
                                    placeholder="Chọn nhân viên thực hiện"
                                    optionFilterProp="children"
                                    options={optionEntries(users)}
                                    filterOption={(input, option) =>
                                        (option?.label ?? "")
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    onChange={(value) => {
                                        updateTaskByColumn(dataAction.id, 'nguoi_thuc_hien', value);
                                    }}
                                />
                            }
                        >
                            <a onClick={(e) => e.preventDefault()} className="_right">
                                <EditOutlined />
                            </a>
                        </Popover>
                        <p>
                            {
                                !dataAction.nguoi_thuc_hien
                                    ?
                                    <span className="value-list">Chưa xác định</span>
                                    :
                                    <Tag style={{ color: '#03ba56ff' }}>{users[dataAction.nguoi_thuc_hien].name} </Tag>
                            }
                        </p>

                    </div>,

                    // Chọn người Làm cùng hoặc theo dõi
                    <div className="item03">
                        <a><UsergroupAddOutlined /> </a>
                        Làm cùng hoặc theo dõi:
                        <Popover placement="bottomLeft"
                            title="Chọn người Làm cùng hoặc theo dõi"
                            trigger="click"
                            content={
                                <Select
                                    showSearch
                                    mode="multiple"
                                    style={{ width: "100%" }}
                                    value={dataAction.nguoi_theo_doi}
                                    placeholder="Chọn nhân viên thực hiện"
                                    optionFilterProp="children"
                                    options={optionEntries(users)}
                                    filterOption={(input, option) =>
                                        (option?.label ?? "")
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    onChange={(value) => {
                                        console.log(value);

                                        updateTaskByColumn(dataAction.id, 'nguoi_theo_doi', value);
                                    }}
                                />
                            }
                        >
                            <a onClick={(e) => e.preventDefault()} className="_right">
                                <EditOutlined />
                            </a>
                        </Popover>

                        <p>
                            {
                                !dataAction.nguoi_theo_doi
                                    ?
                                    <span className="value-list">Chưa xác định</span>
                                    :
                                    <div>
                                        {dataAction.nguoi_theo_doi.map((item, key) => (
                                            <Tag color="cyan" key={key}>{users[item] ? users[item].name : ''} </Tag>
                                        ))}
                                    </div>
                            }
                        </p>
                    </div>,

                    // Tags
                    <div className="item03">
                        <a><HddFilled /> </a>
                        <span>Tags: </span>
                        <Popover placement="bottomLeft"
                            title="Thêm tags"
                            trigger="click"
                            content={
                                <Select
                                    showSearch
                                    mode="tags"
                                    style={{ width: "100%" }}
                                    value={dataAction.tags}
                                    placeholder="Chọn nhân viên thực hiện"
                                    optionFilterProp="children"
                                    // options={optionEntries([])}
                                    filterOption={(input, option) =>
                                        (option?.label ?? "")
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    onChange={(value) => {
                                        console.log(value);

                                        updateTaskByColumn(dataAction.id, 'tags', value);
                                    }}
                                />
                            }
                        >
                            <a onClick={(e) => e.preventDefault()} className="_right">
                                <EditOutlined />
                            </a>
                        </Popover>
                        <p>
                            {
                                !dataAction.tags
                                    ?
                                    <span className="value-list">Chưa xác định</span>
                                    :
                                    <div>
                                        {dataAction.tags.map((item, key) => (
                                            <Tag style={{ color: '#045ea8ff' }} key={key}>{item} </Tag>
                                        ))}
                                    </div>
                            }
                        </p>
                    </div>,

                    // Thời gian
                    <div className="item03">
                        <b><PushpinFilled />  Thời gian: </b>
                    </div>,

                    // Ngày tạo
                    <div>
                        <a><ClockCircleFilled /> </a>
                        Ngày tạo:
                        <span className="value-list"> {dataAction.created_at ? dayjs(dataAction.created_at).format(DATE_SHOW) : ''}</span>
                    </div>,
                    // Ngày cập nhật
                    <div className="item03">
                        <a><FlagFilled /> </a>
                        Bắt đầu:
                        <span className="value-list"> {dataAction.start ? dayjs(dataAction.start).format(DATE_SHOW) : 'Chưa xác định'}</span>
                        <Popover placement="bottomLeft"
                            title="Ngày bắt đầu"
                            trigger="click"
                            content={
                                <DatePicker format='DD/MM/YYYY'
                                    onChange={(date) => {
                                        updateTaskByColumn(dataAction.id, 'start', date.format('YYYY-MM-DD'));
                                    }}
                                />
                            }
                        >
                            <a onClick={(e) => e.preventDefault()} className="_right">
                                <EditOutlined />
                            </a>
                        </Popover>
                    </div>,

                    // ngày hoàn thành
                    <div className="item03">
                        <a><ScheduleFilled /> </a>
                        Hoàn thành:
                        <span className="value-list"> {dataAction.end ? dayjs(dataAction.end).format(DATE_SHOW) : 'Chưa xác định'}</span>
                        <Popover placement="bottomLeft"
                            title="Ngày hoàn thành"
                            trigger="click"
                            content={
                                <DatePicker format='DD/MM/YYYY'
                                    onChange={(date) => {
                                        updateTaskByColumn(dataAction.id, 'end', date.format('YYYY-MM-DD'));
                                    }}
                                />
                            }
                        >
                            <a onClick={(e) => e.preventDefault()} className="_right">
                                <EditOutlined />
                            </a>
                        </Popover>
                    </div>,

                    // ngày thực tế
                    <div className="item03">
                        <a><CheckSquareFilled /> </a>
                        Thực tế:
                        <span className="value-list"> {dataAction.actual ? dayjs(dataAction.actual).format(DATE_SHOW) : 'Chưa xác định'}</span>
                        <Popover placement="bottomLeft"
                            title="Ngày hoàn thành"
                            trigger="click"
                            content={
                                <DatePicker format='DD/MM/YYYY'
                                    onChange={(date) => {
                                        updateTaskByColumn(dataAction.id, 'actual', date.format('YYYY-MM-DD'));
                                    }}
                                />
                            }
                        >
                            <a onClick={(e) => e.preventDefault()} className="_right">
                                <EditOutlined />
                            </a>
                        </Popover>
                    </div>,


                    <div className="item03">
                        <b><DiffFilled />  Thêm vào meeting: </b>
                        <Popover placement="bottomLeft"
                            title="Thêm vào meeting"
                            trigger="click"
                            content={
                                <Row>
                                    <Col span={24}>
                                        <Checkbox value="1"
                                            onChange={(e) => {
                                                let status = 0;
                                                if (e.target.checked) {
                                                    status = 1;
                                                }
                                                updateTaskByColumn(dataAction.id, 'is_daily', status);
                                            }}
                                            checked={dataAction.is_daily}>Daily</Checkbox>
                                    </Col>
                                    <Col span={24}>
                                        <Checkbox value="is_weekly"
                                            onChange={(e) => {
                                                let status = 0;
                                                if (e.target.checked) {
                                                    status = 1;
                                                }
                                                updateTaskByColumn(dataAction.id, 'is_weekly', status);
                                            }}
                                            checked={dataAction.is_weekly}>Weekly</Checkbox>
                                    </Col>
                                    <Col span={24}>
                                        <Checkbox value="1"
                                            onChange={(e) => {
                                                let status = 0;
                                                if (e.target.checked) {
                                                    status = 1;
                                                }
                                                updateTaskByColumn(dataAction.id, 'is_monthly', status);
                                            }}
                                            checked={dataAction.is_monthly}>Monthly</Checkbox>
                                    </Col>
                                </Row>
                            }
                        >
                            <a onClick={(e) => e.preventDefault()} className="_right">
                                <EditOutlined />
                            </a>
                        </Popover>
                    </div>,

                    // daily
                    <div className="item03">
                        <a><FileSyncOutlined /> </a>
                        Daily:
                        <span className="value-list"> {dataAction.is_daily ? 'Có' : 'Không'}</span>
                    </div>,

                    // weekly
                    <div className="item03">
                        <a><FileSearchOutlined /> </a>
                        Weekly:
                        <span className="value-list"> {dataAction.is_weekly ? 'Có' : 'Không'}</span>
                    </div>,

                    // monthly
                    <div className="item03">
                        <a><FileMarkdownOutlined /> </a>
                        Monthly:
                        <span className="value-list"> {dataAction.is_monthly ? 'Có' : 'Không'}</span>
                    </div>,

                    // delete
                    <div className="item03">
                        <Popconfirm
                            icon={<DeleteOutlined />}
                            title="Xác nhận xóa"
                            description="Dữ liệu sẽ bị xóa hòa toàn, bạn xác nhận chứ?"
                            onConfirm={() => {
                                handleDelete(dataAction.id, status);
                            }}
                        >
                            <Button className="_right"><DeleteOutlined /> Xóa </Button>
                        </Popconfirm>
                    </div>

                ]}
                renderItem={(item) => (
                    <List.Item>{item}</List.Item>
                )}
            />

            <div><br /></div>

            <h3><ProfileOutlined /> Lịch sử thay đổi</h3>
            <Timeline
                items={taskLog.map((item) => {
                    return {
                        color: item.color ? item.color : 'blue',
                        children: (
                            <div>
                                <p>{item.name}</p>
                                <span className="text-normal date01">{dayjs(item.created_at).format(DATE_TIME_FORMAT)}</span>
                            </div>
                        ),
                    }
                })}
            />
        </Col>
    </Row>
}


export function TaskConfigWrapper(){

    return <Modal title="Thêm mới"
                            open={isModalAddOpen}
                            onCancel={() => closeModalAdd()}
                            footer={[]}
                            width={{
                                xs: '90%',
                                sm: '80%',
                                md: '70%',
                                lg: '60%',
                                xl: '50%',
                                xxl: '40%',
                            }}
                        >
                            <Form
                                name="htvn"
                                form={formData}
                                layout="vertical"
                                onFinish={onFinishData}
                                autoComplete="off"
                                initialValues={initialValuesForm()}
                                className="form-popup"
                            >

                                <Row>
                                    <Col sm={24}>
                                        <Form.Item name='task_status_id' label='Chọn trạng thái' rules={[{ required: true, message: 'Vui lòng nhập trạng thái công việc', }]}>
                                            <Radio.Group
                                                block
                                                optionType="button"
                                                buttonStyle="solid"
                                                defaultValue={1}
                                                options={Object.entries(status).map(([key, value]) => {
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
                                                <Form.Item className="item-form" name='nguoi_thuc_hien' label="Người thực hiện">
                                                    <Select
                                                        showSearch
                                                        style={{ width: "100%" }}
                                                        placeholder="Chọn nhân viên thực hiện"
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) =>
                                                            (option?.label ?? "")
                                                                .toLowerCase()
                                                                .includes(input.toLowerCase())
                                                        }
                                                        options={optionEntries(users)}
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
                                                        options={optionEntries(users)}
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
                                                <Form.Item className="item-form" name='task_priority_id' label="Độ ưu tiên">
                                                    <Select showSearch
                                                        style={{ width: "100%" }}
                                                        placeholder="Chọn mức độ ưu tiên"
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) =>
                                                            (option?.label ?? "")
                                                                .toLowerCase()
                                                                .includes(input.toLowerCase())
                                                        }
                                                        options={optionEntries(priority)}
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
                                                        options={optionEntries(type)}
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
                                                        options={optionEntries(users)}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col sm={{ span: 24 }}></Col>
                                        </Row>
                                    </Col>

                                    {/* footer */}
                                    <Col sm={{ span: 24 }}>
                                        <Col span={24} className="main-btn-popup">
                                            <Button className="btn-popup"
                                                onClick={() => closeModalAdd(false)}
                                            >
                                                <CloseSquareOutlined />
                                                Hủy
                                            </Button>
                                            <span> </span>
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
                        </Modal>

}