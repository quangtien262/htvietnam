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
    Col, Drawer
} from "antd";
import {
    RollbackOutlined,
    ToolFilled,
    ApartmentOutlined,
    SettingFilled, InsertRowAboveOutlined,
    PlusCircleFilled
} from "@ant-design/icons";

import "../../../../css/task.css";
import { callApi } from "../../../Function/api";
import { icon } from "../../../components/comp_icon";
import { taskConfig, taskInfo } from "./task_config";
import { updateTask } from "../../../Function/api";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import TaskFormModal from "./TaskFormModal";
import TaskExpressForm from "./TaskExpressForm";
import TaskSearchForm from "./TaskSearchForm";
import TaskKanbanBoard from "./TaskKanbanBoard";


export default function Dashboard(props: any) {

    const search = {
        p: props.p,
        pid: props.pid,
        display: props.display,
        parentName: props.parentName
    };
    const [status, setStatus] = useState([]);
    const [statusData, setStatusData] = useState([]);


    const [taskLog, setTaskLog] = useState([]);
    const [users, setUsers] = useState([]);
    const [priority, setPriority] = useState([]);
    const [type, setType] = useState([]);

    const [isModalAddExpress, setIsModalAddExpress] = useState(false);
    const [isLoadingBtn, setIsLoadingBtn] = useState(false);

    // checklist
    const [checklist, setChecklist] = useState([]);

    const [formDesc] = Form.useForm();

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

    useEffect(() => { fetchData(search) }, []);

    function initialValuesForm() {
        return search;
    }

    function closeModalAdd() {
        setIsModalAddOpen(false);
    }


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

                            {/* {taskConfig(statusData, { parentName: props.parentName, currentName: 'task_status', searchData: search, pid: props.pid }, {
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
                    <Modal title="Thêm mới"
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
                        <TaskFormModal
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
                        />
                    </Modal>

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
                    {/* <TaskSearchForm
                        formSearch={formSearch}
                        users={users}
                        priority={priority}
                        initialValuesForm={initialValuesForm}
                        onFinishSearch={onFinishSearch}
                    /> */}

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
                            {/* {taskInfo(props,
                                users,
                                dataAction,
                                comments,
                                checklist,
                                checklistPercent,
                                taskLog,
                                priority,
                                status,
                                (result: any) => {
                                    // set columns, dùng cho case fast edit
                                    if (result.columns) {
                                        setColumns(result.columns);
                                    }

                                    // set data action, dùng cho case fast edit
                                    if (result.dataAction_column) {
                                        setDataAction({
                                            ...((typeof dataAction === 'object' && dataAction !== null) ? dataAction : {}),
                                            [result.dataAction_column.col]: result.dataAction_column.val,
                                        });
                                    }

                                    // set checklist
                                    if (result.checklist) {
                                        setChecklist(result.checklist);
                                    }

                                    // set percent
                                    if (result.checklist_percent !== undefined) {
                                        setChecklistPercent(result.checklist_percent);
                                    }
                                    // set comments
                                    if (result.comments) {
                                        setComments(result.comments);
                                    }

                                })} */}

                            <br />

                        </Drawer>

                    </div>
                </div >
            }
            />
        </div >
    );
}
