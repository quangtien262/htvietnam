import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Link, router } from "@inertiajs/react";
import axios from "axios";
import dayjs from "dayjs";
import {
    Button,
    message,
    Modal,
    Form,
    Select,
    Row,
    Space,
    Tag,
    Divider,
    Col, Drawer, Empty,
    Checkbox, Popconfirm, List, Timeline, Popover, DatePicker, Flex, Progress, Input
} from "antd";
import {
    RollbackOutlined, CheckOutlined,
    ToolFilled, DeleteOutlined,
    ApartmentOutlined,
    SettingFilled, InsertRowAboveOutlined,
    PlusCircleFilled, ProfileOutlined, FileMarkdownOutlined, FileSearchOutlined, FileSyncOutlined,
    EditOutlined, DiffFilled, CheckSquareFilled, ScheduleFilled, FlagFilled, ClockCircleFilled,
    PushpinFilled, HddFilled, UsergroupAddOutlined, UserOutlined, DownOutlined, CaretRightFilled,
    FireFilled, InfoCircleFilled, PlusSquareFilled, EditFilled, SnippetsFilled, CopyOutlined,
    PlusCircleOutlined
} from "@ant-design/icons";
import { icon } from "../../../components/comp_icon";
import { taskConfig, taskInfo } from "./task_config";
import { updateTask } from "../../../Function/api";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { nl2br } from "../../../Function/common";

import TaskFormModal from "./TaskFormModal";
import TaskExpressForm from "./TaskExpressForm";
import TaskSearchForm from "./TaskSearchForm";
import TaskKanbanBoard from "./TaskKanbanBoard";

import { DATE_TIME_SHOW, DATE_SHOW, DATE_TIME_FORMAT } from "../../../Function/constant";

import "../../../../css/list02.css";
import "../../../../css/task.css";
import "../../../../css/form.css";
import { set } from "lodash";


