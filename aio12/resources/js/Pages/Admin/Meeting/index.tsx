import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from "@/layouts/AdminLayout";
import {
    Button,Timeline,
    Table, Drawer,
    message,
    Modal,
    Form,
    Input, DatePicker,
    List,
    Popconfirm,
    Checkbox,
    Row, Col,
    Space, Popover,
    Divider, Progress,
    Tag, Flex,
    Empty,
    Dropdown,
    Select,
    Tree, // thêm
} from "antd";
import { Link, router } from "@inertiajs/react";
import axios from "axios";
import {
    EditFilled, ProfileOutlined, CheckSquareFilled, PlusSquareFilled, CopyOutlined,
    FireFilled, FileMarkdownOutlined, FlagFilled, SnippetsFilled,
    CaretRightFilled, FileSearchOutlined, ScheduleFilled,
    PlusCircleOutlined, FileSyncOutlined, HddFilled,
    DeleteOutlined, DiffFilled, PushpinFilled, DownOutlined,
    EditOutlined, UsergroupAddOutlined, UserOutlined,
    EyeOutlined, InfoCircleFilled,
    CheckOutlined,
    CloseSquareOutlined,
    ClockCircleFilled,
    SettingOutlined, // thêm
} from "@ant-design/icons";

import type { ColumnsType } from "antd/es/table";

import "../../../../css/form.css";
import { callApi } from "../../../Function/api";

// SunEditor
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { optionSunEditor } from '../../../Function/sun_config';

import dayjs from "dayjs";


// import { taskConfig, taskInfo } from "../Task/task_config";
// import { projectConfig, formProject, getProjectDetail, projectInfo } from "../Project/project_config";

import { smartSearch02, showDataSearch, showDataSearch02 } from "../../../Function/input";
import { DATE_TIME_SHOW, DATE_SHOW, DATE_TIME_FORMAT } from "../../../Function/constant";
import { icon as iconRaw } from "../../../components/comp_icon";
import {
    optionEntries, formatGdata_column, objEntries,
    onDrop, nl2br, parseJson, showInfo
} from "../../../Function/common";

