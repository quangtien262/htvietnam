import React, { useEffect, useState, useMemo, useContext } from "react";
import { useParams } from "react-router-dom";
import { API } from "../../common/api";
import { ROUTE } from "../../common/route";
import axios from "../../utils/axiosConfig";
import {
    Button,
    Table,
    message,
    Modal, Drawer,
    Form,
    TableColumnsType,
    Row, Col,
    Tag, Checkbox,
    Select,
    Input, Timeline, Popconfirm
} from "antd";

import {
    SettingFilled, ProfileOutlined, EditOutlined, HolderOutlined, DeleteOutlined,
    PlusCircleFilled, InsertRowAboveOutlined, ApartmentOutlined,
} from "@ant-design/icons";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { callApi } from "../../function/api";
import { TITLE } from '../../function/constant';
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
import { set } from "lodash";

const CheckboxGroup = Checkbox.Group;
const TaskList: React.FC = () => {
    const { parent, pid } = useParams<{ parent: string, pid: string }>();
    const params = new URLSearchParams(window.location.search);
    const p = params.get('p'); // sẽ là string hoặc null
    const display = 'list';

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loadingBtnDelete, setLoadingBtnDelete] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [dataInfo, setDataInfo] = useState([]);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [statusData, setStatusData] = useState([]);
    const [status, setStatus] = useState(); // props.taskStatus
    const [form] = Form.useForm();
    const [dataAction, setDataAction] = useState({ id: 0 });

    const [isShowStatusSetting, setIsShowStatusSetting] = useState(false);

    const [isModalXoaOpen, setIsModalXoaOpen] = useState(false);
    const [isModalAddOpen, setIsModalAddOpen] = useState(false);
    const [formSearch] = Form.useForm();
    const [comments, setComments] = useState([]);
    const [checklist, setChecklist] = useState([]);
    const [checklistPercent, setChecklistPercent] = useState(0);

    const [openDetail, setOpenDetail] = useState(false);
    const [taskLog, setTaskLog] = useState([]);

    const [searchData, setSearchData] = useState({}); // trạng thái lọc hiện tại
    const [users, setUsers] = useState([]);
    const [priority, setPriority] = useState([]);
    const [project, setProject] = useState({ name: '' });
    const [type, setType] = useState([]);


    const [formData] = Form.useForm();
    const [loading, setLoading] = useState(false);


    const [typeSubmit, setTypeSubmit] = useState('save');
    const [formDesc] = Form.useForm();
    const [formTitle] = Form.useForm();
    const [formComment] = Form.useForm();
    const [isLoadingBtn, setIsLoadingBtn] = useState(false);
    const [isApplyAll, setIsApplyAll] = useState(false);
    const [isModalComment, setIsModalComment] = useState(false);
    const [commentAction, setCommentAction] = useState({ id: 0 });

    const [checkListAction, setCheckListAction] = useState({ id: 0 });
    const formChecklist_default = { name: '', content: '', admin_user_id: null };
    const [formChecklist, setFormChecklist] = useState([formChecklist_default, formChecklist_default, formChecklist_default]);
    const [isModalChecklist, setIsModalChecklist] = useState(false);

    ////
    const [isModalAddConfig, setIsModalAddConfig] = useState(false);
    const [formStatus] = Form.useForm();
    const [statusAction, setConfigAction] = useState({ id: 0 });
    const [isModalAddExpress, setIsModalAddExpress] = useState(false);
    const [columns, setColumns] = useState([]);


    // import excel
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 1,
            position: ["bottomRight"],
            total: 0,
            onChange: (page, pageSize) => setPagination({ page, pageSize }),
        },
    });

    function setPagination(pagination: any) {
        // TODO: cập nhật pagination

        // router.get(
        //     route("data.index", [props.table.id, props.searchData]),
        //     pagination
        // );
    }

    const [isReady, setIsReady] = useState(false);

    function fetchData() {
        setLoadingTable(true);
        axios.post(API.taskList, {
            parentName: parent,
            display: 'list',
            pid: pid
        })
            .then((res: any) => {
                setIsReady(true);
                const response = res.data.data;
                console.log('res.data.data', response);
                setDataSource(response.dataSource.data);
                setStatus(response.taskStatus);
                setStatusData(response.statusData);
                setUsers(response.users);
                setPriority(response.priority);
                setType(response.type);
                setProject(response.project);

                const searchDataTmp = response.searchData;
                setSearchData(searchDataTmp);
                formSearch.setFieldValue('keyword', searchDataTmp.keyword || '');
                formSearch.setFieldValue('status', searchDataTmp.status || []);
                formSearch.setFieldValue('manager', searchDataTmp.manager || null);
                formSearch.setFieldValue('support', searchDataTmp.support || null);

                // set table params
                setTableParams({
                    pagination: {
                        ...tableParams.pagination,
                        total: response.dataSource.total,
                        current: response.dataSource.current_page,
                        pageSize: response.dataSource.per_page,
                    },
                });

                setLoadingTable(false);
            })
            .catch((err: any) => console.error(err));
    }
    useEffect(() => {
        fetchData();
    }, []);

    /////////////////common function///////////////

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
                    setColumns(response.data.data.columns);
                }).catch((error) => {
                    message.error('Cập nhật thứ tự thất bại');
                });

                return newOrder;
            });
        }
    };

    //
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

    //
    function closePopupStatus() {
        setIsShowStatusSetting(false);
    }

    //
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


    /////////////////// common end /////////////////
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
    function closeModalAdd() {
        setIsModalAddOpen(false);
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
        setLoadingBtnDelete(true); // ajax request after empty completing
        setLoadingTable(true);

        //TODO: route("data.delete", [props.table.id]
        axios
            .post(API.deleteData, {
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
                setLoadingBtnDelete(false);
                setIsOpenConfirmDelete(false);
                setLoadingTable(false);
            })
            .catch((error) => {
                setLoadingBtnDelete(false);
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

    // TODO
    const expandedRowRender = (record: any, index: number) => {
        return getProjectDetail(props, record, index, dataInfo, (data: any) => setDataInfo(data.info));
    };

    // state expandedRowRender
    const [expandable, setExpandable] = useState({ expandedRowRender, defaultExpandedRowKeys: ['1'] });
    // const [expandable, setExpandable] = useState(props.table.expandable === 0 ? false : { expandedRowRender, defaultExpandedRowKeys: ['1'] });


    const columns2: TableColumnsType = [
        {
            title: 'Name', dataIndex: 'name', render: (text, record: any) => {
                return <>
                    <a onClick={async () => {
                        setOpenDetail(true);
                        setDataAction(record);
                        // TODO
                        const res = await callApi(route('task.getTaskInfo', [record.id]));
                        setChecklist(res.data.data.checklist);
                        setComments(res.data.data.comments);
                        setChecklistPercent(res.data.data.percent);
                        setTaskLog(res.data.data.logs);
                    }}>
                        {record.task_priority_name ? <Tag className="tag-priority" color={record.task_priority_color}>{record.task_priority_name}</Tag> : ''}
                        <b>{text}</b>
                    </a>
                    {record.description ? <p>{record.description}</p> : ''}
                </>;
            }
        },
        {
            title: 'Trạng thái', dataIndex: 'task_status_id', render: (text, record: any) => {
                return record.task_status_name ? (
                    <Tag style={{ color: record.task_status_color, background: record.task_status_background }}>
                        <span>{record.task_status_icon && icon[record.task_status_icon as keyof typeof icon]} </span>
                        <span> {record.task_status_name}</span>
                    </Tag>
                ) : null;
            }
        },
        {
            title: 'Người làm', dataIndex: 'nguoi_thuc_hien', render: (text, record: any) => {
                return <>
                    {record.assignee_name ? <Tag style={{ color: '#000' }}>{record.assignee_name}</Tag> : ''}
                </>;
            }
        },
        {
            title: 'Thời gian', dataIndex: 'date', render: (text, record: any) => {
                return <>
                    {record.start ? <p><b>Start:</b> {record.start}</p> : ''}
                    {record.end ? <p><b>End:</b> {record.end}</p> : ''}
                </>;
            }
        },
    ];

    const onFinishSearch = (values: any) => {
        values.p = p;
        values.display = display;
        values.pid = pid;
        values.parentName = parent;

        setLoadingTable(true);
        setSearchData(values);
        axios.post(API.searchTaskList, values)
            .then((res: any) => {
                setLoadingTable(false);
                setDataSource(res.data.data.data);
                setPagination({
                    page: res.data.data.current_page,
                    pageSize: res.data.data.per_page,
                    total: res.data.data.total,
                });
            })
            .catch((err: any) => console.error(err));
    };

    ///////////////////// detail drawer /////////////////////


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


    function updateChecklistByIndex(indexToUpdate: number, updatedData: any) {
        setFormChecklist(prev =>
            prev.map((item, index) =>
                index === indexToUpdate ? { ...item, ...updatedData } : item
            )
        );
    }
    function removeFormChecklist(key: number) {
        setFormChecklist(prev =>
            prev.filter((_, index) => index !== key)
        );
    }
    function addFormCheckList() {
        setFormChecklist(prev => [...prev, formChecklist_default]);
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

    // onFinishFormComment
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

    const onFinishFormDesc = async (values: any) => {
        updateTaskColumn('description', values.description);
    }

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
            message.success('Cập nhật thành công');
            setDataAction(response.data.data.data);

            const datas = response.data.data.dataSource;
            setDataSource(datas.data);
            setPagination({
                page: datas.current_page,
                pageSize: datas.per_page,
                total: datas.total,
            });


        }).catch(error => {
            message.error('Cập nhật thất bại');
        });
    }

    //////////////////// end detail drawer /////////////////////

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
                        confirmLoading={loadingBtnDelete}
                    >
                        <p>
                            Dữ liệu đã xóa sẽ <b>không thể khôi phục</b> lại
                            được <br />{" "}
                            <b>(Số lượng {selectedRowKeys.length})</b>
                        </p>
                    </Modal>

                    {/* title */}
                    <Row>
                        <Col sm={{ span: 24 }}>

                            {/* page name */}
                            <b className="title-page">{TITLE[parent]}</b>

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
                            {/* Cài đặt trạng thái */}
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
                </div>

                <hr />
                <br />
                {/* search form */}
                <Row>

                    <Col className="search-left" sm={{ span: 6 }}>
                        <Form form={formSearch}
                            name="search"
                            onFinish={onFinishSearch}
                            // initialValues={searchData}
                            layout="vertical">
                            <Form.Item name="keyword" label="Từ khóa">
                                <Input allowClear placeholder="Nhập từ khóa" onBlur={() => formSearch.submit()} />
                            </Form.Item>
                            <Form.Item name="status" label="Trạng thái">
                                <CheckboxGroup className="item-status"
                                    options={status}
                                    onChange={(e) => formSearch.submit()}
                                />
                            </Form.Item>
                            <Form.Item name="manager" label="Người làm">
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder="Chọn quản lý"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                    }
                                    options={users}
                                    onChange={(e) => formSearch.submit()} />
                            </Form.Item>
                            <Form.Item name="support" label="Người support">
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder="Chọn người support"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    filterSort={(optionA, optionB) =>
                                        (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                                    }
                                    options={users}
                                    onChange={(e) => formSearch.submit()} />
                            </Form.Item>
                        </Form>
                    </Col>

                    {/* content */}
                    <Col className="content-right" sm={{ span: 18 }}>
                        <Table
                            size="small"
                            rowClassName={(_, index) =>
                                index % 2 === 0 ? "even-row" : "odd-row"
                            }
                            components={{
                                body: {
                                    cell: EditableCell,
                                },
                            }}
                            loading={loadingTable}
                            pagination={tableParams.pagination}
                            dataSource={dataSource}
                            columns={columns2}
                        // rowSelection={rowSelection}
                        // rowClassName="editable-row"F
                        // expandable={expandable}
                        />
                    </Col>
                </Row>
            </Form>
        </div>
    );

    return (
        <div>
            <div>

                {/* Cài đặt trạng thái  */}
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

                <Modal title="Xác nhận xóa"
                    open={isModalXoaOpen}
                    onOk={async () => {
                        setConfirmLoading(true);
                        const result = await callApi(route('hoa_don.huyHoaDon.nhapHang', [dataAction.id]));
                        if (result.status === 200) {
                            message.success("Đã hủy đơn thành công");
                            location.reload();
                        } else {
                            setConfirmLoading(false);
                            message.error("Đã hủy đơn thất bại, vui lòng tải lại trình duyệt và thử lại");
                        }
                    }
                    }
                    okText="Xác nhận hủy đơn"
                    cancelText="Hủy"
                    loading={true}
                    maskClosable={true}
                    confirmLoading={confirmLoading}
                    onCancel={() => { setIsModalXoaOpen(false); }}>
                    <ul>
                        <li>Các thông tin về hóa đơn này sẽ bị chuyển đến thùng rác</li>
                        <li>các dữ liệu liên quan như <em>phiếu thu, chi, sổ quỹ cũng sẽ được phục hồi lại</em></li>
                        <li>Bạn cũng có thể mở lại đơn này ở trong mục Thùng rác</li>
                    </ul>
                </Modal>

                <Row>
                    <br />
                </Row>

                {pageContent}

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

            </div>


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
    );

};

export default TaskList;