export default function Dashboard(props: any) {
    const searchData = props.searchData || {};
    const [status, setStatus] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [taskLog, setTaskLog] = useState([]);
    const [users, setUsers] = useState([]);
    const [priority, setPriority] = useState([]);
    const [type, setType] = useState([]);

    const [isModalAddExpress, setIsModalAddExpress] = useState(false);
    // const [isLoadingBtn, setIsLoadingBtn] = useState(false);

    // checklist
    const [checklist, setChecklist] = useState([]);

    // const [formDesc] = Form.useForm();

    const [comments, setComments] = useState([]);
    const [isShowStatusSetting, setIsShowStatusSetting] = useState(false);

    const [formData] = Form.useForm();
    const [formSearch] = Form.useForm();

    const [openDetail, setOpenDetail] = useState(false);
    const [dataAction, setDataAction] = useState<any>({});
    const [checklistPercent, setChecklistPercent] = useState(0);

    // save: save and close
    // save_continue: save and add new
    const [typeSubmit, setTypeSubmit] = useState('save');

    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [isModalAddOpen, setIsModalAddOpen] = useState(false);

    const [columns, setColumns] = useState([]);

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



    const [isReady, setIsReady] = useState(false);
    function fetchData(request = {}) {
        axios.post(route('task.api.list'), request).then((res) => {
            setIsReady(true);

            console.log('res.data.data', res.data.data);
            setColumns(res.data.data.datas);
            setStatus(res.data.data.taskStatus);
            setStatusData(res.data.data.statusData);
            setUsers(res.data.data.users);
            setPriority(res.data.data.priority);
            setType(res.data.data.type);
        }).catch((err) => {
            console.error(err);
        });
    }

    useEffect(() => { fetchData(searchData) }, []);


    function closePopupStatus() {
        setIsShowStatusSetting(false);
    }

    const onFinishSearch = (values: any) => {
        values.display = props.display;
        values.p = props.p;
        values.pid = props.pid;
        // console.log('Received values of form: ', values);
        // return;
        router.get(route('task.list', [props.parentName]), values);
    };

    const onFinishData = async (values: any) => {
        // setIsLoadingBtn(true);
        values.typeSubmit = typeSubmit;
        if (values.start) {
            values.start = values.start.format('YYYY-MM-DD');
        }
        if (values.end) {
            values.end = values.end.format('YYYY-MM-DD');
        }
        values.pid = props.pid;
        // const res = await createTask(values);
        axios.post(route('task.add', { parentName: props.parentName }), values)
            .then(response => {
                setIsLoadingBtn(false);
                setColumns(response.data.data);
                message.success("Đã lưu dữ liệu thành công");

                // reset form
                formData.resetFields();

                // case lưu và đóng, đóng modal sau khu lưu thành công
                if (typeSubmit === 'save') {
                    setIsModalAddOpen(false);
                }
            })
            .catch(error => {
                setIsLoadingBtn(false);
            });
    }



    // di chuyển item trong mảng
    function moveItemInArray<T>(array: T[], fromIndex: number, toIndex: number): T[] {
        const result = [...array];
        const [removed] = result.splice(fromIndex, 1);
        result.splice(toIndex, 0, removed);
        return result;
    }

    const onDragEnd = async (result: import("react-beautiful-dnd").DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        // Sao chép mảng gốc
        const newDatas = [...columns];

        // lấy index của cột
        const source_index = columns.findIndex(item => item.status.id === +source.droppableId);
        const destination_index = columns.findIndex(item => item.status.id === +destination.droppableId);

        // data cần di chuyển
        const itemToMove = newDatas[source_index].datas[source.index];

        // trường hợp sắp xếp thứ tự trên cùng 1 cột
        if (source.droppableId === destination.droppableId) {
            // sắp xếp lại thứ tự của data
            newDatas[source_index].datas = moveItemInArray(newDatas[source_index].datas, source.index, destination.index);

            // save 2 state
            setColumns(newDatas); // Cập nhật state

            // lọc ra ids là danh sách id của data sau khi đã sắp xếp
            const ids = newDatas[destination_index].datas.map(item => item.id);
            // save 2 db
            await updateTask(itemToMove.id, {
                task_status_id: destination.droppableId,
                ids: ids,
                parentName: props.parentName,
                pid: props.pid,
            });

            return;
        }

        // trường hợp di chuyển sang cột khác

        // Xoá khỏi vị trí cũ
        newDatas[source_index].datas = newDatas[source_index].datas.filter((_, i) => i !== source.index);

        // Thêm vào vị trí mới
        newDatas[destination_index].datas = [...newDatas[destination_index].datas, itemToMove];
        // sắp xếp lại thứ tự của data
        const lastIndex = newDatas[destination_index].datas.length - 1;
        newDatas[destination_index].datas = moveItemInArray(newDatas[destination_index].datas, lastIndex, destination.index);


        // Cập nhật state
        setColumns(newDatas);

        // lọc ra ids là danh sách id của data sau khi đã sắp xếp
        const ids = newDatas[destination_index].datas.map(item => item.id);

        await updateTask(itemToMove.id, {
            task_status_id: destination.droppableId,
            ids: ids
        });

    };

    ////////////////detail

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
            setChecklist(response.data.data.list);
            setChecklistPercent(response.data.data.percent);
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
            setChecklist(response.data.data.list);
            setChecklistPercent(response.data.data.percent);
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
            setDataAction({
                ...((typeof dataAction === 'object' && dataAction !== null) ? dataAction : {}),
                [columnName]: value,
            });
            setColumns(response.data.data.datas);
            setDataAction(response.data.data.data);
            // response.data.data.data,


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
        }).catch((error) => {
            message.error("Tạo checklist thất bại");
        });
    }

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


    {/* form Thêm checklist */ }
    // function formAddTaskChecklist(users: any) {


    //     return <table className="table-sub">
    //         <thead>
    //             <tr>
    //                 <th>Tiêu đề</th>
    //                 <th>Mô tả</th>
    //                 <th>
    //                     Người thực hiện
    //                     <br />
    //                     <Checkbox checked={isApplyAll}
    //                         onChange={(e) => setIsApplyAll(e.target.checked)}
    //                     >
    //                         Áp dụng tất cả
    //                     </Checkbox>
    //                 </th>
    //                 <th>Xóa</th>
    //             </tr>
    //         </thead>
    //         {
    //             formChecklist.map((item, key) => {
    //                 return <tbody key={key}>
    //                     <tr>
    //                         <td>
    //                             <Input value={item.name} onChange={(e) => updateChecklistByIndex(key, { name: e.target.value })} />
    //                         </td>
    //                         <td>
    //                             <Input.TextArea value={item.content} onChange={(e) => updateChecklistByIndex(key, { content: e.target.value })} />
    //                         </td>
    //                         <td>
    //                             <Select
    //                                 showSearch
    //                                 style={{ width: "100%" }}
    //                                 placeholder="Chọn nhân viên thực hiện"
    //                                 optionFilterProp="children"
    //                                 filterOption={(input, option) =>
    //                                     (option?.label ?? "")
    //                                         .toLowerCase()
    //                                         .includes(input.toLowerCase())
    //                                 }
    //                                 value={item.admin_user_id}
    //                                 options={users}
    //                                 onChange={(value) => {
    //                                     if (!isApplyAll) {
    //                                         updateChecklistByIndex(key, { admin_user_id: value });
    //                                     }
    //                                     setFormChecklist(prev =>
    //                                         prev.map(item => ({
    //                                             ...item,
    //                                             admin_user_id: value
    //                                         }))
    //                                     );
    //                                     return;

    //                                 }}
    //                             />
    //                         </td>
    //                         {
    //                             checkListAction.id === 0 ? (
    //                                 <td>
    //                                     <span onClick={() => removeFormChecklist(key)}
    //                                         title="Xóa"
    //                                         className="icon-large cursor"
    //                                         key="list-loadmore-more">
    //                                         <DeleteOutlined />
    //                                     </span>
    //                                 </td>
    //                             ) : null
    //                         }

    //                     </tr>

    //                 </tbody>
    //             })
    //         }

    //         <tbody>
    //             {
    //                 checkListAction.id === 0 ? (
    //                     <tr>
    //                         <td colSpan={4}>
    //                             <a className="add-item01" onClick={() => addFormCheckList()}>
    //                                 <span className="icon-b"><PlusCircleOutlined /> Thêm Checklist</span>
    //                             </a>
    //                         </td>
    //                     </tr>
    //                 ) : null
    //             }

    //             <tr>
    //                 <td colSpan={4}>
    //                     <Row className="main-modal-footer01">
    //                         <Col span={24} className="main-btn-popup">
    //                             <span> </span>
    //                             <Button className="btn-popup"
    //                                 loading={isLoadingBtn}
    //                                 type="primary"
    //                                 onClick={() => createChecklist()}
    //                             >
    //                                 <CheckOutlined />
    //                                 Lưu Checklist
    //                             </Button>
    //                         </Col>
    //                     </Row>
    //                 </td>
    //             </tr>
    //         </tbody>

    //     </table>
    // }

    // end detail


    const cancelComment = () => setIsModalComment(false);
    const cancelCheckList = () => setIsModalChecklist(false);
    const confirmEditTitle = () => formTitle.submit();
    const onClickEditTitle = () => formTitle.setFieldValue('name', dataAction.name)

    return (
        <div>
            <AdminLayout content={

                <div>
                    {/* modal xóa */}
                    <Modal title="Xác nhận xóa"
                        open={isModalXoaOpen}
                        // onOk={deleteProduct}
                        okText="Đồng ý xóa"
                        cancelText="Hủy"
                    // onCancel={handleCancelDelete}
                    >
                        <p>Dữ liệu sẽ bị xóa hoàn toàn</p>
                    </Modal>

                    {/* Cài đặt trạng thái */}
                    <Modal title="Cài đặt trạng thái"
                        className="status-setting"
                        open={isShowStatusSetting}
                        onCancel={() => closePopupStatus()}
                        footer={[]}
                    >
                        <div>

                            {/* {taskConfig(statusData, { parentName: props.parentName, currentName: 'task_status', searchData: searchData, pid: props.pid }, {
                                name: 'Trạng thái',
                                description: 'Mô tả ',
                                color: 'Màu chữ',
                                background: 'Màu nền',
                            }, (result: any) => {
                                setStatusData(result.status);
                                setColumns(result.columns);
                            })} */}

                            <Row>
                                <Col sm={24} className="text-center">
                                    <br />
                                    <Button type="primary"
                                        className="btn-submit01"
                                        onClick={() => closePopupStatus()}>
                                        Đóng
                                    </Button>
                                </Col>
                            </Row>

                        </div>
                    </Modal>

                    {/* Thêm nhanh công việc */}
                    <Modal title="Thêm nhanh"
                        open={isModalAddExpress}
                        onCancel={() => setIsModalAddExpress(false)}
                        footer={[]}
                        width={1000}
                    >
                        <TaskExpressForm
                            users={users}
                            status={status}
                            parentName={props.parentName}
                            pid={props.pid}
                            setIsLoadingBtn={setIsLoadingBtn}
                            setIsModalAddExpress={setIsModalAddExpress}
                            setColumns={setColumns}
                        />
                    </Modal>

                    {/* Thêm mới task */}
                    {/* <TaskFormModal
                        open={isModalAddOpen}
                        onClose={closeModalAdd}
                        formData={formData}
                        onFinishData={onFinishData}
                        initialValues={initialValuesForm()}
                        isLoadingBtn={isLoadingBtn}
                        status={status}
                        users={users}
                        priority={priority}
                        type={type}
                        setTypeSubmit={setTypeSubmit}
                    /> */}
                    {/* title */}
                    <Row>
                        <Col sm={{ span: 8 }}>
                            <Link href={route('project.list', { parentName: props.parentName, p: props.p })}> <Button icon={<RollbackOutlined />}> Back </Button> </Link>
                            <span> </span>
                            <a><b className="title-page">{props.project.name} </b></a>
                        </Col>

                        <Col sm={{ span: 16 }}>
                            {/* Hiển thị dưới dạng */}
                            <span> </span>
                            <Select
                                className="_right"
                                value={props.display}
                                onChange={(value) => {
                                    router.get(route('task.list', [props.parentName]), { p: props.p, pid: props.pid, display: value });
                                }}
                                style={{ width: 150, marginRight: 8 }}
                            >
                                <Select.Option value="list"><InsertRowAboveOutlined /> Danh sách</Select.Option>
                                <Select.Option value="kanban"><ApartmentOutlined /> Kanban</Select.Option>
                            </Select>
                            <span> </span>
                            {/* Cài đặt quy trình */}
                            <Button className="_right"
                                onClick={() => setIsShowStatusSetting(true)}
                            >
                                <SettingFilled /> Cài đặt trạng thái
                            </Button>
                            <span> </span>
                            {/* Thêm mới */}
                            <Button type="primary"
                                className="_right btn-submit01"
                                onClick={() => setIsModalAddOpen(true)}
                            >
                                <PlusCircleFilled /> Thêm mới
                            </Button>

                            <Button type="primary"
                                className="_right btn-submit01"
                                onClick={() => setIsModalAddExpress(true)}
                            >
                                <PlusCircleFilled /> Thêm nhanh
                            </Button>
                        </Col>
                    </Row>

                    <Divider orientation="left" className="divider02">
                        <Space>
                            <span><ToolFilled /> Tìm kiếm</span>
                            {/* <span> | </span> */}
                            {/* <a className="title-search"> Tìm kiếm nâng cao</a> */}
                        </Space>
                    </Divider>

                    {/* form search */}
                    <TaskSearchForm
                        formSearch={formSearch}
                        users={users}
                        priority={priority}
                        initialValuesForm={searchData}
                        onFinishSearch={onFinishSearch}
                    />

                    {/* {/* content */}
                    <div className="tasks-container">

                        {/* content DND */}
                        <Row>
                            <div>
                                <TaskKanbanBoard
                                    columns={columns}
                                    onDragEnd={onDragEnd}
                                    icon={icon}
                                    priority={priority}
                                    users={users}
                                    setOpenDetail={setOpenDetail}
                                    setDataAction={setDataAction}
                                    setChecklist={setChecklist}
                                    setChecklistPercent={setChecklistPercent}
                                    setComments={setComments}
                                    setTaskLog={setTaskLog}
                                    formDesc={formDesc}
                                />
                            </div>
                        </Row>

                        <Drawer
                            title="Chi tiết công việc"
                            placement="right"
                            open={openDetail}
                            // size={'large'}
                            onClose={() => setOpenDetail(false)}
                            width="90%"
                        >

                            {/* detail */}

                            <Row>
                                {/* modal Thêm checklist */}
                                <Modal title="Thêm checklist"
                                    open={isModalChecklist}
                                    onCancel={cancelCheckList}
                                    footer={[]}
                                    width={1000}
                                >
                                    <table className="table-sub">
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
                                                                options={users}
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
                                </Modal>

                                {/* modal form comment */}
                                <Modal title="Thêm comment"
                                    open={isModalComment}
                                    onCancel={cancelComment}
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

                                <Modal title="Sửa tiêu đề"
                                    open={isModalComment}
                                    onCancel={cancelComment}
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
                                            onConfirm={confirmEditTitle}
                                            description={<Form
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
                                            </Form>}
                                        >
                                            <Button onClick={onClickEditTitle} className="_right">
                                                <EditOutlined />
                                            </Button>
                                        </Popconfirm>
                                    </h3>
                                    <p className="description01">Tạo bởi: {users[dataAction.create_by] ? users[dataAction.create_by].name : ''}</p>

                                    {/* Mô tả */}
                                    <Divider orientation="left">
                                        {/* <span className="title-desc"><SnippetsFilled /> Mô tả</span>
                                        <span> | </span> */}
                                        {/* <Popconfirm
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
                                        </Popconfirm> */}

                                    </Divider>
                                    {/* <div>
                                        <p className="description01">{dataAction.description === null ? <Empty image={null} description="Chưa có mô tả" /> : dataAction.description}</p>
                                    </div> */}

                                    {/* Checklist */}
                                    {/* <div>
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
                                                                        setChecklist(response.data.data.list);
                                                                        setChecklistPercent(response.data.data.percent);
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
                                    </div> */}

                                    {/* Comment */}
                                    {/* <div>
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
                                    </div> */}
                                </Col>

                                {/* right */}
                                <Col sm={8}>


                                    <div><br /></div>

                                    <h3><ProfileOutlined /> Lịch sử thay đổi</h3>
                                    {/* <Timeline
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
                                    /> */}
                                </Col>
                            </Row>

                            {/* end detail */}

                            <br />

                        </Drawer>

                    </div>
                </div >
            }
            />
        </div >
    );
}
