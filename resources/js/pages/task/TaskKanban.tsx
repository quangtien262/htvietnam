import React, { useEffect, useState, useMemo, useContext } from "react";

import axios from "../../utils/axiosConfig";
import { data, useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { API } from "../../common/api";
import { ROUTE } from "../../common/route";
import {
    Button,
    message,
    Modal,
    Form,
    Select,
    Row,
    Space,
    Divider, TableColumnsType,
    Col, Drawer,
    Popconfirm, Timeline, Input
} from "antd";
import {
    ToolFilled, DeleteOutlined,
    ApartmentOutlined,
    SettingFilled, InsertRowAboveOutlined,
    PlusCircleFilled, ProfileOutlined,
    EditOutlined,HolderOutlined
} from "@ant-design/icons";

import {
    arrayMove,
    useSortable,
} from '@dnd-kit/sortable';

import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';


import { DATE_TIME_SHOW, DATE_SHOW, DATE_TIME_FORMAT } from "../../function/constant";

import { icon } from "../../components/comp_icon";

import TaskFormModal from "./TaskFormModal";
import TaskExpressForm from "./TaskExpressForm";
import TaskSearchForm from "./TaskSearchForm";
import TaskKanbanBoard from "./TaskKanbanBoard";
import TaskDescription from "./TaskDescription";
import TaskChecklist from "./TaskChecklist";
import TaskComment from "./TaskComment";
import TaskDetailInfo from "./TaskDetailInfo";
import TaskChecklistModal from "./TaskChecklistModal";
import TaskCommentModal from "./TaskCommentModal";
import StatusSettingModal from "./StatusSettingModal";

// CSS
import { CSS } from '@dnd-kit/utilities';
import "../../../css/list02.css";
import "../../../css/task.css";
import "../../../css/form.css";

const TaskKanban: React.FC = () => {
    // get params from url
    const { parent, pid } = useParams<{ parent: string, pid: string }>();
    const display = 'kanban';
    // const [searchParams] = useSearchParams();
    const [searchData, setSearchData] = useState({ parent: parent, pid: pid }); // trạng thái lọc hiện tại
    const [status, setStatus] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [taskLog, setTaskLog] = useState([]);
    const [users, setUsers] = useState([]);
    const [priority, setPriority] = useState([]);
    const [project, setProject] = useState({ name: '' });
    const [type, setType] = useState([]);

    const [isModalAddExpress, setIsModalAddExpress] = useState(false);
    const [isModalAddConfig, setIsModalAddConfig] = useState(false);

    // checklist
    const [checklist, setChecklist] = useState([]);
    // formChecklist
    const formChecklist_default = { name: '', content: '', admin_user_id: null };
    const [formChecklist, setFormChecklist] = useState([formChecklist_default, formChecklist_default, formChecklist_default]);

    const [comments, setComments] = useState([]);
    const [isShowStatusSetting, setIsShowStatusSetting] = useState(false);

    const [formData] = Form.useForm();
    const [formSearch] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [dataAction, setDataAction] = useState<any>({});
    const [checklistPercent, setChecklistPercent] = useState(0);

    // save: save and close
    // save_continue: save and add new
    const [typeSubmit, setTypeSubmit] = useState('save');
    const [isModalAddOpen, setIsModalAddOpen] = useState(false);

    const [dataSource, setDataSource] = useState([]);

    const [formDesc] = Form.useForm();
    const [formTitle] = Form.useForm();
    const [formComment] = Form.useForm();
    const [isLoadingBtn, setIsLoadingBtn] = useState(false);
    const [isApplyAll, setIsApplyAll] = useState(false);
    const [isModalComment, setIsModalComment] = useState(false);
    const [commentAction, setCommentAction] = useState({ id: 0 });
    const [checkListAction, setCheckListAction] = useState({ id: 0 });

    const [isModalChecklist, setIsModalChecklist] = useState(false);
    const [statusAction, setConfigAction] = useState({ id: 0 });
    const [formStatus] = Form.useForm();

    const [isReady, setIsReady] = useState(false);
    function fetchData() {
        axios.post(API.taskList, {
            parentName: parent,
            display: display,
            pid: pid
        })
            .then((res: any) => {
                setIsReady(true);
                console.log('res.data.data', res.data.data);
                setDataSource(res.data.data.datas);
                setStatus(res.data.data.taskStatus);
                setStatusData(res.data.data.statusData);
                setUsers(res.data.data.users);
                setPriority(res.data.data.priority);
                setType(res.data.data.type);
                setProject(res.data.data.project);
            })
            .catch((err: any) => console.error(err));
    }
    useEffect(() => {
        fetchData();
    }, []);

    const onfinishFormStatus = (values: any) => {
        console.log('values', values);
        // return;
        if (values.background && typeof values.background === 'object') {
            values.background = values.background.toHexString();;
        }
        if (values.color && typeof values.color === 'object') {
            values.color = values.color.toHexString();;
        }
        values.id = statusAction.id;
        values.pid = pid;
        values.parentName = parent;
        values.currentTable = 'task_status';
        console.log('values', values);
        axios.post(API.editConfigTask, values).then((response) => {
            setIsModalAddConfig(false);
            fetchData();
            formStatus.resetFields();
        }).catch((error) => {
            console.error('Error:', error);
        });
    }


    // xóa task
    function deleteTableStatus(id: number) {
        const params = {
            table_name: 'task_status',
            id: statusAction.id,
        };
        // console.log('params', params);
        // return
        axios.post(API.deleteData, params).then(response => {
            fetchData();
        }).catch(error => {
            message.error('Xóa thất bại');
        });
    };

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


    const columnsStatus: TableColumnsType = [
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
            render: (_: any, record: any) =>
                statusData.length >= 1 ? (
                    <>
                        <a onClick={() => {
                            console.log('record', record);
                            setIsModalAddConfig(true);
                            setConfigAction(record);
                            formStatus.setFieldValue('name', record.name);

                            console.log('record', record);
                            formStatus.setFieldValue('description', record.description);
                            if (record.color) {
                                formStatus.setFieldValue('color', record.color ? record.color : null);
                            }
                            if (record.background) {
                                formStatus.setFieldValue('background', record.background ? record.background : null);
                            }

                        }}
                        ><EditOutlined /></a>
                        <span> | </span>
                        {/* TODO */}
                        <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => deleteTableStatus(record.key)}>
                            <a onClick={() => setConfigAction(record)}><DeleteOutlined /></a>
                        </Popconfirm>
                    </>
                ) : null,
        },
    ];

    interface RowContextProps {
        setActivatorNodeRef?: (element: HTMLElement | null) => void;
        listeners?: SyntheticListenerMap;
    }

    const RowContext = React.createContext<RowContextProps>({});

    interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
        'data-row-key': string;
    }

    const RowDnd: React.FC<RowProps> = (props) => {
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
            setStatusData((prevState) => {
                const activeIndex = prevState.findIndex((record) => record.key === active?.id);
                const overIndex = prevState.findIndex((record) => record.key === over?.id);
                const newOrder = arrayMove(prevState, activeIndex, overIndex);

                // Lấy danh sách key/id theo thứ tự mới
                const orderKeys = newOrder.map(item => item.key);
                console.log('orderKeys', orderKeys);

                // send 2 server:
                const param = {
                    order: orderKeys,
                    parentName: parent,
                    currentName: 'task_status',
                    searchData: searchData,
                    pid: pid,
                };
                console.log('param', param);
                // TODO:
                axios.post(API.taskStatusSortOrder, param).then((response) => {
                    message.success('Cập nhật thứ tự thành công');
                    console.log('sss', response.data.data);
                    setDataSource(response.data.data.columns);
                }).catch((error) => {
                    message.error('Cập nhật thứ tự thất bại');
                });

                return newOrder;
            });
        }
    };



    function closePopupStatus() {
        setIsShowStatusSetting(false);
    }

    function search(values: any) {
        axios.post(API.searchKanbanList, values).then(response => {
            setDataSource(response.data.data);
        }).catch(error => {
            message.error('Lọc dữ liệu thất bại')
        });
    }

    const onFinishSearch = (values: any) => {
        values.display = display;
        values.pid = pid;
        values.parentName = parent;
        console.log('values', values);
        setSearchData(values);
        search(values);
    };


    const addTask = async (values: any) => {
        values.typeSubmit = typeSubmit;
        if (values.start) {
            values.start = values.start.format('YYYY-MM-DD');
        }
        if (values.end) {
            values.end = values.end.format('YYYY-MM-DD');
        }
        values.pid = pid;
        values.parentName = parent;
        // const res = await createTask(values);
        axios.post(API.taskAdd, values)
            .then(response => {
                setIsLoadingBtn(false);
                setDataSource(response.data.data);
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
        const newDatas = [...dataSource];

        // lấy index của cột
        const source_index = dataSource.findIndex(item => item.status.id === +source.droppableId);
        const destination_index = dataSource.findIndex(item => item.status.id === +destination.droppableId);

        // data cần di chuyển
        const itemToMove = newDatas[source_index].datas[source.index];

        // trường hợp sắp xếp thứ tự trên cùng 1 cột
        if (source.droppableId === destination.droppableId) {
            // sắp xếp lại thứ tự của data
            newDatas[source_index].datas = moveItemInArray(newDatas[source_index].datas, source.index, destination.index);

            // save 2 state
            setDataSource(newDatas); // Cập nhật state

            // lọc ra ids là danh sách id của data sau khi đã sắp xếp
            const ids = newDatas[destination_index].datas.map(item => item.id);

            // update lại task, trường hợp chỉ đổi thứ tự
            axios.post(API.taskSortOrder, {
                id: itemToMove.id,
                task_status_id: destination.droppableId,
                ids: ids, // danh sach id cần sắp xếp lại
            }).then(response => {
                message.success('Cập nhật thứ tự thành công');
            }).catch(error => {
                message.error('Cập nhật thứ tự thất bại');
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
        setDataSource(newDatas);

        // lọc ra ids là danh sách id của data sau khi đã sắp xếp
        const ids = newDatas[destination_index].datas.map(item => item.id);

        // update lại task, trường hợp đổi trạng thái và thứ tự
        axios.post(API.taskSortOrder, {
            id: itemToMove.id,
            task_status_id: destination.droppableId,
            ids: ids, // danh sach id cần sắp xếp lại
        }).then(response => {
            message.success('Cập nhật thứ tự thành công');
        }).catch(error => {
            message.error('Cập nhật thứ tự thất bại');
        });

    };

    ////////////////detail

    const onFinishFormDesc = async (values: any) => {
        updateTaskColumn('description', values.description);
    }

    const onFinishFormComment = async (values: any) => {
        // setIsLoadingBtn(true);
        console.log(commentAction);
        // return
        axios.post(API.taskCommentAdd, {
            task_id: dataAction.id,
            content: values.content,
            id: commentAction.id
        }).then(response => {
            console.log('response', response);
            setIsModalComment(false);
            formComment.resetFields();
            setIsLoadingBtn(false);
            setComments(response.data.data);
            message.success('Đã thêm comment');
        }).catch(error => {
            message.error('Thêm comment thất bại');
        });
    }

    const removeChecklistByIndex = (id: number) => {
        axios.post(API.taskChecklistDelete, {
            column_name: 'is_recycle_bin',
            tbl_name: 'task_checklist',
            id: id,
            task_id: dataAction.id,
            value: 1
        }).then(response => {
            setIsLoadingBtn(false);
            message.success('Xóa checklist thành công');
            console.log('response.data.data', response.data.data);
            setChecklist(response.data.data.checklist);
            setChecklistPercent(response.data.data.percent);
        }).catch(error => {
            message.error('Xóa checklist thất bại');
        });
    };

    // TODO:
    function updateTaskColumn(columnName: string, value: any) {
        axios.post(API.fastEditTaskColumn, {
            column_name: columnName,
            id: dataAction.id,
            value: value,
            parentName: parent,
            searchData: searchData,
            display: display
        }).then(response => {
            setIsLoadingBtn(false);
            // setColumns(response.data.data);
            message.success('Cập nhật thành công');
            setDataAction({
                ...((typeof dataAction === 'object' && dataAction !== null) ? dataAction : {}),
                [columnName]: value,
            });

            search(searchData);

            // setDataSource(response.data.data.datas);
            // setDataAction(response.data.data.data);
            // response.data.data.data,


        }).catch(error => {
            message.error('Cập nhật thất bại');
        });
    }

    function removeFormChecklist(key: number) {
        setFormChecklist(prev =>
            prev.filter((_, index) => index !== key)
        );
    }

    function updateOrCreateChecklist() {
        setIsLoadingBtn(true);
        axios.post(API.taskChecklistAdd, {
            data: formChecklist,
            task_id: dataAction.id,
            checklist_id: checkListAction.id, // dùng cho trường hợp sửa checklist
        }).then((response) => {
            console.log(response.data.data);

            setIsLoadingBtn(false);
            setIsModalChecklist(false);
            message.success("Tạo checklist thành công");
            setChecklist(response.data.data.checklist);
            setChecklistPercent(response.data.data.percent);
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

    // end detail
    function closeModalAdd() {
        setIsModalAddOpen(false);
    }

    return (
        <div>
            <div>
                {/* Cài đặt trạng thái */}
                <StatusSettingModal
                    isShowStatusSetting={isShowStatusSetting}
                    closePopupStatus={closePopupStatus}
                    isModalAddConfig={isModalAddConfig}
                    setIsModalAddConfig={setIsModalAddConfig}
                    onfinishFormStatus={onfinishFormStatus}
                    formStatus={formStatus}
                    columnsStatus={columnsStatus}
                    statusData={statusData}
                    onDragEnd2={onDragEnd2}
                    RowDnd={RowDnd}
                    statusAction={statusAction}
                    deleteTableStatus={deleteTableStatus}
                />



                {/* Thêm nhanh task */}
                <Modal title="Thêm nhanh"
                    open={isModalAddExpress}
                    onCancel={() => setIsModalAddExpress(false)}
                    footer={[]}
                    width={1000}
                >
                    <TaskExpressForm
                        users={users}
                        status={status}
                        priority={priority}
                        parentName={parent}
                        pid={pid}
                        setIsLoadingBtn={setIsLoadingBtn}
                        setIsModalAddExpress={setIsModalAddExpress}
                        setDataSource={setDataSource}
                        display={display}
                        searchData={searchData}
                    />
                </Modal>

                {/* Thêm mới task */}
                <TaskFormModal
                    open={isModalAddOpen}
                    onClose={closeModalAdd}
                    formData={formData}
                    onFinishData={addTask}
                    initialValues={searchData}
                    isLoadingBtn={isLoadingBtn}
                    status={status}
                    users={users}
                    priority={priority}
                    type={type}
                    setTypeSubmit={setTypeSubmit}
                />

                {/* title */}
                <Row>

                    <Col sm={{ span: 24 }}>
                        {/* Hiển thị dưới dạng */}
                        <span> </span>
                        <Select
                            className="_right"
                            value={display}
                            onChange={(value) => {
                                // chuyển hướng
                                if (value === 'list') {
                                    window.location.href = ROUTE.taskList_all.replace('all', parent || 'all');
                                } else {
                                    window.location.href = ROUTE.taskKanban_all.replace('all', parent || 'all');
                                }
                            }}
                            style={{ width: 150, marginRight: 8 }}
                        >
                            <Select.Option value="list"><InsertRowAboveOutlined /> Danh sách</Select.Option>
                            <Select.Option value="kanban"><ApartmentOutlined /> Kanban</Select.Option>
                        </Select>
                        <span> </span>
                        {/* Cài đặt quy trình */}
                        <Button className="_right"
                            onClick={() => {
                                setIsShowStatusSetting(true);
                            }}
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
                        {/* <span> | </span>
                        <a className="title-search"> Tìm kiếm nâng cao</a> */}
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

                <Row>
                    <Col sm={24}>
                        <Divider className="divider01" orientation="left">
                            {project.name}
                        </Divider>
                    </Col>
                </Row>

                {/* {/* content */}
                <div className="tasks-container">

                    {/* content DND */}
                    <Row>
                        <div>
                            <TaskKanbanBoard
                                columns={dataSource}
                                onDragEnd={onDragEnd}
                                icon={icon}
                                setOpenDetail={setOpenDetail}
                                setDataAction={setDataAction}
                                setChecklist={setChecklist}
                                setChecklistPercent={setChecklistPercent}
                                setComments={setComments}
                                setTaskLog={setTaskLog}
                                formDesc={formDesc}
                                setLoading={setLoading}
                            />
                        </div>
                    </Row>

                    <Drawer
                        title="Chi tiết công việc"
                        placement="right"
                        open={openDetail}
                        // size={'large'}
                        onClose={() => setOpenDetail(false)}
                        loading={loading}
                        width="90%"
                    >

                        {/* detail */}

                        <Row>
                            {/* Thêm checklist */}
                            <TaskChecklistModal
                                isModalChecklist={isModalChecklist}
                                setIsModalChecklist={setIsModalChecklist}
                                formChecklist={formChecklist}
                                updateChecklistByIndex={updateChecklistByIndex}
                                users={users}
                                isApplyAll={isApplyAll}
                                setIsApplyAll={setIsApplyAll}
                                checkListAction={checkListAction}
                                removeFormChecklist={removeFormChecklist}
                                addFormCheckList={addFormCheckList}
                                isLoadingBtn={isLoadingBtn}
                                updateOrCreateChecklist={updateOrCreateChecklist}
                            />

                            {/* form comment */}
                            <TaskCommentModal
                                isModalComment={isModalComment}
                                setIsModalComment={setIsModalComment}
                                formComment={formComment}
                                onFinishFormComment={onFinishFormComment}
                                isLoadingBtn={isLoadingBtn}
                            />

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
                                                    updateTaskColumn('name', values.name);
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
                                {/* Em tách phần mô tả ra component riêng cho sếp */}
                                <TaskDescription
                                    isLoadingBtn={isLoadingBtn}
                                    formDesc={formDesc}
                                    onFinishFormDesc={onFinishFormDesc}
                                    dataAction={dataAction}
                                />

                                {/* Checklist */}
                                <TaskChecklist
                                    checklist={checklist}
                                    checklistPercent={checklistPercent}
                                    setCheckListAction={setCheckListAction}
                                    setIsModalChecklist={setIsModalChecklist}
                                    setFormChecklist={setFormChecklist}
                                    formChecklist_default={formChecklist_default}
                                    removeChecklistByIndex={removeChecklistByIndex}
                                    axios={axios}
                                    dataAction={dataAction}
                                    setChecklist={setChecklist}
                                    setChecklistPercent={setChecklistPercent}
                                    message={message}
                                />

                                {/* Comment */}
                                <TaskComment
                                    comments={comments}
                                    setCommentAction={setCommentAction}
                                    setIsModalComment={setIsModalComment}
                                    formComment={formComment}
                                    setComments={setComments}
                                    message={message}
                                />
                            </Col>

                            {/* right */}
                            <Col sm={8}>
                                <TaskDetailInfo
                                    dataAction={dataAction}
                                    icon={icon}
                                    status={status}
                                    priority={priority}
                                    users={users}
                                    updateTaskColumn={updateTaskColumn}
                                    setOpenDetail={setOpenDetail}
                                    setDataAction={setDataAction}
                                    message={message}
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

                        {/* end detail */}

                        <br />

                    </Drawer>

                </div>
            </div >

        </div >
    );
};

export default TaskKanban;