const icon: Record<string, React.ReactElement> = iconRaw;
const CheckboxGroup = Checkbox.Group;
export default function Dashboard(props: any) {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);

    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState(props.dataSource);
    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);

    const [form] = Form.useForm();
    const [formSearch] = Form.useForm();
    const [formMeetingEdit] = Form.useForm();
    const editor = useRef<{ [key: string]: any }>({});

    const [meetingDataAction, setMeetingDataAction] = useState({ id: 0 });
    const [idAction, setIdAction] = useState(0);
    const [isOpenFormEdit, setIsOpenFormEdit] = useState(false);

    const [projectChecklist, setProjectChecklist] = useState([]);
    const [projectChecklistPercent, setProjectChecklistPercent] = useState(0);
    const [projectComments, setProjectComments] = useState([]);
    const [projectAction, setProjectAction] = useState({ id: 0 });
    const [openProjectDetail, setOpenProjectDetail] = useState(false);

    const [openTaskDetail, setOpenTaskDetail] = useState(false);
    const [taskChecklist, setTaskChecklist] = useState([]);
    const [taskChecklistPercent, setTaskChecklistPercent] = useState(0);
    const [taskComments, setTaskComments] = useState([]);
    const [taskAction, setTaskAction] = useState({ id: 0 });
    const [priority, setPriority] = useState([]);
    const [taskLog, setTaskLog] = useState([]);

    const [isModalEdit, setIsModalEdit] = useState(false);


    const [confirmLoading, setConfirmLoading] = useState(false);


    const [tableParams, setTableParams] = useState({
        pagination: {
            current: props.pageConfig.currentPage,
            pageSize: props.pageConfig.perPage,
            position: ["bottonRight"],
            total: props.pageConfig.total,
            onChange: (page, pageSize) => setPagination({ page, pageSize }),
        },
    });


    // suneditor
    function handleImageUpload(targetImgElement: any, index: any, state: any, imageInfo: any, remainingFilesCount: any) {
        console.log(targetImgElement, index, state, imageInfo, remainingFilesCount)
    }
    function handleImageUploadError(errorMessage: any, result: any) {
        console.log(errorMessage, result)
    }
    function handleOnResizeEditor(height: any, prevHeight: any) {
        console.log(height, prevHeight)
    }
    function imageUploadHandler(xmlHttpRequest: { response: any; }, info: any, core: any, colName: string) {
        const result = parseJson(xmlHttpRequest.response);
        for (const [key, val] of Object.entries(result.data)) {
            editor.current[colName].insertHTML('<img key="' + key + '" src="' + val.url + '">', true, true);
        }
    }
    // end suneditor


    function taskInfo() {
        const [formDesc] = Form.useForm();
        const [formTitle] = Form.useForm();
        const [formComment] = Form.useForm();
        const [isLoadingBtn, setIsLoadingBtn] = useState(false);
        const [isApplyAll, setIsApplyAll] = useState(false);
        const [isModalComment, setIsModalComment] = useState(false);
        const [commentAction, setCommentAction] = useState({ id: 0 });
        const [checkListAction, setCheckListAction] = useState({ id: 0 });

        const [isModalChecklist, setIsModalChecklist] = useState(false);


        // formChecklist
        const formChecklist_default = { name: '', content: '', admin_user_id: null };
        const [formChecklist, setFormChecklist] = useState([formChecklist_default, formChecklist_default, formChecklist_default]);
        const status = props.taskStatus;


        const onFinishFormDesc = async (values: any) => {
            updateTaskByColumn(taskAction.id, 'description', values.description);
        }

        const onFinishFormComment = async (values: any) => {
            // setIsLoadingBtn(true);
            console.log(commentAction);
            // return
            axios.post(route('task.addComment'), {
                task_id: taskAction.id,
                content: values.content,
                id: commentAction.id
            }).then(response => {
                setIsModalComment(false);
                formComment.resetFields();
                setIsLoadingBtn(false);
                message.success('Đã thêm comment');
                // onSuccess({ comments: response.data.data });
                setTaskComments(response.data.data);
            }).catch(error => {
                message.error('Thêm comment thất bại');
            });
        }

        function editComment(id: number, columnName: string, value: any) {
            axios.post(route('data.fastEditByTableName'), {
                tbl_name: 'task_comments',
                id: id,
                value: value,
                task_id: taskAction.id,
                column_name: columnName,
            }).then(response => {
                setIsLoadingBtn(false);
                message.success('Cập nhật thành công');
                // const dataSuccess = {
                //     checklist: response.data.data.list,
                //     checklist_percent: response.data.data.percent
                // };
                // onSuccess(dataSuccess);
                setTaskChecklist(response.data.data.list);
                setTaskChecklistPercent(response.data.data.percent);
            }).catch(error => {
                message.error('Cập nhật thất bại');
            });
        }

        const removeChecklistByIndex = (indexToRemove: number, id: number) => {
            axios.post(route('data.fastEditByTableName'), {
                column_name: 'is_recycle_bin',
                tbl_name: 'task_checklist',
                id: id,
                task_id: taskAction.id,
                value: 1
            }).then(response => {
                setIsLoadingBtn(false);
                message.success('Xóa checklist thành công');
                console.log('response.data.data', response.data.data);

                // const successData = {
                //     checklist: response.data.data.list,
                //     checklist_percent: response.data.data.percent
                // };
                // onSuccess(successData);
                setTaskChecklist(response.data.data.list);
                setTaskChecklistPercent(response.data.data.percent);
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
                id: taskAction.id,
                value: value,
                parentName: props.parentName,
                searchData: props.searchData,
                display: props.display
            }).then(response => {
                setIsLoadingBtn(false);
                // setColumns(response.data.data);
                message.success('Cập nhật thành công');
                // onSuccess({
                //     dataAction_column: { col: columnName, val: value },
                //     columns: response.data.data.datas,
                //     data: response.data.data.data,
                // });
                setTaskAction(response.data.data);


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
                task_id: taskAction.id,
                checklist_id: checkListAction.id,
            }).then((response) => {
                console.log(response.data.data);

                setIsLoadingBtn(false);
                setIsModalChecklist(false);
                message.success("Tạo checklist thành công");

                // update state
                // const successData = {
                //     checklist: response.data.data.checklist,
                //     checklist_percent: response.data.data.percent
                // };
                // onSuccess(successData);
                setTaskChecklist(response.data.data.list);
                setTaskChecklistPercent(response.data.data.percent);
            }).catch((error) => {
                message.error("Tạo checklist thất bại");
            });
        }


        {/* form Thêm checklist */ }
        function formAddTaskChecklist(users, task) {
            function addFormCheckList() {
                setFormChecklist(prev => [...prev, formChecklist_default]);
            }

            function updateChecklistByIndex(indexToUpdate, updatedData) {
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
                {formAddTaskChecklist(props.users, taskAction)}
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
                    {taskAction.name}
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
                                    updateTaskByColumn(taskAction.id, 'name', values.name);
                                }}
                                autoComplete="off"
                                initialValues={{ name: taskAction.name }}
                            >
                                <Form.Item className="edit-description" name='name' label=''>
                                    <Input />
                                </Form.Item>
                            </Form>
                        }
                    >
                        <a onClick={(e) => formTitle.setFieldValue('name', taskAction.name)} className="_right">
                            <EditOutlined />
                        </a>
                    </Popconfirm>
                </h3>
                <p className="description01">Tạo bởi: {props.users[taskAction.create_by] ? props.users[taskAction.create_by].name : ''}</p>

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
                                initialValues={{ description: taskAction.description }}
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
                    <p className="description01">{taskAction.description === null ? <Empty image={null} description="Chưa có mô tả" /> : taskAction.description}</p>
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
                        <Progress percent={taskChecklistPercent} status={taskChecklistPercent === 100 ? "success" : "active"} />
                    </Flex>

                    <List
                        className="demo-loadmore-list"
                        itemLayout="horizontal"
                        pagination={{
                            pageSize: 10, //  số item mỗi trang
                        }}
                        dataSource={!taskChecklist ? [] : taskChecklist.map((item) => { return item; })}
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
                                                    task_id: taskAction.id,
                                                }).then(response => {
                                                    message.success('Cập nhật thứ tự thành công');
                                                    // onSuccess({ checklist: response.data.data.list, checklist_percent: response.data.data.percent });
                                                    setTaskChecklist(response.data.data.list);
                                                    setTaskChecklistPercent(response.data.data.percent);
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
                        dataSource={!taskComments ? [] : taskComments.map((item) => { return item; })}
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
                                                // onSuccess({ comments: response.data.data });
                                                setTaskComments(response.data.data);
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
                                !taskAction.task_status_id
                                    ?
                                    <span className="value-list">Chưa xác định</span>
                                    :
                                    <>
                                        <Tag style={{ color: status[taskAction.task_status_id].color, background: status[taskAction.task_status_id].background }}>
                                            <span>{icon[status[taskAction.task_status_id].icon]} </span>
                                            <span> {status[taskAction.task_status_id].name}</span>
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
                                                    updateTaskByColumn(taskAction.id, 'task_status_id', item.id);
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
                                !taskAction.task_priority_id
                                    ?
                                    <span className="value-list">Chưa xác định</span>
                                    :
                                    <Tag style={{ color: priority[taskAction.task_priority_id].color }}>{priority[taskAction.task_priority_id].name} </Tag>

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
                                                    updateTaskByColumn(taskAction.id, 'task_priority_id', item.id);
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
                                        value={taskAction.nguoi_thuc_hien}
                                        placeholder="Chọn nhân viên thực hiện"
                                        optionFilterProp="children"
                                        options={optionEntries(props.users)}
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        onChange={(value) => {
                                            updateTaskByColumn(taskAction.id, 'nguoi_thuc_hien', value);
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
                                    !taskAction.nguoi_thuc_hien
                                        ?
                                        <span className="value-list">Chưa xác định</span>
                                        :
                                        <Tag style={{ color: '#03ba56ff' }}>{props.users[taskAction.nguoi_thuc_hien].name} </Tag>
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
                                        value={taskAction.nguoi_theo_doi}
                                        placeholder="Chọn nhân viên thực hiện"
                                        optionFilterProp="children"
                                        options={optionEntries(props.users)}
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        onChange={(value) => {
                                            console.log(value);

                                            updateTaskByColumn(taskAction.id, 'nguoi_theo_doi', value);
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
                                    !taskAction.nguoi_theo_doi
                                        ?
                                        <span className="value-list">Chưa xác định</span>
                                        :
                                        <div>
                                            {taskAction.nguoi_theo_doi.map((item, key) => (
                                                <Tag color="cyan" key={key}>{props.users[item] ? props.users[item].name : ''} </Tag>
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
                                        value={taskAction.tags}
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

                                            updateTaskByColumn(taskAction.id, 'tags', value);
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
                                    !taskAction.tags
                                        ?
                                        <span className="value-list">Chưa xác định</span>
                                        :
                                        <div>
                                            {taskAction.tags.map((item, key) => (
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
                            <span className="value-list"> {taskAction.created_at ? dayjs(taskAction.created_at).format(DATE_SHOW) : ''}</span>
                        </div>,
                        // Ngày cập nhật
                        <div className="item03">
                            <a><FlagFilled /> </a>
                            Bắt đầu:
                            <span className="value-list"> {taskAction.start ? dayjs(taskAction.start).format(DATE_SHOW) : 'Chưa xác định'}</span>
                            <Popover placement="bottomLeft"
                                title="Ngày bắt đầu"
                                trigger="click"
                                content={
                                    <DatePicker format='DD/MM/YYYY'
                                        onChange={(date) => {
                                            updateTaskByColumn(taskAction.id, 'start', date.format('YYYY-MM-DD'));
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
                            <span className="value-list"> {taskAction.end ? dayjs(taskAction.end).format(DATE_SHOW) : 'Chưa xác định'}</span>
                            <Popover placement="bottomLeft"
                                title="Ngày hoàn thành"
                                trigger="click"
                                content={
                                    <DatePicker format='DD/MM/YYYY'
                                        onChange={(date) => {
                                            updateTaskByColumn(taskAction.id, 'end', date.format('YYYY-MM-DD'));
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
                            <span className="value-list"> {taskAction.actual ? dayjs(taskAction.actual).format(DATE_SHOW) : 'Chưa xác định'}</span>
                            <Popover placement="bottomLeft"
                                title="Ngày hoàn thành"
                                trigger="click"
                                content={
                                    <DatePicker format='DD/MM/YYYY'
                                        onChange={(date) => {
                                            updateTaskByColumn(taskAction.id, 'actual', date.format('YYYY-MM-DD'));
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
                                                    updateTaskByColumn(taskAction.id, 'is_daily', status);
                                                }}
                                                checked={taskAction.is_daily}>Daily</Checkbox>
                                        </Col>
                                        <Col span={24}>
                                            <Checkbox value="is_weekly"
                                                onChange={(e) => {
                                                    let status = 0;
                                                    if (e.target.checked) {
                                                        status = 1;
                                                    }
                                                    updateTaskByColumn(taskAction.id, 'is_weekly', status);
                                                }}
                                                checked={taskAction.is_weekly}>Weekly</Checkbox>
                                        </Col>
                                        <Col span={24}>
                                            <Checkbox value="1"
                                                onChange={(e) => {
                                                    let status = 0;
                                                    if (e.target.checked) {
                                                        status = 1;
                                                    }
                                                    updateTaskByColumn(taskAction.id, 'is_monthly', status);
                                                }}
                                                checked={taskAction.is_monthly}>Monthly</Checkbox>
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
                            <span className="value-list"> {taskAction.is_daily ? 'Có' : 'Không'}</span>
                        </div>,

                        // weekly
                        <div className="item03">
                            <a><FileSearchOutlined /> </a>
                            Weekly:
                            <span className="value-list"> {taskAction.is_weekly ? 'Có' : 'Không'}</span>
                        </div>,

                        // monthly
                        <div className="item03">
                            <a><FileMarkdownOutlined /> </a>
                            Monthly:
                            <span className="value-list"> {taskAction.is_monthly ? 'Có' : 'Không'}</span>
                        </div>,

                        // delete
                        <div className="item03">
                            <Popconfirm
                                icon={<DeleteOutlined />}
                                title="Xác nhận xóa"
                                description="Dữ liệu sẽ bị xóa hòa toàn, bạn xác nhận chứ?"
                                onConfirm={() => {
                                    handleDelete(taskAction.id, status);
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

    function projectInfo() {
        const [formDesc] = Form.useForm();
        const [formTitle] = Form.useForm();
        const [formComment] = Form.useForm();
        const [isLoadingBtn, setIsLoadingBtn] = useState(false);
        const [isApplyAll, setIsApplyAll] = useState(false);
        const [isModalComment, setIsModalComment] = useState(false);
        const [commentAction, setCommentAction] = useState({ id: 0 });
        const [checkListAction, setCheckListAction] = useState({ id: 0 });
        const [isModalChecklist, setIsModalChecklist] = useState(false);

        // const projectComments = projectComments;
        // formChecklist
        const formChecklist_default = { name: '', content: '', admin_user_id: null };
        const [formChecklist, setFormChecklist] = useState([formChecklist_default, formChecklist_default, formChecklist_default]);
        const status = props.projectStatus;


        const onFinishFormDesc = async (values: any) => {
            updateTaskByColumn(projectAction.id, 'description', values.description);
        }
        const onFinishFormComment = async (values: any) => {
            // setIsLoadingBtn(true);
            console.log(commentAction);
            // return
            axios.post(route('task.addComment'), {
                task_id: projectAction.id,
                content: values.content,
                id: commentAction.id
            }).then(response => {
                setIsModalComment(false);
                formComment.resetFields();
                setIsLoadingBtn(false);
                message.success('Đã thêm comment');
                setProjectComments(response.data.data);
            }).catch(error => {
                message.error('Thêm comment thất bại');
            });
        }

        function editComment(id: number, columnName: string, value: any) {
            axios.post(route('data.fastEditByTableName'), {
                tbl_name: 'task_comments',
                id: id,
                value: value,
                task_id: projectAction.id,
                column_name: columnName,
            }).then(response => {
                setIsLoadingBtn(false);
                message.success('Cập nhật thành công');
                setProjectChecklist(response.data.data.list);
                setProjectChecklistPercent(response.data.data.percent);
            }).catch(error => {
                message.error('Cập nhật thất bại');
            });
        }

        const removeChecklistByIndex = (indexToRemove: number, id: number) => {
            axios.post(route('data.fastEditByTableName'), {
                column_name: 'is_recycle_bin',
                tbl_name: 'task_checklist',
                id: id,
                task_id: projectAction.id,
                value: 1
            }).then(response => {
                setIsLoadingBtn(false);
                message.success('Xóa checklist thành công');
                console.log('response.data.data', response.data.data);

                setProjectChecklist(response.data.data.list);
                setProjectChecklistPercent(response.data.data.percent);
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
            axios.post(route('project.delete', id), params).then(response => {
                message.success('Đã xóa thành công');

                setOpenProjectDetail(false);
                setProjectChecklistPercent(response.data.data.percent);
                // const dataSuccess = {
                //     isClosed: true,
                //     datas: response.data.data.datas,
                // }
            }).catch(error => {
                message.error('Xóa thất bại');
            });

            // setOpenDetail(false);
            message.success("Đã xóa thành công");
        };

        function updateTaskByColumn(id: number, columnName: string, value: any) {
            axios.post(route('project.fastEditProject'), {
                column_name: columnName,
                id: projectAction.id,
                value: value,
                parentName: props.parentName,
                searchData: props.searchData,
                display: props.display
            }).then(response => {
                setIsLoadingBtn(false);
                message.success('Cập nhật thành công');
                setProjectAction(response.data.data.dataAction);
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
            axios.post(route("project.addChecklist"), {
                data: formChecklist,
                project_id: projectAction.id,
                checklist_id: checkListAction.id,
            }).then((response) => {
                console.log(response.data.data);

                setIsLoadingBtn(false);
                setIsModalChecklist(false);
                message.success("Tạo checklist thành công");

                // update state
                setProjectChecklist(response.data.data.checklist);
                setProjectChecklistPercent(response.data.data.percent);
            }).catch((error) => {
                message.error("Tạo checklist thất bại");
            });
        }


        {/* form Thêm checklist */ }
        function formAddTaskChecklist(users, task) {
            function addFormCheckList() {
                setFormChecklist(prev => [...prev, formChecklist_default]);
            }

            function updateChecklistByIndex(indexToUpdate, updatedData) {
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
                {formAddTaskChecklist(props.users, projectAction)}
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
                    {projectAction.name}
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
                                    updateTaskByColumn(projectAction.id, 'name', values.name);
                                }}
                                autoComplete="off"
                                initialValues={{ name: projectAction.name }}
                            >
                                <Form.Item className="edit-description" name='name' label=''>
                                    <Input />
                                </Form.Item>
                            </Form>
                        }
                    >
                        <a onClick={(e) => formTitle.setFieldValue('name', projectAction.name)} className="_right">
                            <EditOutlined />
                        </a>
                    </Popconfirm>
                </h3>
                <p className="description01">Tạo bởi: {props.users[projectAction.create_by] ? props.users[projectAction.create_by].name : ''}</p>

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
                                initialValues={{ description: projectAction.description }}
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
                    <p className="description01">{projectAction.description === null ? <Empty image={null} description="Chưa có mô tả" /> : projectAction.description}</p>
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
                        <Progress percent={projectChecklistPercent} status={projectChecklistPercent === 100 ? "success" : "active"} />
                    </Flex>

                    <List
                        className="demo-loadmore-list"
                        itemLayout="horizontal"
                        pagination={{
                            pageSize: 10, //  số item mỗi trang
                        }}
                        dataSource={!projectChecklist ? [] : projectChecklist.map((item) => { return item; })}
                        locale={{ emptyText: 'Danh sách checklist trống' }}
                        renderItem={(item, key) => (
                            <List.Item
                                actions={[
                                    <span>{item.nguoi_thuc_hien_name ? <Tag color="blue">{item.nguoi_thuc_hien_name}</Tag> : ''}</span>,

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
                                                    task_id: projectAction.id,
                                                }).then(response => {
                                                    message.success('Cập nhật thứ tự thành công');

                                                    setProjectChecklist(response.data.data.list);
                                                    setProjectChecklistPercent(response.data.data.percent);
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
                        dataSource={!projectComments ? [] : projectComments.map((item) => { return item; })}
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
                                !projectAction.project_status_id
                                    ?
                                    <span className="value-list">Chưa xác định</span>
                                    :
                                    <>
                                        <Tag style={{ color: status[projectAction.project_status_id].color, background: status[projectAction.project_status_id].background }}>
                                            <span>{icon[status[projectAction.project_status_id].icon]} </span>
                                            <span> {status[projectAction.project_status_id].name}</span>
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
                                                    updateTaskByColumn(projectAction.id, 'project_status_id', item.id);
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

                        // người thực hiện
                        <div className="item03">
                            <a><UserOutlined /> </a>
                            <span>Quản lý: </span>
                            <Popover placement="bottomLeft"
                                title="Chọn người quản lý"
                                trigger="click"
                                content={
                                    <Select
                                        showSearch
                                        style={{ width: "100%" }}
                                        value={projectAction.project_manager}
                                        placeholder="Chọn nhân viên thực hiện"
                                        optionFilterProp="children"
                                        options={optionEntries(props.users)}
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        onChange={(value) => {
                                            updateTaskByColumn(projectAction.id, 'project_manager', value);
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
                                    !projectAction.project_manager
                                        ?
                                        <span className="value-list">Chưa xác định</span>
                                        :
                                        <Tag color="cyan">{props.users[projectAction.project_manager].name} </Tag>
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
                                        value={projectAction.nguoi_theo_doi}
                                        placeholder="Chọn nhân viên thực hiện"
                                        optionFilterProp="children"
                                        options={optionEntries(props.users)}
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        onChange={(value) => {
                                            console.log(value);

                                            updateTaskByColumn(projectAction.id, 'nguoi_theo_doi', value);
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
                                    !projectAction.nguoi_theo_doi
                                        ?
                                        <span className="value-list">Chưa xác định</span>
                                        :
                                        <div>
                                            {projectAction.nguoi_theo_doi.map((item, key) => (
                                                <Tag color="cyan" key={key}>{props.users[item] ? props.users[item].name : ''} </Tag>
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
                                        value={projectAction.tags}
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

                                            updateTaskByColumn(projectAction.id, 'tags', value);
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
                                    !projectAction.tags
                                        ?
                                        <span className="value-list">Chưa xác định</span>
                                        :
                                        <div>
                                            {projectAction.tags.map((item, key) => (
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
                            <span className="value-list"> {projectAction.created_at ? dayjs(projectAction.created_at).format(DATE_SHOW) : ''}</span>
                        </div>,
                        // Ngày cập nhật
                        <div className="item03">
                            <a><FlagFilled /> </a>
                            Bắt đầu:
                            <span className="value-list"> {projectAction.start ? dayjs(projectAction.start).format(DATE_SHOW) : 'Chưa xác định'}</span>
                            <Popover placement="bottomLeft"
                                title="Ngày bắt đầu"
                                trigger="click"
                                content={
                                    <DatePicker format='DD/MM/YYYY'
                                        onChange={(date) => {
                                            updateTaskByColumn(projectAction.id, 'start', date.format('YYYY-MM-DD'));
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
                            <span className="value-list"> {projectAction.end ? dayjs(projectAction.end).format(DATE_SHOW) : 'Chưa xác định'}</span>
                            <Popover placement="bottomLeft"
                                title="Ngày hoàn thành"
                                trigger="click"
                                content={
                                    <DatePicker format='DD/MM/YYYY'
                                        onChange={(date) => {
                                            updateTaskByColumn(projectAction.id, 'end', date.format('YYYY-MM-DD'));
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
                            <span className="value-list"> {projectAction.actual ? dayjs(projectAction.actual).format(DATE_SHOW) : 'Chưa xác định'}</span>
                            <Popover placement="bottomLeft"
                                title="Ngày hoàn thành"
                                trigger="click"
                                content={
                                    <DatePicker format='DD/MM/YYYY'
                                        onChange={(date) => {
                                            updateTaskByColumn(projectAction.id, 'actual', date.format('YYYY-MM-DD'));
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
                                                    updateTaskByColumn(projectAction.id, 'is_daily', status);
                                                }}
                                                checked={projectAction.is_daily}>Daily</Checkbox>
                                        </Col>
                                        <Col span={24}>
                                            <Checkbox value="is_weekly"
                                                onChange={(e) => {
                                                    let status = 0;
                                                    if (e.target.checked) {
                                                        status = 1;
                                                    }
                                                    updateTaskByColumn(projectAction.id, 'is_weekly', status);
                                                }}
                                                checked={projectAction.is_weekly}>Weekly</Checkbox>
                                        </Col>
                                        <Col span={24}>
                                            <Checkbox value="1"
                                                onChange={(e) => {
                                                    let status = 0;
                                                    if (e.target.checked) {
                                                        status = 1;
                                                    }
                                                    updateTaskByColumn(projectAction.id, 'is_monthly', status);
                                                }}
                                                checked={projectAction.is_monthly}>Monthly</Checkbox>
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
                            <span className="value-list"> {projectAction.is_daily ? 'Có' : 'Không'}</span>
                        </div>,

                        // weekly
                        <div className="item03">
                            <a><FileSearchOutlined /> </a>
                            Weekly:
                            <span className="value-list"> {projectAction.is_weekly ? 'Có' : 'Không'}</span>
                        </div>,

                        // monthly
                        <div className="item03">
                            <a><FileMarkdownOutlined /> </a>
                            Monthly:
                            <span className="value-list"> {projectAction.is_monthly ? 'Có' : 'Không'}</span>
                        </div>,

                        // delete
                        <div className="item03">
                            <Popconfirm
                                icon={<DeleteOutlined />}
                                title="Xác nhận xóa"
                                description="Dữ liệu sẽ bị xóa hòa toàn, bạn xác nhận chứ?"
                                onConfirm={() => {
                                    handleDelete(projectAction.id, status);
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
                {/* <Timeline
                    items={props.logs.map((item) => {
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
                /> */}
            </Col>
        </Row>
    }


    function setPagination(pagination) {
        router.get(
            route("data.index", [props.table.id, props.searchData]),
            pagination
        );
    }
    //
    const EditableCell = ({
        editing,
        dataIndex,
        title,
        inputType,
        record,
        index,
        children,
        ...restProps
    }) => {
        let inputNode;
        return <td {...restProps}>{children}</td>;
    };
    //
    const deletes = () => {
        setLoadingTable(true);
        axios
            .post(route("data.delete", [props.table.id]), {
                ids: selectedRowKeys,
            })
            .then((response) => {
                if (response.data.status_code == 200) {
                    let dataSrc = [];
                    for (var key in dataSource) {
                        if (!selectedRowKeys.includes(dataSource[key].key)) {
                            dataSrc.push(dataSource[key]);
                        }
                    }
                    message.success("Đã xóa");
                    setDataSource(dataSrc);
                    setSelectedRowKeys([]);
                } else {
                    setSelectedRowKeys([]);
                    message.error("Xóa thất bại");
                }
                setIsOpenConfirmDelete(false);
                setLoadingTable(false);
            })
            .catch((error) => {
                setSelectedRowKeys([]);
                setIsOpenConfirmDelete(false);
                setLoadingTable(false);
                message.error("Có lỗi xảy ra");
            });
    };

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;

    const confirmDelete = () => {
        setIsOpenConfirmDelete(true);
    };
    const handleCancelDelete = () => {
        setIsOpenConfirmDelete(false);
    };

    const onFinishSearch = (values: any) => {
        values.p = props.p;
        router.get(route("meeting.index"), values);
    };

    const onFinishSearchFailed = (errorInfo: any) => {
        console.log("Failed:", errorInfo);
    };

    function initialValueSearch() {
        // props.searchData
        let result = props.searchData;
        return result;
    }

    function onClickItem(record: any) {
        if (record.data_type === 'projects') {
            setOpenProjectDetail(true);
            axios.post(route('project.getProjectInfo', record.data_id)).then((res) => {
                console.log('res', res);
                setProjectChecklist(res.data.data.checklist);
                setProjectChecklistPercent(res.data.data.percent);
                setProjectComments(res.data.data.comments);
                setProjectAction(res.data.data.project);
            });
        }
        if (record.data_type === 'tasks') {
            setOpenTaskDetail(true);
            axios.post(route('task.getTaskInfo', record.data_id)).then((res) => {
                console.log(res);
                setTaskChecklist(res.data.data.checklist);
                setTaskChecklistPercent(res.data.data.percent);
                setTaskComments(res.data.data.comments);
                setTaskAction(res.data.data.task);
                setPriority(res.data.data.priority);
                setTaskLog(res.data.data.logs);
            });
        }
    }

    function searchLeft() {
        if (props.table.search_position !== 1) {
            return '';
        }

        return <div>
            <Form
                name="basic"
                layout="vertical"
                onFinish={onFinishSearch}
                onFinishFailed={onFinishSearchFailed}
                autoComplete="off"
                form={formSearch}
                initialValues={initialValueSearch()}
                onBlur={(e) => { formSearch.submit(); }}
            >
                <Row gutter={24} className="main-search-left">
                    {/* smartSearch */}
                    <Col sm={{ span: 24 }} className='item-search'>
                        <Form.Item name='sm_keyword' label='Từ khoá'>
                            <Input onBlur={() => { formSearch.submit(); }} />
                        </Form.Item>
                    </Col>

                    {/* meeting */}
                    <Col span={24}>
                        <Form.Item name='meeting' label='Meeting'>
                            <CheckboxGroup className="item-status"
                                options={[
                                    { label: 'Daily', value: 'daily' },
                                    { label: 'Weekly', value: 'weekly' },
                                    { label: 'Monthly', value: 'monthly' },
                                    { label: 'Yearly', value: 'yearly' },
                                ]}
                                onChange={(e) => formSearch.submit()}
                            />
                        </Form.Item>
                    </Col>

                    {/* status */}
                    <Col span={24}>
                        <Form.Item name='result' label='Trạng thái'>
                            <CheckboxGroup className="item-status"
                                options={Object.entries(props.meetingStatus).map(([key, val]: [string, any]) => ({ label: val.name, value: key }))}
                                onChange={(e) => formSearch.submit()}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <br />
                    </Col>
                </Row>
            </Form>
            <br />
        </div>
    }

    const expandedRowRender = (record: any, index: number) => {
        // meeting info
        const info = [
            <div><b>Tiêu đề: </b> {record.name}</div>,
            <div>{showTypeMeeting(record, <em></em>)}</div>,
            <div>
                {props.meetingStatus[record.meeting_status_id] ? (
                    <Tag style={{ color: props.meetingStatus[record.meeting_status_id]?.color, background: props.meetingStatus[record.meeting_status_id]?.background }}>
                        <span>{icon[props.meetingStatus[record.meeting_status_id]?.icon]} </span>
                        <span> {props.meetingStatus[record.meeting_status_id]?.name}</span>
                    </Tag>
                ) : null}
            </div>
        ];

        // detail project or task
        let detail: any[] = [];

        if (record.data_type === 'projects') {
            detail.push(<div><b>Tiêu đề: </b> <a onClick={() => onClickItem(record)}>{record.project_name}</a></div>);
            // project_manager
            detail.push(<div><b>Quản lý: </b>
                {props.users[record.project_manager] ? <Tag style={{ color: '#000' }}>{props.users[record.project_manager].name}</Tag> : ''}
            </div>);
            detail.push(<div><b>Bắt đầu: </b>{record.project_start}</div>);
            detail.push(<div><b>Kết thúc: </b>{record.project_end}</div>);
        }

        if (record.data_type === 'tasks') {
            detail.push(<div><b>Tiêu đề: </b><a onClick={() => onClickItem(record)}>{record.task_name}</a></div>);
            detail.push(<div><b>Người làm: </b>
                {props.users[record.task_nguoi_thuc_hien] ? <Tag style={{ color: '#000' }}>{props.users[record.task_nguoi_thuc_hien].name}</Tag> : ''}
            </div>);
            detail.push(<div><b>Bắt đầu: </b>{record.task_start}</div>);
            detail.push(<div><b>Kết thúc: </b>{record.task_end}</div>);
        }



        return <Row key={record.id}>
            <Col span={12} style={{ background: '#e9f4f9', padding: '10px', marginBottom: '10px' }}   >
                <List
                    header={<b>Thông tin cuộc họp <a className="_right" onClick={() => {
                        let meetingType = [];
                        if (record.is_daily) {
                            meetingType.push('is_daily');
                        }
                        if (record.is_weekly) {
                            meetingType.push('is_weekly');
                        }
                        if (record.is_monthly) {
                            meetingType.push('is_monthly');
                        }
                        if (record.is_yearly) {
                            meetingType.push('is_yearly');
                        }

                        // set
                        setIsModalEdit(true);
                        setMeetingDataAction(record);
                        formMeetingEdit.setFieldsValue({ name: record.name });
                        formMeetingEdit.setFieldsValue({ meeting_status_id: record.meeting_status_id });
                        formMeetingEdit.setFieldsValue({ meeting_type: meetingType });
                    }}><EditFilled /></a></b>}
                    bordered
                    dataSource={info}
                    renderItem={(item: any) => (
                        <List.Item>
                            {item}
                        </List.Item>
                    )}
                />
            </Col>
            <Col span={12} style={{ background: '#eff7f1', padding: '10px', marginBottom: '10px' }}   >
                <List
                    header={<a onClick={() => onClickItem(record)}><b> <EyeOutlined /> Chi tiết công việc</b></a>}
                    bordered
                    dataSource={detail}
                    renderItem={(item: any) => (
                        <List.Item>
                            {item}
                        </List.Item>
                    )}
                />
            </Col>
            <Col span={24} style={{ background: '#fff', padding: '10px', marginBottom: '10px' }}   >
                <p><b>Nội dung cuộc họp:</b></p>
                <div dangerouslySetInnerHTML={{ __html: record.description }} />
            </Col>
        </Row>
    }

    const cancelEdit = () => {
        setIsOpenFormEdit(false);
    }

    // Component: Thêm nhanh Meeting (tách khỏi hàm có hook)
    function FormAddExpress({
        users,
        searchData,
        onClose,
        onDone,
    }: {
        users: any[];
        searchData: any;
        onClose: () => void;
        onDone: (newData: any[]) => void;
    }) {
        const formAddExpress_default = {
            name: "",
            meeting_type: "is_daily",
            meeting_status_id: 1,
            task_id: null,
        };
        const [rows, setRows] = React.useState([{ ...formAddExpress_default }]);
        const [applyAll, setApplyAll] = React.useState(true);
        const [isLoading, setIsLoading] = React.useState(false);

        const remove = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));

        const updateRow = (idx: number, key: string, val: any) => {
            if (key === "meeting_status_id" && applyAll) {
                setRows((prev) => prev.map((r) => ({ ...r, [key]: val })));
                return;
            }
            setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: val } : r)));
        };

        const addRow = () => setRows((prev) => [...prev, { ...formAddExpress_default }]);

        const submit = async () => {
            // validate
            for (const r of rows) {
                if ((r.name || "").trim() !== "" && !r.meeting_status_id) {
                    message.error("Vui lòng chọn trạng thái cho bản ghi có tiêu đề");
                    return;
                }
            }
            try {
                setIsLoading(true);
                const res = await axios.post(route("meeting.addExpress"), {
                    datas: rows,
                    searchData,
                });
                message.success("Tạo mới thành công");
                onDone(res.data.data);
                onClose();
            } catch {
                message.error("Tạo mới thất bại");
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <div>
                <table className="table-sub">
                    <thead>
                        <tr>
                            <th>
                                <span>Tiêu đề </span>
                                {showInfo("Chỉ lưu những công việc có nhập nội dung cho tiêu đề. nếu bỏ trống tiêu đề thì sẽ bỏ qua")}
                            </th>
                            <th>
                                <span>Meeting </span>
                                {showInfo("Loại cuộc họp")}
                                <br />
                                <Checkbox checked={applyAll} onChange={(e) => setApplyAll(e.target.checked)}>
                                    <em>Áp dụng tất cả</em>
                                </Checkbox>
                            </th>
                            <th>
                                <span>Trạng thái </span>
                                {showInfo("Trạng thái cuộc họp")}
                                <br />
                                <Checkbox checked={applyAll} onChange={(e) => setApplyAll(e.target.checked)}>
                                    <em>Áp dụng tất cả</em>
                                </Checkbox>
                            </th>
                            <th>
                                <span>Chọn công việc cần họp </span>
                                {showInfo("Chọn công việc đã tạo sẵn trước đó")}
                            </th>
                            <th>Xóa</th>
                        </tr>
                    </thead>

                    {rows.map((item, key) => (
                        <tbody key={key}>
                            <tr>
                                <td>
                                    <Input.TextArea
                                        value={item.name}
                                        placeholder="Nhập tiêu đề"
                                        onChange={(e) => updateRow(key, "name", e.target.value)}
                                    />
                                </td>
                                <td>
                                    <Select
                                        showSearch
                                        style={{ width: "100%" }}
                                        placeholder="Chọn loại"
                                        optionFilterProp="children"
                                        options={[
                                            { label: "Daily", value: "is_daily" },
                                            { label: "Weekly", value: "is_weekly" },
                                            { label: "Monthly", value: "is_monthly" },
                                            { label: "Yearly", value: "is_yearly" },
                                        ]}
                                        value={item.meeting_type}
                                        onChange={(val) => updateRow(key, "meeting_type", val)}
                                    />
                                </td>
                                <td>
                                    <Select
                                        showSearch
                                        style={{ width: "100%" }}
                                        placeholder="Chọn trạng thái"
                                        optionFilterProp="children"
                                        options={optionEntries((window as any).props?.meetingStatus || {})}
                                        value={item.meeting_status_id}
                                        onChange={(val) => updateRow(key, "meeting_status_id", val)}
                                    />
                                </td>
                                <td>
                                    <Select
                                        showSearch
                                        style={{ width: "100%" }}
                                        placeholder="Chọn công việc"
                                        optionFilterProp="children"
                                        options={((window as any).props?.tasks || []).map((task: any) => ({
                                            label: task.name,
                                            value: task.id,
                                        }))}
                                        value={item.task_id}
                                        onChange={(val) => updateRow(key, "task_id", val)}
                                    />
                                </td>
                                <td>
                                    <span onClick={() => remove(key)} title="Xóa" className="icon-large cursor">
                                        <DeleteOutlined />
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    ))}

                    <tbody>
                        <tr>
                            <td colSpan={4}>
                                <a className="add-item01">
                                    <span className="icon-b" onClick={addRow}>
                                        <PlusCircleOutlined /> Thêm meeting
                                    </span>
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={4}>
                                <Row className="main-modal-footer01">
                                    <Col span={24} className="main-btn-popup">
                                        <Button className="btn-popup" type="primary" onClick={submit} loading={isLoading}>
                                            <CheckOutlined />
                                            TẠO NHANH
                                        </Button>
                                        <span> </span>
                                        <Button className="btn-popup" onClick={onClose} loading={isLoading}>
                                            <CloseSquareOutlined />
                                            ĐÓNG
                                        </Button>
                                    </Col>
                                </Row>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    // Component: Cài đặt cột (tách khỏi hàm có hook)
    function BtnSetting({
        tableSetting,
        columnData,
    }: {
        tableSetting: any;
        columnData: any[];
    }) {
        const [openSetting, setOpenSetting] = React.useState(false);
        const [gData, setGData] = React.useState<any[]>(columnData || []);
        const [loadingBtn, setLoadingBtn] = React.useState(false);

        const onDropData = async (info: any) => {
            const result = onDrop(info, gData);
            setGData(result);
            try {
                await axios.post(route("column.update_sort_order"), { data: JSON.stringify(result) });
                message.success("Cập nhật thứ tự thành công");
            } catch {
                message.error("Cập nhật thứ tự thất bại");
            }
        };

        return (
            <div>
                <Modal
                    title={
                        <div>
                            Cài đặt <hr />
                            {showsettingMenu(tableSetting)}
                            <hr />
                        </div>
                    }
                    open={openSetting}
                    onCancel={() => setOpenSetting(false)}
                    footer={[]}
                >
                    <Tree
                        className="draggable-tree tree-modal"
                        draggable
                        blockNode
                        onDrop={onDropData}
                        treeData={formatGdata_column(gData)}
                    />
                </Modal>
                <Button type="primary" loading={loadingBtn} onClick={() => setOpenSetting(true)} className="_right">
                    <SettingOutlined />
                </Button>
            </div>
        );
    }

    // Component: Nhóm nút bên phải (thêm mới, route ngoài, cài đặt)
    function BtnIndex({
        table,
        users,
        searchData,
        tableSetting,
        columnData,
        onOpenAddNew,
    }: {
        table: any;
        users: any[];
        searchData: any;
        tableSetting: any;
        columnData: any[];
        onOpenAddNew: () => void;
    }) {
        const btnFromRoute = () => {
            if (!table?.add_btn_from_route) return null;
            const routes = parseJson(table.add_btn_from_route);
            if (!routes) return null;
            return Object.values(routes).map((rt: any) => (
                <Link key={rt.name} href={route(rt.name)}>
                    <Button type="primary" className={rt.class}>
                        <PlusCircleOutlined /> {rt.display_name}
                    </Button>
                </Link>
            ));
        };

        return (
            <Space className="_right">
                {btnFromRoute()}
                <Button type="primary" onClick={onOpenAddNew}>
                    <PlusCircleOutlined />
                    Thêm mới
                </Button>
                {table?.setting_shotcut === 1 ? (
                    <BtnSetting tableSetting={tableSetting} columnData={columnData || []} />
                ) : null}
            </Space>
        );
    }

    function showTypeMeeting(record: any, style = <br />) {
        let result = [];
        let isMeetting = false;
        if (record.is_daily === 1) {
            isMeetting = true;
            result.push(<Tag color="blue">Daily</Tag>);
        }
        if (record.is_weekly === 1) {
            if (isMeetting) {
                result.push(style);
            }
            result.push(<Tag color="green">Weekly</Tag>);
        }
        if (record.is_monthly === 1) {
            if (isMeetting) {
                result.push(style);
            }
            result.push(<Tag color="purple">Monthly</Tag>);
        }
        return result;
    }

    function showNguoiThucHien(record: any) {
        let result = [];
        let isLine01 = false;
        if (props.users[record.task_nguoi_thuc_hien]) {
            isLine01 = true;
            result.push(<Tag color="cyan">{props.users[record.task_nguoi_thuc_hien].name}</Tag>);
        }
        if (props.users[record.project_manager]) {
            isLine01 = true;
            result.push(<Tag color="cyan">{props.users[record.project_manager].name}</Tag>);
        }

        if (props.taskStatus[record.task_status_id]) {
            if (isLine01) {
                result.push(<br />);
            }
            result.push(
                <Tag style={{ color: props.taskStatus[record.task_status_id]?.color, background: props.taskStatus[record.task_status_id]?.background }}>
                    <span>{icon[props.taskStatus[record.task_status_id]?.icon]} </span>
                    <span> {props.taskStatus[record.task_status_id]?.name}</span>
                </Tag>
            );
        }

        if (props.projectStatus[record.project_status_id]) {
            if (isLine01) {
                result.push(<br />);
            }
            result.push(
                <Tag style={{ color: props.projectStatus[record.project_status_id]?.color, background: props.projectStatus[record.project_status_id]?.background }}>
                    <span>{icon[props.projectStatus[record.project_status_id]?.icon]} </span>
                    <span> {props.projectStatus[record.project_status_id]?.name}</span>
                </Tag>
            );
        }

        return <>{result}</>;
    }

    const columns2: ColumnsType<any> = [
        {
            title: 'Name', dataIndex: 'name', render: (text, record: any) => {
                return <b>{text}</b>
            }
        },
        {
            title: 'Meeting', dataIndex: 'Meeting', render: (text, record: any) => {
                return showTypeMeeting(record);
            }
        },
        {
            title: 'Người làm', dataIndex: 'nguoi_thuc_hien', render: (text, record: any) => {
                return showNguoiThucHien(record);
            }
        },
        {
            title: 'Kết quả', dataIndex: 'status', render: (text: any, record: any) => {
                return <>
                    {
                        props.meetingStatus[record.meeting_status_id] ? (
                            <Tag style={{ color: props.meetingStatus[record.meeting_status_id]?.color, background: props.meetingStatus[record.meeting_status_id]?.background }}>
                                <span>{icon[props.meetingStatus[record.meeting_status_id]?.icon]} </span>
                                <span> {props.meetingStatus[record.meeting_status_id]?.name}</span>
                            </Tag>
                        ) : null
                    }
                </>
            }
        },
    ];

    const pageContent = (
        <div>
            <Form form={form} component={false}>
                <div style={{ marginBottom: 16 }}>
                    {/* confirm delete */}
                    <Modal
                        title="Xác nhận xóa"
                        open={isOpenConfirmDelete}
                        onOk={deletes}
                        onCancel={handleCancelDelete}
                    >
                        <p>
                            Dữ liệu đã xóa sẽ <b>không thể khôi phục</b> lại
                            được <br /> <b>(Số lượng {selectedRowKeys.length})</b>
                        </p>
                    </Modal>

                    <Space></Space>

                    {/* THAY {btnIndex()} bằng Component */}
                    <BtnIndex
                        table={props.table}
                        users={props.users}
                        searchData={props.searchData}
                        tableSetting={props.tableSetting}
                        columnData={props.columnData}
                        onOpenAddNew={() => {
                            setIsOpenFormEdit(true);
                        }}
                    />

                    {/* page name */}
                    <b className="title-page">Meeting.</b>
                    <em>
                        {" "}
                        ( Trang {props.pageConfig.currentPage}, hiển thị {props.pageConfig.count}/{props.pageConfig.total} )
                    </em>
                </div>

                <hr />
                <br />

                <Row>
                    <Col sm={{ span: 7 }}>
                        {searchLeft()}
                    </Col>
                    <Col sm={{ span: 17 }}>
                        <Table
                            size="small"
                            components={{ body: { cell: EditableCell } }}
                            loading={loadingTable}
                            pagination={tableParams.pagination}
                            dataSource={dataSource}
                            columns={columns2}
                            rowSelection={rowSelection}
                            expandable={{ expandedRowRender, defaultExpandedRowKeys: ['1'] }}
                        />
                    </Col>
                </Row>
            </Form>
        </div>
    );

    return (
        <div>
            <AdminLayout content={
                <div>
                    {/* Modal xác nhận hủy đơn */}
                    <Modal title="Xác nhận xóa"
                        open={isModalXoaOpen}
                        onOk={async () => {
                            setConfirmLoading(true);
                            const result = await callApi(route('hoa_don.huyHoaDon.xuatHuy', [idAction]));
                            if (result.status === 200) {
                                message.success("Đã hủy đơn thành công");
                                location.reload();
                            } else {
                                setConfirmLoading(false);
                                message.error("Đã hủy đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                            }
                        }}
                        okText="Xác nhận hủy đơn"
                        cancelText="Hủy"
                        loading={true}
                        maskClosable={true}
                        // confirmLoading={confirmLoading}
                        onCancel={() => { setIsModalXoaOpen(false); }}>
                        <ul>
                            <li>Các thông tin về hóa đơn này sẽ bị chuyển đến thùng rác</li>
                            <li>các dữ liệu liên quan như <em>phiếu thu, chi, sổ quỹ cũng sẽ được phục hồi lại</em></li>
                            <li>Bạn cũng có thể mở lại đơn này ở trong mục Thùng rác</li>
                        </ul>
                    </Modal>

                    {/* Modal cập nhật meeting */}
                    <Modal title="Cập nhật meeting"
                        width={1000}
                        open={isModalEdit}
                        onOk={async () => {
                            formMeetingEdit.submit();
                        }}
                        okText="Xác nhận hủy đơn"
                        cancelText="Hủy"
                        confirmLoading={confirmLoading}
                        maskClosable={false}
                        onCancel={() => { setIsModalEdit(false); }}>

                        <Form form={formMeetingEdit}
                            component={false}
                            layout="vertical"
                            onFinish={(values) => {
                                setConfirmLoading(true);
                                // xử lý dữ liệu trước khi submit
                                values.description = editor.current['description'].getContents(false);
                                values.id = meetingDataAction.id;
                                values.searchData = props.searchData;
                                // call api
                                axios.post(route('meeting.updateMeeting'), values).then((res) => {
                                    if (res.data.status_code === 200) {
                                        message.success("Lưu dữ liệu thành công");
                                        setIsModalEdit(false);
                                        setConfirmLoading(false);
                                        setDataSource(res.data.data);
                                    } else {
                                        message.error("Lưu dữ liệu thất bại");
                                        setConfirmLoading(false);
                                    }
                                    setConfirmLoading(false);
                                }).catch((error) => {
                                    message.error("Lưu dữ liệu thất bại");
                                    setConfirmLoading(false);
                                });
                            }}
                        >
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="name"
                                        label="Tiêu đề"
                                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                                    >
                                        <Input placeholder="Nhập tiêu đề" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="meeting_type"
                                        label="Loại cuộc họp"
                                        rules={[{ required: true, message: 'Vui lòng chọn loại cuộc họp' }]}
                                    >
                                        <Select
                                            showSearch
                                            mode='multiple'
                                            style={{ width: "100%" }}
                                            placeholder="Chọn loại cuộc họp"
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.label ?? "")
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                            options={[
                                                { label: 'Daily', value: 'is_daily' },
                                                { label: 'Weekly', value: 'is_weekly' },
                                                { label: 'Monthly', value: 'is_monthly' },
                                                { label: 'Yearly', value: 'is_yearly' },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="meeting_status_id"
                                        label="Trạng thái cuộc họp"
                                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái cuộc họp' }]}
                                    >
                                        <Select
                                            showSearch
                                            style={{ width: "100%" }}
                                            placeholder="Chọn trạng thái cuộc họp"
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.label ?? "")
                                                    .toLowerCase()
                                                    .includes(input.toLowerCase())
                                            }
                                            options={optionEntries(props.meetingStatus)}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={24}>

                                    <SunEditor getSunEditorInstance={(sunEditor) => { editor.current['description'] = sunEditor }}
                                        setContents={meetingDataAction.description ? meetingDataAction.description : ''}
                                        onImageUpload={handleImageUpload}
                                        onImageUploadError={handleImageUploadError}
                                        onResizeEditor={handleOnResizeEditor}
                                        imageUploadHandler={(xmlHttpRequest: any, info: any, core: any) => imageUploadHandler(xmlHttpRequest, info, core, 'description')}
                                        setOptions={optionSunEditor}
                                    />
                                </Col>
                            </Row>
                        </Form>
                    </Modal>

                    {/* Modal thêm nhanh: THAY {formAddExpress(props.users)} bằng Component */}
                    <Modal
                        title={"Thêm nhanh nội dung meeting"}
                        open={isOpenFormEdit}
                        onCancel={() => setIsOpenFormEdit(false)}
                        footer={[]}
                        width={1000}
                    >
                        <FormAddExpress
                            users={props.users}
                            searchData={props.searchData}
                            onClose={() => setIsOpenFormEdit(false)}
                            onDone={(newData) => setDataSource(newData)}
                        />
                    </Modal>

                    {pageContent}

                    <Drawer
                        title="Chi tiết dự án"
                        placement="right"
                        open={openProjectDetail}
                        // size={'large'}
                        onClose={() => setOpenProjectDetail(false)}
                        width="90%"
                    >
                        {projectInfo()}


                        <br />
                    </Drawer>

                    <Drawer
                        title="Chi tiết công việc"
                        placement="right"
                        open={openTaskDetail}
                        onClose={() => setOpenTaskDetail(false)}
                        width="90%"
                    >
                        {taskInfo()}

                        <br />

                    </Drawer>
                </div>
            } />
        </div>
    );
}
